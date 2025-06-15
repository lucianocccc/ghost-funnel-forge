import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Singleton for Supabase admin client
let supabaseAdmin: SupabaseClient | null = null;
const getSupabaseAdmin = () => {
  if (supabaseAdmin) return supabaseAdmin;
  supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
  return supabaseAdmin;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, first_name, last_name, redirectTo } = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    });

    if (createUserError) {
      const errorMessage = (createUserError.message || "").toLowerCase();
      if (errorMessage.includes("user already registered") || errorMessage.includes("duplicate key value")) {
        return new Response(JSON.stringify({ error: "User already registered" }), {
          status: 409, // Using 409 Conflict for existing user
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      throw createUserError;
    }

    if (!user) {
      throw new Error("User creation failed for an unknown reason.");
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: user.email!,
      options: {
        redirectTo: redirectTo || Deno.env.get("SITE_URL") || "",
      },
    });

    if (linkError) throw linkError;

    if (!linkData || !linkData.properties || !linkData.properties.action_link) {
      throw new Error("Failed to generate confirmation link.");
    }
    const confirmationUrl = linkData.properties.action_link;

    const html = `
      <div style="font-family: sans-serif">
        <h2>Conferma il tuo account</h2>
        <p>Ciao ${first_name || ""},<br/>
        Per completare la registrazione a Lead Manager e accedere, clicca il pulsante qui sotto:</p>
        <p>
          <a href="${confirmationUrl}" style="background: #F9C846; color: #222; padding: 8px 20px; border-radius: 6px; text-decoration: none;">
            Conferma e Accedi
          </a>
        </p>
        <p>Se non riconosci questa richiesta, ignora questa email.<br/><br/>Grazie!</p>
      </div>
    `;

    await resend.emails.send({
      from: "Lead Manager <onboarding@resend.dev>",
      to: [user.email!],
      subject: "Conferma la tua email per Lead Manager",
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in signup function:", error.message);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
