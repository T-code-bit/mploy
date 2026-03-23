import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="bg-gradient-primary rounded-lg p-1.5">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">M-Ploy</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Verified Careers. Optimized Skills. Total Readiness.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Platform</h4>
          <div className="flex flex-col gap-2">
            <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Job Board</Link>
            <Link to="/cv-builder" className="text-sm text-muted-foreground hover:text-foreground transition-colors">CV Builder</Link>
            <Link to="/academy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Academy</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">For Employers</h4>
          <div className="flex flex-col gap-2">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Post a Job</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Talent Pool</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">Company</h4>
          <div className="flex flex-col gap-2">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center">
        <p className="text-xs text-muted-foreground">© 2026 M-Ploy. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
