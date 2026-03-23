import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Download, Sparkles, AlertTriangle, CheckCircle2, Layout, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const templates = [
  { id: 1, name: "Graduate Classic", industry: "General", ats: 98 },
  { id: 2, name: "Tech Professional", industry: "IT / Engineering", ats: 96 },
  { id: 3, name: "Creative Modern", industry: "Design / Marketing", ats: 92 },
  { id: 4, name: "Corporate Elite", industry: "Finance / Legal", ats: 97 },
];

const CVBuilder = () => {
  const [atsScore] = useState(72);

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 mb-4">
              <FileCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">ATS Optimized</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">ATS Architect</h1>
            <p className="text-muted-foreground text-lg">Build, optimize, and score your CV for maximum compatibility.</p>
          </motion.div>

          <Tabs defaultValue="builder" className="space-y-8">
            <TabsList className="bg-muted/60 rounded-xl p-1 h-auto">
              <TabsTrigger value="builder" className="rounded-lg data-[state=active]:shadow-sm">CV Builder</TabsTrigger>
              <TabsTrigger value="score" className="rounded-lg data-[state=active]:shadow-sm">ATS Score</TabsTrigger>
              <TabsTrigger value="templates" className="rounded-lg data-[state=active]:shadow-sm">Templates</TabsTrigger>
            </TabsList>

            {/* Builder */}
            <TabsContent value="builder">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Personal Details</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input placeholder="Full Name" className="rounded-xl h-11" />
                      <Input placeholder="Email" type="email" className="rounded-xl h-11" />
                      <Input placeholder="Phone" className="rounded-xl h-11" />
                      <Input placeholder="Location" className="rounded-xl h-11" />
                    </div>
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Professional Summary</h3>
                    <Textarea placeholder="Write a compelling 2-3 sentence summary..." rows={4} className="rounded-xl" />
                    <Button variant="ghost" size="sm" className="mt-3 gap-2 text-primary rounded-xl">
                      <Sparkles className="h-3.5 w-3.5" /> AI Optimize
                    </Button>
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Work Experience</h3>
                    <div className="space-y-3">
                      <Input placeholder="Job Title" className="rounded-xl h-11" />
                      <Input placeholder="Company" className="rounded-xl h-11" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Start Date" className="rounded-xl h-11" />
                        <Input placeholder="End Date" className="rounded-xl h-11" />
                      </div>
                      <Textarea placeholder="Describe your responsibilities..." rows={3} className="rounded-xl" />
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add Experience
                    </Button>
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Education</h3>
                    <div className="space-y-3">
                      <Input placeholder="Degree / Qualification" className="rounded-xl h-11" />
                      <Input placeholder="Institution" className="rounded-xl h-11" />
                      <Input placeholder="Year" className="rounded-xl h-11" />
                    </div>
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add Education
                    </Button>
                  </div>
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Skills</h3>
                    <Input placeholder="Add skills separated by commas" className="rounded-xl h-11" />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["Communication", "Leadership", "Problem Solving"].map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-xs font-medium text-accent-foreground">
                          {s}
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive cursor-pointer" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-semibold text-card-foreground">Live Preview</h3>
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground gap-2 rounded-xl shadow-glow hover:shadow-glow">
                        <Download className="h-3.5 w-3.5" /> Download PDF
                      </Button>
                    </div>
                    <div className="border border-border rounded-xl p-6 bg-background min-h-[500px]">
                      <div className="space-y-4">
                        <div className="h-8 bg-muted rounded-lg w-2/3" />
                        <div className="h-4 bg-muted rounded-lg w-1/3" />
                        <div className="border-t border-border my-4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-5/6" />
                        <div className="h-3 bg-muted rounded w-4/6" />
                        <div className="border-t border-border my-4" />
                        <div className="h-4 bg-muted rounded-lg w-1/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ATS Score */}
            <TabsContent value="score">
              <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-2xl border border-border p-10 shadow-card text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/8 mb-6">
                    <FileCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-card-foreground mb-2 tracking-tight">ATS Compatibility Score</h3>
                  <p className="text-muted-foreground mb-8">Upload your CV or paste a job description to get a detailed score.</p>

                  <div className="mb-10">
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="54" fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          strokeDasharray={`${(atsScore / 100) * 339.3} 339.3`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-5xl font-bold text-foreground">{atsScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-success/8 border border-success/15">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Clean formatting detected</p>
                        <p className="text-xs text-muted-foreground">Your CV uses ATS-friendly formatting</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/8 border border-warning/15">
                      <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Missing keywords</p>
                        <p className="text-xs text-muted-foreground">Add industry-specific keywords to improve match rate</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/8 border border-warning/15">
                      <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Summary too short</p>
                        <p className="text-xs text-muted-foreground">Expand your professional summary to 2-3 sentences</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-gradient-primary text-primary-foreground gap-2 rounded-xl h-11 px-6">
                      <Sparkles className="h-4 w-4" /> Auto-Optimize
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Templates */}
            <TabsContent value="templates">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {templates.map((tmpl, i) => (
                  <motion.div
                    key={tmpl.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-lg transition-all group cursor-pointer hover:-translate-y-1 card-shine"
                  >
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                      <Layout className="h-14 w-14 text-muted-foreground/20 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-300" />
                    </div>
                    <div className="p-5">
                      <h4 className="font-display font-semibold text-card-foreground">{tmpl.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{tmpl.industry}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span className="text-xs font-medium text-muted-foreground">ATS {tmpl.ats}%</span>
                        </div>
                        <Button size="sm" className="text-xs rounded-xl h-8 bg-gradient-primary text-primary-foreground">
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CVBuilder;
