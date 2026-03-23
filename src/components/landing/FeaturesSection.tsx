import { motion } from "framer-motion";
import { ShieldCheck, FileSearch, Layout, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Vault",
    description: "Curated, authenticated job openings. Zero ghost postings, zero data-scraping scams.",
    href: "/jobs",
    gradient: "from-primary/10 to-primary/5",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: FileSearch,
    title: "ATS Architect",
    description: "Real-time CV analysis against job descriptions with predictive match scoring.",
    href: "/cv-builder",
    gradient: "from-secondary/10 to-secondary/5",
    iconBg: "bg-secondary/10 text-secondary",
  },
  {
    icon: Layout,
    title: "Dynamic Templates",
    description: "Industry-specific CV designs optimized for AI parsers like Workday and Taleo.",
    href: "/cv-builder",
    gradient: "from-success/10 to-success/5",
    iconBg: "bg-success/10 text-success",
  },
  {
    icon: GraduationCap,
    title: "Ready-to-Work Academy",
    description: "Self-paced modules on communication, digital literacy, and EQ with TrustBadges.",
    href: "/academy",
    gradient: "from-destructive/10 to-destructive/5",
    iconBg: "bg-destructive/8 text-destructive",
  },
];

const FeaturesSection = () => (
  <section className="py-28 bg-background bg-mesh relative">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Platform Pillars</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
          Everything You Need to <span className="text-gradient-primary">Get Hired</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed text-lg">
          From verified opportunities to ATS-ready CVs and employability training — all in one integrated ecosystem.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <Link
              to={feature.href}
              className={`group block bg-card rounded-2xl p-7 border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 h-full card-shine`}
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.iconBg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-card-foreground mb-2.5">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
