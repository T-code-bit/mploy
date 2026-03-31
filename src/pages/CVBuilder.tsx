import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Download, Sparkles, AlertTriangle, CheckCircle2, Layout, Plus, Trash2, Loader2, Lock, Brain, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import UpgradeBanner from "@/components/UpgradeBanner";
import PaywallOverlay from "@/components/PaywallOverlay";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

const templates = [
  { id: 1, name: "Graduate Classic", industry: "General", ats: 98, tier: "free" as const },
  { id: 2, name: "Tech Professional", industry: "IT / Engineering", ats: 96, tier: "basic" as const },
  { id: 3, name: "Creative Modern", industry: "Design / Marketing", ats: 92, tier: "basic" as const },
  { id: 4, name: "Corporate Elite", industry: "Finance / Legal", ats: 97, tier: "basic" as const },
  { id: 5, name: "Executive Premium", industry: "Leadership / C-Suite", ats: 99, tier: "premium" as const },
  { id: 6, name: "Academic Scholar", industry: "Education / Research", ats: 95, tier: "premium" as const },
];

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  "General": ["teamwork", "communication", "leadership", "problem-solving", "detail-oriented", "organized", "time management", "adaptable", "motivated", "results-driven"],
  "IT / Engineering": ["javascript", "python", "react", "node", "sql", "agile", "devops", "api", "cloud", "git", "testing", "software", "development", "architecture", "microservices"],
  "Design / Marketing": ["figma", "photoshop", "branding", "ux", "ui", "seo", "analytics", "content", "strategy", "campaign", "social media", "creative", "wireframe"],
  "Finance / Legal": ["analysis", "compliance", "audit", "financial", "risk", "regulation", "reporting", "budgeting", "forecasting", "due diligence", "accounting"],
  "Leadership / C-Suite": ["strategy", "revenue", "growth", "stakeholder", "transformation", "governance", "vision", "p&l", "board", "executive", "operations"],
  "Education / Research": ["curriculum", "pedagogy", "research", "publication", "assessment", "methodology", "thesis", "grant", "peer-reviewed", "academic"],
};

const CVBuilder = () => {
  const { subscriptionTier } = useAuth();
  const tierLimits = SUBSCRIPTION_TIERS[subscriptionTier].limits;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: "1", title: "", company: "", startDate: "", endDate: "", description: "" },
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { id: "1", degree: "", institution: "", year: "" },
  ]);
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const addSkill = (input: string) => {
    const newSkills = input.split(",").map((s) => s.trim()).filter((s) => s && !skills.includes(s));
    if (newSkills.length) setSkills([...skills, ...newSkills]);
    setSkillsInput("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const addExperience = () => setExperiences([...experiences, { id: Date.now().toString(), title: "", company: "", startDate: "", endDate: "", description: "" }]);
  const removeExperience = (id: string) => experiences.length > 1 && setExperiences(experiences.filter((e) => e.id !== id));
  const updateExperience = (id: string, field: keyof Experience, value: string) =>
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addEducation = () => setEducations([...educations, { id: Date.now().toString(), degree: "", institution: "", year: "" }]);
  const removeEducation = (id: string) => educations.length > 1 && setEducations(educations.filter((e) => e.id !== id));
  const updateEducation = (id: string, field: keyof Education, value: string) =>
    setEducations(educations.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  // Enhanced ATS scoring with section breakdown
  const atsAnalysis = useCallback(() => {
    const sections: { name: string; score: number; max: number; tips: string[] }[] = [];

    // Personal Details (20 pts)
    let personalScore = 0;
    const personalTips: string[] = [];
    if (fullName) personalScore += 8; else personalTips.push("Add your full name");
    if (email) personalScore += 5; else personalTips.push("Add your email address");
    if (phone) personalScore += 4; else personalTips.push("Add your phone number");
    if (location) personalScore += 3; else personalTips.push("Add your location");
    sections.push({ name: "Personal Details", score: personalScore, max: 20, tips: personalTips });

    // Professional Summary (20 pts)
    let summaryScore = 0;
    const summaryTips: string[] = [];
    if (!summary) { summaryTips.push("Add a professional summary (2-3 sentences)"); }
    else if (summary.length < 50) { summaryScore = 8; summaryTips.push("Expand your summary to at least 100 characters"); }
    else if (summary.length < 100) { summaryScore = 14; summaryTips.push("Add more detail to your summary for better matching"); }
    else { summaryScore = 20; }
    sections.push({ name: "Professional Summary", score: summaryScore, max: 20, tips: summaryTips });

    // Work Experience (25 pts)
    let expScore = 0;
    const expTips: string[] = [];
    const filledExp = experiences.filter((e) => e.title && e.company);
    if (filledExp.length === 0) { expTips.push("Add at least one work experience entry"); }
    else {
      expScore += Math.min(filledExp.length * 5, 15);
      const withDates = filledExp.filter(e => e.startDate);
      if (withDates.length < filledExp.length) expTips.push("Add dates to all experience entries");
      else expScore += 5;
      const withDesc = filledExp.filter(e => e.description && e.description.length > 30);
      if (withDesc.length < filledExp.length) expTips.push("Add detailed descriptions using action verbs");
      else expScore += 5;
    }
    sections.push({ name: "Work Experience", score: Math.min(expScore, 25), max: 25, tips: expTips });

    // Education (15 pts)
    let eduScore = 0;
    const eduTips: string[] = [];
    const filledEdu = educations.filter((e) => e.degree && e.institution);
    if (filledEdu.length === 0) { eduTips.push("Add at least one education entry"); }
    else {
      eduScore += Math.min(filledEdu.length * 5, 10);
      const withYear = filledEdu.filter(e => e.year);
      if (withYear.length < filledEdu.length) eduTips.push("Add graduation years to all entries");
      else eduScore += 5;
    }
    sections.push({ name: "Education", score: Math.min(eduScore, 15), max: 15, tips: eduTips });

    // Skills & Keywords (20 pts)
    let skillScore = 0;
    const skillTips: string[] = [];
    if (skills.length === 0) { skillTips.push("Add relevant skills to improve keyword matching"); }
    else {
      skillScore += Math.min(skills.length * 2, 10);
      // Check industry keyword matching
      const selectedTmpl = templates.find(t => t.id === selectedTemplate);
      const industryKws = INDUSTRY_KEYWORDS[selectedTmpl?.industry || "General"] || INDUSTRY_KEYWORDS["General"];
      const allText = [summary, ...experiences.map(e => e.description), ...skills].join(" ").toLowerCase();
      const matchedKws = industryKws.filter(kw => allText.includes(kw));
      const kwScore = Math.min(Math.round((matchedKws.length / Math.min(industryKws.length, 8)) * 10), 10);
      skillScore += kwScore;
      if (matchedKws.length < 3) skillTips.push(`Add industry keywords like: ${industryKws.slice(0, 4).join(", ")}`);
    }
    sections.push({ name: "Skills & Keywords", score: Math.min(skillScore, 20), max: 20, tips: skillTips });

    const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
    return { totalScore, sections };
  }, [fullName, email, phone, location, summary, experiences, educations, skills, selectedTemplate]);

  const getAiSuggestions = async () => {
    if (!tierLimits.atsScore) {
      toast.error("AI suggestions require a Premium plan");
      return;
    }
    setAiLoading(true);
    setAiSuggestions("");
    try {
      const cvData = { fullName, email, summary, experiences: experiences.filter(e => e.title), educations: educations.filter(e => e.degree), skills };
      const { data, error } = await supabase.functions.invoke("ai-cv-review", { body: { cvData } });
      if (error) throw error;
      setAiSuggestions(data?.suggestions || "No suggestions available.");
      toast.success("AI analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to get AI suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  const generatePDF = () => {
    if (!fullName) { toast.error("Please enter your full name"); return; }
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(fullName, margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const contactParts = [email, phone, location].filter(Boolean);
      if (contactParts.length) { doc.text(contactParts.join("  |  "), margin, y); y += 6; }
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setTextColor(0, 0, 0);

      if (summary) {
        doc.setFontSize(12); doc.setFont("helvetica", "bold");
        doc.text("PROFESSIONAL SUMMARY", margin, y); y += 6;
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(summary, contentWidth);
        doc.text(lines, margin, y); y += lines.length * 5 + 6;
      }

      const filledExp = experiences.filter((e) => e.title || e.company);
      if (filledExp.length) {
        doc.setFontSize(12); doc.setFont("helvetica", "bold");
        doc.text("WORK EXPERIENCE", margin, y); y += 6;
        filledExp.forEach((exp) => {
          if (y > 270) { doc.addPage(); y = margin; }
          doc.setFontSize(11); doc.setFont("helvetica", "bold");
          doc.text(exp.title || "Untitled Role", margin, y); y += 5;
          doc.setFontSize(10); doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const meta = [exp.company, [exp.startDate, exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
          if (meta) { doc.text(meta, margin, y); y += 5; }
          doc.setTextColor(0, 0, 0);
          if (exp.description) {
            const descLines = doc.splitTextToSize(exp.description, contentWidth);
            doc.text(descLines, margin, y); y += descLines.length * 5;
          }
          y += 4;
        });
        y += 2;
      }

      const filledEdu = educations.filter((e) => e.degree || e.institution);
      if (filledEdu.length) {
        if (y > 260) { doc.addPage(); y = margin; }
        doc.setFontSize(12); doc.setFont("helvetica", "bold");
        doc.text("EDUCATION", margin, y); y += 6;
        filledEdu.forEach((edu) => {
          doc.setFontSize(11); doc.setFont("helvetica", "bold");
          doc.text(edu.degree || "Degree", margin, y); y += 5;
          doc.setFontSize(10); doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const meta = [edu.institution, edu.year].filter(Boolean).join("  |  ");
          if (meta) { doc.text(meta, margin, y); y += 5; }
          doc.setTextColor(0, 0, 0); y += 3;
        });
        y += 2;
      }

      if (skills.length) {
        if (y > 260) { doc.addPage(); y = margin; }
        doc.setFontSize(12); doc.setFont("helvetica", "bold");
        doc.text("SKILLS", margin, y); y += 6;
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const skillsText = doc.splitTextToSize(skills.join("  •  "), contentWidth);
        doc.text(skillsText, margin, y);
      }

      doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
      toast.success("CV downloaded successfully!");
    } catch { toast.error("Failed to generate PDF"); }
    finally { setDownloading(false); }
  };

  const { totalScore, sections } = atsAnalysis();
  const tierOrder = { free: 0, basic: 1, premium: 2 } as const;

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 mb-4">
              <FileCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">ATS Optimized</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">ATS Architect</h1>
            <p className="text-muted-foreground text-lg">Build, optimize, and score your CV for maximum compatibility.</p>
          </motion.div>

          {subscriptionTier === "free" && (
            <UpgradeBanner requiredTier="basic" feature="All CV templates and unlimited downloads" />
          )}

          <Tabs defaultValue="builder" className="space-y-8">
            <TabsList className="bg-muted/60 rounded-xl p-1 h-auto">
              <TabsTrigger value="builder" className="rounded-lg data-[state=active]:shadow-sm">CV Builder</TabsTrigger>
              <TabsTrigger value="score" className="rounded-lg data-[state=active]:shadow-sm">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> ATS Analysis
              </TabsTrigger>
              <TabsTrigger value="templates" className="rounded-lg data-[state=active]:shadow-sm">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="builder">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Personal Details</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input placeholder="Full Name" className="rounded-xl h-11" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <Input placeholder="Email" type="email" className="rounded-xl h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input placeholder="Phone" className="rounded-xl h-11" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      <Input placeholder="Location" className="rounded-xl h-11" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Professional Summary</h3>
                    <Textarea placeholder="Write a compelling 2-3 sentence summary..." rows={4} className="rounded-xl" value={summary} onChange={(e) => setSummary(e.target.value)} />
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Work Experience</h3>
                    {experiences.map((exp, i) => (
                      <div key={exp.id} className={`space-y-3 ${i > 0 ? "mt-5 pt-5 border-t border-border" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">Experience {i + 1}</span>
                          {experiences.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)} className="h-7 px-2 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <Input placeholder="Job Title" className="rounded-xl h-11" value={exp.title} onChange={(e) => updateExperience(exp.id, "title", e.target.value)} />
                        <Input placeholder="Company" className="rounded-xl h-11" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Start Date" className="rounded-xl h-11" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                          <Input placeholder="End Date" className="rounded-xl h-11" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
                        </div>
                        <Textarea placeholder="Describe your responsibilities..." rows={3} className="rounded-xl" value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-1.5" onClick={addExperience}>
                      <Plus className="h-3.5 w-3.5" /> Add Experience
                    </Button>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Education</h3>
                    {educations.map((edu, i) => (
                      <div key={edu.id} className={`space-y-3 ${i > 0 ? "mt-5 pt-5 border-t border-border" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">Education {i + 1}</span>
                          {educations.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)} className="h-7 px-2 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <Input placeholder="Degree / Qualification" className="rounded-xl h-11" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                        <Input placeholder="Institution" className="rounded-xl h-11" value={edu.institution} onChange={(e) => updateEducation(edu.id, "institution", e.target.value)} />
                        <Input placeholder="Year" className="rounded-xl h-11" value={edu.year} onChange={(e) => updateEducation(edu.id, "year", e.target.value)} />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-1.5" onClick={addEducation}>
                      <Plus className="h-3.5 w-3.5" /> Add Education
                    </Button>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Skills</h3>
                    <div className="flex gap-2">
                      <Input placeholder="Add skills separated by commas" className="rounded-xl h-11 flex-1" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillsInput); } }} />
                      <Button variant="outline" className="rounded-xl h-11" onClick={() => addSkill(skillsInput)}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-xs font-medium text-accent-foreground">
                          {s}
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive cursor-pointer" onClick={() => removeSkill(s)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-semibold text-card-foreground">Live Preview</h3>
                      <Button size="sm" onClick={generatePDF} disabled={downloading} className="bg-gradient-primary text-primary-foreground gap-2 rounded-xl shadow-glow hover:shadow-glow">
                        {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Download PDF
                      </Button>
                    </div>
                    <div className="border border-border rounded-xl p-6 bg-background min-h-[500px] text-sm">
                      {fullName ? (
                        <div className="space-y-4">
                          <div>
                            <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
                            <p className="text-xs text-muted-foreground">{[email, phone, location].filter(Boolean).join("  |  ")}</p>
                          </div>
                          {(email || phone || location || summary) && <div className="border-t border-border" />}
                          {summary && (
                            <div>
                              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Professional Summary</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
                            </div>
                          )}
                          {experiences.some((e) => e.title || e.company) && (
                            <div>
                              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Work Experience</h4>
                              {experiences.filter((e) => e.title || e.company).map((exp) => (
                                <div key={exp.id} className="mb-3">
                                  <p className="text-xs font-semibold text-foreground">{exp.title}</p>
                                  <p className="text-[11px] text-muted-foreground">{[exp.company, [exp.startDate, exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")}</p>
                                  {exp.description && <p className="text-[11px] text-muted-foreground mt-1">{exp.description}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                          {educations.some((e) => e.degree || e.institution) && (
                            <div>
                              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Education</h4>
                              {educations.filter((e) => e.degree || e.institution).map((edu) => (
                                <div key={edu.id} className="mb-2">
                                  <p className="text-xs font-semibold text-foreground">{edu.degree}</p>
                                  <p className="text-[11px] text-muted-foreground">{[edu.institution, edu.year].filter(Boolean).join("  |  ")}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {skills.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Skills</h4>
                              <p className="text-xs text-muted-foreground">{skills.join("  •  ")}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="h-8 bg-muted rounded-lg w-2/3" />
                          <div className="h-4 bg-muted rounded-lg w-1/3" />
                          <div className="border-t border-border my-4" />
                          <div className="h-3 bg-muted rounded w-full" />
                          <div className="h-3 bg-muted rounded w-5/6" />
                          <div className="h-3 bg-muted rounded w-4/6" />
                          <p className="text-center text-muted-foreground text-xs mt-8">Start filling in your details to see a live preview</p>
                        </div>
                      )}
                    </div>

                    {/* Quick ATS Score */}
                    <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">ATS Score</span>
                        <span className={`text-sm font-bold ${totalScore >= 70 ? "text-success" : totalScore >= 40 ? "text-warning" : "text-destructive"}`}>{totalScore}%</span>
                      </div>
                      <Progress value={totalScore} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="score">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Overall Score */}
                <div className="bg-card rounded-2xl border border-border p-10 shadow-card text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/8 mb-6">
                    <FileCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-card-foreground mb-2 tracking-tight">ATS Compatibility Analysis</h3>
                  <p className="text-muted-foreground mb-8">Detailed section-by-section scoring with actionable tips.</p>

                  <div className="mb-10">
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle cx="60" cy="60" r="54" fill="none" stroke={totalScore >= 70 ? "hsl(var(--success))" : totalScore >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} strokeWidth="8" strokeDasharray={`${(totalScore / 100) * 339.3} 339.3`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-5xl font-bold text-foreground">{totalScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Breakdown */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                  <h4 className="font-display font-semibold text-card-foreground mb-5 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> Section Breakdown
                  </h4>
                  <div className="space-y-5">
                    {sections.map((section) => (
                      <div key={section.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{section.name}</span>
                          <span className={`text-sm font-bold ${section.score >= section.max * 0.7 ? "text-success" : section.score >= section.max * 0.4 ? "text-warning" : "text-destructive"}`}>
                            {section.score}/{section.max}
                          </span>
                        </div>
                        <Progress value={(section.score / section.max) * 100} className="h-2.5 mb-2" />
                        {section.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 mt-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">{tip}</span>
                          </div>
                        ))}
                        {section.tips.length === 0 && (
                          <div className="flex items-start gap-2 mt-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                            <span className="text-xs text-muted-foreground">Looking great!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Suggestions - Premium */}
                <PaywallOverlay requiredTier="premium" feature="Get AI-powered suggestions to improve your CV">
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-display font-semibold text-card-foreground flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" /> AI-Powered Suggestions
                      </h4>
                      <Button size="sm" onClick={getAiSuggestions} disabled={aiLoading} className="bg-gradient-primary text-primary-foreground rounded-xl gap-2">
                        {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {aiLoading ? "Analyzing..." : "Get AI Review"}
                      </Button>
                    </div>
                    {aiSuggestions ? (
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{aiSuggestions}</div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Click "Get AI Review" to receive personalized suggestions for improving your CV's ATS compatibility and content quality.</p>
                    )}
                  </div>
                </PaywallOverlay>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map((tmpl, i) => {
                  const isLocked = tierOrder[tmpl.tier] > tierOrder[subscriptionTier];
                  const templateContent = (
                    <motion.div
                      key={tmpl.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => { if (!isLocked) { setSelectedTemplate(tmpl.id); toast.success(`${tmpl.name} template selected!`); } }}
                      className={`bg-card rounded-2xl border overflow-hidden shadow-card hover:shadow-lg transition-all group cursor-pointer hover:-translate-y-1 card-shine ${selectedTemplate === tmpl.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                    >
                      <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                        {isLocked ? (
                          <Lock className="h-14 w-14 text-muted-foreground/30" />
                        ) : (
                          <Layout className="h-14 w-14 text-muted-foreground/20 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-300" />
                        )}
                        {selectedTemplate === tmpl.id && (
                          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg">Active</div>
                        )}
                        {isLocked && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-[10px] font-bold flex items-center gap-1">
                              <Lock className="h-3 w-3" /> {tmpl.tier === "premium" ? "Premium" : "Basic"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h4 className="font-display font-semibold text-card-foreground">{tmpl.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{tmpl.industry}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-xs font-medium text-muted-foreground">ATS {tmpl.ats}%</span>
                          </div>
                          {isLocked ? (
                            <Button size="sm" variant="outline" className="text-xs rounded-xl h-8 gap-1" onClick={(e) => { e.stopPropagation(); window.location.href = "/#pricing"; }}>
                              <Lock className="h-3 w-3" /> Upgrade
                            </Button>
                          ) : (
                            <Button size="sm" className="text-xs rounded-xl h-8 bg-gradient-primary text-primary-foreground">
                              {selectedTemplate === tmpl.id ? "Selected" : "Use Template"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );

                  return isLocked ? (
                    <div key={tmpl.id} className="relative">
                      <div className="blur-[1px] opacity-70">{templateContent}</div>
                    </div>
                  ) : (
                    <div key={tmpl.id}>{templateContent}</div>
                  );
                })}
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
