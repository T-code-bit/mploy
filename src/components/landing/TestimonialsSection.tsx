import { motion } from "framer-motion";
import { Star, Quote, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const TestimonialsSection = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["approved-reviews-landing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 mb-5">
            <Star className="h-3.5 w-3.5 text-secondary fill-secondary" />
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Reviews</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
            Loved by <span className="text-gradient-accent">Job Seekers</span> Worldwide
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories, verified by our team before they appear here.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 max-w-md mx-auto">
            <p className="text-muted-foreground mb-6">Be the first to share your M-Ploy story.</p>
            <Button asChild className="rounded-xl">
              <Link to="/reviews">Write a Review</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map((t: any, i: number) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative group"
              >
                <Quote className="h-8 w-8 text-primary/10 absolute top-5 right-5" />
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 text-secondary fill-secondary" />
                  ))}
                </div>
                {t.highlight && (
                  <div className="inline-flex px-2 py-0.5 rounded-md bg-primary/8 mb-3">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{t.highlight}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  {t.photo_url ? (
                    <img
                      src={t.photo_url}
                      alt={`${t.name}`}
                      className="h-11 w-11 rounded-xl object-cover ring-2 ring-border"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-border">
                      <span className="font-semibold text-primary">{t.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[t.role, t.location].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/reviews">Read all reviews · Share yours</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
