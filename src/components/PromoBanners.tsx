import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, BookOpen, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import bookCover from "@/assets/agile-jobseeker-book.jpg";
import summitPoster from "@/assets/aes-summit-november-2026.webp";
import useBirthdayCelebration from "@/hooks/useBirthdayCelebration";

// The event banner disappears automatically after 6 November 2026 (end of day, EAT).
export const AES_END = new Date("2026-11-06T23:59:59+03:00");
export const AES_FORM_URL =
  "https://forms.gle/5KMudVrZ6d3DGxUu7";
export const BOOK_PHONE = "+254 717 627632";
export const BOOK_TEL = "+254717627632";
const PROMO_LAST_SHOWN_KEY = "mploy-promotions-last-shown-v2";
const PROMO_INTERVAL_MS = 24 * 60 * 60 * 1000;

const isSummitLive = () => Date.now() <= AES_END.getTime();

/** Full-screen announcement shown at most once every 24 hours per browser. */
const PromoBanners = () => {
  const [open, setOpen] = useState(false);
  const birthdayActive = useBirthdayCelebration();
  const summitLive = isSummitLive();

  useEffect(() => {
    let shownWithinLastDay = false;
    try {
      const lastShown = Number(localStorage.getItem(PROMO_LAST_SHOWN_KEY) || 0);
      shownWithinLastDay = Number.isFinite(lastShown) && Date.now() - lastShown < PROMO_INTERVAL_MS;
    } catch {
      // If storage is unavailable, show the announcement without breaking the site.
    }
    if (shownWithinLastDay) return;

    const t = setTimeout(() => {
      setOpen(true);
      try {
        localStorage.setItem(PROMO_LAST_SHOWN_KEY, String(Date.now()));
      } catch {
        // Storage can be unavailable in privacy modes.
      }
    }, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {open && !birthdayActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="M-Ploy announcements"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl my-auto rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close announcements"
              className="absolute right-3 top-3 z-10 rounded-full bg-background/90 border border-border p-2 hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid sm:grid-cols-2">
              {/* Book promo — permanent */}
              <div className="p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-border">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-secondary/15 text-secondary px-2.5 py-1">
                  <BookOpen className="h-3.5 w-3.5" /> New Book
                </span>
                <img
                  src={bookCover}
                  alt="The Agile Jobseeker book by Cavin O. Apodo"
                  className="mt-3 w-full rounded-2xl object-cover shadow-lg"
                  loading="eager"
                />
                <h3 className="mt-4 text-lg font-bold leading-snug">The Agile Jobseeker</h3>
                <p className="text-sm text-muted-foreground">
                  A guide for future-proofing your career and attaining excellence (from intern to icon)
                  — by Cavin O. Apodo.
                </p>
                <p className="mt-3 text-xl font-extrabold text-primary">KSh 1,000</p>
                <Button asChild className="mt-3 w-full rounded-full bg-gradient-primary text-primary-foreground">
                  <a href={`tel:${BOOK_TEL}`}>
                    <Phone className="h-4 w-4" /> Order: {BOOK_PHONE}
                  </a>
                </Button>
              </div>

              {/* Summit promo — auto-expires after 3 Oct 2026 */}
              {summitLive ? (
                <div className="p-5 sm:p-6">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-primary/15 text-primary px-2.5 py-1">
                    <CalendarDays className="h-3.5 w-3.5" /> 5–6 November 2026
                  </span>
                  <img
                    src={summitPoster}
                    alt="African Employability Summit 2026, 5–6 November at The Nairobi National Polytechnic"
                    className="mt-3 w-full rounded-2xl object-cover shadow-lg"
                    loading="eager"
                  />
                  <h3 className="mt-4 text-lg font-bold leading-snug">African Employability Summit 2026</h3>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> The Nairobi National Polytechnic, Nairobi
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Building Africa's future workforce. Connect. Empower. Employ.
                  </p>
                  <Button asChild className="mt-3 w-full rounded-full bg-gradient-primary text-primary-foreground">
                    <a href={AES_FORM_URL} target="_blank" rel="noopener noreferrer">
                      Register Now <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="p-5 sm:p-6 flex flex-col justify-center">
                  <h3 className="text-lg font-bold">Grab your copy today</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Call or WhatsApp {BOOK_PHONE} to order "The Agile Jobseeker" for KSh 1,000 —
                    delivered anywhere in Kenya.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Slim always-on strip promoting the book. */
export const BookStrip = () => (
  <div className="flex w-full flex-wrap items-center justify-center gap-x-1.5 bg-gradient-primary px-3 py-2 text-center text-xs text-primary-foreground sm:text-sm">
    <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span className="font-semibold">"The Agile Jobseeker" by Cavin O. Apodo — KSh 1,000.</span>
    <a href={`tel:${BOOK_TEL}`} className="underline underline-offset-2 font-semibold">
      Order on {BOOK_PHONE}
    </a>
  </div>
);

export default PromoBanners;
