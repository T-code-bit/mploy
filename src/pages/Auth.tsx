import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, GraduationCap, ArrowRight, Shield, Chrome } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import { motion } from "framer-motion";
import mployLogo from "@/assets/mploy-logo.png";
import usePageTitle from "@/hooks/usePageTitle";

const Auth = () => {
  usePageTitle("Sign In");
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<"job_seeker" | "employer">("job_seeker");
  const [adminLoginCode, setAdminLoginCode] = useState("");
  const [loginRole, setLoginRole] = useState<"job_seeker" | "employer" | "admin">("job_seeker");

  const routeForRole = (role?: string | null) => {
    if (role === "admin") return "/admin";
    if (role === "employer") return "/employer";
    return "/dashboard";
  };

  const cleanEmail = (email: string) => email.trim().toLowerCase();

  const roleFromMetadata = (authUser?: User | null): "job_seeker" | "employer" | "admin" => {
    const role = authUser?.user_metadata?.role;
    return role === "employer" || role === "admin" ? role : "job_seeker";
  };

  const displayNameFor = (authUser?: User | null, fallback?: string) =>
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    fallback ||
    authUser?.email?.split("@")[0] ||
    "there";

  const friendlyAuthError = (message?: string) => {
    const msg = message || "Authentication failed";
    const lower = msg.toLowerCase();
    if (lower.includes("invalid login credentials")) return "Invalid email or password. Please check your details and try again.";
    if (lower.includes("email not confirmed")) return "Please confirm your email first, then sign in.";
    if (lower.includes("user already registered") || lower.includes("already registered")) return "This email already has an account. Please sign in instead.";
    if (lower.includes("password")) return msg;
    if (lower.includes("failed to fetch") || lower.includes("network")) return "Could not reach the login server. Check your internet connection and try again.";
    return msg;
  };

  const clearLocalSupabaseSession = () => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-") && key.endsWith("-auth-token"))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      // Ignore storage errors; auth can still continue.
    }
  };

  const ensureProfile = async (authUser: User, preferredName?: string) => {
    const fullName = displayNameFor(authUser, preferredName);
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: authUser.id,
          full_name: fullName,
          avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.warn("Profile sync skipped:", error.message);
    }
  };

  const getPostAuthRoute = async (authUser: User, preferredRole?: "job_seeker" | "employer" | "admin") => {
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .maybeSingle();

    return routeForRole(roleRow?.role || preferredRole || roleFromMetadata(authUser));
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate(routeForRole(userRole || roleFromMetadata(user)), { replace: true });
    }
  }, [authLoading, navigate, user, userRole]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      clearLocalSupabaseSession();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      toast.error(friendlyAuthError(err.message) || "Google sign-in failed");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (loginRole === "admin") {
      // Admin path bypasses captcha for speed — code itself is the secret
      try {
        const { data, error } = await supabase.functions.invoke("admin-access-login", {
          body: { code: adminLoginCode },
        });
        if (error || !data?.access_token) {
          toast.error("Invalid admin access code");
          setLoading(false);
          return;
        }
        const { error: setErr } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        if (setErr) {
          toast.error(setErr.message);
          setLoading(false);
          return;
        }
        toast.success("Welcome, Administrator");
        navigate("/admin");
      } catch (err: any) {
        toast.error(err.message || "Admin login failed");
      }
      setLoading(false);
      return;
    }

    try {
      clearLocalSupabaseSession();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail(loginEmail),
        password: loginPassword,
      });
      if (error) throw error;
      if (!data.user || !data.session) throw new Error("Sign in did not return a valid session.");

      await ensureProfile(data.user);
      const displayName = displayNameFor(data.user);
      toast.success(`Welcome, ${displayName}!`);
      navigate(await getPostAuthRoute(data.user));
    } catch (err: any) {
      toast.error(friendlyAuthError(err.message));
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    
    try {
      clearLocalSupabaseSession();
      const email = cleanEmail(signupEmail);
      const fullName = signupName.trim();

      const { data, error } = await supabase.auth.signUp({
        email,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: fullName,
            name: fullName,
            role: signupRole,
          },
        },
      });
      if (error) throw error;

      if (data.user?.identities && data.user.identities.length === 0) {
        throw new Error("This email already has an account. Please sign in instead.");
      }

      let signedInUser = data.user;
      if (!data.session) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password: signupPassword,
        });
        if (!loginError && loginData.user) {
          signedInUser = loginData.user;
        }
      }

      if (!signedInUser) {
        toast.success("Account created. Please check your email to finish signing in.");
        return;
      }

      await ensureProfile(signedInUser, fullName);
      toast.success(`Welcome, ${displayNameFor(signedInUser, fullName)}! Your account is ready.`);
      navigate(await getPostAuthRoute(signedInUser, signupRole));
    } catch (err: any) {
      toast.error(friendlyAuthError(err.message));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] rounded-full bg-secondary/6 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-md text-center relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-10">
            <img src={mployLogo} alt="M-Ploy" className="h-12 w-12 rounded-xl" />
            <span className="font-display text-3xl font-bold text-primary-foreground tracking-tight">M-Ploy</span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4 tracking-tight">
            Your Career Journey Starts Here
          </h2>
          <p className="text-primary-foreground/50 leading-relaxed">
            Access verified jobs, build ATS-optimized CVs, and earn industry-recognized badges — all in one platform.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-mesh">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <img src={mployLogo} alt="M-Ploy" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-xl font-bold text-foreground tracking-tight">M-Ploy</span>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-md">
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full rounded-xl h-11">
                <TabsTrigger value="login" className="rounded-lg">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sign in as</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { role: "job_seeker" as const, icon: GraduationCap, label: "Job Seeker" },
                        { role: "employer" as const, icon: Briefcase, label: "Employer" },
                        { role: "admin" as const, icon: Shield, label: "Admin" },
                      ].map((option) => (
                        <button
                          key={option.role}
                          type="button"
                          onClick={() => setLoginRole(option.role)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            loginRole === option.role
                              ? "border-primary bg-accent shadow-glow"
                              : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                          }`}
                        >
                          <option.icon className={`h-5 w-5 ${loginRole === option.role ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-xs font-medium ${loginRole === option.role ? "text-primary" : "text-muted-foreground"}`}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {loginRole === "admin"
                        ? "Enter the admin access code to sign in."
                        : "Sign in with your registered email and password."}
                    </p>
                  </div>
                  {loginRole === "admin" ? (
                    <div className="space-y-2">
                      <Label htmlFor="admin-login-code">Admin Access Code</Label>
                      <Input
                        id="admin-login-code"
                        type="password"
                        placeholder="Enter access code"
                        className="rounded-xl h-11"
                        value={adminLoginCode}
                        onChange={(e) => setAdminLoginCode(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" placeholder="you@example.com" className="rounded-xl h-11" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input id="login-password" type="password" placeholder="••••••••" className="rounded-xl h-11" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                      </div>
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-11 font-semibold"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  {loginRole !== "admin" && (
                    <>
                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-xl h-11 font-semibold"
                        disabled={loading}
                        onClick={handleGoogleLogin}
                      >
                        <Chrome className="mr-2 h-4 w-4" />
                        Continue with Google
                      </Button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!loginEmail) {
                            toast.error("Enter your email address first");
                            return;
                          }
                          setLoading(true);
                          const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
                            redirectTo: `${window.location.origin}/reset-password`,
                          });
                          if (error) toast.error(error.message);
                          else toast.success("Password reset link sent! Check your email.");
                          setLoading(false);
                        }}
                        className="w-full text-center text-sm text-primary hover:underline pt-1"
                      >
                        Forgot your password?
                      </button>
                    </>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" placeholder="John Doe" className="rounded-xl h-11" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" className="rounded-xl h-11" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" className="rounded-xl h-11" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label>I am a...</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { role: "job_seeker" as const, icon: GraduationCap, label: "Job Seeker" },
                        { role: "employer" as const, icon: Briefcase, label: "Employer" },
                      ].map((option) => (
                        <button
                          key={option.role}
                          type="button"
                          onClick={() => setSignupRole(option.role)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            signupRole === option.role
                              ? "border-primary bg-accent shadow-glow"
                              : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                          }`}
                        >
                          <option.icon className={`h-5 w-5 ${signupRole === option.role ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-xs font-medium ${signupRole === option.role ? "text-primary" : "text-muted-foreground"}`}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-11 font-semibold" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl h-11 font-semibold"
                    disabled={loading}
                    onClick={handleGoogleLogin}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
