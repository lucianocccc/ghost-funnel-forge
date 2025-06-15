
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
    const { email, redirectTo } = await req.json();
    console.log(`Processing password reset for email: ${email}`);
    console.log(`Redirect URL received: ${redirectTo}`);
    
    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(user => user.email === email);
    
    if (!userExists) {
      console.log(`User does not exist: ${email}`);
      // Don't reveal whether the user exists or not for security
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Use the redirectTo URL provided by the client (which should be the correct production URL)
    const resetRedirectUrl = redirectTo;
    console.log(`Using redirect URL: ${resetRedirectUrl}`);
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: resetRedirectUrl,
      },
    });

    if (linkError) {
      console.error("Error generating recovery link:", linkError);
      throw linkError;
    }

    if (!linkData || !linkData.properties || !linkData.properties.action_link) {
      throw new Error("Failed to generate recovery link.");
    }
    
    const recoveryUrl = linkData.properties.action_link;
    console.log("Generated recovery URL:", recoveryUrl);

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Reset della Password</h2>
        <p>Hai richiesto di resettare la password per il tuo account Lead Manager.</p>
        <p>Clicca il pulsante qui sotto per impostare una nuova password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${recoveryUrl}" 
             style="background: #F9C846; 
                    color: #222; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    text-decoration: none; 
                    font-weight: bold;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        <p><strong>Importante:</strong> Questo link ti permetterà di impostare una nuova password per il tuo account.</p>
        <p style="color: #666; font-size: 14px;">
          Se non hai richiesto questo reset, ignora questa email.<br/>
          Il link scadrà tra 24 ore per motivi di sicurezza.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Lead Manager - Sistema di Gestione Lead
        </p>
      </div>
    `;

    const emailResult = await resend.emails.send({
      from: "Lead Manager <onboarding@resend.dev>",
      to: [email],
      subject: "Reset della Password - Lead Manager",
      html,
    });

    console.log("Password reset email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in reset-password function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
