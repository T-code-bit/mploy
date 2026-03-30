import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscription";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface UpgradeBannerProps {
  requiredTier: SubscriptionTier;
  feature: string;
}

const UpgradeBanner = ({ requiredTier, feature }: UpgradeBannerProps) => {
  const { subscriptionTier } = useAuth();
  const tierOrder: SubscriptionTier[] = ["free", "basic", "premium"];
  const currentIdx = tierOrder.indexOf(subscriptionTier);
  const requiredIdx = tierOrder.indexOf(requiredTier);

  if (currentIdx >= requiredIdx) return null;

  const targetPlan = SUBSCRIPTION_TIERS[requiredTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
              Upgrade to {targetPlan.name}
              <Sparkles className="h-4 w-4 text-secondary" />
            </h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              {feature} is available on the <strong>{targetPlan.name}</strong> plan ({targetPlan.price}{targetPlan.period}).
              Upgrade now to unlock this and more!
            </p>
          </div>
        </div>
        <Link to="/#pricing">
          <Button className="bg-gradient-primary text-primary-foreground rounded-xl gap-2 shrink-0">
            View Plans <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default UpgradeBanner;
