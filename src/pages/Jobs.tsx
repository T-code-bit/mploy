import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Clock, ShieldCheck, Building2, Briefcase, Filter, Globe, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const categories = ["All", "Remote", "Full-time", "Part-time", "Contract", "Internship"];

const Jobs = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  // Fetch jobs from database
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

  // Fetch user's existing applications to prevent duplicates
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

  const applyMutation = useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: string; coverLetter: string }) => {
      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        applicant_id: user!.id,
        cover_letter: coverLetter || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Application submitted successfully!");
      setApplyOpen(false);
      setCoverLetter("");
      setSelectedJob(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Filter logic
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Verified Job Vault
              </h1>
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Global opportunities, zero scams. Every listing verified and authenticated.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, locations, or skills..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((f) => (
              <Badge
                key={f}
                variant={activeFilter === f ? "default" : "outline"}
                className={`cursor-pointer transition-all ${activeFilter === f ? "bg-gradient-primary text-primary-foreground" : "hover:bg-accent"}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </Badge>
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
            <div className="grid gap-4">
              <AnimatePresence>
                {filtered.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-card-foreground text-lg">{job.title}</h3>
                          {job.is_verified && (
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location || "Not specified"}</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.type}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(job.created_at)}</span>
                        </div>
                        {job.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {(job.requirements || []).slice(0, 5).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                          <Badge variant="outline" className="text-xs">{job.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {job.salary_range && (
                          <>
                            <p className="font-display font-semibold text-foreground">{job.salary_range}</p>
                            <p className="text-xs text-muted-foreground mb-2">per month</p>
                          </>
                        )}
                        {hasApplied(job.id) ? (
                          <Badge variant="secondary" className="mt-1">Applied ✓</Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="mt-1 bg-gradient-primary text-primary-foreground gap-1.5"
                            onClick={() => handleApplyClick(job)}
                          >
                            <Send className="h-3.5 w-3.5" /> Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {jobs.length === 0
                  ? "No jobs posted yet. Check back soon!"
                  : "No jobs found matching your search."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-accent/50 rounded-lg p-4">
              <p className="font-medium text-card-foreground">{selectedJob?.title}</p>
              <p className="text-sm text-muted-foreground">{selectedJob?.company} · {selectedJob?.location}</p>
            </div>
            <div className="space-y-2">
              <Label>Cover Letter (optional)</Label>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                rows={5}
              />
            </div>
            <Button
              onClick={() => applyMutation.mutate({ jobId: selectedJob.id, coverLetter })}
              disabled={applyMutation.isPending}
              className="w-full bg-gradient-primary text-primary-foreground gap-2"
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
