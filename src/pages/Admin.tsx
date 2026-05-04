import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Trash2, Shield, Briefcase, Users, FileText, Mail, Loader2, Star, Check, X,
  Pencil, CreditCard, TrendingUp, UserCheck, BarChart3, DollarSign, Activity,
  MessageSquare, UserCog,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import usePageTitle from "@/hooks/usePageTitle";

// KES amounts per tier (matches paystack-create-subscription)
const TIER_PRICE: Record<string, number> = { basic: 999, premium: 2499, free: 0 };

const Admin = () => {
  usePageTitle("Admin Console");
  const qc = useQueryClient();
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(title, company)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: paystackSubs = [] } = useQuery({
    queryKey: ["admin-paystack-subs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("paystack_subscribers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Build role map (user_id -> role)
  const roleMap = useMemo(() => {
    const m: Record<string, string> = {};
    roles.forEach((r: any) => { m[r.user_id] = r.role; });
    return m;
  }, [roles]);

  const employerCount = roles.filter((r: any) => r.role === "employer").length;
  const seekerCount = roles.filter((r: any) => r.role === "job_seeker").length;
  const adminCount = roles.filter((r: any) => r.role === "admin").length;
  const activeSubs = paystackSubs.filter((s: any) => s.status === "active").length;
  const totalTransactions = paystackSubs.length;
  const totalRevenue = paystackSubs
    .filter((s: any) => s.status === "active")
    .reduce((sum: number, s: any) => sum + (TIER_PRICE[s.tier] || 0), 0);
  const pendingReviews = reviews.filter((r: any) => !r.is_approved).length;

  // Recent activity (combine latest items)
  const activity = useMemo(() => {
    const items: any[] = [];
    applications.slice(0, 5).forEach((a: any) =>
      items.push({ type: "application", at: a.created_at, label: `New application for ${a.jobs?.title || "a job"}` })
    );
    jobs.slice(0, 5).forEach((j: any) =>
      items.push({ type: "job", at: j.created_at, label: `Job posted: ${j.title}` })
    );
    paystackSubs.slice(0, 5).forEach((s: any) =>
      items.push({ type: "tx", at: s.created_at, label: `${s.tier} subscription · ${s.email}` })
    );
    reviews.slice(0, 5).forEach((r: any) =>
      items.push({ type: "review", at: r.created_at, label: `Review by ${r.name}${r.is_approved ? "" : " (pending)"}` })
    );
    return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8);
  }, [applications, jobs, paystackSubs, reviews]);

  const filteredProfiles = profiles.filter((p: any) =>
    !search || (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || "").includes(search)
  );

  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }: { table: "jobs" | "applications" | "newsletter_subscribers" | "contact_messages" | "reviews" | "profiles"; id: string }) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success("Deleted successfully");
      const keyMap: Record<string, string> = {
        jobs: "admin-jobs",
        applications: "admin-applications",
        newsletter_subscribers: "admin-subscribers",
        contact_messages: "admin-messages",
        reviews: "admin-reviews",
        profiles: "admin-profiles",
      };
      qc.invalidateQueries({ queryKey: [keyMap[vars.table]] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveReview = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("reviews").update({ is_approved: approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review updated");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["approved-reviews-landing"] });
      qc.invalidateQueries({ queryKey: ["approved-reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateJob = useMutation({
    mutationFn: async (job: any) => {
      const { error } = await supabase.from("jobs").update({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        category: job.category,
        salary_range: job.salary_range,
        description: job.description,
        is_active: job.is_active,
        is_verified: job.is_verified,
      }).eq("id", job.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job updated");
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      setEditingJob(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateAppStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application updated");
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeUserRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: "job_seeker" | "employer" | "admin" }) => {
      // Delete existing roles for user, then insert new
      await supabase.from("user_roles").delete().eq("user_id", user_id);
      const { error } = await supabase.from("user_roles").insert({ user_id, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ConfirmDelete = ({ onConfirm, label }: { onConfirm: () => void; label: string }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const StatCard = ({ icon: Icon, label, value, accent, sub }: any) => (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-bold font-display">{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Console</h1>
            <p className="text-muted-foreground text-sm">Full platform control · {profiles.length} total users</p>
          </div>
        </div>

        {/* Top KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <StatCard icon={DollarSign} label="Active Revenue (MRR)" value={`KES ${totalRevenue.toLocaleString()}`} accent="bg-primary/10 text-primary" sub={`${activeSubs} active subscriptions`} />
          <StatCard icon={CreditCard} label="Total Transactions" value={totalTransactions} accent="bg-secondary/10 text-secondary" sub="all-time" />
          <StatCard icon={Users} label="Total Users" value={profiles.length} accent="bg-primary/10 text-primary" sub={`${adminCount} admins`} />
          <StatCard icon={Star} label="Pending Reviews" value={pendingReviews} accent="bg-secondary/10 text-secondary" sub={`${reviews.length} total`} />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={UserCheck} label="Job Seekers" value={seekerCount} accent="bg-primary/10 text-primary" />
          <StatCard icon={Briefcase} label="Employers" value={employerCount} accent="bg-secondary/10 text-secondary" />
          <StatCard icon={BarChart3} label="Jobs Posted" value={jobs.length} accent="bg-primary/10 text-primary" sub={`${jobs.filter((j: any) => j.is_active).length} active`} />
          <StatCard icon={FileText} label="Applications" value={applications.length} accent="bg-secondary/10 text-secondary" />
        </div>

        {/* Recent activity feed */}
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-[10px] capitalize">{a.type}</Badge>
                    <span className="truncate">{a.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {new Date(a.at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full h-auto">
            <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1" />Jobs</TabsTrigger>
            <TabsTrigger value="applications"><FileText className="h-4 w-4 mr-1" />Apps</TabsTrigger>
            <TabsTrigger value="users"><UserCog className="h-4 w-4 mr-1" />Users</TabsTrigger>
            <TabsTrigger value="reviews"><Star className="h-4 w-4 mr-1" />Reviews</TabsTrigger>
            <TabsTrigger value="transactions"><CreditCard className="h-4 w-4 mr-1" />Tx</TabsTrigger>
            <TabsTrigger value="subscribers"><Mail className="h-4 w-4 mr-1" />Subs</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="h-4 w-4 mr-1" />Msgs</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-3">
            {jobsLoading ? <Loader2 className="animate-spin" /> : jobs.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No jobs posted yet.</Card>
            ) : jobs.map((j: any) => (
              <Card key={j.id} className="p-4 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{j.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{j.company} · {j.location}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge variant={j.is_active ? "default" : "secondary"} className="text-xs">{j.is_active ? "Active" : "Inactive"}</Badge>
                    {j.is_verified && <Badge variant="outline" className="text-xs">Verified</Badge>}
                    <span className="text-[10px] text-muted-foreground self-center">
                      {new Date(j.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setEditingJob(j)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete label="job" onConfirm={() => deleteMutation.mutate({ table: "jobs", id: j.id })} />
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="applications" className="space-y-3">
            {applications.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No applications yet.</Card>
            ) : applications.map((a: any) => (
              <Card key={a.id} className="p-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{a.jobs?.title || "Job"} — {a.jobs?.company}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={a.status} onValueChange={(v) => updateAppStatus.mutate({ id: a.id, status: v })}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                    </SelectContent>
                  </Select>
                  <ConfirmDelete label="application" onConfirm={() => deleteMutation.mutate({ table: "applications", id: a.id })} />
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="users" className="space-y-3">
            <Input
              placeholder="Search users by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            {filteredProfiles.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No users found.</Card>
            ) : filteredProfiles.map((p: any) => {
              const currentRole = roleMap[p.user_id] || "job_seeker";
              return (
                <Card key={p.id} className="p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{p.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.phone || "—"} · {p.address || "no address"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Joined {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={currentRole}
                      onValueChange={(v: any) => changeUserRole.mutate({ user_id: p.user_id, role: v })}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job_seeker">Job Seeker</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <ConfirmDelete label="user profile" onConfirm={() => deleteMutation.mutate({ table: "profiles", id: p.id })} />
                  </div>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-3">
            {reviews.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No reviews submitted yet.</Card>
            ) : reviews.map((r: any) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{r.name}</p>
                      <Badge variant={r.is_approved ? "default" : "secondary"} className="text-xs">
                        {r.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Array.from({ length: r.rating }).map(() => "★").join("")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[r.role, r.location].filter(Boolean).join(" · ") || "—"}
                    </p>
                    {r.highlight && <p className="text-xs font-bold text-primary uppercase mt-1">{r.highlight}</p>}
                    <p className="text-sm mt-2 whitespace-pre-line">{r.text}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {r.is_approved ? (
                      <Button variant="outline" size="sm" onClick={() => approveReview.mutate({ id: r.id, approved: false })}>
                        <X className="h-4 w-4 mr-1" />Unapprove
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => approveReview.mutate({ id: r.id, approved: true })}>
                        <Check className="h-4 w-4 mr-1" />Approve
                      </Button>
                    )}
                    <ConfirmDelete label="review" onConfirm={() => deleteMutation.mutate({ table: "reviews", id: r.id })} />
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-3">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Monthly recurring revenue</p>
                  <p className="text-xs text-muted-foreground">
                    KES {totalRevenue.toLocaleString()} from {activeSubs} active subscriptions
                  </p>
                </div>
              </div>
            </Card>
            {paystackSubs.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No transactions yet.</Card>
            ) : paystackSubs.map((s: any) => (
              <Card key={s.id} className="p-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{s.email}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.customer_code || "—"} · {s.subscription_code || "no sub"}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap items-center">
                    <Badge className="text-xs capitalize">{s.tier}</Badge>
                    <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
                    <span className="text-xs font-semibold text-primary">
                      KES {(TIER_PRICE[s.tier] || 0).toLocaleString()}/mo
                    </span>
                    {s.current_period_end && (
                      <span className="text-xs text-muted-foreground">
                        until {new Date(s.current_period_end).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-3">
            {subscribers.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No newsletter subscribers yet.</Card>
            ) : subscribers.map((s: any) => (
              <Card key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <p>{s.email}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <ConfirmDelete label="subscriber" onConfirm={() => deleteMutation.mutate({ table: "newsletter_subscribers", id: s.id })} />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="messages" className="space-y-3">
            {messages.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">No messages yet.</Card>
            ) : messages.map((m: any) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{m.name} <span className="text-muted-foreground font-normal text-sm">({m.email})</span></p>
                    {m.subject && <p className="text-sm font-medium mt-1">{m.subject}</p>}
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{m.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <ConfirmDelete label="message" onConfirm={() => deleteMutation.mutate({ table: "contact_messages", id: m.id })} />
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Job Dialog */}
      <Dialog open={!!editingJob} onOpenChange={(o) => !o && setEditingJob(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editingJob.title || ""} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} /></div>
              <div><Label>Company</Label><Input value={editingJob.company || ""} onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={editingJob.location || ""} onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label><Input value={editingJob.type || ""} onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })} /></div>
                <div><Label>Category</Label><Input value={editingJob.category || ""} onChange={(e) => setEditingJob({ ...editingJob, category: e.target.value })} /></div>
              </div>
              <div><Label>Salary range</Label><Input value={editingJob.salary_range || ""} onChange={(e) => setEditingJob({ ...editingJob, salary_range: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={5} value={editingJob.description || ""} onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })} /></div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={!!editingJob.is_active} onCheckedChange={(v) => setEditingJob({ ...editingJob, is_active: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Verified</Label>
                <Switch checked={!!editingJob.is_verified} onCheckedChange={(v) => setEditingJob({ ...editingJob, is_verified: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
            <Button onClick={() => editingJob && updateJob.mutate(editingJob)} disabled={updateJob.isPending}>
              {updateJob.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
