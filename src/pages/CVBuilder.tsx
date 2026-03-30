import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Download, Sparkles, AlertTriangle, CheckCircle2, Layout, Plus, Trash2, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import UpgradeBanner from "@/components/UpgradeBanner";

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
  { id: 1, name: "Graduate Classic", industry: "General", ats: 98 },
  { id: 2, name: "Tech Professional", industry: "IT / Engineering", ats: 96 },
  { id: 3, name: "Creative Modern", industry: "Design / Marketing", ats: 92 },
  { id: 4, name: "Corporate Elite", industry: "Finance / Legal", ats: 97 },
];

const CVBuilder = () => {
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

  const atsScore = useCallback(() => {
    let score = 0;
    if (fullName) score += 15;
    if (email) score += 10;
    if (phone) score += 5;
    if (location) score += 5;
    if (summary && summary.length > 50) score += 15;
    else if (summary) score += 5;
    const filledExp = experiences.filter((e) => e.title && e.company);
    score += Math.min(filledExp.length * 10, 20);
    const filledEdu = educations.filter((e) => e.degree && e.institution);
    score += Math.min(filledEdu.length * 10, 15);
    score += Math.min(skills.length * 3, 15);
    return Math.min(score, 100);
  }, [fullName, email, phone, location, summary, experiences, educations, skills]);

  const generatePDF = () => {
    if (!fullName) { toast.error("Please enter your full name"); return; }
    setDownloading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(fullName, margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const contactParts = [email, phone, location].filter(Boolean);
      if (contactParts.length) {
        doc.text(contactParts.join("  |  "), margin, y);
        y += 6;
      }

      // Divider
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setTextColor(0, 0, 0);

      // Summary
      if (summary) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PROFESSIONAL SUMMARY", margin, y);
        y += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(summary, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 6;
      }

      // Experience
      const filledExp = experiences.filter((e) => e.title || e.company);
      if (filledExp.length) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("WORK EXPERIENCE", margin, y);
        y += 6;
        filledExp.forEach((exp) => {
          if (y > 270) { doc.addPage(); y = margin; }
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(exp.title || "Untitled Role", margin, y);
          y += 5;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const meta = [exp.company, [exp.startDate, exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
          if (meta) { doc.text(meta, margin, y); y += 5; }
          doc.setTextColor(0, 0, 0);
          if (exp.description) {
            const descLines = doc.splitTextToSize(exp.description, contentWidth);
            doc.text(descLines, margin, y);
            y += descLines.length * 5;
          }
          y += 4;
        });
        y += 2;
      }

      // Education
      const filledEdu = educations.filter((e) => e.degree || e.institution);
      if (filledEdu.length) {
        if (y > 260) { doc.addPage(); y = margin; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("EDUCATION", margin, y);
        y += 6;
        filledEdu.forEach((edu) => {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(edu.degree || "Degree", margin, y);
          y += 5;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const meta = [edu.institution, edu.year].filter(Boolean).join("  |  ");
          if (meta) { doc.text(meta, margin, y); y += 5; }
          doc.setTextColor(0, 0, 0);
          y += 3;
        });
        y += 2;
      }

      // Skills
      if (skills.length) {
        if (y > 260) { doc.addPage(); y = margin; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("SKILLS", margin, y);
        y += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const skillsText = doc.splitTextToSize(skills.join("  •  "), contentWidth);
        doc.text(skillsText, margin, y);
      }

      doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
      toast.success("CV downloaded successfully!");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const score = atsScore();

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

          <Tabs defaultValue="builder" className="space-y-8">
            <TabsList className="bg-muted/60 rounded-xl p-1 h-auto">
              <TabsTrigger value="builder" className="rounded-lg data-[state=active]:shadow-sm">CV Builder</TabsTrigger>
              <TabsTrigger value="score" className="rounded-lg data-[state=active]:shadow-sm">ATS Score</TabsTrigger>
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
                      <Input
                        placeholder="Add skills separated by commas"
                        className="rounded-xl h-11 flex-1"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillsInput); } }}
                      />
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
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="score">
              <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-2xl border border-border p-10 shadow-card text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/8 mb-6">
                    <FileCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-card-foreground mb-2 tracking-tight">ATS Compatibility Score</h3>
                  <p className="text-muted-foreground mb-8">Fill in your CV details to see your real-time ATS score.</p>

                  <div className="mb-10">
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle cx="60" cy="60" r="54" fill="none" stroke={score >= 70 ? "hsl(var(--success))" : score >= 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} strokeWidth="8" strokeDasharray={`${(score / 100) * 339.3} 339.3`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-5xl font-bold text-foreground">{score}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-left max-w-md mx-auto">
                    {fullName && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-success/8 border border-success/15">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Personal details complete</p>
                          <p className="text-xs text-muted-foreground">Name and contact info detected</p>
                        </div>
                      </div>
                    )}
                    {!summary && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/8 border border-warning/15">
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Missing professional summary</p>
                          <p className="text-xs text-muted-foreground">Add a 2-3 sentence summary to boost your score</p>
                        </div>
                      </div>
                    )}
                    {summary && summary.length < 50 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/8 border border-warning/15">
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Summary too short</p>
                          <p className="text-xs text-muted-foreground">Expand to 2-3 sentences for better results</p>
                        </div>
                      </div>
                    )}
                    {skills.length === 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/8 border border-warning/15">
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">No skills added</p>
                          <p className="text-xs text-muted-foreground">Add relevant skills to improve keyword matching</p>
                        </div>
                      </div>
                    )}
                    {skills.length > 0 && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-success/8 border border-success/15">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{skills.length} skills detected</p>
                          <p className="text-xs text-muted-foreground">Great keyword coverage for ATS</p>
                        </div>
                      </div>
                    )}
                    {experiences.some((e) => e.title && e.company) && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-success/8 border border-success/15">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Work experience present</p>
                          <p className="text-xs text-muted-foreground">ATS-friendly formatting detected</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {templates.map((tmpl, i) => (
                  <motion.div
                    key={tmpl.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => { setSelectedTemplate(tmpl.id); toast.success(`${tmpl.name} template selected!`); }}
                    className={`bg-card rounded-2xl border overflow-hidden shadow-card hover:shadow-lg transition-all group cursor-pointer hover:-translate-y-1 card-shine ${selectedTemplate === tmpl.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                  >
                    <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                      <Layout className="h-14 w-14 text-muted-foreground/20 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-300" />
                      {selectedTemplate === tmpl.id && (
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg">Active</div>
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
                        <Button size="sm" className="text-xs rounded-xl h-8 bg-gradient-primary text-primary-foreground">
                          {selectedTemplate === tmpl.id ? "Selected" : "Use Template"}
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
