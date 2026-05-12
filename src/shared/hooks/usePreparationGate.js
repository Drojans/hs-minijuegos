import { useEffect, useMemo, useState } from "react";
import { warmImages } from "../images/imageCache";

function uniqueSources(sources) {
  return Array.from(new Set((sources ?? []).filter(Boolean)));
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function usePreparationGate({
  active,
  sources = [],
  resetKey,
  minDurationMs = 1200,
  timeoutMs = 2800,
  fetchPriority = "high",
} = {}) {
  const normalizedSources = useMemo(() => uniqueSources(sources), [sources]);
  const sourcesKey = normalizedSources.join("|");
  const gateKey = resetKey ?? sourcesKey;
  const [preparedKeys, setPreparedKeys] = useState(() => new Set());
  const [gateState, setGateState] = useState({ key: null, preparing: false });
  const hasPreparedCurrentKey = Boolean(gateKey && preparedKeys.has(gateKey));

  useEffect(() => {
    if (!active || !gateKey || typeof window === "undefined") {
      setGateState({ key: gateKey ?? null, preparing: false });
      return undefined;
    }

    if (hasPreparedCurrentKey) {
      if (normalizedSources.length) {
        warmImages(normalizedSources, { fetchPriority });
      }
      setGateState({ key: gateKey, preparing: false });
      return undefined;
    }

    let cancelled = false;
    setGateState({ key: gateKey, preparing: true });

    const preload = normalizedSources.length
      ? Promise.race([
          warmImages(normalizedSources, { fetchPriority }),
          wait(timeoutMs),
        ])
      : Promise.resolve();

    Promise.all([wait(minDurationMs), preload]).then(() => {
      if (!cancelled) {
        setPreparedKeys((currentKeys) => new Set(currentKeys).add(gateKey));
        setGateState({ key: gateKey, preparing: false });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [active, gateKey, sourcesKey, minDurationMs, timeoutMs, fetchPriority, normalizedSources, hasPreparedCurrentKey]);

  if (!active || !gateKey || hasPreparedCurrentKey) return false;
  if (gateState.key !== gateKey) return true;
  return gateState.preparing;
}

export default usePreparationGate;
