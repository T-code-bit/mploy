import { useEffect, useRef, useCallback } from "react";

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

// Load the script once globally
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
    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoad&render=explicit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

const GoogleReCaptcha = ({ onVerify, onExpire, onError }: GoogleReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire, onError });
  callbacksRef.current = { onVerify, onExpire, onError };

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) return;
    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: (token: string) => callbacksRef.current.onVerify(token),
        "expired-callback": () => callbacksRef.current.onExpire?.(),
        "error-callback": () => callbacksRef.current.onError?.(),
        theme: "light",
      });
    } catch (e) {
      console.error("reCAPTCHA render error:", e);
    }
  }, []);

  useEffect(() => {
    loadRecaptchaScript(renderWidget);
    return () => {
      widgetIdRef.current = null;
    };
  }, [renderWidget]);

  return <div ref={containerRef} className="flex justify-center my-3" />;
};

export default GoogleReCaptcha;
