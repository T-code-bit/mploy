import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AppRole = "job_seeker" | "employer";

const EMPLOYER_ACCESS_CODE = Deno.env.get("EMPLOYER_ACCESS_CODE");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const cleanEmail = (value: unknown) => String(value || "").trim().toLowerCase();
const cleanText = (value: unknown) => String(value || "").trim();
const safeRole = (value: unknown): AppRole => (value === "employer" ? "employer" : "job_seeker");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const action = cleanText(body.action);
    const email = cleanEmail(body.email);
    const password = cleanText(body.password);
    const fullName = cleanText(body.fullName) || email.split("@")[0] || "M-Ploy User";
    const role = safeRole(body.role);

    if (!email || !password) return json({ error: "Email and password are required" }, 400);
    if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const syncAccount = async (userId: string, nextRole: AppRole, name: string, avatar?: string | null) => {
      const { error: profileError } = await admin.from("profiles").upsert(
        { user_id: userId, full_name: name, avatar_url: avatar ?? null, role: nextRole },
        { onConflict: "user_id" }
      );
      if (profileError) throw profileError;

      const { error: roleError } = await admin.from("user_roles").upsert(
        { user_id: userId, role: nextRole },
        { onConflict: "user_id,role" }
      );
      if (roleError) throw roleError;
    };

    const resolveRole = async (authUser: { id: string; user_metadata?: Record<string, unknown> }): Promise<"admin" | AppRole> => {
      const { data } = await admin.from("user_roles").select("role").eq("user_id", authUser.id);
      const roles = (data ?? []).map((row: { role: string }) => row.role);
      if (roles.includes("admin")) return "admin";
      if (roles.includes("employer")) return "employer";
      if (authUser.user_metadata?.role === "employer") return "employer";
      return "job_seeker";
    };

    const signIn = async () => {
      const { data, error } = await anon.auth.signInWithPassword({ email, password });
      if (error || !data.session || !data.user) {
        return { error: error?.message || "Unable to sign in", status: 401 };
      }
      return { data };
    };

    if (action === "signup") {
      if (role !== "employer") {
        return json({ error: "Job seeker sign-up must use Supabase Auth directly" }, 400);
      }
      if (role === "employer" && (!EMPLOYER_ACCESS_CODE || cleanText(body.employerCode) !== EMPLOYER_ACCESS_CODE)) {
        return json({ error: "Invalid employer access code" }, 403);
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
      });

      if (createError && !createError.message.toLowerCase().includes("already")) {
        return json({ error: createError.message }, 400);
      }

      const signedIn = await signIn();
      if (signedIn.error) return json({ error: signedIn.error }, signedIn.status);
      if (!signedIn.data) return json({ error: "Unable to sign in" }, 401);
      const sessionData = signedIn.data;

      await syncAccount(sessionData.user.id, role, fullName, sessionData.user.user_metadata?.avatar_url);
      return json({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user: sessionData.user,
        role,
        created: !createError && !!created.user,
      });
    }

    if (action === "login") {
      if (role === "employer" && (!EMPLOYER_ACCESS_CODE || cleanText(body.employerCode) !== EMPLOYER_ACCESS_CODE)) {
        return json({ error: "Invalid employer access code" }, 403);
      }

      const signedIn = await signIn();
      if (signedIn.error) return json({ error: signedIn.error }, signedIn.status);
      if (!signedIn.data) return json({ error: "Unable to sign in" }, 401);
      const sessionData = signedIn.data;
      const user = sessionData.user;
      const resolvedRole = await resolveRole(user);
      const nextRole = resolvedRole !== "admin" && role === "employer" ? "employer" : resolvedRole;
      if (nextRole !== "admin") {
        await syncAccount(
          user.id,
          nextRole,
          user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "M-Ploy User",
          user.user_metadata?.avatar_url || user.user_metadata?.picture || null
        );
      }
      return json({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user,
        role: nextRole,
      });
    }

    return json({ error: "Unsupported auth action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Authentication failed" }, 500);
  }
});