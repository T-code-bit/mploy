import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "mploy-cookie-consent";

export type CookiePreferences = {
  essential: true;
  analytics: boolean;
  preferences: boolean;
};

export const getCookiePreferences = (): CookiePreferences | null => {
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    const existing = getCookiePreferences();
    if (!existing) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setVisible(false);
  };

  const acceptAll = () => savePreferences({ essential: true, analytics: true, preferences: true });
  const rejectOptional = () => savePreferences({ essential: true, analytics: false, preferences: false });
  const saveCustom = () => savePreferences({ essential: true, analytics, preferences });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Cookie className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-card-foreground text-sm">Cookie Preferences</h3>
              </div>
              <button onClick={rejectOptional} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              We use cookies to enhance your experience. Essential cookies are required for the platform to function.{" "}
              <Link to="/cookies" className="text-primary hover:underline">Learn more</Link>
            </p>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="space-y-3 pt-1">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                      <div>
                        <p className="text-xs font-semibold text-card-foreground">Essential</p>
                        <p className="text-xs text-muted-foreground">Required for site functionality</p>
                      </div>
                      <div className="h-5 w-9 rounded-full bg-primary flex items-center justify-end px-0.5 opacity-60 cursor-not-allowed">
                        <div className="h-4 w-4 rounded-full bg-primary-foreground" />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border cursor-pointer" onClick={() => setAnalytics(!analytics)}>
                      <div>
                        <p className="text-xs font-semibold text-card-foreground">Analytics</p>
                        <p className="text-xs text-muted-foreground">Help us improve M-Ploy</p>
                      </div>
                      <div className={`h-5 w-9 rounded-full flex items-center px-0.5 transition-colors ${analytics ? "bg-primary justify-end" : "bg-muted-foreground/30 justify-start"}`}>
                        <div className="h-4 w-4 rounded-full bg-primary-foreground transition-all" />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border cursor-pointer" onClick={() => setPreferences(!preferences)}>
                      <div>
                        <p className="text-xs font-semibold text-card-foreground">Preferences</p>
                        <p className="text-xs text-muted-foreground">Remember your settings</p>
                      </div>
                      <div className={`h-5 w-9 rounded-full flex items-center px-0.5 transition-colors ${preferences ? "bg-primary justify-end" : "bg-muted-foreground/30 justify-start"}`}>
                        <div className="h-4 w-4 rounded-full bg-primary-foreground transition-all" />
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              {showDetails ? (
                <>
                  <Button variant="outline" size="sm" onClick={rejectOptional} className="flex-1 rounded-xl text-xs h-9">
                    Reject Optional
                  </Button>
                  <Button size="sm" onClick={saveCustom} className="flex-1 bg-gradient-primary text-primary-foreground rounded-xl text-xs h-9">
                    Save Preferences
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowDetails(true)} className="flex-1 rounded-xl text-xs h-9">
                    Customize
                  </Button>
                  <Button size="sm" onClick={acceptAll} className="flex-1 bg-gradient-primary text-primary-foreground rounded-xl text-xs h-9">
                    Accept All
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
