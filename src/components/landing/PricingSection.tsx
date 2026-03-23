import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Get started with basic access",
    features: ["Basic job search", "1 CV template", "3 academy lessons", "Job alerts"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$14",
    period: "/month",
    description: "Full power for serious job seekers",
    features: [
      "Unlimited verified jobs",
      "All CV templates",
      "ATS score reports",
      "Full academy access",
      "CV review & feedback",
      "Priority support",
    ],
    cta: "Go Premium",
    highlighted: true,
  },
  {
    name: "Employer",
    price: "$99",
    period: "/month",
    description: "Hire better talent faster",
    features: [
      "Unlimited job postings",
      "Featured listings",
      "Candidate database",
      "Recruitment dashboard",
      "Analytics & reports",
    ],
    cta: "Start Hiring",
    highlighted: false,
  },
];

const PricingSection = () => (
  <section className="py-28 bg-muted/40 bg-mesh relative">
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
        <p className="text-muted-foreground text-lg">Freemium for candidates. Flexible plans for employers.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className={`relative rounded-2xl p-8 border transition-all duration-300 ${
              plan.highlighted
                ? "bg-hero text-primary-foreground border-transparent shadow-xl scale-[1.03]"
                : "bg-card text-card-foreground border-border shadow-card hover:shadow-lg hover:-translate-y-1"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-gradient-accent text-secondary-foreground text-xs font-bold shadow-glow-accent">
                  Most Popular
                </span>
              </div>
            )}
            <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
            <div className="mt-5 mb-2">
              <span className="font-display text-5xl font-bold tracking-tight">{plan.price}</span>
              <span className={`text-sm ml-1 ${plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {plan.period}
              </span>
            </div>
            <p className={`text-sm mb-8 ${plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              {plan.description}
            </p>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <div className={`rounded-full p-0.5 mt-0.5 ${plan.highlighted ? "bg-secondary/20" : "bg-primary/10"}`}>
                    <Check className={`h-3 w-3 ${plan.highlighted ? "text-secondary" : "text-primary"}`} />
                  </div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full rounded-xl h-11 font-semibold ${
                plan.highlighted
                  ? "bg-gradient-accent text-secondary-foreground shadow-glow-accent hover:shadow-glow-accent"
                  : "bg-gradient-primary text-primary-foreground"
              }`}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
