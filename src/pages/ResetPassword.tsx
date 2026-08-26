import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import usePageTitle from "@/hooks/usePageTitle";
import mployLogo from "@/assets/mploy-logo.png";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  usePageTitle("Reset Password");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Supabase auto-detects the recovery token in URL hash and creates a session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setValidSession(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully!");
      await supabase.auth.signOut();
      navigate("/auth");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-md">
        <Link to="/" className="flex items-center gap-2.5 mb-8 justify-center">
          <img src={mployLogo} alt="M-Ploy" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-xl font-bold text-foreground">M-Ploy</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Reset your password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {validSession ? "Enter your new password below." : "Verifying your reset link..."}
        </p>
        {validSession && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" className="rounded-xl h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" className="rounded-xl h-11" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-11 font-semibold">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
