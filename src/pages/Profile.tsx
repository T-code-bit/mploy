import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, FileText, Save, Loader2, AlertTriangle } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  usePageTitle("Profile Settings");
  const { user, profile, userRole, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    about: "",
    phone: "",
    address: "",
    avatar_url: "",
  });

  const completionFields = ["full_name", "phone", "address", "bio"] as const;
  const completionPercent = useMemo(() => {
    const filled = completionFields.filter((f) => form[f]?.trim()).length;
    return Math.round((filled / completionFields.length) * 100);
  }, [form]);
  const isComplete = completionPercent === 100;

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        about: profile.about || "",
        phone: profile.phone || "",
        address: profile.address || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          bio: form.bio,
          about: form.about,
          phone: form.phone,
          address: form.address,
          avatar_url: form.avatar_url,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated successfully!");
      if (isComplete) {
        navigate(userRole === "employer" ? "/employer" : "/dashboard");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      // Bucket is private — use a long-lived signed URL so the avatar renders everywhere
      const { data: signed, error: signErr } = await supabase.storage
        .from("application-documents")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5); // 5 years
      if (signErr) throw signErr;
      const url = signed?.signedUrl;
      if (!url) throw new Error("Failed to generate image URL");

      // Persist immediately so the avatar sticks even if the user forgets to press Save
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id);
      if (updErr) throw updErr;

      setForm((prev) => ({ ...prev, avatar_url: url }));
      await refreshProfile();
      toast.success("Profile photo updated!");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight mb-2">Profile Settings</h1>
            <p className="text-muted-foreground mb-4">Update your professional details.</p>

            {!isComplete && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-destructive">Complete your profile to continue</p>
                  <p className="text-xs text-muted-foreground mt-1">Please fill in all required fields (Name, Phone, Address, Bio) before accessing the platform.</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={completionPercent} className="h-2 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground">{completionPercent}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage src={form.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {(form.full_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" className="rounded-xl" asChild disabled={uploading}>
                      <span>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {uploading ? "Uploading..." : "Change Photo"}
                      </span>
                    </Button>
                  </Label>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 5MB.</p>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Full Name</Label>
                <Input className="rounded-xl h-11" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email</Label>
                <Input className="rounded-xl h-11 bg-muted" value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Phone Number</Label>
                <Input className="rounded-xl h-11" placeholder="+254 7XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Address</Label>
                <Input className="rounded-xl h-11" placeholder="City, Country" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Bio</Label>
                <Textarea className="rounded-xl" rows={2} placeholder="A short bio..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>

              {/* About */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> About</Label>
                <Textarea className="rounded-xl" rows={4} placeholder="Tell us more about your experience, skills, and career goals..." value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-11 font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
