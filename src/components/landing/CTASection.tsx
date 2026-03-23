import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => (
  <section className="py-28 bg-hero relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-[120px]" />
    <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[140px]" />

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="container mx-auto px-4 text-center relative z-10"
    >
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-5 tracking-tight">
        Ready to Land <span className="text-gradient-accent">Your Next Role?</span>
      </h2>
      <p className="text-primary-foreground/50 max-w-lg mx-auto mb-10 text-lg">
        Join thousands of job seekers who trust M-Ploy for verified careers, optimized skills, and total readiness.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/jobs">
          <Button size="lg" className="bg-gradient-accent text-secondary-foreground font-semibold px-8 rounded-xl h-12 shadow-glow-accent hover:shadow-glow-accent">
            Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link to="/academy">
          <Button size="lg" variant="outline" className="border-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/8 rounded-xl h-12">
            Start Learning
          </Button>
        </Link>
      </div>
    </motion.div>
  </section>
);

export default CTASection;
