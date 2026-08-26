import { motion } from "framer-motion";
import { AlertTriangle, Ghost, FileX, Brain, Users, Clock, RotateCcw, UserX } from "lucide-react";

const jobSeekerProblems = [
  { icon: Ghost, text: "Fake or scam job listings that exploit desperate applicants" },
  { icon: FileX, text: "Poorly structured CVs that fail ATS screening tools" },
  { icon: Brain, text: "Limited knowledge of modern hiring processes" },
  { icon: UserX, text: "Lack of employability and workplace readiness skills" },
];

const employerProblems = [
  { icon: Users, text: "Receiving floods of unqualified applications" },
  { icon: Clock, text: "Time-consuming screening and vetting processes" },
  { icon: AlertTriangle, text: "Difficulty identifying truly job-ready candidates" },
  { icon: RotateCcw, text: "High employee turnover from poor hiring matches" },
];

const ProblemSection = () => (
  <section className="py-28 bg-muted/40 bg-mesh relative">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/8 mb-5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-xs font-semibold text-destructive uppercase tracking-wider">The Problem</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
          The Hiring Market Is <span className="text-gradient-primary">Broken</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          In an era where AI can generate 1,000 fake resumes or job posts in minutes, authentication is the new gold standard. It's time to move from "Spray and Pray" to precision placement.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Job Seekers */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl border border-border p-8 shadow-card"
        >
          <h3 className="font-display text-xl font-bold text-card-foreground mb-6 flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </span>
            Job Seekers Struggle With
          </h3>
          <ul className="space-y-4">
            {jobSeekerProblems.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="p-1.5 rounded-lg bg-destructive/8 mt-0.5">
                  <p.icon className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">{p.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Employers */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl border border-border p-8 shadow-card"
        >
          <h3 className="font-display text-xl font-bold text-card-foreground mb-6 flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-secondary" />
            </span>
            Employers Struggle With
          </h3>
          <ul className="space-y-4">
            {employerProblems.map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="p-1.5 rounded-lg bg-destructive/8 mt-0.5">
                  <p.icon className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground leading-relaxed">{p.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ProblemSection;
