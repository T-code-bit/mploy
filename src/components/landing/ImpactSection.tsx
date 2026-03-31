import { motion } from "framer-motion";
import { ShieldOff, TrendingUp, Rocket, HandshakeIcon } from "lucide-react";

const impacts = [
  {
    icon: ShieldOff,
    title: "Reduce Job Scams",
    description: "Every listing is verified and authenticated before publication, eliminating fake postings and protecting job seekers.",
    stat: "Zero",
    statLabel: "Scam tolerance",
  },
  {
    icon: TrendingUp,
    title: "Improve Job Readiness",
    description: "Self-paced Academy courses build communication, digital literacy, and professional skills that employers demand.",
    stat: "50+",
    statLabel: "Skill courses",
  },
  {
    icon: Rocket,
    title: "Increase Employment",
    description: "ATS-optimized CVs and precision matching connect qualified candidates with the right opportunities faster.",
    stat: "95%",
    statLabel: "ATS pass rate",
  },
  {
    icon: HandshakeIcon,
    title: "Better Hiring Outcomes",
    description: "Employers access pre-screened, skill-tagged candidates — reducing time-to-hire and improving retention.",
    stat: "500+",
    statLabel: "Employers served",
  },
];

const ImpactSection = () => (
  <section className="py-28 bg-hero relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full bg-secondary/8 blur-[120px]" />

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/8 mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">Our Impact</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-5 tracking-tight">
          Driving <span className="text-gradient-accent">Real Change</span>
        </h2>
        <p className="text-primary-foreground/50 text-lg leading-relaxed">
          M-Ploy contributes to economic growth and workforce development by bridging the gap between talent and opportunity.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
        {impacts.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-dark rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform"
          >
            <div className="inline-flex p-3 rounded-xl bg-primary-foreground/8 mb-4">
              <item.icon className="h-6 w-6 text-secondary" />
            </div>
            <p className="font-display text-2xl font-bold text-primary-foreground mb-0.5">{item.stat}</p>
            <p className="text-[10px] text-primary-foreground/40 uppercase tracking-wider mb-3">{item.statLabel}</p>
            <h4 className="font-display font-semibold text-primary-foreground text-sm mb-2">{item.title}</h4>
            <p className="text-xs text-primary-foreground/50 leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ImpactSection;
