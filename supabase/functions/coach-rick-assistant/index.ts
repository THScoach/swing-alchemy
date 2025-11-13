import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, phoneNumber, swingScoreData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get user context and upcoming sessions
    let userContext = '';
    let sessionData = null;

    if (userId) {
      // Get player data
      const { data: players } = await supabase
        .from('players')
        .select('id, name')
        .eq('profile_id', userId)
        .limit(1);

      if (players && players.length > 0) {
        const player = players[0];
        
        // Get upcoming sessions
        const { data: sessions } = await supabase
          .from('sessions')
          .select('*')
          .eq('player_id', player.id)
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(3);

        if (sessions && sessions.length > 0) {
          sessionData = sessions;
          userContext = `\n\nUSER CONTEXT:\nPlayer: ${player.name}\nUpcoming sessions:\n`;
          sessions.forEach((s) => {
            const date = new Date(s.scheduled_at);
            userContext += `- ${s.session_type} on ${date.toLocaleDateString()} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}\n`;
          });
        } else {
          userContext = `\n\nUSER CONTEXT:\nPlayer: ${player.name}\nNo upcoming sessions booked.`;
        }
      }
    }

    // Add swing score data to context
    if (swingScoreData) {
      userContext += `\n\nLATEST SWING ANALYSIS (3-Pillar System):
- Anchor: ${swingScoreData.anchor_score}/100 (rear leg stability, COM control)
- Stability: ${swingScoreData.stability_score}/100 (kinematic sequence)
- Whip: ${swingScoreData.whip_score}/100 (bat lag, distal whip)
- Overall: ${swingScoreData.overall_swing_score}/100

When discussing swing mechanics:
- Use biomechanically accurate language (COM control, kinematic sequence, double pendulum)
- Identify lowest sub-metrics as root causes
- Prioritize 2-3 specific issues to address
- Map drills to categories: Anchor (rear leg/COM), Stability (sequence/trunk), Whip (bat lag/hand path)`;
    }

    // Coach Rick system prompt
    const systemPrompt = `You are Coach Rick's AI Assistant for The Hitting Skool 4B System.
Your job is to help players and parents with scheduling, directions, basic program questions, and simple prep instructions.

CRITICAL RULES:
- Speak in Coach Rick's voice: grounded, clear, encouraging, short
- Use pattern: Observation → Meaning → Cue → Encouragement when giving advice
- NEVER say "as an AI" or "I'm a bot" - you are "Coach Rick's assistant"
- Keep replies UNDER 80 WORDS unless user explicitly asks for more detail
- If unsure or needs human approval: "I'll flag this for Coach Rick and we'll confirm with you shortly."

FACILITY INFO:
Location: 2013 Hitzert Court, Fenton, Missouri 63026
Maps: https://maps.google.com/?q=2013+Hitzert+Court,+Fenton,+Missouri+63026
Phone/SMS: 314-784-1322

INTENT ROUTING:

GET_DIRECTIONS (keywords: address, where, location, directions):
"We train at 2013 Hitzert Court, Fenton, MO 63026. Here's the map: https://maps.google.com/?q=2013+Hitzert+Court,+Fenton,+Missouri+63026. Aim to arrive 10–15 minutes early."

CONFIRM_SESSION (keywords: what time, confirm, do I have):
If session found: "You're booked for [SESSION_TYPE] on [DATE] at [TIME]. If anything changes, text 'reschedule'."
If not found: "I don't see a session under this number yet. Drop your full name and I'll look it up."

RESCHEDULE_REQUEST (keywords: reschedule, can't make it, need to change):
"Got you. Tell me which date/time you can't make and your preferred new window. I'll queue this for Coach Rick to confirm."

CANCEL_REQUEST (keywords: cancel):
"Understood. I'll mark your request to cancel [SESSION_TYPE] on [DATE]. You'll get a confirmation message once processed."

PROGRAM_INFO (keywords: pods, 4B eval, nine inning, pricing, how does it work):
- 4B Eval: "4B Evaluation is a 90-min data session: Brain, Body, Bat, Ball. $299 with a full report and plan."
- Pods: "Pods are 3-player groups, 90 minutes, rotating strength/movement/ball data. $399/mo, 3-month minimum."
- Nine-Inning: "Nine-Inning is an 8-week rebuild program. $997 with eval, sessions, and post-test."

PREP_INSTRUCTIONS (keywords: what do I bring, how do I prep):
"Bring your bat, turfs/cleats, and any sensors you use. Wear something you can move in. Show up 10–15 min early to stretch."

LATE_OR_ETA (keywords: running late, 5 min late):
"Thanks for the heads up. Drive safe. We'll adjust your reps when you get here."

SAFETY/ESCALATION:
- Never discuss payment adjustments, refunds, or medical issues → "That one needs a human. I'll flag it for Coach Rick's staff."
- If angry/abusive language → Stay calm, short, flag for review

${userContext}`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 200, // Keep responses concise
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            reply: "Hey, we're getting a lot of messages right now. Text back in a minute and I'll help you out."
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Payment required',
            reply: "System's temporarily down. Call 314-784-1322 for immediate help."
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Log interaction
    console.log('Coach Rick AI interaction:', {
      userId,
      phoneNumber,
      message: message.substring(0, 100),
      reply: reply.substring(0, 100),
      hasSessionContext: !!sessionData
    });

    return new Response(
      JSON.stringify({ 
        reply,
        sessionContext: sessionData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in coach-rick-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        reply: "System hiccup. Call 314-784-1322 and we'll get you sorted."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
