import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-24 bg-hero relative overflow-hidden">
    <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full w-1/2 h-1/2 m-auto" />
    <div className="container mx-auto px-4 text-center relative z-10">
      <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
        Ready to Land Your Next Role?
      </h2>
      <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
        Join thousands of job seekers who trust M-Ploy for verified careers, optimized skills, and total readiness.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/jobs">
          <Button size="lg" className="bg-gradient-accent text-secondary-foreground font-semibold px-8">
            Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link to="/academy">
          <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
            Start Learning
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default CTASection;
