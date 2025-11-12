import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[TEAM-CLAIM] ${step}${detailsStr}`);
};

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
    if (!user?.email) throw new Error("User email not found");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request
    const { token: inviteToken } = await req.json();
    if (!inviteToken) throw new Error("Invite token is required");

    logStep("Claiming invite", { token: inviteToken });

    // Look up invite
    const { data: invite, error: inviteError } = await supabase
      .from("team_invites")
      .select("*, teams(*)")
      .eq("token", inviteToken)
      .single();

    if (inviteError || !invite) {
      throw new Error("Invalid or expired invite");
    }

    // Check if invite is still valid
    if (invite.status === "claimed") {
      throw new Error("This invite has already been used");
    }

    if (invite.status === "expired" || new Date(invite.expires_at) < new Date()) {
      throw new Error("This invite has expired");
    }

    // Check if team is expired
    if (new Date(invite.teams.expires_on) < new Date()) {
      throw new Error("Team access has expired");
    }

    logStep("Invite validated", { inviteId: invite.id, teamId: invite.team_id });

    // Check seat limit
    const { count: activeMembers } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_id", invite.team_id)
      .eq("status", "active");

    if ((activeMembers ?? 0) >= invite.teams.player_limit) {
      throw new Error("Team is full");
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    // Upsert team member (match by email if exists, otherwise create new)
    const { error: memberError } = await supabase
      .from("team_members")
      .upsert({
        team_id: invite.team_id,
        player_user_id: user.id,
        player_email: user.email,
        player_name: profile?.name || user.email,
        status: "active",
        joined_at: new Date().toISOString(),
      }, {
        onConflict: "team_id,player_email",
      });

    if (memberError) {
      logStep("Error creating team member", { error: memberError });
      throw new Error("Failed to join team");
    }

    // Mark invite as claimed
    await supabase
      .from("team_invites")
      .update({ status: "claimed" })
      .eq("id", invite.id);

    logStep("Invite claimed successfully", { userId: user.id, teamId: invite.team_id });

    return new Response(
      JSON.stringify({ 
        success: true,
        teamId: invite.team_id,
        teamName: invite.teams.name,
        redirectTo: "/my-progress",
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
