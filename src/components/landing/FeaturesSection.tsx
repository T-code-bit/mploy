import { motion } from "framer-motion";
import { ShieldCheck, FileSearch, Layout, GraduationCap, ArrowRight, Briefcase, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Vault",
    description: "Curated, authenticated job openings from vetted employers worldwide. Zero ghost postings, zero scams.",
    href: "/jobs",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    stat: "100%",
    statLabel: "Verified",
  },
  {
    icon: FileSearch,
    title: "ATS Architect",
    description: "Real-time CV analysis against job descriptions with predictive match scoring powered by AI.",
    href: "/cv-builder",
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    stat: "95%",
    statLabel: "Pass rate",
  },
  {
    icon: Layout,
    title: "Dynamic Templates",
    description: "Industry-specific CV designs optimized for AI parsers like Workday, Taleo, and Greenhouse.",
    href: "/cv-builder",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    stat: "6+",
    statLabel: "Templates",
  },
  {
    icon: GraduationCap,
    title: "Ready-to-Work Academy",
    description: "Self-paced modules on communication, digital literacy, and EQ with verifiable TrustBadges.",
    href: "/academy",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    stat: "50+",
    statLabel: "Courses",
  },
  {
    icon: Briefcase,
    title: "Employer Portal",
    description: "Post jobs, manage applications, and find top talent with an intuitive recruitment dashboard.",
    href: "/employer",
    iconBg: "bg-destructive/8",
    iconColor: "text-destructive",
    stat: "500+",
    statLabel: "Employers",
  },
  {
    icon: BarChart3,
    title: "Career Dashboard",
    description: "Track applications, monitor your readiness score, and get personalized career insights.",
    href: "/dashboard",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    stat: "Real-time",
    statLabel: "Insights",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-28 bg-background bg-mesh relative">
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <Link
              to={feature.href}
              className="group block bg-card rounded-2xl p-7 border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 h-full card-shine"
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`inline-flex p-3 rounded-xl ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-foreground">{feature.stat}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{feature.statLabel}</p>
                </div>
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
