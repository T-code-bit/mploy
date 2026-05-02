import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Shield, Briefcase, Users, FileText, Mail, Loader2, Star, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import usePageTitle from "@/hooks/usePageTitle";

const Admin = () => {
  usePageTitle("Admin Console");
  const qc = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }: { table: "jobs" | "applications" | "newsletter_subscribers" | "contact_messages" | "reviews"; id: string }) => {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Console</h1>
            <p className="text-muted-foreground text-sm">Full management access across the platform</p>
          </div>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1" />Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="applications"><FileText className="h-4 w-4 mr-1" />Applications ({applications.length})</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />Users ({profiles.length})</TabsTrigger>
            <TabsTrigger value="subscribers"><Mail className="h-4 w-4 mr-1" />Subscribers ({subscribers.length})</TabsTrigger>
            <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-3">
            {jobsLoading ? <Loader2 className="animate-spin" /> : jobs.map((j: any) => (
              <Card key={j.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{j.title}</p>
                  <p className="text-sm text-muted-foreground">{j.company} · {j.location}</p>
                  <Badge variant={j.is_active ? "default" : "secondary"} className="mt-1 text-xs">{j.is_active ? "Active" : "Inactive"}</Badge>
                </div>
                <ConfirmDelete label="job" onConfirm={() => deleteMutation.mutate({ table: "jobs", id: j.id })} />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="applications" className="space-y-3">
            {applications.map((a: any) => (
              <Card key={a.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{a.jobs?.title || "Job"} — {a.jobs?.company}</p>
                  <p className="text-sm text-muted-foreground">Status: {a.status}</p>
                </div>
                <ConfirmDelete label="application" onConfirm={() => deleteMutation.mutate({ table: "applications", id: a.id })} />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="users" className="space-y-3">
            {profiles.map((p: any) => (
              <Card key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{p.full_name || "Unnamed"}</p>
                  <p className="text-sm text-muted-foreground">{p.phone || p.address || "—"}</p>
                  <Badge className="mt-1 text-xs capitalize">{p.role}</Badge>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-3">
            {subscribers.map((s: any) => (
              <Card key={s.id} className="p-4 flex items-center justify-between">
                <p>{s.email}</p>
                <ConfirmDelete label="subscriber" onConfirm={() => deleteMutation.mutate({ table: "newsletter_subscribers", id: s.id })} />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="messages" className="space-y-3">
            {messages.map((m: any) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{m.name} <span className="text-muted-foreground font-normal text-sm">({m.email})</span></p>
                    {m.subject && <p className="text-sm font-medium mt-1">{m.subject}</p>}
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{m.message}</p>
                  </div>
                  <ConfirmDelete label="message" onConfirm={() => deleteMutation.mutate({ table: "contact_messages", id: m.id })} />
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
