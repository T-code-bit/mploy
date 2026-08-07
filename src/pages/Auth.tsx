import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { useSignIn, useSignUp, useClerk } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, GraduationCap, ArrowRight, Shield, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import { motion } from "framer-motion";
import mployLogo from "@/assets/mploy-logo.png";
import usePageTitle from "@/hooks/usePageTitle";

const EMPLOYER_CODE = "6490";


const Auth = () => {
  usePageTitle("Sign In");
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const clerk = useClerk();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmployerCode, setLoginEmployerCode] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<"job_seeker" | "employer">("job_seeker");
  const [signupEmployerCode, setSignupEmployerCode] = useState("");
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

  const setSessionFromResponse = async (data: any) => {
    if (!data?.access_token || !data?.refresh_token) {
      throw new Error(data?.error || "Sign in did not return a valid session.");
    }
    const { error } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    if (error) throw error;
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate(routeForRole(userRole || roleFromMetadata(user)), { replace: true });
    }
  }, [authLoading, navigate, user, userRole]);

  // Exchange a verified Clerk session for a platform session
  const bridgeClerkSession = async (opts?: { fullName?: string; role?: string }) => {
    const token = await clerk.session?.getToken();
    if (!token) throw new Error("Could not read your Clerk session. Please try again.");
    const { data, error } = await supabase.functions.invoke("clerk-session", {
      body: { token, fullName: opts?.fullName, role: opts?.role },
    });
    if (error || data?.error) throw new Error(data?.error || error?.message || "Could not link your account");
    await setSessionFromResponse(data);
    return data;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (loginRole === "admin") {
      try {
        const { data, error } = await supabase.functions.invoke("admin-access-login", {
          body: { code: adminLoginCode },
        });
        if (error || !data?.access_token) {
          toast.error(data?.error || "Invalid admin access code");
          setLoading(false);
          return;
        }
        await setSessionFromResponse(data);
        toast.success("Welcome, Administrator");
        navigate("/admin");
      } catch (err: any) {
        toast.error(err.message || "Admin login failed");
      }
      setLoading(false);
      return;
    }

    if (loginRole === "employer" && loginEmployerCode.trim() !== EMPLOYER_CODE) {
      toast.error("Invalid employer access code");
      setLoading(false);
      return;
    }

    try {
      if (!signInLoaded || !signIn) throw new Error("Sign in is still loading, please wait a moment.");
      clearLocalSupabaseSession();
      await clerk.signOut().catch(() => undefined);

      const attempt = await signIn.create({
        identifier: cleanEmail(loginEmail),
        password: loginPassword,
      });
      if (attempt.status !== "complete") {
        throw new Error("Additional verification is required. Please check your email.");
      }
      await setSignInActive({ session: attempt.createdSessionId });

      const data = await bridgeClerkSession({ role: loginRole });
      toast.success(`Welcome, ${displayNameFor(data.user)}!`);
      navigate(routeForRole(data.role || loginRole));
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.errors?.[0]?.longMessage || err?.message));
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (signupRole === "employer" && signupEmployerCode.trim() !== EMPLOYER_CODE) {
      toast.error("Invalid employer access code. Please contact M-Ploy support to obtain one.");
      return;
    }
    setLoading(true);

    try {
      if (!signUpLoaded || !signUp) throw new Error("Sign up is still loading, please wait a moment.");
      clearLocalSupabaseSession();
      await clerk.signOut().catch(() => undefined);

      const fullName = signupName.trim();
      const [firstName, ...rest] = fullName.split(" ");

      const attempt = await signUp.create({
        emailAddress: cleanEmail(signupEmail),
        password: signupPassword,
        firstName: firstName || undefined,
        lastName: rest.join(" ") || undefined,
      });

      if (attempt.status === "complete") {
        await setSignUpActive({ session: attempt.createdSessionId });
        const data = await bridgeClerkSession({ fullName, role: signupRole });
        toast.success(`Welcome, ${displayNameFor(data.user, fullName)}! Your account is ready.`);
        navigate(routeForRole(data.role || signupRole));
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
        toast.success("We sent a verification code to your email.");
      }
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.errors?.[0]?.longMessage || err?.message));
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!signUpLoaded || !signUp) throw new Error("Sign up is still loading.");
      const attempt = await signUp.attemptEmailAddressVerification({ code: verificationCode.trim() });
      if (attempt.status !== "complete") throw new Error("That code was not accepted. Please try again.");
      await setSignUpActive({ session: attempt.createdSessionId });
      const fullName = signupName.trim();
      const data = await bridgeClerkSession({ fullName, role: signupRole });
      setPendingVerification(false);
      toast.success(`Welcome, ${displayNameFor(data.user, fullName)}! Your account is ready.`);
      navigate(routeForRole(data.role || signupRole));
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.errors?.[0]?.longMessage || err?.message));
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
                        : loginRole === "employer"
                        ? "Employers need the M-Ploy access code plus their email and password."
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
                      {loginRole === "employer" && (
                        <div className="space-y-2">
                          <Label htmlFor="login-employer-code" className="flex items-center gap-1.5">
                            <KeyRound className="h-3.5 w-3.5" /> Employer Access Code
                          </Label>
                          <Input
                            id="login-employer-code"
                            type="password"
                            placeholder="M-Ploy employer code"
                            className="rounded-xl h-11"
                            value={loginEmployerCode}
                            onChange={(e) => setLoginEmployerCode(e.target.value)}
                            required
                          />
                        </div>
                      )}
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
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="w-full text-center text-sm text-primary hover:underline pt-1"
                    >
                      Forgot your password?
                    </button>
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

                  {signupRole === "employer" && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-employer-code" className="flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5" /> Employer Access Code
                      </Label>
                      <Input
                        id="signup-employer-code"
                        type="password"
                        placeholder="Enter M-Ploy employer code"
                        className="rounded-xl h-11"
                        value={signupEmployerCode}
                        onChange={(e) => setSignupEmployerCode(e.target.value)}
                        required
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Employer signups require a verified access code from M-Ploy to prevent fraudulent postings.
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-11 font-semibold" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
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
