import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, ShieldCheck, Building2, Briefcase, Filter, Globe, Send, Loader2, Upload, FileText, AlertCircle, CalendarClock, Eye, Trash2, Check } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { uploadUserFile, validateUpload } from "@/lib/file-storage";
import JobDescription from "@/components/JobDescription";
import { jobDescriptionText } from "@/lib/job-description";

const categories = ["All", "Remote", "Full-time", "Part-time", "Contract", "Internship"];
const APPLICATION_FILE_ACCEPT = [
  ".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt",
  ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text", "application/rtf", "text/plain",
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
].join(",");

interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUploadField = ({ label, required, file, onFileChange }: FileUploadFieldProps) => {
  const inputId = useId();

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative flex min-h-16 items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/50 focus-within:ring-2 focus-within:ring-primary/30">
        <div className="shrink-0 p-2 rounded-lg bg-primary/10">
          <Upload className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(1)} MB · Tap to replace
                </p>
              </div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Choose PDF, Word, text, or image file
            </span>
          )}
        </div>
        <input
          id={inputId}
          type="file"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          accept={APPLICATION_FILE_ACCEPT}
          aria-label={label}
          onClick={(event) => {
            // Reset before opening the picker so choosing the same file again
            // still fires onChange, without invalidating a selected mobile File.
            event.currentTarget.value = "";
          }}
          onChange={(event) => {
            const nextFile = event.currentTarget.files?.item(0) || null;
            if (!nextFile) return;
            try {
              validateUpload(nextFile);
              onFileChange(nextFile);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "This file cannot be uploaded.");
            }
          }}
        />
      </div>
    </div>
  );
};

const applicationErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  if (normalized.includes("duplicate") || normalized.includes("unique constraint")) {
    return "You have already applied for this job.";
  }
  if (
    normalized.includes("jwt")
    || normalized.includes("unauthorized")
    || normalized.includes("row-level security")
  ) {
    return "Your session expired. Please sign in again, then retry.";
  }
  if (
    normalized.includes("schema cache")
    || normalized.includes("column")
    || normalized.includes("relation")
  ) {
    return "The application service is updating. Refresh the page and retry.";
  }
  if (normalized.includes("fetch") || normalized.includes("network")) {
    return "The connection was interrupted. Check your internet and retry.";
  }
  return "The application could not be submitted. Please retry.";
};

const Jobs = () => {
  usePageTitle("Verified Jobs");
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [viewJob, setViewJob] = useState<any>(null);
  const [deleteJob, setDeleteJob] = useState<any>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [availability, setAvailability] = useState("Immediately");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [recommendationFile, setRecommendationFile] = useState<File | null>(null);
  const [educationLevel, setEducationLevel] = useState("");
  const [gender, setGender] = useState("");
  const [county, setCounty] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("job_id")
        .eq("applicant_id", user!.id);
      if (error) throw error;
      return data.map((a) => a.job_id);
    },
    enabled: !!user,
  });

  const uploadFile = (file: File, folder: string) =>
    uploadUserFile(user!.id, file, folder);

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedJob) throw new Error("Please sign in and select a job.");
      if (!cvFile) throw new Error("CV is required");

      const uploadedPaths: string[] = [];
      try {
        const cvUpload = await uploadFile(cvFile, "cv");
        uploadedPaths.push(cvUpload.path);
        const coverLetterUpload = coverLetterFile ? await uploadFile(coverLetterFile, "cover-letter") : null;
        if (coverLetterUpload) uploadedPaths.push(coverLetterUpload.path);
        const recommendationUpload = recommendationFile ? await uploadFile(recommendationFile, "recommendation") : null;
        if (recommendationUpload) uploadedPaths.push(recommendationUpload.path);

        // The generated database types have not picked up cover_letter_url yet.
        const application: Database["public"]["Tables"]["applications"]["Insert"] & { cover_letter_url: string | null } = {
          job_id: selectedJob.id,
          applicant_id: user.id,
          applicant_email: user.email || null,
          cover_letter: coverLetter || null,
          cv_url: cvUpload.path,
          cover_letter_url: coverLetterUpload?.path || null,
          recommendation_letter_url: recommendationUpload?.path || null,
          phone: phone || null,
          years_of_experience: yearsExp || null,
          availability,
          linkedin_url: linkedinUrl || null,
          education_level: educationLevel || null,
          gender: gender || null,
          county: county || null,
          date_of_birth: dateOfBirth || null,
        };
        // Keep insert bound to its query builder so it retains the request state.
        const insertApplication = supabase.from("applications").insert as unknown as
          (values: typeof application) => PromiseLike<{ error: Error | null }>;
        const { error } = await insertApplication(application);
        if (error) throw error;
      } catch (error) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from("application-documents").remove(uploadedPaths).catch(() => undefined);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Application submitted successfully!");
      resetForm();
    },
    onError: (error) => {
      console.error("Application submission failed:", error);
      toast.error(applicationErrorMessage(error));
    },
  });

  const resetForm = () => {
    setApplyOpen(false);
    setCoverLetter("");
    setPhone("");
    setYearsExp("");
    setAvailability("Immediately");
    setLinkedinUrl("");
    setCvFile(null);
    setCoverLetterFile(null);
    setRecommendationFile(null);
    setSelectedJob(null);
    setEducationLevel("");
    setGender("");
    setCounty("");
    setDateOfBirth("");
  };

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase()) ||
      job.category.toLowerCase().includes(search.toLowerCase()) ||
      (job.requirements || []).some((r: string) => r.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Remote" && job.location.toLowerCase().includes("remote")) ||
      job.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  const handleApplyClick = (job: any) => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      navigate("/auth");
      return;
    }
    if (userRole === "employer") {
      toast.error("Employers cannot apply for jobs");
      return;
    }
    setSelectedJob(job);
    setApplyOpen(true);
  };

  const hasApplied = (jobId: string) => myApplications.includes(jobId);

  const isOwner = (job: any) => user && userRole === "employer" && job.employer_id === user.id;

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
      setDeleteJob(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero header */}
          <div className="relative mb-10 rounded-2xl bg-hero p-8 sm:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-primary/8 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-secondary/6 blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <Globe className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium text-primary-foreground/60">Global Opportunities</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight mb-2">
                Verified Job Vault
              </h1>
              <p className="text-primary-foreground/50 max-w-md">
                Global opportunities, zero scams. Every listing verified and authenticated.
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, locations, or skills..."
                className="pl-11 h-12 rounded-xl bg-card border-border shadow-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 h-12 rounded-xl px-5">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeFilter === f
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Listings */}
          {!isLoading && (
            <div className="grid gap-3">
              <AnimatePresence>
                {filtered.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: i * 0.03 }}
                    className="group bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 card-shine"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <h3 className="break-words font-display font-semibold text-card-foreground text-lg">{job.title}</h3>
                              {job.is_verified && (
                                <ShieldCheck className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <p className="break-words text-sm text-muted-foreground">{job.company}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3 sm:ml-[52px]">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || "Not specified"}</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(job.created_at)}</span>
                          {(job as any).deadline && (
                            <span className={`flex items-center gap-1 font-medium ${new Date((job as any).deadline) < new Date() ? 'text-destructive' : 'text-primary'}`}>
                              <CalendarClock className="h-3 w-3" />
                              {new Date((job as any).deadline) < new Date() ? 'Expired' : `Deadline: ${new Date((job as any).deadline).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 sm:ml-[52px]">{jobDescriptionText(job.description)}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 sm:ml-[52px]">
                          {(job.requirements || []).slice(0, 4).map((tag: string) => (
                            <span key={tag} className="inline-flex px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">{tag}</span>
                          ))}
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-accent text-xs font-medium text-accent-foreground">{job.category}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-2 text-left sm:items-end sm:text-right">
                        {job.salary_range && (
                          <div>
                            <p className="font-display font-bold text-foreground text-lg">{job.salary_range}</p>
                            <p className="text-xs text-muted-foreground">per month</p>
                          </div>
                        )}
                        {isOwner(job) ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 rounded-xl"
                              onClick={() => setViewJob(job)}
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 dark:border-red-400/50 dark:text-red-400"
                              onClick={() => setDeleteJob(job)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          </div>
                        ) : hasApplied(job.id) ? (
                          <Badge variant="secondary" className="gap-1 rounded-xl px-4 py-1.5">
                            Applied <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </Badge>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 rounded-xl"
                              onClick={() => setViewJob(job)}
                            >
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-primary text-primary-foreground gap-1.5 rounded-xl shadow-glow hover:shadow-glow px-5"
                              onClick={() => handleApplyClick(job)}
                            >
                              <Send className="h-3.5 w-3.5" /> Apply Now
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex p-5 rounded-2xl bg-muted mb-5">
                <Briefcase className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground text-lg">
                {jobs.length === 0
                  ? "No jobs posted yet. Check back soon!"
                  : "No jobs found matching your search."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Job Dialog */}
      <Dialog open={!!viewJob} onOpenChange={(open) => { if (!open) setViewJob(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{viewJob?.title}</DialogTitle>
          </DialogHeader>
          {viewJob && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{viewJob.company}</p>
                  <p className="text-sm text-muted-foreground">{viewJob.location}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-lg">{viewJob.type}</Badge>
                <Badge variant="outline" className="rounded-lg">{viewJob.category}</Badge>
                {viewJob.is_verified && <Badge className="rounded-lg gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>}
                <Badge variant={viewJob.is_active ? "default" : "destructive"} className="rounded-lg">
                  {viewJob.is_active ? "Active" : "Closed"}
                </Badge>
              </div>
              {viewJob.salary_range && (
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Salary Range</p>
                  <p className="font-display font-bold text-foreground">{viewJob.salary_range}</p>
                </div>
              )}
              {viewJob.deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="h-4 w-4" />
                  <span>Deadline: {new Date(viewJob.deadline).toLocaleDateString()}</span>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Description</h4>
                <JobDescription value={viewJob.description} />
              </div>
              {viewJob.requirements?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Requirements</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewJob.requirements.map((r: string) => (
                      <span key={r} className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Posted {new Date(viewJob.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJob} onOpenChange={(open) => { if (!open) setDeleteJob(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete Job Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteJob?.title}"</span> at {deleteJob?.company}? This action cannot be undone and all associated applications will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteJob) deleteJobMutation.mutate(deleteJob.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={(open) => { if (!open) resetForm(); else setApplyOpen(true); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="bg-muted rounded-xl p-4">
              <p className="font-semibold text-card-foreground">{selectedJob?.title}</p>
              <p className="text-sm text-muted-foreground">{selectedJob?.company} · {selectedJob?.location}</p>
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Fields marked with <span className="text-destructive font-bold">*</span> are required. Upload documents in PDF, DOC, or image format.</p>
            </div>

            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Personal Information</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone Number <span className="text-destructive">*</span></Label>
                  <Input placeholder="+254 7XX XXX XXX" className="rounded-xl h-11" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" className="rounded-xl h-11" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>County</Label>
                  <Select value={county} onValueChange={setCounty}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select county" /></SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60">
                      {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret/Uasin Gishu", "Kiambu", "Machakos", "Kajiado", "Nyeri", "Meru", "Kilifi", "Kwale", "Garissa", "Narok", "Migori", "Bungoma", "Kakamega", "Kericho", "Nyandarua", "Laikipia", "Trans Nzoia", "Nandi", "Bomet", "Embu", "Tharaka Nithi", "Murang'a", "Kirinyaga", "Homa Bay", "Siaya", "Kisii", "Nyamira", "Vihiga", "Busia", "Turkana", "West Pokot", "Samburu", "Baringo", "Elgeyo Marakwet", "Isiolo", "Marsabit", "Mandera", "Wajir", "Tana River", "Lamu", "Taita Taveta", "Kitui", "Makueni"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="KCSE">KCSE Certificate</SelectItem>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Degree">Bachelor's Degree</SelectItem>
                      <SelectItem value="Masters">Master's Degree</SelectItem>
                      <SelectItem value="PhD">PhD / Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Select value={yearsExp} onValueChange={setYearsExp}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="0-1">0–1 years</SelectItem>
                      <SelectItem value="1-3">1–3 years</SelectItem>
                      <SelectItem value="3-5">3–5 years</SelectItem>
                      <SelectItem value="5-10">5–10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Immediately">Immediately</SelectItem>
                    <SelectItem value="2 weeks">2 weeks notice</SelectItem>
                    <SelectItem value="1 month">1 month notice</SelectItem>
                    <SelectItem value="3 months">3 months notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>LinkedIn Profile</Label>
                <Input placeholder="linkedin.com/in/..." className="rounded-xl h-11" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Documents</h4>
              <FileUploadField label="Upload CV" required file={cvFile} onFileChange={setCvFile} />
              <FileUploadField label="Upload Cover Letter" file={coverLetterFile} onFileChange={setCoverLetterFile} />
              <FileUploadField label="Recommendation Letter" file={recommendationFile} onFileChange={setRecommendationFile} />
            </div>

            {/* Cover Letter Text */}
            <div className="space-y-2">
              <Label>Additional Message (optional)</Label>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                rows={4}
                className="rounded-xl"
              />
            </div>

            <Button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending || !cvFile}
              className="w-full bg-gradient-primary text-primary-foreground gap-2 rounded-xl h-11"
            >
              {applyMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="h-4 w-4" /> Submit Application</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Jobs;
