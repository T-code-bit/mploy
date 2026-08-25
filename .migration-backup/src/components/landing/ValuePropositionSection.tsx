import { motion } from "framer-motion";
import { CheckCircle, Briefcase, GraduationCap, Target } from "lucide-react";

const jobSeekerBenefits = [
  "Access to 100% verified job opportunities",
  "Increased chances of passing ATS filters",
  "Improved interview performance through Academy training",
  "Affordable career development tools",
  "LinkedIn profile optimization guidance",
  "Mock interview practice & career coaching",
];

const employerBenefits = [
  "Reduced recruitment time with pre-screened candidates",
  "Access to job-ready, skill-tagged talent pool",
  "Improved hiring efficiency and quality",
  "Intuitive job posting & recruitment dashboard",
  "Reduced employee turnover with better matches",
  "Partnership options for universities & institutions",
];

const ValuePropositionSection = () => (
  <section className="py-28 bg-background bg-mesh relative">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 mb-5">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Value Proposition</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
          One Platform, <span className="text-gradient-accent">Two Audiences</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          M-Ploy combines job discovery, employability training, and CV optimization in one integrated ecosystem — serving both job seekers and employers.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Job Seekers */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl border border-border p-8 shadow-card hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-card-foreground">For Job Seekers</h3>
              <p className="text-xs text-muted-foreground">Graduates, professionals & career changers</p>
            </div>
          </div>
          <ul className="space-y-3">
            {jobSeekerBenefits.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{b}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Employers */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-8 shadow-card hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Briefcase className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-card-foreground">For Employers</h3>
              <p className="text-xs text-muted-foreground">Companies, SMEs & recruitment agencies</p>
            </div>
          </div>
          <ul className="space-y-3">
            {employerBenefits.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <CheckCircle className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                <span>{b}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ValuePropositionSection;
