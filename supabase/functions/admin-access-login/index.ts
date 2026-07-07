import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_ACCESS_CODE = "2013";
const ADMIN_EMAIL = "tribaltechnexus@gmail.com";
const ADMIN_PASSWORD = "1044157372-internal-admin-secret";
const ADMIN_NAME = "M-Ploy Administrator";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
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

const sessionResponse = (session: { access_token?: string; refresh_token?: string } | null | undefined) => {
  if (!session?.access_token || !session?.refresh_token) {
    return json({ error: "Unable to start admin session" }, 500);
  }
  return json({ access_token: session.access_token, refresh_token: session.refresh_token, role: "admin" });
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code } = await req.json().catch(() => ({}));
    if (code !== ADMIN_ACCESS_CODE) {
      return json({ error: "Invalid access code" }, 401);
    }

    const anon = createAnonClient();

    // Fast path: the managed admin account already exists, so avoid expensive user listing.
    const { data: existingSignIn } = await anon.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (existingSignIn.session?.access_token) {
      runInBackground(syncAdminAccount(createAdminClient(), existingSignIn.user.id));
      return sessionResponse(existingSignIn.session);
    }

    const admin = createAdminClient();
    let adminUser: any = null;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME, role: "admin" },
    });

    if (created.user) {
      adminUser = created.user!;
    } else if (createErr?.message?.toLowerCase().includes("already")) {
      const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listErr) throw listErr;
      adminUser = list?.users?.find((u: any) => u.email === ADMIN_EMAIL);
      if (!adminUser) throw new Error("Admin user exists but could not be loaded");
      await admin.auth.admin.updateUserById(adminUser.id, { password: ADMIN_PASSWORD });
    } else if (createErr) {
      throw createErr;
    }

    await syncAdminAccount(admin, adminUser!.id);

    const { data: signIn, error: signErr } = await anon.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (signErr) throw signErr;

    return sessionResponse(signIn.session);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg }, 500);
  }
});
