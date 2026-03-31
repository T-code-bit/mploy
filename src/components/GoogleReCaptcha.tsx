import { useEffect, useRef, useState } from "react";

const RECAPTCHA_SITE_KEY = "6LdDyZ4sAAAAALpayoNXABG7Y1CUV5tO53-1J1RE";

declare global {
  interface Window {
    grecaptcha: any;
    __rcReady?: Promise<any>;
  }
}

interface GoogleReCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

function getRecaptchaReady(): Promise<any> {
  if (!window.__rcReady) {
    window.__rcReady = new Promise((resolve, reject) => {
      if (window.grecaptcha?.render) {
        window.grecaptcha.ready(() => resolve(window.grecaptcha));
        return;
      }
      // Remove any stale script
      document.querySelectorAll('script[src*="recaptcha"]').forEach((s) => s.remove());
      const s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = () => {
        const poll = setInterval(() => {
          if (window.grecaptcha?.render) {
            clearInterval(poll);
            window.grecaptcha.ready(() => resolve(window.grecaptcha));
          }
        }, 50);
      };
      s.onerror = () => {
        window.__rcReady = undefined;
        reject(new Error("reCAPTCHA script failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return window.__rcReady;
}

const GoogleReCaptcha = ({ onVerify, onExpire, onError }: GoogleReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [loadError, setLoadError] = useState(false);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  callbacksRef.current = { onVerify, onExpire, onError };

  const doRender = () => {
    setLoadError(false);
    getRecaptchaReady()
      .then((g) => {
        const el = containerRef.current;
        if (!el) return;
        // Already rendered — just reset
        if (widgetIdRef.current !== null) {
          try { g.reset(widgetIdRef.current); } catch {}
          return;
        }
        el.innerHTML = "";
        widgetIdRef.current = g.render(el, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token: string) => callbacksRef.current.onVerify(token),
          "expired-callback": () => callbacksRef.current.onExpire?.(),
          "error-callback": () => {
            callbacksRef.current.onError?.();
            setLoadError(true);
          },
          theme: "light",
        });
      })
      .catch((err) => {
        console.error("reCAPTCHA load error:", err);
        setLoadError(true);
      });
  };

  const retry = () => {
    window.__rcReady = undefined;
    widgetIdRef.current = null;
    doRender();
  };

  useEffect(() => {
    doRender();
    return () => { widgetIdRef.current = null; };
  }, []);

  return (
    <div className="flex flex-col items-center my-3">
      <div ref={containerRef} />
      {loadError && (
        <button type="button" onClick={retry} className="mt-2 text-sm text-primary hover:underline">
          Security check failed to load. Click to retry.
        </button>
      )}
    </div>
  );
};

export default GoogleReCaptcha;
