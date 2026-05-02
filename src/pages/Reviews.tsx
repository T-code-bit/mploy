import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Quote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import usePageTitle from "@/hooks/usePageTitle";

const Reviews = () => {
  usePageTitle("Reviews");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", role: "", location: "", text: "", rating: 5, highlight: "",
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
      return data;
    },
  });

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
      toast.success("Thanks! Your review is awaiting admin approval.");
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">Community Reviews</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            All reviews are verified by our admin team before being published.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submit form */}
          <Card className="p-6 lg:sticky lg:top-24 h-fit">
            <h2 className="font-display text-xl font-bold mb-4">Share Your Story</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="e.g. Software Dev" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Nairobi, Kenya" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Rating</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      className="p-1"
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    >
                      <Star className={`h-6 w-6 ${n <= form.rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="highlight">Highlight (optional)</Label>
                <Input id="highlight" placeholder="e.g. Hired in 3 weeks" value={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.value })} maxLength={40} />
              </div>
              <div>
                <Label htmlFor="text">Your review *</Label>
                <Textarea id="text" rows={5} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required maxLength={500} />
                <p className="text-xs text-muted-foreground mt-1">{form.text.length}/500</p>
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-xl">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Review"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Reviews are reviewed by an admin before going live.
              </p>
            </form>
          </Card>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No approved reviews yet — be the first to share your story.</p>
              </Card>
            ) : (
              reviews.map((r: any) => (
                <Card key={r.id} className="p-6 relative">
                  <Quote className="h-8 w-8 text-primary/10 absolute top-5 right-5" />
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  {r.highlight && (
                    <div className="inline-flex px-2 py-0.5 rounded-md bg-primary/8 mb-3">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{r.highlight}</span>
                    </div>
                  )}
                  <p className="text-foreground/90 leading-relaxed mb-4">"{r.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">{r.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[r.role, r.location].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reviews;
