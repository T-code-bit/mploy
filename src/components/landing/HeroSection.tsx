import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, FileCheck, GraduationCap, ArrowRight, Sparkles, Globe, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="relative bg-hero min-h-screen flex items-center overflow-hidden">
    {/* Animated gradient orbs */}
    <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
    <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] rounded-full bg-secondary/6 blur-[140px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/4 blur-[160px] rotate-45" />

    {/* Dot pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

    <div className="container mx-auto px-4 relative z-10 py-32">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-dark mb-8"
          >
            <Sparkles className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground/80">AI-powered career platform</span>
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
            <span className="text-primary-foreground">Stop Searching.</span>
            <br />
            <span className="text-primary-foreground">Start </span>
            <span className="text-gradient-accent">Getting Hired.</span>
          </h1>

          <p className="text-lg text-primary-foreground/60 max-w-xl mb-10 leading-relaxed">
            Verified job listings. ATS-optimized CVs. Employability training.
            M-Ploy is the trusted bridge between you and your next career move — globally.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link to="/jobs">
              <Button size="lg" className="bg-gradient-accent text-secondary-foreground font-semibold px-8 rounded-xl shadow-glow-accent hover:shadow-glow-accent transition-shadow h-13 text-base">
                Find Verified Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cv-builder">
              <Button size="lg" variant="outline" className="border-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/8 rounded-xl h-13 text-base">
                Build Your CV
              </Button>
            </Link>
          </div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center gap-6 text-primary-foreground/40"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">Global Reach</span>
            </div>
            <div className="h-4 w-px bg-primary-foreground/15" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">10K+ Users</span>
            </div>
            <div className="h-4 w-px bg-primary-foreground/15" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">95% ATS Rate</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats bento grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:grid grid-cols-2 gap-4"
        >
          {[
            { icon: ShieldCheck, value: "100%", label: "Verified Jobs", desc: "Every listing authenticated", accent: "from-primary/20 to-primary/5" },
            { icon: FileCheck, value: "95%", label: "ATS Pass Rate", desc: "Optimized for all parsers", accent: "from-secondary/20 to-secondary/5" },
            { icon: GraduationCap, value: "50+", label: "Courses", desc: "Skill-building modules", accent: "from-primary/15 to-primary/5" },
            { icon: Sparkles, value: "10K+", label: "Users", desc: "Trust our platform", accent: "from-secondary/15 to-secondary/5" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              className={`glass-dark rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 ${i === 0 ? "col-span-2" : ""}`}
            >
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.accent} mb-3`}>
                <stat.icon className="h-5 w-5 text-primary-foreground/80" />
              </div>
              <p className="font-display text-3xl font-bold text-primary-foreground mb-0.5">{stat.value}</p>
              <p className="text-sm font-medium text-primary-foreground/70">{stat.label}</p>
              <p className="text-xs text-primary-foreground/40 mt-0.5">{stat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
