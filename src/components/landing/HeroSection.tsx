import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, FileCheck, GraduationCap, ArrowRight, Sparkles, Globe, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroTeam from "@/assets/hero-team.jpg";

const HeroSection = () => (
  <section className="relative bg-hero min-h-screen flex items-center overflow-hidden">
    <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse" />
    <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] rounded-full bg-secondary/6 blur-[140px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/4 blur-[160px] rotate-45" />
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
            M-Ploy is Kenya's trusted bridge between you and your next career move.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link to="/jobs" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-accent text-secondary-foreground font-semibold px-8 rounded-xl shadow-glow-accent hover:shadow-glow-accent transition-shadow h-13 text-base sm:w-auto">
                Find Verified Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cv-builder" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground rounded-xl h-13 text-base sm:w-auto">
                Build Your CV
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center gap-6 text-primary-foreground/40"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">Made in Kenya</span>
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

        {/* Right side: Hero image + floating stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <img
              src={heroTeam}
              alt="Professional team collaborating in a modern Kenyan office"
              className="w-full h-[480px] object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
          </div>

          {/* Floating stat cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="absolute -left-8 top-12 glass-dark rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <div className="p-2 rounded-xl bg-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary-foreground/80" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary-foreground">100%</p>
              <p className="text-xs text-primary-foreground/50">Verified Jobs</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute -right-6 bottom-20 glass-dark rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <div className="p-2 rounded-xl bg-secondary/20">
              <FileCheck className="h-5 w-5 text-primary-foreground/80" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary-foreground">95%</p>
              <p className="text-xs text-primary-foreground/50">ATS Pass Rate</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="absolute left-8 -bottom-6 glass-dark rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <div className="p-2 rounded-xl bg-primary/15">
              <GraduationCap className="h-5 w-5 text-primary-foreground/80" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary-foreground">50+</p>
              <p className="text-xs text-primary-foreground/50">Academy Courses</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
