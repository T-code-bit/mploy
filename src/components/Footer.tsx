import { Link } from "react-router-dom";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
        <div className="col-span-2 md:col-span-4">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="bg-gradient-primary rounded-xl p-1.5">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground tracking-tight">M-Ploy</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            The trusted bridge between talent and opportunity. Verified careers. Optimized skills. Total readiness.
          </p>
          <div className="flex gap-3 mt-6">
            {["X", "Li", "In"].map((icon) => (
              <div key={icon} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                {icon}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Platform</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "Job Board", href: "/jobs" },
              { label: "CV Builder", href: "/cv-builder" },
              { label: "Academy", href: "/academy" },
            ].map((link) => (
              <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                {link.label}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm">For Employers</h4>
          <div className="flex flex-col gap-3">
            {["Post a Job", "Talent Pool", "Pricing"].map((label) => (
              <a key={label} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                {label}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Company</h4>
          <div className="flex flex-col gap-3">
            {["About", "Contact", "Privacy"].map((label) => (
              <a key={label} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</a>
            ))}
          </div>
        </div>

        <div className="col-span-2 md:col-span-2">
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Stay Updated</h4>
          <p className="text-sm text-muted-foreground mb-3">Get the latest job tips and updates.</p>
          <div className="flex gap-2">
            <input placeholder="Email" className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">© 2026 M-Ploy. All rights reserved.</p>
        <div className="flex gap-6">
          {["Terms", "Privacy", "Cookies"].map((label) => (
            <a key={label} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{label}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
