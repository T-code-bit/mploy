import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Upload, Download, Sparkles, AlertTriangle, CheckCircle2, Layout } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">ATS Architect</h1>
            <p className="text-muted-foreground">Build, optimize, and score your CV for maximum ATS compatibility.</p>
          </div>

          <Tabs defaultValue="builder" className="space-y-8">
            <TabsList className="bg-muted">
              <TabsTrigger value="builder">CV Builder</TabsTrigger>
              <TabsTrigger value="score">ATS Score</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            {/* Builder */}
            <TabsContent value="builder">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h3 className="font-semibold text-card-foreground mb-4">Personal Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input placeholder="Full Name" />
                      <Input placeholder="Email" type="email" />
                      <Input placeholder="Phone" />
                      <Input placeholder="Location" />
                    </div>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h3 className="font-semibold text-card-foreground mb-4">Professional Summary</h3>
                    <Textarea placeholder="Write a compelling 2-3 sentence summary..." rows={4} />
                    <Button variant="ghost" size="sm" className="mt-2 gap-2 text-primary">
                      <Sparkles className="h-3.5 w-3.5" /> AI Optimize
                    </Button>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h3 className="font-semibold text-card-foreground mb-4">Work Experience</h3>
                    <div className="space-y-4">
                      <Input placeholder="Job Title" />
                      <Input placeholder="Company" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Start Date" />
                        <Input placeholder="End Date" />
                      </div>
                      <Textarea placeholder="Describe your responsibilities..." rows={3} />
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">+ Add Experience</Button>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h3 className="font-semibold text-card-foreground mb-4">Education</h3>
                    <div className="space-y-4">
                      <Input placeholder="Degree / Qualification" />
                      <Input placeholder="Institution" />
                      <Input placeholder="Year" />
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">+ Add Education</Button>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <h3 className="font-semibold text-card-foreground mb-4">Skills</h3>
                    <Input placeholder="Add skills separated by commas" />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["Communication", "Leadership", "Problem Solving"].map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <div className="bg-card rounded-xl border border-border p-8 shadow-card min-h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-card-foreground">Live Preview</h3>
                      <Button size="sm" className="bg-gradient-primary text-primary-foreground gap-2">
                        <Download className="h-3.5 w-3.5" /> Download PDF
                      </Button>
                    </div>
                    <div className="border border-border rounded-lg p-6 bg-background min-h-[500px]">
                      <div className="space-y-4">
                        <div className="h-8 bg-muted rounded w-2/3" />
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="border-t border-border my-4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-5/6" />
                        <div className="h-3 bg-muted rounded w-4/6" />
                        <div className="border-t border-border my-4" />
                        <div className="h-4 bg-muted rounded w-1/4 mb-2" />
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
                <div className="bg-card rounded-xl border border-border p-8 shadow-card text-center">
                  <FileCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold text-card-foreground mb-2">ATS Compatibility Score</h3>
                  <p className="text-muted-foreground mb-8">Upload your CV or paste a job description to get a detailed score.</p>

                  <div className="mb-8">
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
                        <span className="font-display text-4xl font-bold text-foreground">{atsScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Clean formatting detected</p>
                        <p className="text-xs text-muted-foreground">Your CV uses ATS-friendly formatting</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Missing keywords</p>
                        <p className="text-xs text-muted-foreground">Add industry-specific keywords to improve match rate</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Summary too short</p>
                        <p className="text-xs text-muted-foreground">Expand your professional summary to 2-3 sentences</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-gradient-primary text-primary-foreground gap-2">
                      <Upload className="h-4 w-4" /> Upload CV
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Sparkles className="h-4 w-4" /> Auto-Optimize
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Templates */}
            <TabsContent value="templates">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map((tmpl, i) => (
                  <motion.div
                    key={tmpl.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all group cursor-pointer"
                  >
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                      <Layout className="h-12 w-12 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-card-foreground text-sm">{tmpl.name}</h4>
                      <p className="text-xs text-muted-foreground">{tmpl.industry}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span className="text-xs text-muted-foreground">ATS {tmpl.ats}%</span>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs text-primary h-7">
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
