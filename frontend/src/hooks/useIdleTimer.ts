import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeoutMs: number;
  warningMs: number;
  onWarning: () => void;
  onLogout: () => void;
}

export const useIdleTimer = ({
  timeoutMs,
  warningMs,
  onWarning,
  onLogout,
}: UseIdleTimerOptions) => {
  const logoutTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current)  clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    warningTimer.current = setTimeout(onWarning, timeoutMs - warningMs);
    logoutTimer.current  = setTimeout(onLogout,  timeoutMs);
  }, [timeoutMs, warningMs, onWarning, onLogout, clearTimers]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleActivity = () => resetTimers();

    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    resetTimers();

    return () => {
      clearTimers();
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [resetTimers, clearTimers]);
};
