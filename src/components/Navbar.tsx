import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, ChevronDown, Home, Briefcase, FileText, GraduationCap, LayoutDashboard, Building2, Info, Shield, Scale, Cookie } from "lucide-react";
import mployLogo from "@/assets/mploy-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, userRole, signOut } = useAuth();

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Jobs", href: "/jobs", icon: Briefcase },
    { label: "CV Builder", href: "/cv-builder", icon: FileText },
    { label: "Academy", href: "/academy", icon: GraduationCap },
    ...(user ? [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] : []),
    ...(userRole === "employer" ? [{ label: "Employer Portal", href: "/employer", icon: Building2 }] : []),
  ];

  const secondaryLinks = [
    { label: "About Us", href: "/about", icon: Info },
    { label: "Privacy Policy", href: "/privacy", icon: Shield },
    { label: "Terms of Service", href: "/terms", icon: Scale },
    { label: "Cookie Policy", href: "/cookies", icon: Cookie },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src={mployLogo} alt="M-Ploy logo" className="h-12 w-auto max-w-[160px] object-contain mix-blend-multiply dark:mix-blend-screen" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 bg-muted/60 rounded-xl p-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {location.pathname === link.href && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-card rounded-lg shadow-xs"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                  <div className="h-7 w-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {(profile?.full_name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{profile?.full_name || "Account"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="rounded-lg">
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-lg">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive rounded-lg">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground rounded-xl shadow-glow hover:shadow-glow" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-card/98 backdrop-blur-2xl border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-5 py-5 flex flex-col gap-0.5 max-h-[calc(100dvh-4rem)] overflow-y-auto">
              {/* Primary navigation */}
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
                Navigate
              </p>
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                const active = location.pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <Link
                      to={link.href}
                      onClick={closeMobile}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted hover:text-foreground active:scale-[0.98]"
                      }`}
                    >
                      <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${
                        active ? "bg-primary/15" : "bg-muted/80"
                      }`}>
                        <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <span>{link.label}</span>
                      {active && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Divider */}
              <div className="my-2 border-t border-border/60" />

              {/* Secondary links */}
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
                Company
              </p>
              <div className="grid grid-cols-2 gap-1">
                {secondaryLinks.map((link, i) => {
                  const Icon = link.icon;
                  const active = location.pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.03, duration: 0.2 }}
                    >
                      <Link
                        to={link.href}
                        onClick={closeMobile}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-2 border-t border-border/60" />

              {/* Auth actions */}
              <div className="flex gap-2">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl h-11 text-sm"
                      onClick={() => { closeMobile(); navigate("/profile"); }}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 rounded-xl h-11 text-sm text-destructive hover:text-destructive"
                      onClick={() => { closeMobile(); handleSignOut(); }}
                    >
                      <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl h-11 text-sm"
                      onClick={() => { closeMobile(); navigate("/auth"); }}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-primary text-primary-foreground rounded-xl h-11 text-sm shadow-glow"
                      onClick={() => { closeMobile(); navigate("/auth"); }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
