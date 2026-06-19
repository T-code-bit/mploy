import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_ACCESS_CODE = "1044157372";
const ADMIN_EMAIL = "tribaltechnexus@gmail.com";
const ADMIN_PASSWORD = "1044157372-internal-admin-secret";
const ADMIN_NAME = "M-Ploy Administrator";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code } = await req.json();
    if (code !== ADMIN_ACCESS_CODE) {
      return new Response(JSON.stringify({ error: "Invalid access code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: list } = await admin.auth.admin.listUsers();
    let adminUser = list?.users?.find((u: any) => u.email === ADMIN_EMAIL);

    if (!adminUser) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: ADMIN_NAME, role: "admin" },
      });
      if (createErr) throw createErr;
      adminUser = created.user!;
    } else {
      await admin.auth.admin.updateUserById(adminUser.id, { password: ADMIN_PASSWORD });
    }

    await admin.from("user_roles").upsert(
      { user_id: adminUser!.id, role: "admin" },
      { onConflict: "user_id,role" }
    );
    await admin.from("profiles").upsert(
      { user_id: adminUser!.id, full_name: ADMIN_NAME },
      { onConflict: "user_id" }
    );

    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const { data: signIn, error: signErr } = await anon.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (signErr) throw signErr;

    return new Response(
      JSON.stringify({
        access_token: signIn.session?.access_token,
        refresh_token: signIn.session?.refresh_token,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
