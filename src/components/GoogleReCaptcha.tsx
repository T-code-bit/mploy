import { useEffect, useRef, useCallback, useState } from "react";

const RECAPTCHA_SITE_KEY = "6LdDyZ4sAAAAALpayoNXABG7Y1CUV5tO53-1J1RE";

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
    onReCaptchaLoad?: () => void;
    __recaptchaCallbacks?: Array<() => void>;
  }
}

let scriptLoaded = false;
let scriptReady = false;

function loadRecaptchaScript(onReady: () => void) {
  if (scriptReady && window.grecaptcha) {
    onReady();
    return;
  }

  if (!window.__recaptchaCallbacks) {
    window.__recaptchaCallbacks = [];
  }
  window.__recaptchaCallbacks.push(onReady);

  if (!scriptLoaded) {
    scriptLoaded = true;
    window.onReCaptchaLoad = () => {
      scriptReady = true;
      window.__recaptchaCallbacks?.forEach((cb) => cb());
      window.__recaptchaCallbacks = [];
    };

    // Remove any existing reCAPTCHA script to avoid conflicts
    const existing = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoad&render=explicit";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Failed to load reCAPTCHA script");
      scriptLoaded = false;
    };
    document.head.appendChild(script);
  }
}

const GoogleReCaptcha = ({ onVerify, onExpire, onError }: GoogleReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  const [loadError, setLoadError] = useState(false);
  callbacksRef.current = { onVerify, onExpire, onError };

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) return;
    try {
      // Clear container first to avoid duplicate widgets
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
      console.error("reCAPTCHA render error:", e);
      setLoadError(true);
    }
  }, []);

  const retryLoad = useCallback(() => {
    widgetIdRef.current = null;
    scriptLoaded = false;
    scriptReady = false;
    setLoadError(false);
    loadRecaptchaScript(renderWidget);
  }, [renderWidget]);

  useEffect(() => {
    loadRecaptchaScript(renderWidget);
    return () => {
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
