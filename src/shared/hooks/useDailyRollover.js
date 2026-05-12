import { useCallback, useEffect, useRef, useState } from "react";
import { getTodayKey } from "../progress/dailyProgress";

export const DAILY_ROLLOVER_EVENT = "hearthdle:daily-rollover";

const NOTICE_VISIBLE_MS = 7000;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 2_147_483_647;

function getMillisecondsUntilNextLocalDay(date = new Date()) {
  const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 250);
  return Math.max(MIN_TIMEOUT_MS, nextDay.getTime() - date.getTime());
}

function dispatchDailyRolloverEvent(detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DAILY_ROLLOVER_EVENT, { detail }));
}

export function useDailyRollover() {
  const [dateKey, setDateKey] = useState(() => getTodayKey());
  const [notice, setNotice] = useState(null);
  const currentDateKeyRef = useRef(dateKey);
  const nextDayTimeoutRef = useRef(null);
  const noticeTimeoutRef = useRef(null);

  const dismissNotice = useCallback(() => {
    if (noticeTimeoutRef.current) {
      window.clearTimeout(noticeTimeoutRef.current);
      noticeTimeoutRef.current = null;
    }

    setNotice(null);
  }, []);

  const showNotice = useCallback((nextDateKey, previousDateKey) => {
    setNotice({
      id: `${previousDateKey}-${nextDateKey}-${Date.now()}`,
      dateKey: nextDateKey,
      previousDateKey,
    });

    if (noticeTimeoutRef.current) {
      window.clearTimeout(noticeTimeoutRef.current);
    }

    noticeTimeoutRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimeoutRef.current = null;
    }, NOTICE_VISIBLE_MS);
  }, []);

  const checkForRollover = useCallback(
    (reason = "timer") => {
      const nextDateKey = getTodayKey();
      const previousDateKey = currentDateKeyRef.current;

      if (nextDateKey === previousDateKey) return false;

      currentDateKeyRef.current = nextDateKey;
      setDateKey(nextDateKey);
      showNotice(nextDateKey, previousDateKey);
      dispatchDailyRolloverEvent({
        dateKey: nextDateKey,
        previousDateKey,
        reason,
      });

      return true;
    },
    [showNotice],
  );

  useEffect(() => {
    function clearNextDayTimeout() {
      if (!nextDayTimeoutRef.current) return;
      window.clearTimeout(nextDayTimeoutRef.current);
      nextDayTimeoutRef.current = null;
    }

    function scheduleNextDayCheck() {
      clearNextDayTimeout();

      const delay = Math.min(getMillisecondsUntilNextLocalDay(), MAX_TIMEOUT_MS);
      nextDayTimeoutRef.current = window.setTimeout(() => {
        checkForRollover("timer");
        scheduleNextDayCheck();
      }, delay);
    }

    function checkAfterTabWake() {
      checkForRollover("tab-wake");
      scheduleNextDayCheck();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        checkAfterTabWake();
      }
    }

    scheduleNextDayCheck();
    window.addEventListener("focus", checkAfterTabWake);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearNextDayTimeout();
      window.removeEventListener("focus", checkAfterTabWake);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkForRollover]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  return {
    dateKey,
    notice,
    dismissNotice,
  };
}
