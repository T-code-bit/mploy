import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, FileCheck, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="relative bg-hero min-h-[90vh] flex items-center overflow-hidden">
    {/* Decorative orbs */}
    <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px] animate-pulse-glow" />
    <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/10 blur-[120px] animate-pulse-glow" />

    <div className="container mx-auto px-4 relative z-10 py-32">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground/80">
              Trusted by 10,000+ job seekers
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
            <span className="text-primary-foreground">Stop Spraying.</span>
            <br />
            <span className="text-primary-foreground">Start </span>
            <span className="text-secondary">Getting Hired.</span>
          </h1>

          <p className="text-lg text-primary-foreground/70 max-w-xl mb-8 leading-relaxed">
            Verified job listings. ATS-optimized CVs. Employability training.
            M-Ploy is the trusted bridge between you and your next career.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/jobs">
              <Button size="lg" className="bg-gradient-accent text-secondary-foreground font-semibold px-8 shadow-glow">
                Find Verified Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cv-builder">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Build Your CV
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-3 gap-6 mt-16 max-w-lg"
        >
          {[
            { icon: ShieldCheck, value: "100%", label: "Verified Jobs" },
            { icon: FileCheck, value: "95%", label: "ATS Pass Rate" },
            { icon: GraduationCap, value: "50+", label: "Courses" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-5 w-5 text-secondary mx-auto mb-2" />
              <p className="font-display text-2xl font-bold text-primary-foreground">{stat.value}</p>
              <p className="text-xs text-primary-foreground/60">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
