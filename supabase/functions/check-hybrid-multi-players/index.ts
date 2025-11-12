import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, data?: any) => {
  const detailsStr = data ? ` - ${JSON.stringify(data)}` : '';
  console.log(`[CHECK-HYBRID-MULTI-PLAYERS] ${step}${detailsStr}`);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    logStep('Function started')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all users with Hybrid_Coaching subscription
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, subscription_tier')
      .eq('subscription_tier', 'Hybrid_Coaching')

    if (profilesError) {
      logStep('Error fetching profiles', { error: profilesError })
      throw profilesError
    }

    logStep('Found Hybrid Coaching members', { count: profiles?.length || 0 })

    let sequencesScheduled = 0
    let sequencesSkipped = 0

    for (const profile of profiles || []) {
      logStep('Processing hybrid member', { userId: profile.id, name: profile.name })

      // Count players managed by this user
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id')
        .eq('profile_id', profile.id)

      if (playersError) {
        logStep('Error fetching players', { userId: profile.id, error: playersError })
        continue
      }

      const playerCount = players?.length || 0
      logStep('Player count', { userId: profile.id, count: playerCount })

      // Trigger upgrade sequence if managing 3+ players
      if (playerCount >= 3) {
        logStep('Hybrid member managing 3+ players', { userId: profile.id, playerCount })

        // Check if already on team plan or if sequence already scheduled
        const { data: existingSequences, error: sequenceError } = await supabase
          .from('email_sequences')
          .select('id')
          .eq('user_id', profile.id)
          .eq('sequence_name', 'hybrid_to_team_upgrade')
          .eq('status', 'pending')

        if (sequenceError) {
          logStep('Error checking sequences', { error: sequenceError })
          continue
        }

        if (existingSequences && existingSequences.length > 0) {
          logStep('Upgrade sequence already scheduled', { userId: profile.id })
          sequencesSkipped++
          continue
        }

        // Check if user already has an organization (already upgraded)
        const { data: orgMembers } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', profile.id)
          .limit(1)

        if (orgMembers && orgMembers.length > 0) {
          logStep('User already part of team organization', { userId: profile.id })
          sequencesSkipped++
          continue
        }

        // Schedule 3-step hybrid-to-team upgrade sequence
        const now = new Date()
        const scheduledEmails = [
          {
            user_id: profile.id,
            sequence_name: 'hybrid_to_team_upgrade',
            email_number: 1,
            scheduled_at: now.toISOString(), // Day 0 - immediate
            metadata: { 
              player_count: playerCount,
              trigger_reason: 'multiple_players'
            }
          },
          {
            user_id: profile.id,
            sequence_name: 'hybrid_to_team_upgrade',
            email_number: 2,
            scheduled_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Day 3
            metadata: { 
              player_count: playerCount
            }
          },
          {
            user_id: profile.id,
            sequence_name: 'hybrid_to_team_upgrade',
            email_number: 3,
            scheduled_at: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(), // Day 6
            metadata: { 
              player_count: playerCount
            }
          }
        ]

        const { error: insertError } = await supabase
          .from('email_sequences')
          .insert(scheduledEmails)

        if (insertError) {
          logStep('Error scheduling upgrade sequence', { userId: profile.id, error: insertError })
          continue
        }

        logStep('Hybrid-to-team upgrade sequence scheduled', { userId: profile.id, emails: 3 })
        sequencesScheduled++
      } else {
        logStep('Hybrid member below threshold', { userId: profile.id, playerCount })
      }
    }

    logStep('Processing complete', { scheduled: sequencesScheduled, skipped: sequencesSkipped })

    return new Response(
      JSON.stringify({ 
        success: true,
        members_checked: profiles?.length || 0,
        sequences_scheduled: sequencesScheduled,
        sequences_skipped: sequencesSkipped
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    logStep('ERROR', { message: error.message })
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
