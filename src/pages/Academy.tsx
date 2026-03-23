import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, Clock, Award, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

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

const Academy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Ready-to-Work Academy</h1>
          <p className="text-muted-foreground">Self-paced employability courses. Earn TrustBadges. Get hired.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: "Courses", value: "50+" },
            { icon: PlayCircle, label: "Video Lessons", value: "400+" },
            { icon: Users, label: "Learners", value: "10K+" },
            { icon: Award, label: "TrustBadges", value: "25+" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <Badge
              key={c}
              variant={c === "All" ? "default" : "outline"}
              className={`cursor-pointer ${c === "All" ? "bg-gradient-primary text-primary-foreground" : ""}`}
            >
              {c}
            </Badge>
          ))}
        </div>

        {/* Courses */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all group cursor-pointer"
            >
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                <PlayCircle className="h-10 w-10 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                {course.badge && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gradient-accent text-secondary-foreground text-[10px]">
                      <Award className="h-3 w-3 mr-1" /> TrustBadge
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <Badge variant="outline" className="text-[10px] mb-2">{course.category}</Badge>
                <h4 className="font-semibold text-card-foreground text-sm mb-2">{course.title}</h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.lessons} lessons</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                </div>
                {course.progress > 0 ? (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                    <Button size="sm" className="w-full mt-3 bg-gradient-primary text-primary-foreground text-xs">
                      {course.progress === 100 ? "Review Course" : "Continue"}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Start Course
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Academy;
