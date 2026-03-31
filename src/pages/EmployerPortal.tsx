import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Briefcase, Users, Eye, Trash2, Building2, Pencil, UserCircle } from "lucide-react";
import ApplicantProfileDialog from "@/components/ApplicantProfileDialog";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const EmployerPortal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [viewingApplicant, setViewingApplicant] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "", company: "", location: "", type: "Full-time", category: "General",
    description: "", salary_range: "", deadline: "",
  });

  const { data: myJobs = [] } = useQuery({
    queryKey: ["employer-jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["employer-applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs!inner(title, employer_id)")
        .eq("jobs.employer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createJob = useMutation({
    mutationFn: async () => {
      if (editingJob) {
        const { error } = await supabase.from("jobs").update({
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          type: jobForm.type,
          category: jobForm.category,
          description: jobForm.description,
          salary_range: jobForm.salary_range || null,
          deadline: jobForm.deadline || null,
        }).eq("id", editingJob.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("jobs").insert({
          ...jobForm,
          employer_id: user!.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      toast.success(editingJob ? "Job updated!" : "Job posted!");
      setDialogOpen(false);
      setEditingJob(null);
      setJobForm({ title: "", company: "", location: "", type: "Full-time", category: "General", description: "", salary_range: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEditDialog = (job: any) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      category: job.category,
      description: job.description,
      salary_range: job.salary_range || "",
    });
    setDialogOpen(true);
  };

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-applications"] });
      toast.success("Status updated");
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      toast.success("Job removed");
    },
  });

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 mb-4">
                <Building2 className="h-3.5 w-3.5 text-secondary" />
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Employer</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-1">Employer Portal</h1>
              <p className="text-muted-foreground text-lg">Manage your listings and review candidates.</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingJob(null); setJobForm({ title: "", company: "", location: "", type: "Full-time", category: "General", description: "", salary_range: "" }); }} className="bg-gradient-accent text-secondary-foreground gap-2 rounded-xl h-11 px-6 font-semibold shadow-glow-accent hover:shadow-glow-accent">
                  <Plus className="h-4 w-4" /> Post a Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display">{editingJob ? "Edit Job" : "Post a New Job"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Frontend Developer" className="rounded-xl h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} className="rounded-xl h-11" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={jobForm.type} onValueChange={(v) => setJobForm({ ...jobForm, type: v })}>
                        <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Salary Range</Label>
                      <Input value={jobForm.salary_range} onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })} placeholder="e.g. $3k - $5k" className="rounded-xl h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={4} className="rounded-xl" />
                  </div>
                  <Button onClick={() => createJob.mutate()} disabled={!jobForm.title || !jobForm.company} className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-11 font-semibold">
                    {editingJob ? "Update Job" : "Publish Job"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Briefcase, label: "Active Jobs", value: myJobs.filter((j: any) => j.is_active).length, bg: "bg-primary/10", color: "text-primary" },
              { icon: Users, label: "Applications", value: applications.length, bg: "bg-secondary/10", color: "text-secondary" },
              { icon: Eye, label: "Total Views", value: "—", bg: "bg-muted", color: "text-muted-foreground" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold text-card-foreground tracking-tight">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList className="bg-muted/60 rounded-xl p-1 h-auto">
              <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:shadow-sm">My Jobs</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-lg data-[state=active]:shadow-sm">Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs">
              {myJobs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex p-5 rounded-2xl bg-muted mb-5">
                    <Briefcase className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground text-lg">No jobs posted yet. Click "Post a Job" to get started.</p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myJobs.map((job: any) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-semibold">{job.title}</TableCell>
                          <TableCell className="text-muted-foreground">{job.location}</TableCell>
                          <TableCell><Badge variant="secondary" className="rounded-lg">{job.type}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={job.is_active ? "default" : "outline"} className="rounded-lg">
                              {job.is_active ? "Active" : "Closed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(job)} className="rounded-lg">
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteJob.mutate(job.id)} className="rounded-lg">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications">
              {applications.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex p-5 rounded-2xl bg-muted mb-5">
                    <Users className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground text-lg">No applications received yet.</p>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app: any) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-semibold">{app.jobs?.title}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary rounded-lg" onClick={() => { setViewingApplicant(app.applicant_id); setProfileDialogOpen(true); }}>
                              <UserCircle className="h-3.5 w-3.5" /> View Profile
                            </Button>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}
                              className="rounded-lg"
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="text-xs text-success rounded-lg" onClick={() => updateApplicationStatus.mutate({ id: app.id, status: "accepted" })}>
                                Accept
                              </Button>
                              <Button size="sm" variant="ghost" className="text-xs text-destructive rounded-lg" onClick={() => updateApplicationStatus.mutate({ id: app.id, status: "rejected" })}>
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ApplicantProfileDialog
        applicantId={viewingApplicant}
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
      />
      <Footer />
    </div>
  );
};

export default EmployerPortal;
