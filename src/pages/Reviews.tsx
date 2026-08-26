import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, Loader2, Sparkles, ShieldCheck, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import usePageTitle from "@/hooks/usePageTitle";

const Reviews = () => {
  usePageTitle("Reviews");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | 5 | 4>("all");
  const [form, setForm] = useState({
    name: "",
    role: "",
    location: "",
    text: "",
    rating: 5,
    highlight: "",
  });

  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ["approved-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / total : 0;
    const five = reviews.filter((r: any) => r.rating === 5).length;
    return { total, avg, five };
  }, [reviews]);

  const filtered = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((r: any) => r.rating === filter)),
    [reviews, filter]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      toast.error("Name and review text are required");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("reviews").insert({
        name: form.name.trim(),
        role: form.role.trim() || null,
        location: form.location.trim() || null,
        text: form.text.trim(),
        rating: form.rating,
        highlight: form.highlight.trim() || null,
        user_id: user?.id || null,
        is_approved: false,
      });
      if (error) throw error;
      toast.success("Thank you — your story is queued for review.");
      setForm({ name: "", role: "", location: "", text: "", rating: 5, highlight: "" });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-40 right-0 w-[420px] h-[420px] rounded-full bg-secondary/15 blur-[120px]" />

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/70 backdrop-blur border border-border mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">Verified Voices</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5"
          >
            Stories from the <span className="text-gradient-accent">M-Ploy</span> community
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground max-w-xl mx-auto text-lg"
          >
            Every review is hand-verified by our team before it goes live — no bots, no fakes.
          </motion.p>

          {/* Stats bento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-12 grid grid-cols-3 max-w-2xl mx-auto gap-3"
          >
            {[
              { label: "Average rating", value: stats.avg ? stats.avg.toFixed(1) : "—", icon: Star },
              { label: "Total stories", value: stats.total, icon: Quote },
              { label: "5-star reviews", value: stats.five, icon: Sparkles },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl bg-card/70 backdrop-blur border border-border p-5 text-left shadow-card hover:shadow-lg transition-all"
              >
                <s.icon className="h-4 w-4 text-secondary mb-2" />
                <div className="font-display text-2xl md:text-3xl font-bold">{s.value}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10">
          {/* Submit panel — premium glass card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-card to-card/60 shadow-xl">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 to-transparent pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />

              <div className="relative p-7 md:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                    <Quote className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-secondary">Share your story</span>
                </div>
                <h2 className="font-display text-2xl font-bold mb-1">Tell us how it went</h2>
                <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Verified by a real human before publishing.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Full name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl h-11 mt-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="role" className="text-xs uppercase tracking-wider text-muted-foreground">Role</Label>
                      <Input id="role" placeholder="Software Dev" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-xl h-11 mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-xs uppercase tracking-wider text-muted-foreground">Location</Label>
                      <Input id="location" placeholder="Nairobi, KE" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="rounded-xl h-11 mt-1.5" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Your rating</Label>
                    <div className="flex gap-1 mt-2 p-2 rounded-xl bg-muted/40 border border-border w-fit">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm({ ...form, rating: n })}
                          className="p-1 transition-transform hover:scale-110"
                          aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        >
                          <Star className={`h-6 w-6 transition-colors ${n <= form.rating ? "fill-secondary text-secondary drop-shadow" : "text-muted-foreground/40"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="highlight" className="text-xs uppercase tracking-wider text-muted-foreground">Headline (optional)</Label>
                    <Input id="highlight" placeholder="Hired in 3 weeks" value={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.value })} maxLength={40} className="rounded-xl h-11 mt-1.5" />
                  </div>

                  <div>
                    <Label htmlFor="text" className="text-xs uppercase tracking-wider text-muted-foreground">Your story *</Label>
                    <Textarea id="text" rows={5} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required maxLength={500} className="rounded-xl mt-1.5 resize-none" />
                    <p className="text-[11px] text-muted-foreground mt-1 text-right">{form.text.length}/500</p>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Send className="h-4 w-4 mr-2" /> Submit Review</>)}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Reviews stream */}
          <div>
            {/* Filter pills */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-display text-2xl font-bold">Latest voices</h2>
              <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border">
                {([
                  { k: "all" as const, label: "All" },
                  { k: 5 as const, label: "5★" },
                  { k: 4 as const, label: "4★" },
                ]).map((opt) => (
                  <button
                    key={String(opt.k)}
                    onClick={() => setFilter(opt.k)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filter === opt.k
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-card/40">
                <Quote className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No reviews yet — be the first to share your story.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((r: any, idx: number) => (
                    <motion.article
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05, duration: 0.35 }}
                      className="group relative rounded-2xl bg-card border border-border p-6 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Quote className="h-10 w-10 text-primary/8 absolute top-4 right-4" />

                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                        ))}
                      </div>

                      {r.highlight && (
                        <div className="inline-flex px-2 py-0.5 rounded-md bg-secondary/10 mb-3">
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{r.highlight}</span>
                        </div>
                      )}

                      <p className="text-foreground/90 leading-relaxed text-[15px] mb-5">"{r.text}"</p>

                      <div className="flex items-center gap-3 pt-4 border-t border-border">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold ring-2 ring-card shadow">
                          {r.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate flex items-center gap-1.5">
                            {r.name}
                            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          </p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            {r.role && <span>{r.role}</span>}
                            {r.location && <><MapPin className="h-3 w-3" />{r.location}</>}
                          </p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reviews;
