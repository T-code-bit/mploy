import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, FileCheck, GraduationCap, Award, TrendingUp,
  Eye, Send, Clock, ChevronRight, Star, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Dashboard = () => (
  <div className="min-h-screen bg-background bg-mesh">
    <Navbar />
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Welcome back 👋
            </h1>
            <p className="text-muted-foreground mt-1">Here's your career readiness overview.</p>
          </div>
          <Link to="/jobs">
            <Button className="bg-gradient-primary text-primary-foreground rounded-xl h-11 px-6 shadow-glow hover:shadow-glow">
              Browse Jobs <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Send, label: "Applications Sent", value: "24", change: "+3 this week", color: "text-primary", bg: "bg-primary/10" },
            { icon: Eye, label: "Profile Views", value: "182", change: "+12%", color: "text-secondary", bg: "bg-secondary/10" },
            { icon: FileCheck, label: "ATS Score", value: "72%", change: "Needs improvement", color: "text-warning", bg: "bg-warning/10" },
            { icon: Award, label: "TrustBadges", value: "3", change: "2 in progress", color: "text-success", bg: "bg-success/10" },
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
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-card-foreground text-lg">Recent Applications</h3>
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { title: "Frontend Developer", company: "TechCorp SA", status: "Under Review", date: "Mar 20" },
                { title: "Data Analyst", company: "FinInsight", status: "Interview Scheduled", date: "Mar 18" },
                { title: "Marketing Coordinator", company: "BrandWave", status: "Applied", date: "Mar 15" },
                { title: "UX Designer", company: "DesignLab", status: "Rejected", date: "Mar 12" },
              ].map((app) => (
                <div key={app.title} className="flex items-center justify-between p-4 rounded-xl bg-background/80 border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{app.title}</p>
                      <p className="text-xs text-muted-foreground">{app.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] rounded-lg ${
                        app.status === "Interview Scheduled"
                          ? "border-success text-success bg-success/5"
                          : app.status === "Rejected"
                          ? "border-destructive text-destructive bg-destructive/5"
                          : "border-border"
                      }`}
                    >
                      {app.status}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground mt-1">{app.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Readiness Score */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h3 className="font-display font-semibold text-card-foreground mb-5">Career Readiness</h3>
              <div className="relative w-28 h-28 mx-auto mb-5">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${(68 / 100) * 339.3} 339.3`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-foreground">68%</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "CV Optimization", value: 72 },
                  { label: "Skills Training", value: 45 },
                  { label: "Interview Prep", value: 80 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-semibold">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* TrustBadges */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h3 className="font-display font-semibold text-card-foreground mb-4">TrustBadges Earned</h3>
              <div className="flex flex-wrap gap-2">
                {["CV Pro", "Communicator", "Etiquette"].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent">
                    <Award className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-semibold text-accent-foreground">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Jobs */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
              <h3 className="font-display font-semibold text-card-foreground mb-4">Saved Jobs</h3>
              <div className="space-y-3">
                {[
                  { title: "Product Manager", company: "InnovateCo" },
                  { title: "Backend Developer", company: "CloudNine Dev" },
                ].map((job) => (
                  <div key={job.title} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                    <Star className="h-4 w-4 text-secondary" />
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

export default Dashboard;
