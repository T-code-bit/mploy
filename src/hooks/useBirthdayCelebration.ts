import { useEffect, useState } from "react";

export const BIRTHDAY_START = Date.parse("2026-10-07T00:00:00+03:00");
export const BIRTHDAY_END = Date.parse("2026-10-08T00:00:00+03:00");
export const isBirthdayActive = (now = Date.now()) => now >= BIRTHDAY_START && now < BIRTHDAY_END;

export default function useBirthdayCelebration() {
  const [active, setActive] = useState(isBirthdayActive);
  useEffect(() => {
    const refresh = () => setActive(isBirthdayActive());
    const remaining = BIRTHDAY_END - Date.now();
    const timeout = remaining > 0 ? window.setTimeout(refresh, remaining) : undefined;
    const interval = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return active;
}