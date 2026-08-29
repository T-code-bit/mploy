import { useState, useCallback, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Download, Sparkles, AlertTriangle, CheckCircle2, Layout, Plus, Trash2, Loader2, Lock, Brain, BarChart3, Globe, Award, Languages, BookOpen, Link2 } from "lucide-react";
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
  achievements: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpa: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
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
  const { user, userRole, subscriptionTier } = useAuth();
  const tierLimits = SUBSCRIPTION_TIERS[subscriptionTier].limits;
  const tabsRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("builder");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: "1", title: "", company: "", startDate: "", endDate: "", description: "", achievements: "" },
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { id: "1", degree: "", institution: "", year: "", gpa: "" },
  ]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState("");
  const [references, setReferences] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [verifiedPurchaseReference, setVerifiedPurchaseReference] = useState<string | null>(null);
  const [pendingPurchaseReference, setPendingPurchaseReference] = useState<string | null>(null);
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | null>(null);
  const [needsFinalization, setNeedsFinalization] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const addSkill = (input: string) => {
    const newSkills = input.split(",").map((s) => s.trim()).filter((s) => s && !skills.includes(s));
    if (newSkills.length) setSkills([...skills, ...newSkills]);
    setSkillsInput("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const addExperience = () => setExperiences([...experiences, { id: Date.now().toString(), title: "", company: "", startDate: "", endDate: "", description: "", achievements: "" }]);
  const removeExperience = (id: string) => experiences.length > 1 && setExperiences(experiences.filter((e) => e.id !== id));
  const updateExperience = (id: string, field: keyof Experience, value: string) =>
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addEducation = () => setEducations([...educations, { id: Date.now().toString(), degree: "", institution: "", year: "", gpa: "" }]);
  const removeEducation = (id: string) => educations.length > 1 && setEducations(educations.filter((e) => e.id !== id));
  const updateEducation = (id: string, field: keyof Education, value: string) =>
    setEducations(educations.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addCertification = () => setCertifications([...certifications, { id: Date.now().toString(), name: "", issuer: "", year: "" }]);
  const removeCertification = (id: string) => setCertifications(certifications.filter((c) => c.id !== id));
  const updateCertification = (id: string, field: keyof Certification, value: string) =>
    setCertifications(certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const addLanguage = () => setLanguages([...languages, { id: Date.now().toString(), language: "", proficiency: "" }]);
  const removeLanguage = (id: string) => setLanguages(languages.filter((l) => l.id !== id));
  const updateLanguage = (id: string, field: keyof LanguageEntry, value: string) =>
    setLanguages(languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  // Strict ATS scoring
  const atsAnalysis = useCallback(() => {
    const sections: { name: string; score: number; max: number; tips: string[] }[] = [];

    // Personal Details (15 pts) - stricter
    let personalScore = 0;
    const personalTips: string[] = [];
    if (fullName.trim().split(" ").length >= 2) personalScore += 4; else personalTips.push("Use your full legal name (first and last)");
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) personalScore += 3; else personalTips.push("Add a valid professional email address");
    if (phone && phone.length >= 10) personalScore += 3; else personalTips.push("Add a phone number with country code");
    if (location) personalScore += 2; else personalTips.push("Add your city/location for local job matching");
    if (linkedinUrl) personalScore += 2; else personalTips.push("Add LinkedIn URL — 87% of recruiters use LinkedIn");
    if (portfolioUrl) personalScore += 1;
    sections.push({ name: "Contact Information", score: Math.min(personalScore, 15), max: 15, tips: personalTips });

    // Professional Summary (20 pts) - much stricter
    let summaryScore = 0;
    const summaryTips: string[] = [];
    if (!summary) {
      summaryTips.push("A professional summary is critical — add 3-4 sentences highlighting your value proposition");
    } else {
      const wordCount = summary.trim().split(/\s+/).length;
      if (wordCount < 20) { summaryScore = 5; summaryTips.push("Summary too short. Aim for 40-60 words with key achievements"); }
      else if (wordCount < 40) { summaryScore = 10; summaryTips.push("Expand to 40-60 words. Include years of experience, key skills, and a measurable achievement"); }
      else if (wordCount <= 80) { summaryScore = 18; }
      else { summaryScore = 14; summaryTips.push("Summary too long — keep it under 80 words for ATS clarity"); }

      // Check for quantifiable metrics
      const hasNumbers = /\d+/.test(summary);
      if (hasNumbers) summaryScore = Math.min(summaryScore + 2, 20);
      else summaryTips.push("Include at least one quantifiable achievement (e.g., '5+ years', 'increased sales by 30%')");
    }
    sections.push({ name: "Professional Summary", score: summaryScore, max: 20, tips: summaryTips });

    // Work Experience (25 pts) - stricter grading
    let expScore = 0;
    const expTips: string[] = [];
    const filledExp = experiences.filter((e) => e.title && e.company);
    if (filledExp.length === 0) {
      expTips.push("Add at least one work experience entry with detailed responsibilities");
    } else {
      expScore += Math.min(filledExp.length * 3, 9);
      const withDates = filledExp.filter(e => e.startDate && e.endDate);
      if (withDates.length < filledExp.length) { expTips.push("Every role must have start and end dates (use 'Present' if current)"); }
      else expScore += 4;

      const withDesc = filledExp.filter(e => e.description && e.description.length > 50);
      if (withDesc.length < filledExp.length) { expTips.push("Each role needs 50+ character descriptions with action verbs (Led, Managed, Developed)"); }
      else expScore += 5;

      // Check for action verbs
      const actionVerbs = ["led", "managed", "developed", "created", "implemented", "designed", "built", "achieved", "increased", "reduced", "delivered", "coordinated", "analyzed", "optimized"];
      const allDescText = filledExp.map(e => e.description.toLowerCase()).join(" ");
      const usedVerbs = actionVerbs.filter(v => allDescText.includes(v));
      if (usedVerbs.length < 2) { expTips.push("Use strong action verbs: Led, Managed, Developed, Achieved, Implemented"); }
      else expScore += 4;

      // Check for achievements / metrics
      const hasAchievements = filledExp.some(e => e.achievements && e.achievements.length > 10);
      if (!hasAchievements) { expTips.push("Add measurable achievements (e.g., 'Increased revenue by 25%', 'Managed team of 8')"); }
      else expScore += 3;
    }
    sections.push({ name: "Work Experience", score: Math.min(expScore, 25), max: 25, tips: expTips });

    // Education (15 pts)
    let eduScore = 0;
    const eduTips: string[] = [];
    const filledEdu = educations.filter((e) => e.degree && e.institution);
    if (filledEdu.length === 0) { eduTips.push("Add at least one education entry"); }
    else {
      eduScore += Math.min(filledEdu.length * 4, 8);
      const withYear = filledEdu.filter(e => e.year);
      if (withYear.length < filledEdu.length) eduTips.push("Add graduation year to all entries");
      else eduScore += 4;
      const withGpa = filledEdu.filter(e => e.gpa);
      if (withGpa.length > 0) eduScore += 3;
      else eduTips.push("Consider adding GPA if 3.0+ to strengthen your profile");
    }
    sections.push({ name: "Education", score: Math.min(eduScore, 15), max: 15, tips: eduTips });

    // Skills & Keywords (15 pts) - stricter
    let skillScore = 0;
    const skillTips: string[] = [];
    if (skills.length === 0) {
      skillTips.push("Skills section is empty — add 6-12 relevant skills for ATS keyword matching");
    } else if (skills.length < 4) {
      skillScore += skills.length * 2;
      skillTips.push("Add more skills (aim for 6-12) — most ATS scan for keyword density");
    } else {
      skillScore += Math.min(skills.length, 12);
    }
    // Industry keyword matching
    const selectedTmpl = templates.find(t => t.id === selectedTemplate);
    const industryKws = INDUSTRY_KEYWORDS[selectedTmpl?.industry || "General"] || INDUSTRY_KEYWORDS["General"];
    const allText = [summary, ...experiences.map(e => `${e.description} ${e.achievements}`), ...skills].join(" ").toLowerCase();
    const matchedKws = industryKws.filter(kw => allText.includes(kw));
    const kwBonus = Math.min(Math.round((matchedKws.length / Math.min(industryKws.length, 6)) * 3), 3);
    skillScore += kwBonus;
    if (matchedKws.length < 3) skillTips.push(`Missing industry keywords: ${industryKws.filter(kw => !allText.includes(kw)).slice(0, 5).join(", ")}`);
    sections.push({ name: "Skills & Keywords", score: Math.min(skillScore, 15), max: 15, tips: skillTips });

    // Extras (10 pts) - certifications, languages, etc.
    let extrasScore = 0;
    const extrasTips: string[] = [];
    if (certifications.filter(c => c.name).length > 0) extrasScore += 4;
    else extrasTips.push("Add certifications or professional licenses to stand out");
    if (languages.filter(l => l.language).length > 0) extrasScore += 3;
    else extrasTips.push("Add languages — bilingual candidates have a competitive edge");
    if (references) extrasScore += 2;
    if (hobbies) extrasScore += 1;
    sections.push({ name: "Certifications & Extras", score: Math.min(extrasScore, 10), max: 10, tips: extrasTips });

    const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
    return { totalScore, sections };
  }, [fullName, email, phone, location, linkedinUrl, portfolioUrl, summary, experiences, educations, skills, selectedTemplate, certifications, languages, references, hobbies]);

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

  const generatePDF = async (purchaseReference?: string) => {
    if (!fullName) { toast.error("Please enter your full name"); return; }
    setDownloading(true);
    setPaymentStatus("Building your ATS-ready PDF…");
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPage = (needed: number) => {
        if (y + needed > 280) { doc.addPage(); y = margin; }
      };

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(fullName, margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      const contactParts = [email, phone, location].filter(Boolean);
      if (contactParts.length) { doc.text(contactParts.join("  |  "), margin, y); y += 5; }
      const linkParts = [linkedinUrl, portfolioUrl].filter(Boolean);
      if (linkParts.length) { doc.text(linkParts.join("  |  "), margin, y); y += 5; }
      doc.setDrawColor(50, 50, 50);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setTextColor(0, 0, 0);

      // Summary
      if (summary) {
        checkPage(20);
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("PROFESSIONAL SUMMARY", margin, y); y += 6;
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(summary, contentWidth);
        doc.text(lines, margin, y); y += lines.length * 5 + 6;
      }

      // Experience
      const filledExp = experiences.filter((e) => e.title || e.company);
      if (filledExp.length) {
        checkPage(20);
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("WORK EXPERIENCE", margin, y); y += 6;
        filledExp.forEach((exp) => {
          checkPage(25);
          doc.setFontSize(10); doc.setFont("helvetica", "bold");
          doc.text(exp.title || "Untitled Role", margin, y); y += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const meta = [exp.company, [exp.startDate, exp.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
          if (meta) { doc.text(meta, margin, y); y += 5; }
          doc.setTextColor(0, 0, 0);
          if (exp.description) {
            const descLines = doc.splitTextToSize(exp.description, contentWidth);
            doc.text(descLines, margin, y); y += descLines.length * 5;
          }
          if (exp.achievements) {
            doc.setFont("helvetica", "italic");
            const achLines = doc.splitTextToSize("Key Achievements: " + exp.achievements, contentWidth);
            doc.text(achLines, margin, y); y += achLines.length * 5;
            doc.setFont("helvetica", "normal");
          }
          y += 4;
        });
        y += 2;
      }

      // Education
      const filledEdu = educations.filter((e) => e.degree || e.institution);
      if (filledEdu.length) {
        checkPage(20);
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("EDUCATION", margin, y); y += 6;
        filledEdu.forEach((edu) => {
          doc.setFontSize(10); doc.setFont("helvetica", "bold");
          doc.text(edu.degree || "Degree", margin, y); y += 5;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          const meta = [edu.institution, edu.year, edu.gpa ? `GPA: ${edu.gpa}` : ""].filter(Boolean).join("  |  ");
          if (meta) { doc.text(meta, margin, y); y += 5; }
          doc.setTextColor(0, 0, 0); y += 3;
        });
        y += 2;
      }

      // Certifications
      const filledCerts = certifications.filter(c => c.name);
      if (filledCerts.length) {
        checkPage(15);
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("CERTIFICATIONS", margin, y); y += 6;
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        filledCerts.forEach(c => {
          doc.text(`• ${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}`, margin, y);
          y += 5;
        });
        y += 4;
      }

      // Skills
      if (skills.length) {
        checkPage(15);
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("SKILLS", margin, y); y += 6;
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const skillsText = doc.splitTextToSize(skills.join("  •  "), contentWidth);
        doc.text(skillsText, margin, y); y += skillsText.length * 5 + 4;
      }

      // Languages
      const filledLangs = languages.filter(l => l.language);
      if (filledLangs.length) {
        checkPage(15);
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("LANGUAGES", margin, y); y += 6;
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text(filledLangs.map(l => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  "), margin, y);
        y += 8;
      }

      // References
      if (references) {
        checkPage(15);
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        doc.text("REFERENCES", margin, y); y += 6;
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        const refLines = doc.splitTextToSize(references, contentWidth);
        doc.text(refLines, margin, y);
      }

      doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
      if (purchaseReference) {
        // Keep a local recovery marker until the server records the completed export.
        // This is intentionally set only after jsPDF has successfully saved the file.
        sessionStorage.setItem(`mploy-cv-exported-${purchaseReference}`, "true");
        setPaymentStatus("Finalizing your paid CV export…");
        const { error } = await supabase.functions.invoke("complete-cv-export", {
          body: { reference: purchaseReference },
        });
        if (error) throw error;
        setVerifiedPurchaseReference(null);
        sessionStorage.removeItem(`mploy-cv-draft-${purchaseReference}`);
        sessionStorage.removeItem(`mploy-cv-exported-${purchaseReference}`);
      }
      setPaymentStatus("CV exported successfully.");
      toast.success("CV downloaded successfully!");
    } catch (err: any) {
      if (purchaseReference) setNeedsFinalization(true);
      setPaymentStatus(purchaseReference
        ? "Your PDF was downloaded, but finalization needs retrying. Do not start another payment."
        : "Export could not be completed. Please try again.");
      toast.error(err.message || "Failed to generate PDF");
    } finally { setDownloading(false); }
  };

  const saveDraft = () => ({
    fullName, email, phone, location, linkedinUrl, portfolioUrl, summary, experiences,
    educations, certifications, languages, skills, hobbies, references, selectedTemplate,
  });

  const restoreDraft = (draft: ReturnType<typeof saveDraft>) => {
    setFullName(draft.fullName); setEmail(draft.email); setPhone(draft.phone); setLocation(draft.location);
    setLinkedinUrl(draft.linkedinUrl); setPortfolioUrl(draft.portfolioUrl); setSummary(draft.summary);
    setExperiences(draft.experiences); setEducations(draft.educations); setCertifications(draft.certifications);
    setLanguages(draft.languages); setSkills(draft.skills); setHobbies(draft.hobbies); setReferences(draft.references);
    setSelectedTemplate(draft.selectedTemplate);
  };

  const startPaidExport = async () => {
    if (!user) { toast.error("Please sign in to pay for and export your CV"); return; }
    if (userRole === "admin") {
      if (!fullName) { toast.error("Please enter your full name"); return; }
      await generatePDF();
      return;
    }
    if (verifiedPurchaseReference) {
      if (!fullName) { toast.error("Please enter your full name"); return; }
      await generatePDF(verifiedPurchaseReference);
      return;
    }
    if (pendingPurchaseReference) {
      await verifyPurchase(pendingPurchaseReference);
      return;
    }
    setDownloading(true);
    setPaymentStatus("Opening secure KES 10 Paystack checkout…");
    try {
      const { data, error } = await supabase.functions.invoke("paystack-create-cv-payment");
      if (error) throw error;
      if (!data?.url || !data?.reference) throw new Error("Checkout could not be started");
      sessionStorage.setItem(`mploy-cv-draft-${data.reference}`, JSON.stringify(saveDraft()));
      setPendingPurchaseReference(data.reference);
      setPendingCheckoutUrl(data.url);
      setPaymentStatus("Redirecting to Paystack to complete payment…");
      window.location.assign(data.url);
    } catch (err: any) {
      setPaymentStatus("");
      toast.error(err.message || "Failed to start secure checkout");
      setDownloading(false);
    }
  };

  const verifyPurchase = async (reference: string) => {
    setDownloading(true);
    setPaymentStatus("Verifying your KES 10 payment securely with Paystack…");
    try {
      const { data, error } = await supabase.functions.invoke("paystack-verify-cv-payment", { body: { reference } });
      if (error || !data?.verified) throw error || new Error("Payment has not been verified");
      const savedDraft = sessionStorage.getItem(`mploy-cv-draft-${reference}`);
      if (savedDraft) {
        try {
          restoreDraft(JSON.parse(savedDraft));
        } catch {
          // Verification must remain usable even if a local draft was corrupted.
          sessionStorage.removeItem(`mploy-cv-draft-${reference}`);
          toast.error("Your payment was verified, but the saved local draft could not be restored.");
        }
      }
      setPendingPurchaseReference(null);
      setPendingCheckoutUrl(null);
      setVerifiedPurchaseReference(data.exported ? null : reference);
      const finalizePending = sessionStorage.getItem(`mploy-cv-exported-${reference}`) === "true";
      setNeedsFinalization(finalizePending && !data.exported);
      setPaymentStatus(data.exported
        ? "This paid CV was already exported."
        : finalizePending
          ? "Your PDF was downloaded earlier, but finalization needs retrying."
          : "Payment verified. You can now build and export this CV.");
      toast.success(data.exported ? "This CV purchase has already been used." : "Payment verified — CV Builder unlocked.");
      // The database now holds the verified purchase, so removing callback details is safe.
      if (new URLSearchParams(window.location.search).get("reference") === reference) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch (err: any) {
      setPendingPurchaseReference(reference);
      setPaymentStatus("Payment is still pending or could not be verified. Retry verification after completing Paystack checkout.");
      toast.error(err.message || "Payment verification failed");
    } finally {
      setDownloading(false);
    }
  };

  const finalizeExport = async () => {
    if (!verifiedPurchaseReference) return;
    setDownloading(true);
    setPaymentStatus("Finalizing your paid CV export…");
    try {
      const { error } = await supabase.functions.invoke("complete-cv-export", { body: { reference: verifiedPurchaseReference } });
      if (error) throw error;
      sessionStorage.removeItem(`mploy-cv-draft-${verifiedPurchaseReference}`);
      sessionStorage.removeItem(`mploy-cv-exported-${verifiedPurchaseReference}`);
      setVerifiedPurchaseReference(null);
      setNeedsFinalization(false);
      setPaymentStatus("CV export completed successfully.");
      toast.success("Your paid CV export has been finalized.");
    } catch (err: any) {
      setNeedsFinalization(true);
      setPaymentStatus("Your PDF was downloaded, but finalization needs retrying. Do not start another payment.");
      toast.error(err.message || "Could not finalize the exported CV");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (!user || userRole === "admin") return;
    let cancelled = false;
    const recoverPurchase = async () => {
      if (params.get("cv_payment") === "1" && reference) {
        await verifyPurchase(reference);
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke("paystack-cv-purchase-status");
        if (error) throw error;
        if (!cancelled && data?.purchase?.status === "verified") {
          setVerifiedPurchaseReference(data.purchase.reference);
          const finalizePending = sessionStorage.getItem(`mploy-cv-exported-${data.purchase.reference}`) === "true";
          setNeedsFinalization(finalizePending);
          setPaymentStatus(finalizePending
            ? "Your PDF was downloaded earlier, but finalization needs retrying."
            : "Recovered your verified CV build session. Continue building, then export it.");
        } else if (!cancelled && data?.purchase?.status === "pending") {
          setPendingPurchaseReference(data.purchase.reference);
          setPendingCheckoutUrl(data.purchase.checkout_url || null);
          setPaymentStatus("A CV payment is pending. Complete checkout, then verify it to unlock the builder.");
        }
      } catch (err: any) {
        if (!cancelled) {
          setPaymentStatus("We could not recover your CV payment status. Refresh to retry; do not make another payment yet.");
          toast.error(err.message || "Could not recover payment status");
        }
      }
    };
    recoverPurchase();
    return () => { cancelled = true; };
  }, [user, userRole]);

  const selectTemplate = (tmpl: typeof templates[0]) => {
    setSelectedTemplate(tmpl.id);
    setActiveTab("builder");
    toast.success(`${tmpl.name} template selected! Start building your CV.`);
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
            <p className="text-muted-foreground text-lg">Build, optimize, and score your CV for maximum ATS compatibility.</p>
          </motion.div>

          {subscriptionTier === "free" && (
            <UpgradeBanner requiredTier="basic" feature="All CV templates and unlimited downloads" />
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8" ref={tabsRef}>
            <TabsList className="bg-muted/60 rounded-xl p-1 h-auto">
              <TabsTrigger value="builder" className="rounded-lg data-[state=active]:shadow-sm">CV Builder</TabsTrigger>
              <TabsTrigger value="score" className="rounded-lg data-[state=active]:shadow-sm">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> ATS Analysis
              </TabsTrigger>
              <TabsTrigger value="templates" className="rounded-lg data-[state=active]:shadow-sm">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="builder">
              {userRole !== "admin" && !verifiedPurchaseReference ? (
                <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-card">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Unlock one CV build for KES 10</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    A verified, one-off Paystack payment unlocks this builder for one CV session. Your purchase is finalized only after its PDF export succeeds.
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">{paymentStatus || "Start secure checkout to build your CV."}</p>
                  <Button onClick={startPaidExport} disabled={downloading} className="mt-6 gap-2 rounded-xl bg-gradient-primary text-primary-foreground">
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : pendingPurchaseReference ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {pendingPurchaseReference ? "Verify KES 10 payment" : "Pay KES 10 to start building"}
                  </Button>
                  {pendingPurchaseReference && pendingCheckoutUrl && (
                    <Button variant="outline" onClick={() => window.location.assign(pendingCheckoutUrl)} disabled={downloading} className="ml-3 mt-6 rounded-xl">
                      Return to Paystack checkout
                    </Button>
                  )}
                </div>
              ) : (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  {/* Personal Details */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-3.5 w-3.5 text-primary" /></div>
                      Contact Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input placeholder="Full Name *" className="rounded-xl h-11" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <Input placeholder="Email *" type="email" className="rounded-xl h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input placeholder="Phone *" className="rounded-xl h-11" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      <Input placeholder="City, Country" className="rounded-xl h-11" value={location} onChange={(e) => setLocation(e.target.value)} />
                      <Input placeholder="LinkedIn URL" className="rounded-xl h-11" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
                      <Input placeholder="Portfolio / Website" className="rounded-xl h-11" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
                    </div>
                  </div>

                  {/* Professional Summary */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-1 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="h-3.5 w-3.5 text-primary" /></div>
                      Professional Summary
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">Write 3-4 sentences: Who you are, key expertise, years of experience, and a top achievement.</p>
                    <Textarea placeholder="Results-driven Marketing Manager with 5+ years of experience driving brand growth through data-driven strategies. Increased quarterly revenue by 30% through targeted campaigns..." rows={5} className="rounded-xl" value={summary} onChange={(e) => setSummary(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-2">{summary.trim().split(/\s+/).filter(Boolean).length} / 60 words recommended</p>
                  </div>

                  {/* Work Experience */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="h-3.5 w-3.5 text-primary" /></div>
                      Work Experience
                    </h3>
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
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input placeholder="Job Title *" className="rounded-xl h-11" value={exp.title} onChange={(e) => updateExperience(exp.id, "title", e.target.value)} />
                          <Input placeholder="Company *" className="rounded-xl h-11" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Input placeholder="Start Date (e.g. Jan 2022)" className="rounded-xl h-11" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                          <Input placeholder="End Date or Present" className="rounded-xl h-11" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
                        </div>
                        <Textarea placeholder="Describe your responsibilities using action verbs (Led, Managed, Developed, Created)..." rows={3} className="rounded-xl" value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} />
                        <Textarea placeholder="Key achievements with measurable results (e.g., Increased sales by 25%, Managed a team of 12)..." rows={2} className="rounded-xl" value={exp.achievements} onChange={(e) => updateExperience(exp.id, "achievements", e.target.value)} />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-1.5" onClick={addExperience}>
                      <Plus className="h-3.5 w-3.5" /> Add Experience
                    </Button>
                  </div>

                  {/* Education */}
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
                        <Input placeholder="Degree / Qualification *" className="rounded-xl h-11" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input placeholder="Institution *" className="rounded-xl h-11" value={edu.institution} onChange={(e) => updateEducation(edu.id, "institution", e.target.value)} />
                          <Input placeholder="Graduation Year" className="rounded-xl h-11" value={edu.year} onChange={(e) => updateEducation(edu.id, "year", e.target.value)} />
                        </div>
                        <Input placeholder="GPA (optional, e.g. 3.8/4.0)" className="rounded-xl h-11" value={edu.gpa} onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)} />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-1.5" onClick={addEducation}>
                      <Plus className="h-3.5 w-3.5" /> Add Education
                    </Button>
                  </div>

                  {/* Certifications */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="h-3.5 w-3.5 text-primary" /></div>
                      Certifications & Licenses
                    </h3>
                    {certifications.map((cert, i) => (
                      <div key={cert.id} className={`space-y-3 ${i > 0 ? "mt-4 pt-4 border-t border-border" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">Certification {i + 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeCertification(cert.id)} className="h-7 px-2 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <Input placeholder="Certification Name" className="rounded-xl h-11" value={cert.name} onChange={(e) => updateCertification(cert.id, "name", e.target.value)} />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <Input placeholder="Issuing Organization" className="rounded-xl h-11" value={cert.issuer} onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)} />
                          <Input placeholder="Year" className="rounded-xl h-11" value={cert.year} onChange={(e) => updateCertification(cert.id, "year", e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-1.5" onClick={addCertification}>
                      <Plus className="h-3.5 w-3.5" /> Add Certification
                    </Button>
                  </div>

                  {/* Skills */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-1">Skills</h3>
                    <p className="text-xs text-muted-foreground mb-4">Add 6-12 relevant skills. Include both technical and soft skills for better ATS matching.</p>
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

                  {/* Languages */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center"><Languages className="h-3.5 w-3.5 text-primary" /></div>
                      Languages
                    </h3>
                    {languages.map((lang, i) => (
                      <div key={lang.id} className={`flex items-center gap-3 ${i > 0 ? "mt-3" : ""}`}>
                        <Input placeholder="Language" className="rounded-xl h-11 flex-1" value={lang.language} onChange={(e) => updateLanguage(lang.id, "language", e.target.value)} />
                        <Input placeholder="Proficiency (e.g. Fluent)" className="rounded-xl h-11 flex-1" value={lang.proficiency} onChange={(e) => updateLanguage(lang.id, "proficiency", e.target.value)} />
                        <Button variant="ghost" size="sm" onClick={() => removeLanguage(lang.id)} className="h-7 px-2 text-destructive shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-4 rounded-xl gap-1.5" onClick={addLanguage}>
                      <Plus className="h-3.5 w-3.5" /> Add Language
                    </Button>
                  </div>

                  {/* Hobbies & References */}
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h3 className="font-display font-semibold text-card-foreground mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2">Hobbies & Interests (optional)</p>
                        <Input placeholder="e.g. Volunteering, Public Speaking, Marathon Running" className="rounded-xl h-11" value={hobbies} onChange={(e) => setHobbies(e.target.value)} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2">References</p>
                        <Textarea placeholder="Name — Title, Company — Phone / Email (one per line)" rows={3} className="rounded-xl" value={references} onChange={(e) => setReferences(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-semibold text-card-foreground">Live Preview</h3>
                      <Button size="sm" onClick={startPaidExport} disabled={downloading} className="bg-gradient-primary text-primary-foreground gap-2 rounded-xl shadow-glow hover:shadow-glow">
                        {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        {verifiedPurchaseReference ? "Export paid CV" : userRole === "admin" ? "Download PDF" : "Pay KES 10 & Export"}
                      </Button>
                    </div>
                    <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                      {paymentStatus || (userRole === "admin"
                        ? "Admin access: export is available without checkout."
                        : "Each CV export costs KES 10. Payment is verified securely before export.")}
                      {needsFinalization && (
                        <Button variant="link" size="sm" onClick={finalizeExport} disabled={downloading} className="ml-2 h-auto px-0 text-xs text-primary">
                          Retry finalization
                        </Button>
                      )}
                    </div>
                    <div className="border border-border rounded-xl p-6 bg-background min-h-[500px] max-h-[70vh] overflow-y-auto text-sm">
                      {fullName ? (
                        <div className="space-y-4">
                          <div>
                            <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
                            <p className="text-xs text-muted-foreground">{[email, phone, location].filter(Boolean).join("  |  ")}</p>
                            {(linkedinUrl || portfolioUrl) && (
                              <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                {[linkedinUrl, portfolioUrl].filter(Boolean).join("  |  ")}
                              </p>
                            )}
                          </div>
                          <div className="border-t border-border" />
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
                                  {exp.achievements && (
                                    <p className="mt-0.5 flex items-start gap-1 text-[11px] italic text-primary/80">
                                      <Award className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                                      <span>{exp.achievements}</span>
                                    </p>
                                  )}
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
                                  <p className="text-[11px] text-muted-foreground">{[edu.institution, edu.year, edu.gpa ? `GPA: ${edu.gpa}` : ""].filter(Boolean).join("  |  ")}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {certifications.filter(c => c.name).length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Certifications</h4>
                              {certifications.filter(c => c.name).map(c => (
                                <p key={c.id} className="text-[11px] text-muted-foreground">• {c.name}{c.issuer ? ` — ${c.issuer}` : ""}{c.year ? ` (${c.year})` : ""}</p>
                              ))}
                            </div>
                          )}
                          {skills.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Skills</h4>
                              <p className="text-xs text-muted-foreground">{skills.join("  •  ")}</p>
                            </div>
                          )}
                          {languages.filter(l => l.language).length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Languages</h4>
                              <p className="text-xs text-muted-foreground">{languages.filter(l => l.language).map(l => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  ")}</p>
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
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {totalScore >= 80 ? "Excellent — your CV is highly ATS compatible" :
                         totalScore >= 60 ? "Good — a few improvements will boost your score" :
                         totalScore >= 40 ? "Needs work — check ATS Analysis tab for tips" :
                         "Low — fill in more sections to improve compatibility"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </TabsContent>

            <TabsContent value="score">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Overall Score */}
                <div className="bg-card rounded-2xl border border-border p-10 shadow-card text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/8 mb-6">
                    <FileCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-card-foreground mb-2 tracking-tight">ATS Compatibility Analysis</h3>
                  <p className="text-muted-foreground mb-8">Strict section-by-section scoring with actionable improvement tips.</p>

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
                  return (
                    <motion.div
                      key={tmpl.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => { if (!isLocked) selectTemplate(tmpl); }}
                      className={`bg-card rounded-2xl border overflow-hidden shadow-card hover:shadow-lg transition-all group cursor-pointer hover:-translate-y-1 card-shine ${
                        isLocked ? "opacity-70" : ""
                      } ${selectedTemplate === tmpl.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
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
                            <Button size="sm" className="text-xs rounded-xl h-8 bg-gradient-primary text-primary-foreground" onClick={(e) => { e.stopPropagation(); selectTemplate(tmpl); }}>
                              {selectedTemplate === tmpl.id ? (
                                <><CheckCircle2 className="h-3 w-3" /> Selected</>
                              ) : "Use Template"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
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
