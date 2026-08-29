import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const tierOrder: SubscriptionTier[] = ["free", "basic", "premium"];

const PricingSection = () => {
  const { user, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (tier === "free") return;

    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-create-subscription", {
        body: { tier },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoadingTier(null);
    }
  };

  const getButtonLabel = (tier: SubscriptionTier) => {
    if (tier === subscriptionTier) return "Current Plan";
    if (tier === "free") return "Free Forever";
    const currentIdx = tierOrder.indexOf(subscriptionTier);
    const targetIdx = tierOrder.indexOf(tier);
    return targetIdx > currentIdx ? "Upgrade" : "Downgrade";
  };

  return (
    <section id="pricing" className="py-28 bg-muted/40 bg-mesh relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 mb-5">
            <Zap className="h-3.5 w-3.5 text-secondary" />
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Pricing</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
            Plans That Fit <span className="text-gradient-accent">Your Journey</span>
          </h2>
          <p className="text-muted-foreground text-lg">Secure monthly billing in KES via Paystack — cancel anytime.</p>
          <p className="mt-2 text-sm text-muted-foreground">Need a one-off CV? Start each CV build for <strong className="text-foreground">KES 10</strong> after secure Paystack verification; the purchase completes after export.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold">We accept:</span>
            {[
              "Visa", "Mastercard", "Amex", "Verve",
              "M-Pesa", "Airtel Money", "Paybill", "Till",
              "Bank Transfer", "USSD", "Apple Pay", "QR",
            ].map((m) => (
              <span key={m} className="px-2.5 py-1 rounded-full bg-muted border border-border font-medium">
                {m}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tierOrder.map((tierKey, i) => {
            const plan = SUBSCRIPTION_TIERS[tierKey];
            const isHighlighted = tierKey === "premium";
            const isCurrent = tierKey === subscriptionTier;

            return (
              <motion.div
                key={tierKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                  isHighlighted
                    ? "bg-hero text-primary-foreground border-transparent shadow-xl scale-[1.03]"
                    : "bg-card text-card-foreground border-border shadow-card hover:shadow-lg hover:-translate-y-1"
                } ${isCurrent ? "ring-2 ring-primary" : ""}`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-accent text-secondary-foreground text-xs font-bold shadow-glow-accent">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Your Plan
                    </span>
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <div className="mt-5 mb-2">
                  <span className="font-display text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className={`text-sm ml-1 ${isHighlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mb-8 ${isHighlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div className={`rounded-full p-0.5 mt-0.5 ${isHighlighted ? "bg-secondary/20" : "bg-primary/10"}`}>
                        <Check className={`h-3 w-3 ${isHighlighted ? "text-secondary" : "text-primary"}`} />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={isCurrent || loadingTier === tierKey}
                  onClick={() => handleSubscribe(tierKey)}
                  className={`w-full rounded-xl h-11 font-semibold ${
                    isCurrent
                      ? "bg-muted text-muted-foreground cursor-default"
                      : isHighlighted
                        ? "bg-gradient-accent text-secondary-foreground shadow-glow-accent hover:shadow-glow-accent"
                        : "bg-gradient-primary text-primary-foreground"
                  }`}
                >
                  {loadingTier === tierKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    getButtonLabel(tierKey)
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
