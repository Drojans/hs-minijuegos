import { useEffect, useMemo } from "react";
import { warmImages } from "../images/imageCache";

function normalizeSources(sources) {
  return Array.from(new Set((sources ?? []).filter(Boolean)));
}

function useWarmImageCache(sources, options = {}) {
  const normalizedSources = useMemo(() => normalizeSources(sources), [sources]);
  const sourcesKey = normalizedSources.join("|");
  const fetchPriority = options.fetchPriority ?? "auto";

  useEffect(() => {
    if (!normalizedSources.length) return;
    warmImages(normalizedSources, { fetchPriority });
  }, [normalizedSources, sourcesKey, fetchPriority]);
}

export default useWarmImageCache;
