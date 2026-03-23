import { motion } from "framer-motion";
import { UserPlus, Search, FileText, Trophy } from "lucide-react";
import cvPreview from "@/assets/cv-builder-preview.jpg";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Profile",
    description: "Sign up in seconds and tell us about your career goals and experience level.",
  },
  {
    icon: Search,
    step: "02",
    title: "Discover Opportunities",
    description: "Browse verified job listings from trusted employers across the globe.",
  },
  {
    icon: FileText,
    step: "03",
    title: "Build & Optimize Your CV",
    description: "Use our ATS-optimized templates and get real-time scoring against job descriptions.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Get Hired",
    description: "Apply with confidence, track your applications, and land your dream role.",
  },
];

const HowItWorksSection = () => (
  <section className="py-28 bg-hero relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] rounded-full bg-primary/6 blur-[120px]" />

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/8 mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">How It Works</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-5 tracking-tight">
          Your Path to <span className="text-gradient-accent">Career Success</span>
        </h2>
        <p className="text-primary-foreground/50 text-lg">
          Four simple steps to transform your job search experience.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        {/* Steps */}
        <div className="space-y-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="flex gap-5 group"
            >
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-2xl glass-dark group-hover:scale-110 transition-transform duration-300">
                  <s.icon className="h-6 w-6 text-secondary" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-full bg-gradient-to-b from-primary-foreground/20 to-transparent mt-2" />
                )}
              </div>
              <div className="pb-6">
                <div className="text-xs font-bold text-secondary mb-1">{s.step}</div>
                <h3 className="font-display text-lg font-semibold text-primary-foreground mb-1.5">{s.title}</h3>
                <p className="text-sm text-primary-foreground/50 leading-relaxed">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="hidden lg:block"
        >
          <div className="rounded-3xl overflow-hidden shadow-xl border border-primary-foreground/10">
            <img
              src={cvPreview}
              alt="Graduates celebrating by throwing caps into the sky"
              className="w-full h-[420px] object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
