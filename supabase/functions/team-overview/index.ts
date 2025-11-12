import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_URL") || "https://app.4bhitting.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[TEAM-OVERVIEW] ${step}${detailsStr}`);
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
    if (!user) throw new Error("User not authenticated");

    // Get teamId from query params
    const url = new URL(req.url);
    const teamId = url.searchParams.get("teamId");
    if (!teamId) throw new Error("teamId is required");

    logStep("Request parsed", { teamId, userId: user.id });

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*, team_passes(*)")
      .eq("id", teamId)
      .eq("coach_user_id", user.id)
      .single();

    if (teamError || !team) {
      throw new Error("Team not found or access denied");
    }

    logStep("Team found", { teamId: team.id, name: team.name });

    // Get roster (team members)
    const { data: roster, error: rosterError } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .order("status", { ascending: true })
      .order("joined_at", { ascending: false });

    if (rosterError) {
      logStep("Error fetching roster", { error: rosterError });
    }

    // Get last activity for each active member
    const activePlayerIds = roster
      ?.filter(m => m.player_user_id && m.status === "active")
      .map(m => m.player_user_id) || [];

    let lastActivity: Array<{ player_id: string; last_upload_at: string }> = [];
    if (activePlayerIds.length > 0) {
      const { data: activityData } = await supabase
        .from("video_analyses")
        .select("player_id, created_at")
        .in("player_id", activePlayerIds)
        .order("created_at", { ascending: false });

      // Group by player_id and get most recent
      const activityMap = new Map();
      activityData?.forEach(activity => {
        if (!activityMap.has(activity.player_id)) {
          activityMap.set(activity.player_id, activity.created_at);
        }
      });

      lastActivity = Array.from(activityMap, ([player_id, created_at]) => ({
        player_id,
        last_upload_at: created_at,
      }));
    }

    // Calculate seats used/remaining
    const seatsUsed = roster?.filter(m => m.status === "active").length || 0;
    const seatsRemaining = team.player_limit - seatsUsed;

    // Build join link
    const appUrl = Deno.env.get("APP_URL") || "https://app.4bhitting.com";
    const joinUrl = `${appUrl}/coach/teams/${teamId}/invites`;

    // Calculate days until expiry
    const daysUntilExpiry = Math.ceil(
      (new Date(team.expires_on).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return new Response(
      JSON.stringify({ 
        team: {
          id: team.id,
          name: team.name,
          coach_email: team.coach_email,
          player_limit: team.player_limit,
          expires_on: team.expires_on,
          status: team.status,
          created_at: team.created_at,
          days_until_expiry: daysUntilExpiry,
        },
        passes: team.team_passes,
        seatsUsed,
        seatsRemaining,
        joinUrl,
        roster: roster || [],
        lastActivity: lastActivity || [],
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
