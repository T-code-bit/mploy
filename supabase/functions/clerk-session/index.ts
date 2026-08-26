import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5";

const CLERK_DOMAIN = "clerk.go-mploy.com";
const JWKS = createRemoteJWKSet(new URL(`https://${CLERK_DOMAIN}/.well-known/jwks.json`));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token, fullName, role: requestedRole } = await req.json().catch(() => ({}));
    if (!token || typeof token !== "string") return json({ error: "Missing Clerk token" }, 400);

    // 1. Verify the Clerk session token
    let sub: string;
    try {
      const { payload } = await jwtVerify(token, JWKS);
      sub = String(payload.sub);
    } catch (_e) {
      return json({ error: "Invalid or expired Clerk session" }, 401);
    }

    // 2. Load the Clerk user (source of truth for email + name)
    const clerkSecret = Deno.env.get("CLERK_SECRET_KEY");
    if (!clerkSecret) return json({ error: "Clerk is not configured on the server" }, 500);

    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${sub}`, {
      headers: { Authorization: `Bearer ${clerkSecret}` },
    });
    if (!clerkRes.ok) return json({ error: "Could not load Clerk profile" }, 401);
    const clerkUser = await clerkRes.json();

    const primaryId = clerkUser.primary_email_address_id;
    const emailObj =
      (clerkUser.email_addresses || []).find((e: any) => e.id === primaryId) ||
      (clerkUser.email_addresses || [])[0];
    const email = String(emailObj?.email_address || "").toLowerCase();
    if (!email) return json({ error: "Your Clerk account has no email address" }, 400);

    const name =
      (fullName && String(fullName).trim()) ||
      [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ").trim() ||
      email.split("@")[0];

    const role = requestedRole === "employer" ? "employer" : "job_seeker";

    // 3. Mirror the user into the platform database
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    let userId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: `clerk_${sub}_${Deno.env.get("SUPABASE_URL")?.slice(-8)}`,
      user_metadata: { full_name: name, role, clerk_user_id: sub },
    });

    if (created?.user) {
      userId = created.user.id;
    } else if (createErr) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const existing = list?.users?.find((u) => (u.email || "").toLowerCase() === email);
      if (!existing) return json({ error: createErr.message }, 400);
      userId = existing.id;
      await admin.auth.admin.updateUserById(userId, {
        email_confirm: true,
        user_metadata: { ...existing.user_metadata, full_name: name, clerk_user_id: sub },
      });
    }

    if (!userId) return json({ error: "Could not link your Clerk account" }, 500);

    await admin
      .from("profiles")
      .upsert({ user_id: userId, full_name: name }, { onConflict: "user_id" });

    const { data: existingRole } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (!existingRole) {
      await admin.from("user_roles").insert({ user_id: userId, role });
    }

    // 4. Mint a platform session for this user
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkErr || !link?.properties?.hashed_token) {
      return json({ error: linkErr?.message || "Could not create session" }, 500);
    }

    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false },
    });
    const { data: verified, error: verifyErr } = await anon.auth.verifyOtp({
      type: "magiclink",
      token_hash: link.properties.hashed_token,
    });
    if (verifyErr || !verified?.session) {
      return json({ error: verifyErr?.message || "Could not establish session" }, 500);
    }

    return json({
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
      user: verified.user,
      role: (existingRole?.role as string) || role,
    });
  } catch (err) {
    return json({ error: (err as Error).message || "Unexpected error" }, 500);
  }
});
