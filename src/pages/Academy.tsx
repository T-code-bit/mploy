import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, Clock, Award, Users, BookOpen, Search, Lock } from "lucide-react";
import academyImg from "@/assets/academy-learning.jpg";
import usePageTitle from "@/hooks/usePageTitle";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import UpgradeBanner from "@/components/UpgradeBanner";

const courses = [
  { id: 1, title: "CV Writing Masterclass", category: "CV & Resume", lessons: 12, duration: "2h 30m", enrolled: 3400, level: "Beginner", progress: 0, badge: true },
  { id: 2, title: "Interview Preparation", category: "Interviews", lessons: 8, duration: "1h 45m", enrolled: 2800, level: "Beginner", progress: 45, badge: true },
  { id: 3, title: "Workplace Communication", category: "Soft Skills", lessons: 10, duration: "2h 15m", enrolled: 1900, level: "Intermediate", progress: 0, badge: false },
  { id: 4, title: "Professional Etiquette", category: "Soft Skills", lessons: 6, duration: "1h 10m", enrolled: 1500, level: "Beginner", progress: 100, badge: true },
  { id: 5, title: "Personal Branding", category: "Career Growth", lessons: 9, duration: "2h", enrolled: 2100, level: "Intermediate", progress: 0, badge: true },
  { id: 6, title: "Job Search Strategies", category: "Job Search", lessons: 7, duration: "1h 30m", enrolled: 2600, level: "Beginner", progress: 20, badge: false },
  { id: 7, title: "Freelancing & Remote Work", category: "Career Growth", lessons: 11, duration: "2h 45m", enrolled: 1800, level: "Advanced", progress: 0, badge: true },
  { id: 8, title: "Digital Literacy Essentials", category: "Tech Skills", lessons: 14, duration: "3h", enrolled: 3200, level: "Beginner", progress: 0, badge: false },
];

const categories = ["All", "CV & Resume", "Interviews", "Soft Skills", "Career Growth", "Job Search", "Tech Skills"];

const Academy = () => {
  usePageTitle("Academy");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { subscriptionTier } = useAuth();
  const tierLimits = SUBSCRIPTION_TIERS[subscriptionTier].limits;
  const maxLessons = tierLimits.academyLessons;

  const filtered = courses.filter((c) => {
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="rounded-3xl overflow-hidden border border-border shadow-xl relative">
              <img
                src={academyImg}
                alt="Ready-to-Work Academy — coming soon"
                className="w-full h-[420px] sm:h-[520px] object-cover blur-md scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/80 backdrop-blur-sm" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 backdrop-blur-md mb-6">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Ready-to-Work Academy</span>
                </div>
                <h1 className="font-display text-4xl sm:text-6xl font-bold text-foreground tracking-tight mb-4">
                  Coming <span className="text-gradient-primary">Soon</span>
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg max-w-xl leading-relaxed">
                  We're crafting a world-class employability academy — self-paced courses, TrustBadges, and real skills that get you hired. Stay tuned.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card/80 backdrop-blur-md border border-border shadow-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Launching soon on M-Ploy</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );

  // eslint-disable-next-line no-unreachable
  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 mb-4">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Earn TrustBadges</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">Ready-to-Work Academy</h1>
            <p className="text-muted-foreground text-lg mb-6">Self-paced employability courses. Build skills. Get hired.</p>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
              <img src={academyImg} alt="Students learning in a modern digital classroom" className="w-full h-[200px] sm:h-[280px] object-cover" loading="lazy" />
            </div>
          </motion.div>

          {maxLessons < Infinity && (
            <UpgradeBanner
              requiredTier={maxLessons <= 3 ? "basic" : "premium"}
              feature={`Full academy access (${maxLessons} lessons on your current plan)`}
            />
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { icon: BookOpen, label: "Courses", value: "50+" },
              { icon: PlayCircle, label: "Video Lessons", value: "400+" },
              { icon: Users, label: "Learners", value: "10K+" },
              { icon: Award, label: "TrustBadges", value: "25+" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border p-5 shadow-card text-center hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="inline-flex p-2.5 rounded-xl bg-primary/8 mb-3">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-11 h-11 rounded-xl bg-card border-border shadow-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === c
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Courses */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((course, i) => {
              const isLocked = maxLessons !== Infinity && i >= maxLessons;
              return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-lg transition-all group cursor-pointer hover:-translate-y-1 card-shine ${isLocked ? "relative" : ""}`}
              >
                <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                  {isLocked ? (
                    <Lock className="h-12 w-12 text-muted-foreground/40" />
                  ) : (
                    <PlayCircle className="h-12 w-12 text-muted-foreground/30 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                  )}
                  {course.badge && (
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-accent text-secondary-foreground text-[10px] font-bold shadow-sm">
                        <Award className="h-3 w-3" /> TrustBadge
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur text-[10px] font-semibold text-foreground">{course.level}</span>
                  </div>
                  {isLocked && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-[10px] font-bold flex items-center gap-1 w-fit">
                        <Lock className="h-3 w-3" /> Upgrade to unlock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="inline-flex px-2.5 py-1 rounded-lg bg-muted text-[10px] font-medium text-muted-foreground mb-2.5">{course.category}</span>
                  <h4 className="font-display font-semibold text-card-foreground text-sm mb-3">{course.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.lessons} lessons</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                  </div>
                  {isLocked ? (
                    <Button size="sm" variant="outline" className="w-full text-xs rounded-xl h-9" onClick={() => window.location.href = "/#pricing"}>
                      <Lock className="h-3 w-3 mr-1" /> Upgrade Plan
                    </Button>
                  ) : course.progress > 0 ? (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2 rounded-full" />
                      <Button size="sm" className="w-full mt-4 bg-gradient-primary text-primary-foreground text-xs rounded-xl h-9">
                        {course.progress === 100 ? "Review Course" : "Continue"}
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full text-xs rounded-xl h-9 hover:bg-primary hover:text-primary-foreground transition-colors">
                      Start Course
                    </Button>
                  )}
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Academy;
