import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2.57.2"

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers })
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", { auth: { persistSession: false } })
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    const { data: auth, error: authError } = token ? await supabase.auth.getUser(token) : { data: null, error: true }
    if (authError || !auth?.user) throw new Error("Not authenticated")
    const { reference } = await req.json()
    if (typeof reference !== "string") throw new Error("Invalid payment reference")
    const { data, error } = await supabase.from("cv_export_purchases").update({
      status: "exported", exported_at: new Date().toISOString(),
    }).eq("reference", reference).eq("user_id", auth.user.id).eq("status", "verified").select("id").maybeSingle()
    if (error) throw error
    if (!data) throw new Error("A verified CV export purchase is required")
    return new Response(JSON.stringify({ completed: true }), { headers: { ...headers, "Content-Type": "application/json" } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } })
  }
})