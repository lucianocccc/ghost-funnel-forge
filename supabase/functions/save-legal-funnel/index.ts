import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComplianceStatus {
  isCompliant: boolean;
  issues?: Array<{ message: string; severity?: "warning" | "error" }>;
  score?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, funnel, complianceReport } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!funnel || !funnel.name) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing funnel payload or name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic compliance guard (double-check)
    const compliance: ComplianceStatus | undefined = funnel.compliance_status || complianceReport;
    if (!compliance?.isCompliant) {
      return new Response(
        JSON.stringify({ success: false, error: "Funnel non conforme: salvataggio negato" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare insert payload for ai_generated_funnels
    const insertPayload = {
      user_id: userId,
      name: funnel.name,
      description: funnel.description || "",
      funnel_data: funnel, // store full spec including html_content & structure
      is_from_chatbot: false,
      source: "legal_generator",
      funnel_type: "legal_funnel",
      industry: (funnel as any)?.industry || null,
      use_case: (funnel as any)?.use_case || "Legal Funnel",
    };

    const { data, error } = await supabase
      .from("ai_generated_funnels")
      .insert([insertPayload])
      .select("id, share_token, name, created_at")
      .single();

    if (error) {
      console.error("❌ Error inserting legal funnel:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, saved: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("💥 save-legal-funnel error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
