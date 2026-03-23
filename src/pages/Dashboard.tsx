import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, FileCheck, GraduationCap, Award, TrendingUp,
  Eye, Send, Clock, ShieldCheck, ChevronRight, Star
} from "lucide-react";

const Dashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back, Thabo 👋
            </h1>
            <p className="text-muted-foreground">Here's your career readiness overview.</p>
          </div>
          <Button className="bg-gradient-primary text-primary-foreground">
            Browse Jobs <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Send, label: "Applications Sent", value: "24", change: "+3 this week", color: "text-primary" },
            { icon: Eye, label: "Profile Views", value: "182", change: "+12%", color: "text-secondary" },
            { icon: FileCheck, label: "ATS Score", value: "72%", change: "Needs improvement", color: "text-warning" },
            { icon: Award, label: "TrustBadges", value: "3", change: "2 in progress", color: "text-success" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-card">
            <h3 className="font-semibold text-card-foreground mb-4">Recent Applications</h3>
            <div className="space-y-3">
              {[
                { title: "Frontend Developer", company: "TechCorp SA", status: "Under Review", date: "Mar 20" },
                { title: "Data Analyst", company: "FinInsight", status: "Interview Scheduled", date: "Mar 18" },
                { title: "Marketing Coordinator", company: "BrandWave", status: "Applied", date: "Mar 15" },
                { title: "UX Designer", company: "DesignLab", status: "Rejected", date: "Mar 12" },
              ].map((app) => (
                <div key={app.title} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent rounded-lg p-2">
                      <Briefcase className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{app.title}</p>
                      <p className="text-xs text-muted-foreground">{app.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        app.status === "Interview Scheduled"
                          ? "border-success text-success"
                          : app.status === "Rejected"
                          ? "border-destructive text-destructive"
                          : ""
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
          <div className="space-y-6">
            {/* Readiness Score */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-card-foreground mb-4">Career Readiness</h3>
              <div className="relative w-28 h-28 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${(68 / 100) * 339.3} 339.3`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-foreground">68%</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "CV Optimization", value: 72 },
                  { label: "Skills Training", value: 45 },
                  { label: "Interview Prep", value: 80 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* TrustBadges */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-card-foreground mb-4">TrustBadges Earned</h3>
              <div className="flex flex-wrap gap-3">
                {["CV Pro", "Communicator", "Etiquette"].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent">
                    <Award className="h-4 w-4 text-secondary" />
                    <span className="text-xs font-medium text-accent-foreground">{badge}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 text-primary text-xs">
                View All Badges
              </Button>
            </div>

            {/* Saved Jobs */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-card-foreground mb-4">Saved Jobs</h3>
              <div className="space-y-3">
                {[
                  { title: "Product Manager", company: "InnovateCo" },
                  { title: "Backend Developer", company: "CloudNine Dev" },
                ].map((job) => (
                  <div key={job.title} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{job.title}</p>
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
