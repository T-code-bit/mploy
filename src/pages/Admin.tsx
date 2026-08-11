import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  MessageSquare, UserCog, LayoutDashboard, LogOut, Home, Menu, Send, Megaphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import usePageTitle from "@/hooks/usePageTitle";
import { useAuth } from "@/contexts/AuthContext";
import mployLogo from "@/assets/mploy-logo.png";

const TIER_PRICE: Record<string, number> = { basic: 10, premium: 15, free: 0 };

type View =
  | "overview" | "jobs" | "applications" | "users"
  | "reviews" | "transactions" | "subscribers" | "messages" | "broadcast";

const NAV: { key: View; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "applications", label: "Applications", icon: FileText },
  { key: "users", label: "Users & Roles", icon: UserCog },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "transactions", label: "Transactions", icon: CreditCard },
  { key: "subscribers", label: "Newsletter", icon: Mail },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "broadcast", label: "Broadcast", icon: Megaphone },
];

const Admin = () => {
  usePageTitle("Admin Console");
  const qc = useQueryClient();
  const { profile, signOut } = useAuth();
  const [view, setView] = useState<View>("overview");
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [broadcast, setBroadcast] = useState({ subject: "", body: "", audience: "all_users" as "all_users" | "active_subscribers" | "newsletter" });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Realtime — auto-refresh every admin table on any change
  useEffect(() => {
    const tables = ["jobs", "applications", "profiles", "user_roles", "paystack_subscribers", "reviews", "newsletter_subscribers", "contact_messages"];
    const keyMap: Record<string, string> = {
      jobs: "admin-jobs", applications: "admin-applications", profiles: "admin-profiles",
      user_roles: "admin-roles", paystack_subscribers: "admin-paystack-subs",
      reviews: "admin-reviews", newsletter_subscribers: "admin-subscribers",
      contact_messages: "admin-messages",
    };
    const ch = supabase.channel("admin-live");
    tables.forEach((t) => {
      ch.on("postgres_changes", { event: "*", schema: "public", table: t }, () => {
        qc.invalidateQueries({ queryKey: [keyMap[t]] });
      });
    });
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => (await supabase.from("jobs").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: applications = [] } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => (await supabase.from("applications").select("*, jobs(title, company)").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => (await supabase.from("user_roles").select("*")).data ?? [],
  });
  const { data: subscribers = [] } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => (await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: messages = [] } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => (await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => (await supabase.from("reviews").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: paystackSubs = [] } = useQuery({
    queryKey: ["admin-paystack-subs"],
    queryFn: async () => (await supabase.from("paystack_subscribers").select("*").order("created_at", { ascending: false })).data ?? [],
  });

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
    return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 10);
  }, [applications, jobs, paystackSubs, reviews]);

  const filteredProfiles = profiles.filter((p: any) =>
    !search || (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || "").includes(search)
  );

  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }: { table: any; id: string }) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success("Deleted");
      const keyMap: Record<string, string> = {
        jobs: "admin-jobs", applications: "admin-applications",
        newsletter_subscribers: "admin-subscribers", contact_messages: "admin-messages",
        reviews: "admin-reviews", profiles: "admin-profiles",
        paystack_subscribers: "admin-paystack-subs",
      };
      qc.invalidateQueries({ queryKey: [keyMap[vars.table]] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: async (user_id: string) => {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { user_id } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
    },
    onSuccess: () => {
      toast.success("User account deleted");
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
      qc.invalidateQueries({ queryKey: ["admin-paystack-subs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendBroadcast = async () => {
    if (!broadcast.subject.trim() || !broadcast.body.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    setSendingBroadcast(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-broadcast", { body: broadcast });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`Broadcast queued to ${(data as any)?.total_recipients || 0} recipients`);
      setBroadcast({ subject: "", body: "", audience: broadcast.audience });
    } catch (e: any) {
      toast.error(e.message || "Broadcast failed");
    } finally {
      setSendingBroadcast(false);
    }
  };

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
  });

  const updateJob = useMutation({
    mutationFn: async (job: any) => {
      const { error } = await supabase.from("jobs").update({
        title: job.title, company: job.company, location: job.location,
        type: job.type, category: job.category, salary_range: job.salary_range,
        description: job.description, is_active: job.is_active, is_verified: job.is_verified,
      }).eq("id", job.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job updated");
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      setEditingJob(null);
    },
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
  });

  const changeUserRole = useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: "job_seeker" | "employer" | "admin" }) => {
      await supabase.from("user_roles").delete().eq("user_id", user_id);
      const { error } = await supabase.from("user_roles").insert({ user_id, role });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-roles"] });
    },
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

  const KPI = ({ icon: Icon, label, value, sub, tone }: any) => (
    <Card className="p-5 relative overflow-hidden">
      <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-10 ${tone}`} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="font-display text-3xl font-bold mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${tone}`}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );

  // ---------- VIEWS ----------
  const Overview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={DollarSign} label="MRR (Active)" value={`KES ${totalRevenue.toLocaleString()}`} sub={`${activeSubs} active subs`} tone="bg-primary" />
        <KPI icon={CreditCard} label="Total Transactions" value={totalTransactions} sub="all-time" tone="bg-secondary" />
        <KPI icon={Users} label="Total Users" value={profiles.length} sub={`${adminCount} admins · ${employerCount} employers`} tone="bg-primary" />
        <KPI icon={Star} label="Pending Reviews" value={pendingReviews} sub={`${reviews.length} total`} tone="bg-secondary" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={UserCheck} label="Job Seekers" value={seekerCount} tone="bg-primary" />
        <KPI icon={Briefcase} label="Employers" value={employerCount} tone="bg-secondary" />
        <KPI icon={BarChart3} label="Jobs Posted" value={jobs.length} sub={`${jobs.filter((j: any) => j.is_active).length} active`} tone="bg-primary" />
        <KPI icon={FileText} label="Applications" value={applications.length} tone="bg-secondary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold">Live Activity Feed</h2>
            </div>
            <Badge variant="outline" className="text-[10px]">real-time</Badge>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-sm border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {a.type === "application" && <FileText className="h-4 w-4 text-primary" />}
                      {a.type === "job" && <Briefcase className="h-4 w-4 text-secondary" />}
                      {a.type === "tx" && <CreditCard className="h-4 w-4 text-primary" />}
                      {a.type === "review" && <Star className="h-4 w-4 text-secondary" />}
                    </div>
                    <span className="truncate">{a.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(a.at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setView("jobs")}>
              <Briefcase className="h-4 w-4" /> Manage jobs
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setView("users")}>
              <UserCog className="h-4 w-4" /> Manage users
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setView("reviews")}>
              <Star className="h-4 w-4" /> Moderate reviews ({pendingReviews})
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setView("transactions")}>
              <CreditCard className="h-4 w-4" /> View transactions
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const Jobs = () => (
    <div className="space-y-3">
      {jobsLoading ? <Loader2 className="animate-spin" /> : jobs.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No jobs posted yet.</Card>
      ) : jobs.map((j: any) => (
        <Card key={j.id} className="p-4 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{j.title}</p>
            <p className="text-sm text-muted-foreground truncate">{j.company} · {j.location}</p>
            <div className="flex gap-1 mt-1 flex-wrap items-center">
              <Badge variant={j.is_active ? "default" : "secondary"} className="text-xs">{j.is_active ? "Active" : "Inactive"}</Badge>
              {j.is_verified && <Badge variant="outline" className="text-xs">Verified</Badge>}
              <span className="text-[10px] text-muted-foreground">{new Date(j.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setEditingJob(j)}><Pencil className="h-4 w-4" /></Button>
            <ConfirmDelete label="job" onConfirm={() => deleteMutation.mutate({ table: "jobs", id: j.id })} />
          </div>
        </Card>
      ))}
    </div>
  );

  const Applications = () => (
    <div className="space-y-3">
      {applications.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No applications yet.</Card>
      ) : applications.map((a: any) => (
        <Card key={a.id} className="p-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold truncate">{a.jobs?.title || "Job"} — {a.jobs?.company}</p>
            <p className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select value={a.status} onValueChange={(v) => updateAppStatus.mutate({ id: a.id, status: v })}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
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
    </div>
  );

  const Users = () => (
    <div className="space-y-3">
      <Input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      {filteredProfiles.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No users found.</Card>
      ) : filteredProfiles.map((p: any) => {
        const currentRole = roleMap[p.user_id] || "job_seeker";
        return (
          <Card key={p.id} className="p-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold truncate">{p.full_name || "Unnamed"}</p>
              <p className="text-xs text-muted-foreground truncate">{p.phone || "—"} · {p.address || "no address"}</p>
              <p className="text-[10px] text-muted-foreground">Joined {new Date(p.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select value={currentRole} onValueChange={(v: any) => changeUserRole.mutate({ user_id: p.user_id, role: v })}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="job_seeker">Job Seeker</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <ConfirmDelete label="user account (auth, profile, roles)" onConfirm={() => deleteUser.mutate(p.user_id)} />
            </div>
          </Card>
        );
      })}
    </div>
  );

  const Reviews = () => (
    <div className="space-y-3">
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
                <span className="text-xs text-muted-foreground">{Array.from({ length: r.rating }).map(() => "★").join("")}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{[r.role, r.location].filter(Boolean).join(" · ") || "—"}</p>
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
    </div>
  );

  const Transactions = () => (
    <div className="space-y-3">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Monthly recurring revenue</p>
            <p className="text-xs text-muted-foreground">KES {totalRevenue.toLocaleString()} from {activeSubs} active subscriptions</p>
          </div>
        </div>
      </Card>
      {paystackSubs.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">No transactions yet.</Card>
      ) : paystackSubs.map((s: any) => (
        <Card key={s.id} className="p-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold truncate">{s.email}</p>
            <p className="text-xs text-muted-foreground truncate">{s.customer_code || "—"} · {s.subscription_code || "no sub"}</p>
            <div className="flex gap-1 mt-1 flex-wrap items-center">
              <Badge className="text-xs capitalize">{s.tier}</Badge>
              <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
              <span className="text-xs font-semibold text-primary">KES {(TIER_PRICE[s.tier] || 0).toLocaleString()}/mo</span>
              {s.current_period_end && (
                <span className="text-xs text-muted-foreground">until {new Date(s.current_period_end).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <ConfirmDelete label="subscription record" onConfirm={() => deleteMutation.mutate({ table: "paystack_subscribers", id: s.id })} />
        </Card>
      ))}
    </div>
  );

  const Broadcast = () => (
    <div className="space-y-4 max-w-2xl">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Send a Broadcast</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Send an email to your users or subscribers. Delivered via the M-Ploy email queue.
        </p>
        <div className="space-y-2">
          <Label>Audience</Label>
          <Select value={broadcast.audience} onValueChange={(v: any) => setBroadcast({ ...broadcast, audience: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all_users">All platform users ({profiles.length})</SelectItem>
              <SelectItem value="active_subscribers">Active paid subscribers ({activeSubs})</SelectItem>
              <SelectItem value="newsletter">Newsletter subscribers ({subscribers.length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input value={broadcast.subject} onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })} placeholder="Subject line" />
        </div>
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea rows={8} value={broadcast.body} onChange={(e) => setBroadcast({ ...broadcast, body: e.target.value })} placeholder="Write your message here..." />
        </div>
        <Button onClick={sendBroadcast} disabled={sendingBroadcast} className="gap-2">
          {sendingBroadcast ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send Broadcast
        </Button>
      </Card>
    </div>
  );

  const Subscribers = () => (
    <div className="space-y-3">
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
    </div>
  );

  const Messages = () => (
    <div className="space-y-3">
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
    </div>
  );

  const renderView = () => {
    switch (view) {
      case "overview": return Overview();
      case "jobs": return Jobs();
      case "applications": return Applications();
      case "users": return Users();
      case "reviews": return Reviews();
      case "transactions": return Transactions();
      case "subscribers": return Subscribers();
      case "messages": return Messages();
      case "broadcast": return Broadcast();
    }
  };

  const currentNav = NAV.find((n) => n.key === view)!;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-border flex items-center gap-2">
          <img src={mployLogo} alt="M-Ploy" className="h-9 w-auto object-contain mix-blend-multiply" />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Admin</p>
            <p className="text-sm font-display font-bold leading-none">Console</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = view === n.key;
            return (
              <button
                key={n.key}
                onClick={() => { setView(n.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
                {n.key === "reviews" && pendingReviews > 0 && (
                  <Badge variant="secondary" className="ml-auto text-[10px]">{pendingReviews}</Badge>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <Link to="/" className="block">
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
              <Home className="h-4 w-4" /> View Site
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur border-b border-border px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="p-2 rounded-lg bg-primary/10 hidden sm:flex">
              <currentNav.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Admin Console</p>
              <h1 className="font-display text-xl font-bold truncate">{currentNav.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="truncate max-w-[160px]">{profile?.full_name || "Admin"}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          {renderView()}
        </main>
      </div>

      {/* Edit Job Dialog */}
      <Dialog open={!!editingJob} onOpenChange={(o) => !o && setEditingJob(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Job</DialogTitle></DialogHeader>
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
              <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={!!editingJob.is_active} onCheckedChange={(v) => setEditingJob({ ...editingJob, is_active: v })} /></div>
              <div className="flex items-center justify-between"><Label>Verified</Label><Switch checked={!!editingJob.is_verified} onCheckedChange={(v) => setEditingJob({ ...editingJob, is_verified: v })} /></div>
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
    </div>
  );
};

export default Admin;
