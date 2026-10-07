import { Cake, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useBirthdayCelebration from "@/hooks/useBirthdayCelebration";
import photo from "@/assets/phin-birthday.jpg.asset.json";

const birthdayPhotoUrl = new URL(photo.url, "https://mploy.lovable.app").href;

export function BirthdayConfetti() {
  const active = useBirthdayCelebration();
  if (!active) return null;
  return <div className="birthday-confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</div>;
}

export default function BirthdayCelebration() {
  return (
    <section className="birthday-hero" aria-labelledby="birthday-heading">
      <img className="birthday-photo" src={birthdayPhotoUrl} alt="Phinnaline Achieng, M-Ploy’s Product Manager, smiling at an event" loading="eager" fetchPriority="high" />
      <div className="birthday-shade" aria-hidden="true" />
      <div className="container relative z-10 mx-auto flex h-full items-end px-5 pb-12 pt-28 sm:px-8 lg:items-center lg:justify-end lg:pb-8">
        <div className="birthday-copy">
          <p className="mb-5 flex items-center gap-2 text-sm font-semibold text-secondary"><Cake className="h-5 w-5" /> 7 October · A little extra joy at M-Ploy</p>
          <h1 id="birthday-heading" className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">Happy birthday,<br /><span className="text-secondary">Phin!</span> <Heart className="inline h-8 w-8 text-secondary" /></h1>
          <p className="mt-4 text-lg font-semibold text-primary-foreground">Phinnaline Achieng</p>
          <p className="mt-1 text-sm text-primary-foreground/75">Our Product Manager. Our reason to celebrate today.</p>
          <blockquote className="my-6 border-l-2 border-secondary pl-4 text-lg leading-relaxed text-primary-foreground sm:text-xl">“You turn ideas into possibilities and possibilities into experiences that change lives. May this new chapter bring you as much joy as you bring to the world.”</blockquote>
          <p className="flex items-center gap-2 text-sm text-primary-foreground/80"><Sparkles className="h-4 w-4 text-secondary" /> With love, your M-Ploy family</p>
          <Button asChild variant="secondary" className="mt-7"><Link to="/jobs">Explore opportunities <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </section>
  );
}