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
      render: (container: HTMLElement, options: Record<string, unknown>) => number;
      reset: (widgetId: number) => void;
    };
    onReCaptchaLoad?: () => void;
  }
}

const GoogleReCaptcha = ({ onVerify, onExpire, onError }: GoogleReCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha) return;
    if (widgetIdRef.current !== null) {
      window.grecaptcha.reset(widgetIdRef.current);
      return;
    }
    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
      sitekey: RECAPTCHA_SITE_KEY,
      callback: onVerify,
      "expired-callback": onExpire,
      "error-callback": onError,
      theme: "light",
    });
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    if (window.grecaptcha?.render) {
      renderWidget();
      return;
    }

    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (!existingScript) {
      window.onReCaptchaLoad = renderWidget;
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      window.onReCaptchaLoad = renderWidget;
    }

    return () => {
      widgetIdRef.current = null;
    };
  }, [renderWidget]);

  return <div ref={containerRef} className="flex justify-center my-3" />;
};

export default GoogleReCaptcha;
