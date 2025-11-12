import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const logStep = (step: string, data?: any) => {
  const detailsStr = data ? ` - ${JSON.stringify(data)}` : '';
  console.log(`[CHECK-TEAM-CAPACITY] ${step}${detailsStr}`);
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

    // Get all team organizations (subscription_tier = 'team')
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, subscription_tier')
      .eq('subscription_tier', 'team')

    if (orgsError) {
      logStep('Error fetching organizations', { error: orgsError })
      throw orgsError
    }

    logStep('Found team organizations', { count: organizations?.length || 0 })

    let sequencesScheduled = 0
    let sequencesSkipped = 0

    for (const org of organizations || []) {
      logStep('Processing organization', { orgId: org.id, name: org.name })

      // Count active players in this organization
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, profile_id')
        .eq('organization_id', org.id)

      if (playersError) {
        logStep('Error fetching players', { orgId: org.id, error: playersError })
        continue
      }

      const playerCount = players?.length || 0
      logStep('Player count', { orgId: org.id, count: playerCount })

      // Determine seat capacity based on subscription tier
      // This should ideally be stored in a team_accounts table with seat_limit field
      // For now, using standard tiers: 10, 15, 25
      let seatLimit = 10 // Default starter tier

      // You would need to query a team_accounts or similar table here
      // For this example, we'll infer from player count ranges
      if (playerCount > 15) {
        seatLimit = 25
      } else if (playerCount > 10) {
        seatLimit = 15
      }

      const usagePercent = seatLimit > 0 ? playerCount / seatLimit : 0
      logStep('Usage calculated', { orgId: org.id, playerCount, seatLimit, usagePercent })

      // Trigger expansion sequence if >= 90% capacity
      if (usagePercent >= 0.9) {
        logStep('Organization at 90%+ capacity', { orgId: org.id, usagePercent })

        // Get organization admin/owner to send email
        const { data: orgMembers, error: membersError } = await supabase
          .from('organization_members')
          .select('user_id, role')
          .eq('organization_id', org.id)
          .eq('role', 'admin')
          .limit(1)

        if (membersError || !orgMembers || orgMembers.length === 0) {
          logStep('No admin found for organization', { orgId: org.id })
          sequencesSkipped++
          continue
        }

        const adminUserId = orgMembers[0].user_id

        // Check if expansion sequence already scheduled
        const { data: existingSequences, error: sequenceError } = await supabase
          .from('email_sequences')
          .select('id')
          .eq('user_id', adminUserId)
          .eq('sequence_name', 'team_expansion')
          .eq('status', 'pending')

        if (sequenceError) {
          logStep('Error checking sequences', { error: sequenceError })
          continue
        }

        if (existingSequences && existingSequences.length > 0) {
          logStep('Expansion sequence already scheduled', { orgId: org.id })
          sequencesSkipped++
          continue
        }

        // Schedule 3-step expansion sequence
        const now = new Date()
        const scheduledEmails = [
          {
            user_id: adminUserId,
            sequence_name: 'team_expansion',
            email_number: 1,
            scheduled_at: now.toISOString(), // Day 0 - immediate
            metadata: { 
              organization_id: org.id,
              current_seats: seatLimit,
              player_count: playerCount,
              usage_percent: usagePercent
            }
          },
          {
            user_id: adminUserId,
            sequence_name: 'team_expansion',
            email_number: 2,
            scheduled_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day 2
            metadata: { 
              organization_id: org.id,
              current_seats: seatLimit
            }
          },
          {
            user_id: adminUserId,
            sequence_name: 'team_expansion',
            email_number: 3,
            scheduled_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Day 5
            metadata: { 
              organization_id: org.id,
              current_seats: seatLimit
            }
          }
        ]

        const { error: insertError } = await supabase
          .from('email_sequences')
          .insert(scheduledEmails)

        if (insertError) {
          logStep('Error scheduling expansion sequence', { orgId: org.id, error: insertError })
          continue
        }

        logStep('Expansion sequence scheduled', { orgId: org.id, emails: 3 })
        sequencesScheduled++
      } else {
        logStep('Organization below capacity threshold', { orgId: org.id, usagePercent })
      }
    }

    logStep('Processing complete', { scheduled: sequencesScheduled, skipped: sequencesSkipped })

    return new Response(
      JSON.stringify({ 
        success: true,
        organizations_checked: organizations?.length || 0,
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
