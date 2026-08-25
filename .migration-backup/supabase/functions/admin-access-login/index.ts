import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "600",
};
const allowedOrigins = new Set(["https://go-mploy.com", "https://www.go-mploy.com"]);
const corsHeadersFor = (origin?: string | null) => ({
  ...corsHeaders,
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://go-mploy.com",
});

const ADMIN_ACCESS_CODE = Deno.env.get("ADMIN_ACCESS_CODE");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
const ADMIN_NAME = Deno.env.get("ADMIN_NAME") ?? "M-Ploy Administrator";

const json = (body: unknown, status = 200, origin?: string | null) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeadersFor(origin), "Content-Type": "application/json" },
    status,
  });

const createAdminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

const createAnonClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

const syncAdminAccount = async (admin: ReturnType<typeof createAdminClient>, userId: string) => {
  await admin.from("user_roles").upsert(
    { user_id: userId, role: "admin" },
    { onConflict: "user_id,role" }
  );
  await admin.from("profiles").upsert(
    { user_id: userId, full_name: ADMIN_NAME },
    { onConflict: "user_id" }
  );
};

const runInBackground = (task: Promise<unknown>) => {
  const edgeRuntime = (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (promise: Promise<unknown>) => void } }).EdgeRuntime;
  if (edgeRuntime?.waitUntil) edgeRuntime.waitUntil(task);
  else task.catch((err) => console.error("Admin sync failed", err));
};

const sessionResponse = (session: { access_token?: string; refresh_token?: string } | null | undefined, origin?: string | null) => {
  if (!session?.access_token || !session?.refresh_token) {
    return json({ error: "Unable to start admin session" }, 500, origin);
  }
  return json({ access_token: session.access_token, refresh_token: session.refresh_token, role: "admin" }, 200, origin);
};

const withTimeout = async <T,>(promise: Promise<T>, label: string, ms = 8000): Promise<T> => {
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  // Respond to preflight with 204 and the CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeadersFor(origin), status: 204 });
  }

  try {
    if (!ADMIN_ACCESS_CODE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("Admin authentication is missing required configuration");
      return json({ error: "Admin authentication is not configured" }, 503, origin);
    }

    const { code } = await req.json().catch(() => ({}));
    const trimmedCode = String(code || "").trim();
    if (trimmedCode !== ADMIN_ACCESS_CODE) {
      return json({ error: "Invalid access code" }, 401, origin);
    }

    const anon = createAnonClient();

    // Fast path: the managed admin account already exists, so avoid expensive user listing.
    const { data: link, error: linkError } = await withTimeout(
      createAdminClient().auth.admin.generateLink({
        type: "magiclink",
        email: ADMIN_EMAIL,
        options: { data: { full_name: ADMIN_NAME, role: "admin" } },
      }),
      "Admin session"
    );

    const emailOtp = link?.properties?.email_otp;
    if (!linkError && emailOtp) {
      const { data: verified, error: verifyError } = await withTimeout(
        anon.auth.verifyOtp({ email: ADMIN_EMAIL, token: emailOtp, type: "email" }),
        "Admin verification"
      );
      if (!verifyError && verified.session?.access_token && verified.user) {
        runInBackground(syncAdminAccount(createAdminClient(), verified.user.id));
        return sessionResponse(verified.session, origin);
      }
    }

    const admin = createAdminClient();
    let adminUser: any = null;

    const { data: created, error: createErr } = await withTimeout(
      admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: ADMIN_NAME, role: "admin" },
      }),
      "Admin setup"
    );

    if (created.user) {
      adminUser = created.user!;
    } else if (createErr?.message?.toLowerCase().includes("already")) {
      const { data: list, error: listErr } = await withTimeout(
        admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        "Admin lookup"
      );
      if (listErr) throw listErr;
      adminUser = list?.users?.find((u: any) => u.email === ADMIN_EMAIL);
      if (!adminUser) throw new Error("Admin user exists but could not be loaded");
      await withTimeout(admin.auth.admin.updateUserById(adminUser.id, { password: ADMIN_PASSWORD }), "Admin update");
    } else if (createErr) {
      throw createErr;
    }

    await syncAdminAccount(admin, adminUser!.id);

    const { data: signIn, error: signErr } = await withTimeout(
      anon.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
      "Admin sign in"
    );
    if (signErr) throw signErr;

    return sessionResponse(signIn.session, origin);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500, origin);
  }
});
