import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ShieldCheck, Globe, Users, Target, Heart, Zap } from "lucide-react";

const values = [
  { icon: ShieldCheck, title: "Trust & Verification", description: "Every job listing is authenticated. We eliminate scams and ghost postings so you can apply with confidence." },
  { icon: Globe, title: "Global Access", description: "Opportunities know no borders. We connect talent from every continent with employers worldwide." },
  { icon: Users, title: "Community First", description: "We build for the job seeker. Every feature is designed to give you an unfair advantage in your career." },
  { icon: Target, title: "Results-Driven", description: "Our 95% ATS pass rate and growing placement numbers speak louder than promises." },
  { icon: Heart, title: "Empowerment", description: "We believe everyone deserves access to quality career tools, regardless of background or location." },
  { icon: Zap, title: "Innovation", description: "AI-powered tools, real-time scoring, and smart matching — we're always pushing the boundaries." },
];

const team = [
  { name: "James Ochieng", role: "Founder & CEO", bio: "Former recruiter turned entrepreneur. Passionate about making hiring fair and transparent across Kenya and East Africa." },
  { name: "Amina Wanjiku", role: "CTO", bio: "Experienced engineer with 12 years in AI/ML. Building the tech that powers smarter career matching for Kenyan talent." },
  { name: "Peter Mwangi", role: "Head of Product", bio: "Product leader who's shipped tools used by thousands. Obsessed with user experience and accessibility." },
  { name: "Fatima Hassan", role: "Head of Partnerships", bio: "Connects M-Ploy with employers across Kenya and the East African region. Background in international business development." },
];

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">About M-Ploy</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-5">
            The Trusted Bridge Between <span className="text-gradient-primary">Talent & Opportunity</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Founded in 2024, M-Ploy was born from a simple frustration: job seekers deserved better. Too many fake listings, too many rejection black holes, too little support. We built the platform we wished existed — verified jobs, ATS-optimized CVs, and employability training, all in one place.
          </p>
        </motion.div>

        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card rounded-2xl border border-border p-8 shadow-card">
            <h3 className="font-display text-2xl font-bold text-card-foreground mb-3">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To democratize career access by providing every job seeker — from fresh graduates to seasoned professionals — with verified opportunities, world-class tools, and the skills needed to succeed in a competitive global market.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-card rounded-2xl border border-border p-8 shadow-card">
            <h3 className="font-display text-2xl font-bold text-card-foreground mb-3">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              A world where talent is matched to opportunity based on skill and potential — not geography, connections, or luck. We envision M-Ploy as the global standard for trusted, transparent hiring.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10 tracking-tight">What We Stand For</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  <v.icon className="h-5 w-5" />
                </div>
                <h4 className="font-display font-semibold text-card-foreground mb-2">{v.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10 tracking-tight">Meet the Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {team.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-card rounded-2xl border border-border p-6 shadow-card text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">{t.name[0]}</span>
                </div>
                <h4 className="font-display font-semibold text-card-foreground">{t.name}</h4>
                <p className="text-xs text-primary font-semibold mb-2">{t.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-hero rounded-3xl p-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "500+", label: "Verified Employers" },
              { value: "40+", label: "Countries Served" },
              { value: "95%", label: "ATS Pass Rate" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-bold text-primary-foreground">{s.value}</p>
                <p className="text-xs text-primary-foreground/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default About;
