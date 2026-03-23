import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "R0",
    period: "/month",
    description: "Get started with basic access",
    features: ["Basic job search", "1 CV template", "3 academy lessons", "Job alerts"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "R149",
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
    price: "R999",
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
  <section className="py-24 bg-muted/50">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
          Plans That Fit Your Journey
        </h2>
        <p className="text-muted-foreground">Freemium for candidates. Flexible plans for employers.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`rounded-2xl p-8 border ${
              plan.highlighted
                ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow scale-105"
                : "bg-card text-card-foreground border-border shadow-card"
            }`}
          >
            <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
            <div className="mt-4 mb-2">
              <span className="font-display text-4xl font-bold">{plan.price}</span>
              <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.period}
              </span>
            </div>
            <p className={`text-sm mb-6 ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {plan.description}
            </p>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-secondary" : "text-primary"}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full ${
                plan.highlighted
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
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
