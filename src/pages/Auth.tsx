import { useEffect, useRef, useState } from "react";
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
import { lovable } from "@/integrations/lovable/index";
import usePageTitle from "@/hooks/usePageTitle";

const ADMIN_ACCESS_CODE = "2013";
const EMPLOYER_CODE = "6490";

// One single auth path on every domain (preview, lovable.app, go-mploy.com,
// local): native platform auth. Clerk is kept imported for the legacy callback
// route but is no longer used for sign in / sign up anywhere.
const clerkEnabled = false;



const Auth = () => {
  usePageTitle("Sign In");
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const clerk = useClerk();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmployerCode, setLoginEmployerCode] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRole, setSignupRole] = useState<"job_seeker" | "employer">("job_seeker");
  const [signupEmployerCode, setSignupEmployerCode] = useState("");
  const [loginRole, setLoginRole] = useState<"job_seeker" | "employer" | "admin">("job_seeker");
  const clerkBridgeStarted = useRef(false);

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

  useEffect(() => {
    if (!clerkEnabled || user || !clerk.loaded || !clerk.session || clerkBridgeStarted.current) return;
    clerkBridgeStarted.current = true;
    bridgeClerkSession({ role: loginRole })
      .then((data) => {
        toast.success(`Welcome, ${displayNameFor(data.user)}!`);
        navigate(routeForRole(data.role || loginRole), { replace: true });
      })
      .catch((error) => {
        clerkBridgeStarted.current = false;
        toast.error(friendlyAuthError(error instanceof Error ? error.message : String(error)));
      });
  }, [clerk.loaded, clerk.session, loginRole, navigate, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (loginRole === "admin") {
      // Verify admin access code
      if (!adminCode.trim() || adminCode.trim() !== ADMIN_ACCESS_CODE) {
        toast.error("Invalid admin access code");
        setLoading(false);
        return;
      }

      try {
        clearLocalSupabaseSession();
        
        // Create or sign in as admin user
        const adminEmail = "admin@mploy.internal";
        const adminPassword = "M-Ploy-Admin-2024-Secure";
        
        // Try to sign in first
        let signInResult = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        }).catch(() => ({ data: null, error: { message: "User not found" } }));

        // If user doesn't exist, create the account
        if (signInResult.error) {
          const { data: newUser, error: createError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
              data: { full_name: "M-Ploy Administrator", role: "admin" },
            },
          });
          if (createError) throw createError;
          signInResult = { data: newUser, error: null };
        }

        if (signInResult.error || !signInResult.data.session) {
          throw new Error("Could not create admin session");
        }

        // Ensure admin role is set in database
        if (signInResult.data.user) {
          await supabase
            .from("user_roles")
            .upsert(
              { user_id: signInResult.data.user.id, role: "admin" },
              { onConflict: "user_id,role" }
            )
            .catch(() => null);
        }

        toast.success("Welcome, Administrator");
        navigate("/admin", { replace: true });
      } catch (err: any) {
        console.error("Admin auth error:", err);
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

    if (!clerkEnabled) {
      try {
        clearLocalSupabaseSession();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail(loginEmail),
          password: loginPassword,
        });
        if (error) throw error;
        const role = roleFromMetadata(data.user);
        toast.success(`Welcome, ${displayNameFor(data.user)}!`);
        navigate(routeForRole(role));
      } catch (err: any) {
        toast.error(friendlyAuthError(err?.message));
      }
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

    if (!clerkEnabled) {
      try {
        clearLocalSupabaseSession();
        const fullName = signupName.trim();
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail(signupEmail),
          password: signupPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, role: signupRole },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Account created. Check your email to confirm, then sign in.");
        } else {
          toast.success(`Welcome, ${displayNameFor(data.user, fullName)}! Your account is ready.`);
          navigate(routeForRole(signupRole));
        }
      } catch (err: any) {
        toast.error(friendlyAuthError(err?.message));
      }
      setLoading(false);
      return;
    }

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

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      toast.error("Enter your email address first");
      return;
    }
    setLoading(true);

    if (!clerkEnabled) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail(loginEmail), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent. Check your email.");
      } catch (err: any) {
        toast.error(friendlyAuthError(err?.message));
      }
      setLoading(false);
      return;
    }

    try {

      if (!signInLoaded || !signIn) throw new Error("Sign in is still loading.");
      await signIn.create({ strategy: "reset_password_email_code", identifier: cleanEmail(loginEmail) });
      setResetPending(true);
      toast.success("We sent a password reset code to your email.");
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.errors?.[0]?.longMessage || err?.message));
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      if (!signInLoaded || !signIn) throw new Error("Sign in is still loading.");
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: verificationCode.trim(),
        password: newPassword,
      });
      if (attempt.status !== "complete") throw new Error("Could not reset your password. Please try again.");
      await setSignInActive({ session: attempt.createdSessionId });
      const data = await bridgeClerkSession({});
      setResetPending(false);
      setVerificationCode("");
      setNewPassword("");
      toast.success("Password updated. You are signed in.");
      navigate(routeForRole(data.role));
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.errors?.[0]?.longMessage || err?.message));
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      if (clerkEnabled) {
        if (!signInLoaded || !signIn) throw new Error("Google sign in is still loading. Please try again.");
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/auth",
        });
        return;
      }

      // The Lovable OAuth broker (/~oauth/*) only exists on Lovable-served origins.
      // On externally hosted domains it 404s, so fall back to direct Supabase OAuth.
      const host = window.location.hostname;
      const brokerAvailable = host.endsWith(".lovable.app") || host === "localhost" || host === "127.0.0.1";

      if (brokerAvailable) {
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
          extraParams: { prompt: "select_account" },
        });
        if (result.error) throw result.error;
        if (result.redirected) return;
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth`,
            queryParams: { prompt: "select_account" },
          },
        });
        if (error) throw error;
        return; // full-page redirect to Google
      }

      const { data } = await supabase.auth.getUser();
      toast.success(`Welcome, ${displayNameFor(data.user)}!`);
      navigate(routeForRole(roleFromMetadata(data.user)));
    } catch (err: any) {
      toast.error(friendlyAuthError(err?.message));
    }
    setLoading(false);
  };

  const GoogleButton = ({ label }: { label: string }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full rounded-xl h-11 font-semibold gap-2"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
        </svg>
        {label}
      </Button>
    </div>
  );



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
            {pendingVerification || resetPending ? (
              <form onSubmit={resetPending ? handleResetPassword : handleVerifyCode} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {resetPending ? "Reset your password" : "Verify your email"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code we sent to{" "}
                    {resetPending ? cleanEmail(loginEmail) : cleanEmail(signupEmail)}.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-code">Verification Code</Label>
                  <Input
                    id="verify-code"
                    inputMode="numeric"
                    placeholder="123456"
                    className="rounded-xl h-11 tracking-[0.4em] text-center"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
                {resetPending && (
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      className="rounded-xl h-11"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary text-primary-foreground rounded-xl h-11 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : resetPending ? "Update Password" : "Verify & Continue"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingVerification(false);
                    setResetPending(false);
                    setVerificationCode("");
                  }}
                  className="w-full text-center text-sm text-muted-foreground hover:underline"
                >
                  Back to sign in
                </button>
              </form>
            ) : (
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
                      <Label htmlFor="admin-code">Admin Access Code</Label>
                      <Input
                        id="admin-code"
                        type="password"
                        placeholder="Enter admin access code"
                        className="rounded-xl h-11"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
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

                  {loginRole !== "admin" && <GoogleButton label="Continue with Google" />}
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

                  {signupRole !== "employer" && <GoogleButton label="Sign up with Google" />}
                </form>
              </TabsContent>
            </Tabs>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
