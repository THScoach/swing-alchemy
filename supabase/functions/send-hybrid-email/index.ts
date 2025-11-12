import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.15";
import React from "https://esm.sh/react@18.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { HybridEmail1 } from "./_templates/hybrid-email-1.tsx";
import { HybridEmail2 } from "./_templates/hybrid-email-2.tsx";
import { HybridEmail3 } from "./_templates/hybrid-email-3.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-HYBRID-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    if (!resend) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sequenceId } = await req.json();
    
    if (!sequenceId) {
      throw new Error("sequenceId is required");
    }

    logStep("Fetching sequence", { sequenceId });

    // Fetch the sequence
    const { data: sequence, error: sequenceError } = await supabaseClient
      .from("email_sequences")
      .select("*, user_id")
      .eq("id", sequenceId)
      .eq("status", "pending")
      .single();

    if (sequenceError || !sequence) {
      throw new Error(`Sequence not found or already sent: ${sequenceError?.message}`);
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("name")
      .eq("id", sequence.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`);
    }

    // Fetch user email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(sequence.user_id);
    if (userError || !userData.user || !userData.user.email) {
      throw new Error(`User not found or no email: ${userError?.message}`);
    }

    const email = userData.user.email;
    const firstName = profile.name?.split(' ')[0] || 'there';
    
    logStep("Rendering email", { emailNumber: sequence.email_number, firstName, email });

    // Render the appropriate email template
    let html: string;
    let subject: string;
    const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
    const analyzeUrl = `${originUrl}/analyze`;
    const zoomLink = "https://zoom.us/placeholder"; // Update with actual Zoom link

    switch (sequence.email_number) {
      case 1:
        subject = "Welcome to Hybrid Coaching — Let's Get Your Swing in Motion";
        html = await renderAsync(
          React.createElement(HybridEmail1, { firstName, analyzeUrl })
        );
        break;
      case 2:
        subject = "Your First Live Call Is Coming — Here's How to Get Ready";
        html = await renderAsync(
          React.createElement(HybridEmail2, { firstName, zoomLink, analyzeUrl })
        );
        break;
      case 3:
        subject = "You're Part of the Elite Tier — Here's What Happens Next";
        html = await renderAsync(
          React.createElement(HybridEmail3, { firstName })
        );
        break;
      default:
        throw new Error(`Unknown email number: ${sequence.email_number}`);
    }

    logStep("Sending email via Resend", { to: email, subject });

    // Send email
    const { error: sendError } = await resend.emails.send({
      from: "Coach Rick <onboarding@resend.dev>", // Update with your domain
      to: [email],
      subject,
      html,
      ...(sequence.email_number === 1 && {
        cc: ["support@thehittingskool.com"]
      })
    });

    if (sendError) {
      logStep("ERROR sending email", { error: sendError });
      
      // Mark as failed
      await supabaseClient
        .from("email_sequences")
        .update({
          status: "failed",
          error_message: sendError.message || "Unknown error"
        })
        .eq("id", sequenceId);

      throw new Error(`Failed to send email: ${sendError.message}`);
    }

    // Mark as sent
    await supabaseClient
      .from("email_sequences")
      .update({
        status: "sent",
        sent_at: new Date().toISOString()
      })
      .eq("id", sequenceId);

    logStep("Email sent successfully", { sequenceId });

    return new Response(
      JSON.stringify({ success: true, sequenceId }),
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
