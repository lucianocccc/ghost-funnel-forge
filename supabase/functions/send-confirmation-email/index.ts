
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, first_name } = await req.json();

    // Email template
    const confirmationUrl = `${Deno.env.get("SUPABASE_URL")}/auth/verify?email=${encodeURIComponent(email)}`;
    const html = `
      <div style="font-family: sans-serif">
        <h2>Conferma il tuo account</h2>
        <p>Ciao${first_name ? " " + first_name : ""},<br/>
        Per completare la registrazione a Lead Manager, clicca il pulsante qui sotto:</p>
        <p>
          <a href="${confirmationUrl}" style="background: #F9C846; color: #222; padding: 8px 20px; border-radius: 6px; text-decoration: none;">
            Conferma email
          </a>
        </p>
        <p>Se non riconosci questa richiesta, ignora questa email.<br/><br/>Grazie!</p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Lead Manager <onboarding@resend.dev>",
      to: [email],
      subject: "Conferma la tua email per completare la registrazione",
      html,
    });

    console.log("Confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("Error in send-confirmation-email:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Errore invio conferma email" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
