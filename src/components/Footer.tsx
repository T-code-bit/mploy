import { Link } from "react-router-dom";
import { ArrowUpRight, Loader2, MapPin, Phone, Mail } from "lucide-react";
import mployLogo from "@/assets/mploy-logo.png";
import btlLogo from "@/assets/partner-btl.png";
import kenyaSealLogo from "@/assets/partner-kenya-seal.png";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/betheleader001/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com/LeaderBtl5600/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://ke.linkedin.com/company/be-the-leader-btl",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/betheleader_org/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@usaembassyinnairobikenya",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
    ),
  },
];
const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubscribing(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } else {
      toast.success("Subscribed! You'll receive career tips and updates.");
    }
    setEmail("");
    setSubscribing(false);
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={mployLogo} alt="M-Ploy logo" className="h-12 w-auto max-w-[160px] object-contain mix-blend-multiply" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              The trusted bridge between talent and opportunity. Verified careers. Optimized skills. Total readiness.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110">
                  {s.icon}
                </a>
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
                { label: "Dashboard", href: "/dashboard" },
              ].map((link) => (
                <Link key={link.href} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                  {link.label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Job Seekers</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Browse Jobs", href: "/jobs" },
                { label: "Build Your CV", href: "/cv-builder" },
                { label: "My Applications", href: "/dashboard" },
                { label: "My Profile", href: "/profile" },
              ].map((link) => (
                <Link key={link.label} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                  {link.label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">For Employers</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Post a Job", href: "/employer" },
                { label: "Talent Pool", href: "/employer" },
                { label: "Pricing", href: "/#pricing" },
              ].map((link) => (
                <Link key={link.label} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                  {link.label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Company</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "About", href: "/about" },
                { label: "Reviews", href: "/reviews" },
                { label: "Contact", href: "/#contact" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Cookies", href: "/cookies" },
              ].map((link) => (
                <Link key={link.label} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                  {link.label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="font-display font-semibold text-foreground mb-1">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">Get the latest job tips, career advice, and platform updates.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="flex-1 sm:w-64 h-11 rounded-xl border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={handleSubscribe} disabled={subscribing} className="bg-gradient-primary text-primary-foreground rounded-xl h-11 px-5 font-semibold">
                {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
              </Button>
            </div>
          </div>
        </div>

        {/* Partners / Trusted By */}
        <div className="border-t border-border mt-8 pt-8">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            In Partnership With
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <a href="https://www.president.go.ke/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
              <img src={kenyaSealLogo} alt="Republic of Kenya" className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain" />
              <div className="hidden sm:block">
                <span className="block text-sm font-semibold text-foreground leading-tight">Republic of Kenya</span>
                <span className="block text-xs text-muted-foreground leading-tight">Government of Kenya</span>
              </div>
            </a>
            <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
              <img src={btlLogo} alt="BTL - Be The Leader" className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain" />
              <div className="hidden sm:block">
                <span className="block text-sm font-semibold text-foreground leading-tight">BTL</span>
                <span className="block text-xs text-muted-foreground leading-tight">Be The Leader</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> Nairobi, Kenya</span>
          <span className="flex items-center gap-1.5">Mon–Fri 8:00 AM – 5:00 PM (EAT)</span>
          <a href="tel:+254793264418" className="flex items-center gap-1.5 hover:text-foreground transition-colors"><Phone className="h-3.5 w-3.5 text-primary" /> +254 793 264 418</a>
          <a href="mailto:mploykenya@gmail.com" className="flex items-center gap-1.5 hover:text-foreground transition-colors"><Mail className="h-3.5 w-3.5 text-primary" /> mploykenya@gmail.com</a>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} M-Ploy. All rights reserved. Made by <a href="https://tribaltechnexus.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Tribal Tech Nexus</a></p>
          <div className="flex gap-6">
            {[
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "Cookies", href: "/cookies" },
            ].map((link) => (
              <Link key={link.label} to={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
