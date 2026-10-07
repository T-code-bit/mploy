import { useRef, useState } from "react";
import { CalendarDays, ExternalLink, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import BirthdayCelebration from "@/components/BirthdayCelebration";
import summitPoster from "@/assets/aes-summit-november-2026.webp";
import { AES_FORM_URL } from "@/components/PromoBanners";

/**
 * Swipeable hero shown while the birthday celebration is active.
 * Slide 1: birthday celebration. Slide 2: AES summit poster advert.
 * The poster stays live here and in the PromoBanners popup after the celebration ends.
 */
export default function SwipeHero() {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - (startY.current ?? 0);
    startX.current = null;
    startY.current = null;
    // Only treat mostly-horizontal gestures as swipes.
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    setIndex((prev) => Math.min(1, Math.max(0, prev + (dx < 0 ? 1 : -1))));
  };

  return (
    <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        <div className="w-full shrink-0"><BirthdayCelebration /></div>
        <div className="w-full shrink-0"><SummitAdSlide /></div>
      </div>

      {/* Slide controls */}
      <button
        onClick={() => setIndex(0)}
        aria-label="Back to celebration"
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/60 p-2 text-primary-foreground backdrop-blur-sm transition-opacity hover:bg-background/80"
        style={{ opacity: index === 0 ? 0.35 : 1 }}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setIndex(1)}
        aria-label="Next: African Employability Summit"
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/60 p-2 text-primary-foreground backdrop-blur-sm transition-opacity hover:bg-background/80"
        style={{ opacity: index === 1 ? 0.35 : 1 }}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {["Birthday", "AES Summit"].map((label, i) => (
          <button
            key={label}
            onClick={() => setIndex(i)}
            aria-label={label}
            className={`h-2.5 rounded-full transition-all ${index === i ? "w-7 bg-secondary" : "w-2.5 bg-primary-foreground/50 hover:bg-primary-foreground/80"}`}
          />
        ))}
      </div>
    </div>
  );
}

function SummitAdSlide() {
  return (
    <section className="birthday-hero" aria-label="African Employability Summit 2026">
      <img
        className="summit-poster"
        src={summitPoster}
        alt="African Employability Summit 2026 poster — 5–6 November, The Nairobi National Polytechnic"
        loading="lazy"
      />
      <div className="birthday-shade" aria-hidden="true" />
      <div className="container relative z-10 mx-auto flex h-full items-end px-5 pb-16 pt-28 sm:px-8 lg:items-center lg:justify-end lg:pb-8">
        <div className="birthday-copy">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1.5 text-sm font-semibold text-secondary backdrop-blur-sm">
            <CalendarDays className="h-4 w-4" /> 5–6 November 2026
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            African Employability<br /><span className="text-secondary">Summit 2026</span>
          </h2>
          <p className="mt-4 inline-flex items-center gap-2 text-lg font-semibold text-primary-foreground">
            <MapPin className="h-5 w-5 text-secondary" /> The Nairobi National Polytechnic, Nairobi
          </p>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Building Africa's future workforce. Connect. Empower. Employ.
          </p>
          <a
            href={AES_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-transform hover:scale-[1.02]"
          >
            Register Now <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
