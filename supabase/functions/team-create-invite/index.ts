import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { render } from "https://esm.sh/@react-email/render@0.0.15";
import React from "https://esm.sh/react@18.2.0";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "https://esm.sh/@react-email/components@0.0.15";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_URL") || "https://app.4bhitting.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[TEAM-CREATE-INVITE] ${step}${detailsStr}`);
};

// Team invite email template
const TeamInviteEmail = ({ coachName, teamName, joinUrl, supportEmail }: any) =>
  React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Preview, null, `You're invited to join ${teamName}`),
    React.createElement(Body, { style: { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }},
      React.createElement(Container, { style: { margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' }},
        React.createElement(Heading, { style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}, `⚾ Join ${teamName}`),
        React.createElement(Text, { style: { fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}, 
          `${coachName} invited you to join their team on The Hitting Skool.`
        ),
        React.createElement(Text, { style: { fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }},
          "You'll get access to:",
          React.createElement('br'),
          "• The Hitting Skool Community",
          React.createElement('br'),
          "• 4B Biomechanics Training",
          React.createElement('br'),
          "• Player Progress Tracking",
          React.createElement('br'),
          "• Personalized Drill Recommendations"
        ),
        React.createElement(Link, { 
          href: joinUrl, 
          style: { 
            backgroundColor: '#FFD700', 
            borderRadius: '5px', 
            color: '#000', 
            display: 'inline-block', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            padding: '12px 24px', 
            textDecoration: 'none',
            margin: '20px 0'
          }
        }, "Accept Invitation →"),
        React.createElement(Text, { style: { fontSize: '14px', color: '#666', marginTop: '32px' }},
          "This invitation expires in 30 days. If you have questions, contact ",
          React.createElement(Link, { href: `mailto:${supportEmail}`, style: { color: '#2754C5' }}, supportEmail)
        )
      )
    )
  );

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Parse request
    const { teamId, email, playerName } = await req.json();
    if (!teamId) throw new Error("teamId is required");

    logStep("Request parsed", { teamId, email });

    // Verify coach owns this team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*, team_members(count)")
      .eq("id", teamId)
      .eq("coach_user_id", user.id)
      .single();

    if (teamError || !team) {
      throw new Error("Team not found or access denied");
    }

    logStep("Team verified", { teamId: team.id, name: team.name });

    // Check if team is expired
    if (new Date(team.expires_on) < new Date()) {
      throw new Error("Team access has expired");
    }

    // Check seat limit
    const { count: activeMembers } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", teamId)
      .eq("status", "active");

    if ((activeMembers ?? 0) >= team.player_limit) {
      throw new Error("Team is full");
    }

    // Generate invite token and create invite
    const { data: invite, error: inviteError } = await supabase
      .from("team_invites")
      .insert({
        team_id: teamId,
        email: email || null,
        status: email ? "sent" : "created",
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    logStep("Invite created", { inviteId: invite.id, token: invite.token });

    // Create team_member row if email provided
    if (email) {
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: teamId,
          player_email: email,
          player_name: playerName || null,
          status: "invited",
        });

      if (memberError && memberError.code !== "23505") { // Ignore duplicate errors
        logStep("Warning: Could not create team member", { error: memberError });
      }
    }

    // Build join URL
    const appUrl = Deno.env.get("APP_URL") || "https://app.4bhitting.com";
    const joinUrl = `${appUrl}/team/join?token=${invite.token}`;

    // Send email if email provided and RESEND_API_KEY is set
    if (email && Deno.env.get("RESEND_API_KEY")) {
      try {
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        const coachName = profile?.name || "Your coach";
        const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "support@4bhitting.com";
        const fromBrand = Deno.env.get("FROM_BRAND") || "Coach Rick @ The Hitting Skool";

        const html = render(
          TeamInviteEmail({
            coachName,
            teamName: team.name,
            joinUrl,
            supportEmail,
          })
        );

        await resend.emails.send({
          from: `${fromBrand} <noreply@4bhitting.com>`,
          to: email,
          reply_to: supportEmail,
          subject: `You're invited to join ${team.name}`,
          html,
        });

        logStep("Email sent", { email });

        // Update invite status
        await supabase
          .from("team_invites")
          .update({ status: "sent" })
          .eq("id", invite.id);
      } catch (emailError) {
        logStep("Email sending failed", { error: emailError });
        
        // Log email failure to webhook_events for monitoring
        try {
          await supabase.from("webhook_events").insert({
            event_id: `email_failure_${Date.now()}`,
            event_type: "email.invite_failed",
            processed_at: new Date().toISOString(),
          });
        } catch (logError) {
          logStep("Failed to log email error", { error: logError });
        }
        
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        joinUrl,
        inviteId: invite.id,
        token: invite.token,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
