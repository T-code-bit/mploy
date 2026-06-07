import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Preemptively clear stale Supabase auth tokens if the auth service is unreachable.
// Prevents the page from being stuck in an endless refresh-token loop during an
// upstream auth outage (Cloudflare 522 on /auth/v1/token).
(async () => {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (keys.length === 0) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch("https://ypqdeaarllhwnxyijshs.supabase.co/auth/v1/health", {
      headers: {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcWRlYWFybGxod254eWlqc2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDg3MzQsImV4cCI6MjA4OTgyNDczNH0.HDcMDrab9YJSw1ii07iE9XPaZMpcO7t6-N1qpMteX1w",
      },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Auth service unreachable — purge stale tokens so the UI doesn't loop.
    Object.keys(localStorage)
      .filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
      .forEach((k) => localStorage.removeItem(k));
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
