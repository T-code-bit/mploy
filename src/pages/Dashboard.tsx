import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, FileCheck, GraduationCap, Award, TrendingUp,
  Eye, Send, ChevronRight, ArrowUpRight, Loader2, Crown, Settings, Sparkles, User, MessageSquare, Mail
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import UpgradeBanner from "@/components/UpgradeBanner";
import usePageTitle from "@/hooks/usePageTitle";
import { toast } from "sonner";

const Dashboard = () => {
  usePageTitle("Dashboard");
  const { user, profile, userRole, subscriptionTier, subscriptionEnd } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const currentPlan = SUBSCRIPTION_TIERS[subscriptionTier];

  const handleManageSubscription = async () => {
    if (!confirm("Cancel your monthly subscription? You'll keep access until the end of your current period.")) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-cancel-subscription");
      if (error) throw error;
      toast.success("Subscription cancelled");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setPortalLoading(false);
    }
  };

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["dashboard-applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(title, company, location)")
        .eq("applicant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && userRole !== "employer",
  });

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a: any) => a.status === "pending").length;
    const accepted = applications.filter((a: any) => a.status === "accepted").length;
    return { total, pending, accepted };
  }, [applications]);

  // Redirect admins to their console and employers to their portal
  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (userRole === "employer") {
    return <Navigate to="/employer" replace />;
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "accepted": return "border-success text-success bg-success/5";
      case "rejected": return "border-destructive text-destructive bg-destructive/5";
      default: return "border-border";
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4"
          >
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Welcome back, {profile?.full_name || "there"} 👋
              </h1>
              <p className="text-muted-foreground mt-1">Here's your career readiness overview.</p>
            </div>
            <Link to="/jobs">
              <Button className="bg-gradient-primary text-primary-foreground rounded-xl h-11 px-6 shadow-glow hover:shadow-glow">
                Browse Jobs <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {subscriptionTier === "free" && (
            <UpgradeBanner requiredTier="basic" feature="Unlimited job views, all CV templates, and more academy lessons" />
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Send, label: "Applications Sent", value: stats.total.toString(), change: `${stats.pending} pending`, color: "text-primary", bg: "bg-primary/10" },
              { icon: Eye, label: "Accepted", value: stats.accepted.toString(), change: "Offers received", color: "text-success", bg: "bg-success/10" },
              { icon: FileCheck, label: "CV Builder", value: "Ready", change: "Build your CV", color: "text-warning", bg: "bg-warning/10" },
              { icon: Award, label: "Academy", value: "50+", change: "Courses available", color: "text-secondary", bg: "bg-secondary/10" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border p-5 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="font-display text-3xl font-bold text-card-foreground tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{stat.change}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold text-card-foreground text-lg">My Applications</h3>
                <Link to="/jobs">
                  <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                    Find more <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground">No applications yet.</p>
                  <Link to="/jobs">
                    <Button size="sm" className="mt-4 bg-gradient-primary text-primary-foreground rounded-xl">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 8).map((app: any) => (
                    <div key={app.id} className="p-4 rounded-xl bg-background/80 border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{app.jobs?.title || "Unknown Job"}</p>
                            <p className="text-xs text-muted-foreground">{app.jobs?.company || "Unknown Company"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={`text-[10px] rounded-lg ${statusColor(app.status)}`}>
                            {app.status}
                          </Badge>
                          <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(app.created_at)}</p>
                        </div>
                      </div>
                      {/* Employer Feedback */}
                      {(app.employer_feedback || app.employer_contact_info) && (
                        <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
                          {app.employer_feedback && (
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <p className="text-xs text-muted-foreground leading-relaxed">{app.employer_feedback}</p>
                            </div>
                          )}
                          {app.employer_contact_info && (
                            <div className="flex items-start gap-2">
                              <Mail className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <p className="text-xs text-foreground font-medium">{app.employer_contact_info}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Profile Card */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-card-foreground">Your Profile</h3>
                    <p className="text-xs text-muted-foreground">Update your professional details</p>
                  </div>
                </div>
                <Link to="/profile">
                  <Button variant="outline" className="w-full rounded-xl h-11 gap-2">
                    <User className="h-4 w-4" /> Edit Profile
                  </Button>
                </Link>
              </div>

              {/* Subscription Card */}
              <div className={`rounded-2xl border p-6 shadow-card ${subscriptionTier !== "free" ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20" : "bg-card border-border"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-card-foreground flex items-center gap-2">
                    <Crown className={`h-4 w-4 ${subscriptionTier !== "free" ? "text-primary" : "text-muted-foreground"}`} />
                    Your Plan
                  </h3>
                  <Badge variant={subscriptionTier !== "free" ? "default" : "secondary"} className="rounded-lg">
                    {currentPlan.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {currentPlan.price}{currentPlan.period}
                </p>
                {subscriptionEnd && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Renews: {new Date(subscriptionEnd).toLocaleDateString("en-KE", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
                <div className="space-y-2 mt-3">
                  <Link to="/#pricing">
                    <Button size="sm" className="w-full bg-gradient-primary text-primary-foreground rounded-xl gap-2">
                      <Sparkles className="h-3.5 w-3.5" /> {subscriptionTier === "free" ? "Upgrade Plan" : "Change / View Plans"}
                    </Button>
                  </Link>
                  {subscriptionTier !== "free" && (
                    <Button size="sm" variant="outline" className="w-full rounded-xl gap-2" onClick={handleManageSubscription} disabled={portalLoading}>
                      {portalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Settings className="h-3.5 w-3.5" />}
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <h3 className="font-display font-semibold text-card-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/cv-builder" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2 rounded-xl h-11">
                      <FileCheck className="h-4 w-4 text-primary" /> Build Your CV
                    </Button>
                  </Link>
                  <Link to="/academy" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2 rounded-xl h-11">
                      <GraduationCap className="h-4 w-4 text-secondary" /> Start Learning
                    </Button>
                  </Link>
                  <Link to="/jobs" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2 rounded-xl h-11">
                      <Briefcase className="h-4 w-4 text-primary" /> Find Jobs
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                <h3 className="font-display font-semibold text-card-foreground mb-4">Application Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: "Pending", value: stats.pending, total: stats.total || 1 },
                    { label: "Accepted", value: stats.accepted, total: stats.total || 1 },
                    { label: "Total", value: stats.total, total: Math.max(stats.total, 1) },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-foreground font-semibold">{item.value}</span>
                      </div>
                      <Progress value={(item.value / item.total) * 100} className="h-2 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
