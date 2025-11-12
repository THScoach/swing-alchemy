import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-EMAIL-QUEUE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting email queue processing");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find pending emails that are due to be sent
    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from("email_sequences")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(10); // Process 10 at a time

    if (fetchError) {
      throw new Error(`Failed to fetch pending emails: ${fetchError.message}`);
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      logStep("No pending emails found");
      return new Response(
        JSON.stringify({ processed: 0, message: "No pending emails" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep(`Found ${pendingEmails.length} pending emails`);

    // Process each email by invoking the send-hybrid-email function
    const results = await Promise.allSettled(
      pendingEmails.map(async (sequence) => {
        logStep(`Processing sequence ${sequence.id}`);
        
        const response = await supabaseClient.functions.invoke("send-hybrid-email", {
          body: { sequenceId: sequence.id }
        });

        if (response.error) {
          logStep(`Failed to send sequence ${sequence.id}`, { error: response.error });
          throw response.error;
        }

        return { sequenceId: sequence.id, status: "sent" };
      })
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    logStep("Processing complete", { successful, failed });

    return new Response(
      JSON.stringify({ 
        processed: pendingEmails.length,
        successful,
        failed,
        message: `Processed ${pendingEmails.length} emails: ${successful} sent, ${failed} failed`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
