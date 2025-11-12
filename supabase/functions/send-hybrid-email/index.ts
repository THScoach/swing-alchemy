import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.15";
import React from "https://esm.sh/react@18.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Centralized email configuration
const SUPPORT_EMAIL = Deno.env.get("SUPPORT_EMAIL") || "support@4bhitting.com";
const FROM_BRAND = Deno.env.get("FROM_BRAND") || "Coach Rick @ 4B Hitting";
const FROM_ADDRESS = `${FROM_BRAND} <${SUPPORT_EMAIL}>`;
import { HybridEmail1 } from "./_templates/hybrid-email-1.tsx";
import { HybridEmail2 } from "./_templates/hybrid-email-2.tsx";
import { HybridEmail3 } from "./_templates/hybrid-email-3.tsx";
import { HybridEmail4Active } from "./_templates/hybrid-email-4-active.tsx";
import { HybridEmail4Inactive } from "./_templates/hybrid-email-4-inactive.tsx";
import { HybridEmailReactivation } from "./_templates/hybrid-email-reactivation.tsx";
import { HybridReactivationStep1 } from "./_templates/hybrid-reactivation-step-1.tsx";
import { HybridReactivationStep2 } from "./_templates/hybrid-reactivation-step-2.tsx";
import { HybridReactivationStep3 } from "./_templates/hybrid-reactivation-step-3.tsx";
import { OnboardingStep1 } from "./_templates/onboarding-step-1.tsx";
import { OnboardingStep2 } from "./_templates/onboarding-step-2.tsx";
import { OnboardingStep3 } from "./_templates/onboarding-step-3.tsx";
import { TeamOnboardingStep1 } from "./_templates/team-onboarding-step-1.tsx";
import { TeamOnboardingStep2 } from "./_templates/team-onboarding-step-2.tsx";
import { TeamOnboardingStep3 } from "./_templates/team-onboarding-step-3.tsx";
import { TeamOnboardingStep5 } from "./_templates/team-onboarding-step-5.tsx";
import { TeamExpansionStep1 } from "./_templates/team-expansion-step-1.tsx";
import { TeamExpansionStep2 } from "./_templates/team-expansion-step-2.tsx";
import { TeamExpansionStep3 } from "./_templates/team-expansion-step-3.tsx";
import { HybridToTeamStep1 } from "./_templates/hybrid-to-team-step-1.tsx";
import { HybridToTeamStep2 } from "./_templates/hybrid-to-team-step-2.tsx";
import { HybridToTeamStep3 } from "./_templates/hybrid-to-team-step-3.tsx";
import { StarterActivation } from "./_templates/starter-activation.tsx";

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
    
    logStep("Rendering email", { sequenceName: sequence.sequence_name, emailNumber: sequence.email_number, firstName, email });

    // Handle 3-step reactivation funnel
    if (sequence.sequence_name === 'hybrid_reactivation_funnel') {
      logStep("Processing reactivation funnel email", { step: sequence.email_number });

      const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
      const analyzeUrl = `${originUrl}/analyze`;
      const dashboardUrl = `${originUrl}/feed`;

      // Check if user uploaded since scheduling (exit condition for entire sequence)
      const { data: recentUpload } = await supabaseClient
        .from("video_analyses")
        .select("id")
        .eq("user_id", sequence.user_id)
        .gte("created_at", sequence.scheduled_at)
        .limit(1)
        .single();

      if (recentUpload) {
        logStep("User uploaded since scheduling, canceling remaining sequence");
        
        // Cancel all pending emails in this sequence
        await supabaseClient
          .from("email_sequences")
          .update({ 
            status: "skipped",
            error_message: "User reactivated - uploaded swing"
          })
          .eq("user_id", sequence.user_id)
          .eq("sequence_name", "hybrid_reactivation_funnel")
          .eq("status", "pending");

        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "User reactivated with upload" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      let html: string;
      let subject: string;

      switch (sequence.email_number) {
        case 1:
          subject = "Quick Check-In — Haven't Seen a Swing in a While";
          html = await renderAsync(
            React.createElement(HybridReactivationStep1, { firstName, analyzeUrl })
          );
          break;
        case 2:
          subject = "If You Miss a Week, You Miss Momentum";
          html = await renderAsync(
            React.createElement(HybridReactivationStep2, { firstName, analyzeUrl })
          );
          break;
        case 3:
          subject = "Ready for a Fresh Start? I've Reset Your Week 1 Plan.";
          html = await renderAsync(
            React.createElement(HybridReactivationStep3, { firstName, dashboardUrl })
          );
          break;
        default:
          throw new Error(`Unknown reactivation funnel step: ${sequence.email_number}`);
      }

      logStep("Sending reactivation funnel email via Resend", { to: email, subject, step: sequence.email_number });

      const { error: sendError } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject,
        html,
        reply_to: [SUPPORT_EMAIL],
      });

      if (sendError) {
        logStep("ERROR sending reactivation funnel email", { error: sendError });
        await supabaseClient
          .from("email_sequences")
          .update({
            status: "failed",
            error_message: sendError.message || "Unknown error"
          })
          .eq("id", sequenceId);
        throw new Error(`Failed to send email: ${sendError.message}`);
      }

      await supabaseClient
        .from("email_sequences")
        .update({
          status: "sent",
          sent_at: new Date().toISOString()
        })
        .eq("id", sequenceId);

      logStep("Reactivation funnel email sent successfully", { sequenceId, step: sequence.email_number });

      return new Response(
        JSON.stringify({ success: true, sequenceId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle new player onboarding sequence
    if (sequence.sequence_name === 'new_player_onboarding') {
      logStep("Processing new player onboarding email", { step: sequence.email_number });

      const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
      const analyzeUrl = `${originUrl}/analyze`;
      const dashboardUrl = `${originUrl}/dashboard`;

      // Check if player has uploaded (exit condition for entire sequence)
      const playerId = sequence.metadata?.player_id;
      if (playerId) {
        const { data: existingUpload } = await supabaseClient
          .from("video_analyses")
          .select("id")
          .eq("player_id", playerId)
          .limit(1)
          .single();

        if (existingUpload) {
          logStep("Player uploaded swing, canceling remaining onboarding sequence");
          
          // Cancel all pending emails in this sequence
          await supabaseClient
            .from("email_sequences")
            .update({ 
              status: "skipped",
              error_message: "Player uploaded first swing - onboarding complete"
            })
            .eq("user_id", sequence.user_id)
            .eq("sequence_name", "new_player_onboarding")
            .eq("status", "pending");

          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Player completed first upload" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      }

      let html: string;
      let subject: string;

      switch (sequence.email_number) {
        case 1:
          subject = "Welcome to The Hitting Skool — Here's Your First Step";
          html = await renderAsync(
            React.createElement(OnboardingStep1, { firstName, dashboardUrl, analyzeUrl })
          );
          break;
        case 2:
          subject = "Your Swing Tells the Story — Ready to See It?";
          html = await renderAsync(
            React.createElement(OnboardingStep2, { firstName, analyzeUrl })
          );
          break;
        case 3:
          subject = "Your AI Coach Is Ready to Break Down Your Swing";
          html = await renderAsync(
            React.createElement(OnboardingStep3, { firstName, analyzeUrl })
          );
          break;
        default:
          throw new Error(`Unknown onboarding step: ${sequence.email_number}`);
      }

      logStep("Sending onboarding email via Resend", { to: email, subject, step: sequence.email_number });

      const { error: sendError } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject,
        html,
        reply_to: [SUPPORT_EMAIL],
      });

      if (sendError) {
        logStep("ERROR sending onboarding email", { error: sendError });
        await supabaseClient
          .from("email_sequences")
          .update({
            status: "failed",
            error_message: sendError.message || "Unknown error"
          })
          .eq("id", sequenceId);
        throw new Error(`Failed to send email: ${sendError.message}`);
      }

      await supabaseClient
        .from("email_sequences")
        .update({
          status: "sent",
          sent_at: new Date().toISOString()
        })
        .eq("id", sequenceId);

      logStep("Onboarding email sent successfully", { sequenceId, step: sequence.email_number });

      return new Response(
        JSON.stringify({ success: true, sequenceId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle team coach onboarding sequence
    if (sequence.sequence_name === 'team_coach_onboarding') {
      logStep("Processing team coach onboarding email", { step: sequence.email_number });

      const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
      const dashboardUrl = `${originUrl}/dashboard`;
      const reportsUrl = `${originUrl}/my-progress`;
      const uploadUrl = `${originUrl}/analyze`;
      const trendsUrl = `${originUrl}/my-progress`;

      // Check for exit conditions
      const organizationId = sequence.metadata?.organization_id;
      
      if (organizationId) {
        // Check if subscription is canceled
        const { data: org } = await supabaseClient
          .from("organizations")
          .select("subscription_tier")
          .eq("id", organizationId)
          .single();

        if (!org || org.subscription_tier === 'free') {
          logStep("Organization subscription canceled, canceling team onboarding sequence");
          
          await supabaseClient
            .from("email_sequences")
            .update({ 
              status: "skipped",
              error_message: "Subscription canceled"
            })
            .eq("user_id", sequence.user_id)
            .eq("sequence_name", "team_coach_onboarding")
            .eq("status", "pending");

          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Subscription canceled" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        // Check for upload inactivity (30+ days with no uploads from team players)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentTeamUploads } = await supabaseClient
          .from("video_analyses")
          .select("id, players!inner(organization_id)")
          .eq("players.organization_id", organizationId)
          .gte("created_at", thirtyDaysAgo.toISOString())
          .limit(1);

        if (!recentTeamUploads || recentTeamUploads.length === 0) {
          logStep("No team uploads in 30 days, canceling team onboarding sequence");
          
          await supabaseClient
            .from("email_sequences")
            .update({ 
              status: "skipped",
              error_message: "No swing uploads after 30 days - inactive team"
            })
            .eq("user_id", sequence.user_id)
            .eq("sequence_name", "team_coach_onboarding")
            .eq("status", "pending");

          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Team inactive for 30+ days" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      }

      const coachName = firstName;
      let html: string;
      let subject: string;

      switch (sequence.email_number) {
        case 1:
          subject = "Your Team Dashboard Is Ready — Let's Get Your Players Set Up";
          html = await renderAsync(
            React.createElement(TeamOnboardingStep1, { coachName, dashboardUrl })
          );
          break;
        case 2:
          subject = "How to Read Your First Team Report";
          html = await renderAsync(
            React.createElement(TeamOnboardingStep2, { coachName, reportsUrl })
          );
          break;
        case 3:
          subject = "Keep Your Players Uploading — AI Can't Coach What It Can't See";
          html = await renderAsync(
            React.createElement(TeamOnboardingStep3, { coachName, uploadUrl })
          );
          break;
        case 5:
          subject = "We've Built You a Custom Retention Bonus";
          html = await renderAsync(
            React.createElement(TeamOnboardingStep5, { coachName, trendsUrl })
          );
          break;
        default:
          throw new Error(`Unknown team onboarding step: ${sequence.email_number}`);
      }

      logStep("Sending team onboarding email via Resend", { to: email, subject, step: sequence.email_number });

      const { error: sendError } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject,
        html,
        reply_to: [SUPPORT_EMAIL],
      });

      if (sendError) {
        logStep("ERROR sending team onboarding email", { error: sendError });
        await supabaseClient
          .from("email_sequences")
          .update({
            status: "failed",
            error_message: sendError.message || "Unknown error"
          })
          .eq("id", sequenceId);
        throw new Error(`Failed to send email: ${sendError.message}`);
      }

      await supabaseClient
        .from("email_sequences")
        .update({
          status: "sent",
          sent_at: new Date().toISOString()
        })
        .eq("id", sequenceId);

      logStep("Team onboarding email sent successfully", { sequenceId, step: sequence.email_number });

      return new Response(
        JSON.stringify({ success: true, sequenceId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle team expansion upsell sequence
    if (sequence.sequence_name === 'team_expansion') {
      logStep("Processing team expansion email", { step: sequence.email_number });

      const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
      const upgradeUrl = `${originUrl}/teams-upgrade`;

      // Check for exit condition: coach upgraded to next tier
      const organizationId = sequence.metadata?.organization_id;
      const currentSeats = sequence.metadata?.current_seats || 10;
      
      if (organizationId) {
        // Count current players
        const { data: players } = await supabaseClient
          .from('players')
          .select('id')
          .eq('organization_id', organizationId);

        const playerCount = players?.length || 0;

        // If player count suggests upgrade happened (e.g., was at 10, now can have more than 10 active)
        // or if they're no longer near capacity, cancel sequence
        if (playerCount < currentSeats * 0.85) {
          logStep("Team upgraded or capacity resolved, canceling expansion sequence");
          
          await supabaseClient
            .from("email_sequences")
            .update({ 
              status: "skipped",
              error_message: "Team upgraded or capacity resolved"
            })
            .eq("user_id", sequence.user_id)
            .eq("sequence_name", "team_expansion")
            .eq("status", "pending");

          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Team upgraded" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
      }

      const coachName = firstName;
      let html: string;
      let subject: string;

      switch (sequence.email_number) {
        case 1:
          subject = "You're Out of Seats — Let's Expand Your Roster";
          html = await renderAsync(
            React.createElement(TeamExpansionStep1, { 
              coachName, 
              currentSeats,
              upgradeUrl 
            })
          );
          break;
        case 2:
          subject = "Don't Lose Progress — Your Players Still Need You";
          html = await renderAsync(
            React.createElement(TeamExpansionStep2, { coachName, upgradeUrl })
          );
          break;
        case 3:
          subject = "Final Reminder — Don't Let Data Drop Off";
          html = await renderAsync(
            React.createElement(TeamExpansionStep3, { coachName, upgradeUrl })
          );
          break;
        default:
          throw new Error(`Unknown team expansion step: ${sequence.email_number}`);
      }

      logStep("Sending team expansion email via Resend", { to: email, subject, step: sequence.email_number });

      const { error: sendError } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject,
        html,
        reply_to: [SUPPORT_EMAIL],
      });

      if (sendError) {
        logStep("ERROR sending team expansion email", { error: sendError });
        await supabaseClient
          .from("email_sequences")
          .update({
            status: "failed",
            error_message: sendError.message || "Unknown error"
          })
          .eq("id", sequenceId);
        throw new Error(`Failed to send email: ${sendError.message}`);
      }

      await supabaseClient
        .from("email_sequences")
        .update({
          status: "sent",
          sent_at: new Date().toISOString()
        })
        .eq("id", sequenceId);

      logStep("Team expansion email sent successfully", { sequenceId, step: sequence.email_number });

      return new Response(
        JSON.stringify({ success: true, sequenceId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle hybrid-to-team upgrade sequence
    if (sequence.sequence_name === 'hybrid_to_team_upgrade') {
      logStep("Processing hybrid-to-team upgrade email", { step: sequence.email_number });

      const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
      const upgradeUrl = `${originUrl}/teams-upgrade`;

      // Check for exit condition: user already upgraded to team
      const { data: orgMembers } = await supabaseClient
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', sequence.user_id)
        .limit(1);

      if (orgMembers && orgMembers.length > 0) {
        logStep("User already upgraded to team plan, canceling sequence");
        
        await supabaseClient
          .from("email_sequences")
          .update({ 
            status: "skipped",
            error_message: "User upgraded to team plan"
          })
          .eq("user_id", sequence.user_id)
          .eq("sequence_name", "hybrid_to_team_upgrade")
          .eq("status", "pending");

        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "User upgraded to team" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      let html: string;
      let subject: string;

      switch (sequence.email_number) {
        case 1:
          subject = "Looks Like You're Coaching a Team — Let's Make It Official";
          html = await renderAsync(
            React.createElement(HybridToTeamStep1, { firstName, upgradeUrl })
          );
          break;
        case 2:
          subject = "You're Coaching a Team — Here's How to Save $297 This Year";
          html = await renderAsync(
            React.createElement(HybridToTeamStep2, { firstName, upgradeUrl })
          );
          break;
        case 3:
          subject = "Keep Your Players Connected — Upgrade Before Friday";
          html = await renderAsync(
            React.createElement(HybridToTeamStep3, { firstName, upgradeUrl })
          );
          break;
        default:
          throw new Error(`Unknown hybrid-to-team upgrade step: ${sequence.email_number}`);
      }

      logStep("Sending hybrid-to-team upgrade email via Resend", { to: email, subject, step: sequence.email_number });

      const { error: sendError } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject,
        html,
        reply_to: [SUPPORT_EMAIL],
      });

      if (sendError) {
        logStep("ERROR sending hybrid-to-team upgrade email", { error: sendError });
        await supabaseClient
          .from("email_sequences")
          .update({
            status: "failed",
            error_message: sendError.message || "Unknown error"
          })
          .eq("id", sequenceId);
        throw new Error(`Failed to send email: ${sendError.message}`);
      }

      await supabaseClient
        .from("email_sequences")
        .update({
          status: "sent",
          sent_at: new Date().toISOString()
        })
        .eq("id", sequenceId);

      logStep("Hybrid-to-team upgrade email sent successfully", { sequenceId, step: sequence.email_number });

      return new Response(
        JSON.stringify({ success: true, sequenceId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle single reactivation emails (legacy)
    if (sequence.sequence_name === 'hybrid_reactivation') {
      logStep("Processing reactivation email");

      const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
      const analyzeUrl = `${originUrl}/analyze`;

      // Check if user uploaded in the last 24 hours (skip email if so)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const { data: recentUpload } = await supabaseClient
        .from("video_analyses")
        .select("id")
        .eq("user_id", sequence.user_id)
        .gte("created_at", oneDayAgo.toISOString())
        .limit(1)
        .single();

      if (recentUpload) {
        logStep("User uploaded in last 24 hours, skipping reactivation email");
        
        await supabaseClient
          .from("email_sequences")
          .update({ 
            status: "skipped",
            error_message: "User uploaded within 24 hours of scheduled send"
          })
          .eq("id", sequenceId);

        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "Recent activity" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Rotate subject lines (weekly rotation)
      const subjectVariants = [
        "Quick Check-In — Haven't Seen a Swing in a While",
        "Let's Get You Back in Rhythm",
        "One Upload Away from Progress"
      ];
      const subjectIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 3;

      const html = await renderAsync(
        React.createElement(HybridEmailReactivation, {
          firstName,
          analyzeUrl,
          subjectVariant: subjectIndex + 1
        })
      );

      logStep("Sending reactivation email via Resend", { to: email, subject: subjectVariants[subjectIndex] });

      const { error: sendError } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: [email],
        subject: subjectVariants[subjectIndex],
        html,
        reply_to: [SUPPORT_EMAIL],
      });

      if (sendError) {
        logStep("ERROR sending reactivation email", { error: sendError });
        await supabaseClient
          .from("email_sequences")
          .update({
            status: "failed",
            error_message: sendError.message || "Unknown error"
          })
          .eq("id", sequenceId);
        throw new Error(`Failed to send email: ${sendError.message}`);
      }

      await supabaseClient
        .from("email_sequences")
        .update({
          status: "sent",
          sent_at: new Date().toISOString()
        })
        .eq("id", sequenceId);

      logStep("Reactivation email sent successfully", { sequenceId });

      return new Response(
        JSON.stringify({ success: true, sequenceId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle onboarding sequence emails
    let html: string;
    let subject: string;
    const originUrl = Deno.env.get("SUPABASE_URL")?.replace('//', '//app.') || '';
    const analyzeUrl = `${originUrl}/analyze`;
    const dashboardUrl = `${originUrl}/feed`;
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
      case 4:
        // Day 7 Progress Check-in - fetch user activity and metrics
        
        // First check if user is still subscribed to Hybrid
        const { data: currentProfile } = await supabaseClient
          .from("profiles")
          .select("subscription_tier")
          .eq("id", sequence.user_id)
          .single();

        if (!currentProfile || currentProfile.subscription_tier !== "Hybrid_Coaching") {
          logStep("User no longer subscribed to Hybrid, skipping Day 7 email");
          
          // Mark as skipped
          await supabaseClient
            .from("email_sequences")
            .update({
              status: "skipped",
              error_message: "User no longer subscribed to Hybrid"
            })
            .eq("id", sequenceId);
            
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Not subscribed to Hybrid" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Find user's player profile
        const { data: player } = await supabaseClient
          .from("players")
          .select("id")
          .eq("profile_id", sequence.user_id)
          .single();

        if (!player) {
          logStep("No player profile found, sending inactive email");
          subject = "Quick Nudge: Let's Get Your First Hybrid Results In";
          html = await renderAsync(
            React.createElement(HybridEmail4Inactive, { firstName, analyzeUrl })
          );
          break;
        }

        // Count uploads in last 7 days
        const { data: analyses, count: uploadsCount } = await supabaseClient
          .from("video_analyses")
          .select("id, created_at", { count: "exact" })
          .eq("player_id", player.id)
          .gte("created_at", sevenDaysAgo.toISOString());

        logStep("Activity check", { uploadsCount, playerId: player.id });

        if (!uploadsCount || uploadsCount === 0) {
          // No activity - send inactive email
          subject = "Quick Nudge: Let's Get Your First Hybrid Results In";
          html = await renderAsync(
            React.createElement(HybridEmail4Inactive, { firstName, analyzeUrl })
          );
        } else {
          // Has activity - fetch metrics and send active email
          const { data: scores } = await supabaseClient
            .from("fourb_scores")
            .select("*")
            .eq("player_id", player.id)
            .gte("session_date", sevenDaysAgo.toISOString())
            .order("session_date", { ascending: true });

          if (!scores || scores.length === 0) {
            // Has uploads but no scores yet - send inactive email
            subject = "Quick Nudge: Let's Get Your First Hybrid Results In";
            html = await renderAsync(
              React.createElement(HybridEmail4Inactive, { firstName, analyzeUrl })
            );
            break;
          }

          const earliest = scores[0];
          const latest = scores[scores.length - 1];

          // Calculate directional changes
          const getDirection = (latestVal: number | null, prevVal: number | null): string => {
            if (!latestVal || !prevVal) return "recorded";
            const delta = latestVal - prevVal;
            if (delta >= 5) return "↑ up";
            if (delta <= -5) return "↓ down";
            return "→ steady";
          };

          // Fetch latest body data for additional metrics
          const { data: bodyData } = await supabaseClient
            .from("body_data")
            .select("*")
            .eq("player_id", player.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Determine tempo label (simplified - you may have more complex logic)
          let tempoLabel = "Recorded in your dashboard";
          if (bodyData) {
            // Add tempo logic here if you have it in your data
            tempoLabel = "Recorded in your dashboard";
          }

          subject = "Your First Week Results Are In ✅";
          html = await renderAsync(
            React.createElement(HybridEmail4Active, {
              firstName,
              uploadsCount: uploadsCount || 0,
              tempoLabel,
              overall: {
                latest: latest.overall_score || 0,
                direction: getDirection(latest.overall_score, earliest.overall_score),
              },
              brain: {
                latest: latest.brain_score || 0,
                direction: getDirection(latest.brain_score, earliest.brain_score),
              },
              body: {
                latest: latest.body_score || 0,
                direction: getDirection(latest.body_score, earliest.body_score),
              },
              bat: {
                latest: latest.bat_score || 0,
                direction: getDirection(latest.bat_score, earliest.bat_score),
              },
              ball: {
                latest: latest.ball_score || 0,
                direction: getDirection(latest.ball_score, earliest.ball_score),
              },
              comPct: bodyData?.com_max_forward_pct || undefined,
              headMovement: bodyData?.head_movement_inches || undefined,
              sequence: bodyData?.sequence_correct ? "Correct" : bodyData?.sequence_correct === false ? "In Review" : undefined,
              dashboardUrl,
            })
          );
        }
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
      reply_to: [SUPPORT_EMAIL],
      ...(sequence.email_number === 1 && {
        cc: [SUPPORT_EMAIL]
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
