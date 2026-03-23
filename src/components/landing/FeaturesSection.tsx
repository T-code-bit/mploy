import { motion } from "framer-motion";
import { ShieldCheck, FileSearch, Layout, GraduationCap } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Vault",
    description: "A curated feed of authenticated job openings. Eliminates ghost postings and data-scraping scams.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileSearch,
    title: "ATS Architect",
    description: "Real-time CV analysis against specific job descriptions with a scoring engine to predict match rates.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Layout,
    title: "Dynamic Templates",
    description: "Industry-specific CV designs optimized for readability by AI parsers like Workday and Taleo.",
    color: "bg-success/10 text-success",
  },
  {
    icon: GraduationCap,
    title: "Ready-to-Work Academy",
    description: "Self-paced modules on communication, digital literacy, and EQ. Earn TrustBadges for your profile.",
    color: "bg-destructive/10 text-destructive",
  },
];

const FeaturesSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Platform Pillars</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
          Everything You Need to Get Hired
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          From verified opportunities to ATS-ready CVs and employability training — all in one integrated ecosystem.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-semibold text-card-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
