import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GamePlanRequest {
  playerId: string;
  opponent?: string;
  pitcher?: string;
  pitchMix?: string[];
  velocityBand?: string;
  notes?: string;
  videoIds?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestData: GamePlanRequest = await req.json();

    // Get player and verify org access
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*, organization_id, organizations(subscription_tier)")
      .eq("id", requestData.playerId)
      .single();

    if (playerError || !player) {
      return new Response(
        JSON.stringify({ error: "Player not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check org membership
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", player.organization_id)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription tier for enterprise features
    const subscriptionTier = player.organizations?.subscription_tier || "team";
    if (subscriptionTier !== "enterprise") {
      return new Response(
        JSON.stringify({ error: "Enterprise subscription required for Game-Plan Generator" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get latest 4B scores
    const { data: scores } = await supabase
      .from("fourb_scores")
      .select("*")
      .eq("player_id", requestData.playerId)
      .order("session_date", { ascending: false })
      .limit(1)
      .single();

    // SERVER-SIDE GAME-PLAN GENERATION LOGIC
    // All intelligence and rules stay here - never exposed to frontend
    const gamePlan = generateGamePlan({
      player,
      scores,
      opponent: requestData.opponent,
      pitcher: requestData.pitcher,
      pitchMix: requestData.pitchMix || [],
      velocityBand: requestData.velocityBand,
      notes: requestData.notes,
    });

    // Log the action
    await supabase.from("audit_logs").insert({
      organization_id: player.organization_id,
      user_id: user.id,
      action: "gameplan_generated",
      resource_type: "gameplan",
      resource_id: requestData.playerId,
      metadata: {
        opponent: requestData.opponent,
        pitcher: requestData.pitcher,
      },
    });

    return new Response(JSON.stringify(gamePlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in gameplan-generate:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// SERVER-SIDE INTELLIGENCE - NEVER EXPOSE TO CLIENT
function generateGamePlan(params: any) {
  const { player, scores, opponent, pitcher, pitchMix, velocityBand, notes } = params;
  
  // Complex scoring and recommendation logic stays server-side
  const routine = {
    title: `Game Plan: ${player.name} vs ${opponent || 'Opponent'}`,
    date: new Date().toISOString(),
    
    // Brain focus
    brainFocus: determineBrainFocus(scores),
    
    // Body preparation
    bodyPrep: determineBodyPrep(scores),
    
    // Bat approach
    batApproach: determineBatApproach(scores, pitchMix, velocityBand),
    
    // Ball targeting
    ballTargets: determineBallTargets(scores, velocityBand),
    
    // Recommended drills (3-5 specific to this matchup)
    drills: generateDrills(scores, pitchMix, velocityBand),
    
    // Mental cues
    mentalCues: generateMentalCues(scores, opponent, pitcher),
    
    notes: notes || "",
  };

  return routine;
}

// These functions contain proprietary 4B scoring intelligence
function determineBrainFocus(scores: any) {
  if (!scores) return "Focus on pitch recognition fundamentals";
  
  const brainScore = scores.brain_score || 0;
  
  if (brainScore < 60) {
    return "Priority: Impulse control - work on not chasing";
  } else if (brainScore < 75) {
    return "Solid recognition - focus on anticipating off-speed";
  } else {
    return "Elite recognition - trust your instincts and attack early";
  }
}

function determineBodyPrep(scores: any) {
  if (!scores) return "Standard warm-up routine";
  
  const bodyScore = scores.body_score || 0;
  
  if (bodyScore < 65) {
    return "Extra time on sequencing drills - hips before hands";
  } else {
    return "Maintain your kinetic chain - you're in rhythm";
  }
}

function determineBatApproach(scores: any, pitchMix: string[], velocityBand?: string) {
  let approach = "Look fastball, adjust to off-speed";
  
  if (pitchMix.includes("breaking") && pitchMix.includes("off-speed")) {
    approach = "Stay back and let the ball travel";
  } else if (velocityBand === "high") {
    approach = "Quick hands, attack early in the zone";
  }
  
  return approach;
}

function determineBallTargets(scores: any, velocityBand?: string) {
  const ballScore = scores?.ball_score || 0;
  
  if (ballScore < 70) {
    return "Focus on center/gap contact - build confidence";
  } else {
    return "Elevate and drive - you're barreling consistently";
  }
}

function generateDrills(scores: any, pitchMix: string[], velocityBand?: string) {
  const drills = [];
  
  if (scores?.brain_score < 70) {
    drills.push("Pitch recognition on video (15 min)");
  }
  
  if (scores?.body_score < 70) {
    drills.push("Connection tee work (10 swings)");
  }
  
  if (pitchMix.includes("breaking")) {
    drills.push("Curveball machine (20 swings)");
  }
  
  drills.push("Dry swings visualizing pitcher (25 swings)");
  
  return drills;
}

function generateMentalCues(scores: any, opponent?: string, pitcher?: string) {
  return [
    "Breathe and see it early",
    "Stay connected and short",
    "Drive through the middle",
  ];
}
