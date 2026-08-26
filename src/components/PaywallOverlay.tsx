import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscription";

interface PaywallOverlayProps {
  requiredTier: SubscriptionTier;
  children: React.ReactNode;
  feature?: string;
}

const PaywallOverlay = ({ requiredTier, children, feature }: PaywallOverlayProps) => {
  const { subscriptionTier, userRole } = useAuth();
  const tierOrder: SubscriptionTier[] = ["free", "basic", "premium"];
  const currentIdx = tierOrder.indexOf(subscriptionTier);
  const requiredIdx = tierOrder.indexOf(requiredTier);

  if (userRole === "admin" || currentIdx >= requiredIdx) return <>{children}</>;

  const targetPlan = SUBSCRIPTION_TIERS[requiredTier];

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl">
        <div className="text-center p-6 max-w-sm">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h4 className="font-display font-bold text-foreground text-lg mb-1">
            {targetPlan.name} Feature
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {feature || `This feature requires the ${targetPlan.name} plan.`}
          </p>
          <Link to="/#pricing">
            <Button className="bg-gradient-primary text-primary-foreground rounded-xl gap-2">
              <Sparkles className="h-4 w-4" /> Upgrade to {targetPlan.name}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaywallOverlay;
