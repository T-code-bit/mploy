import { useEffect, useRef, useCallback, useState } from "react";

const RECAPTCHA_SITE_KEY = "6LdDyZ4sAAAAALpayoNXABG7Y1CUV5tO53-1J1RE";
const SCRIPT_ID = "recaptcha-api-script";

interface GoogleReCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (container: HTMLElement, options: Record<string, unknown>) => number;
      reset: (widgetId: number) => void;
    };
  }
}

function ensureRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded and available
    if (window.grecaptcha?.ready) {
      window.grecaptcha.ready(() => resolve());
      return;
    }

    // If script tag exists but not yet loaded, wait for it
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      const check = () => {
        if (window.grecaptcha?.ready) {
          window.grecaptcha.ready(() => resolve());
        } else {
          setTimeout(check, 100);
        }
      };
      check();
      return;
    }

    // Load fresh
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const wait = () => {
        if (window.grecaptcha?.ready) {
          window.grecaptcha.ready(() => resolve());
        } else {
          setTimeout(wait, 100);
        }
      };
      wait();
    };
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });
}

const GoogleReCaptcha = ({ onVerify, onExpire, onError }: GoogleReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  const [loadError, setLoadError] = useState(false);
  callbacksRef.current = { onVerify, onExpire, onError };

  const renderWidget = useCallback(async () => {
    try {
      await ensureRecaptchaScript();
      if (!mountedRef.current || !containerRef.current || !window.grecaptcha) return;

      // Reset if already rendered
      if (widgetIdRef.current !== null) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch {}
        return;
      }

      containerRef.current.innerHTML = "";
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: (token: string) => callbacksRef.current.onVerify(token),
        "expired-callback": () => callbacksRef.current.onExpire?.(),
        "error-callback": () => {
          callbacksRef.current.onError?.();
          setLoadError(true);
        },
        theme: "light",
      });
      setLoadError(false);
    } catch (e) {
      console.error("reCAPTCHA error:", e);
      if (mountedRef.current) setLoadError(true);
    }
  }, []);

  const retryLoad = useCallback(() => {
    // Remove old script to force fresh load
    const old = document.getElementById(SCRIPT_ID);
    if (old) old.remove();
    widgetIdRef.current = null;
    setLoadError(false);
    renderWidget();
  }, [renderWidget]);

  useEffect(() => {
    mountedRef.current = true;
    renderWidget();
    return () => {
      mountedRef.current = false;
      widgetIdRef.current = null;
    };
  }, [renderWidget]);

  return (
    <div className="flex flex-col items-center my-3">
      <div ref={containerRef} />
      {loadError && (
        <button
          type="button"
          onClick={retryLoad}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Security check failed to load. Click to retry.
        </button>
      )}
    </div>
  );
};

export default GoogleReCaptcha;
