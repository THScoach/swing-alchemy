import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  playerId: string
  userId: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { playerId, userId }: RequestBody = await req.json()

    console.log('Scheduling onboarding for player:', playerId)

    // Check if player has any uploads already
    const { data: existingAnalyses, error: analysesError } = await supabase
      .from('video_analyses')
      .select('id')
      .eq('player_id', playerId)
      .limit(1)

    if (analysesError) {
      console.error('Error checking existing analyses:', analysesError)
      throw analysesError
    }

    // If player already has uploads, don't send onboarding
    if (existingAnalyses && existingAnalyses.length > 0) {
      console.log('Player already has uploads, skipping onboarding')
      return new Response(
        JSON.stringify({ message: 'Player already has uploads, skipping onboarding' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if onboarding sequence is already scheduled
    const { data: existingSequences, error: sequenceCheckError } = await supabase
      .from('email_sequences')
      .select('id')
      .eq('user_id', userId)
      .eq('sequence_name', 'new_player_onboarding')
      .eq('status', 'pending')

    if (sequenceCheckError) {
      console.error('Error checking sequences:', sequenceCheckError)
      throw sequenceCheckError
    }

    if (existingSequences && existingSequences.length > 0) {
      console.log('Onboarding already scheduled for this user')
      return new Response(
        JSON.stringify({ message: 'Onboarding already scheduled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete any existing pending sequences for this user
    await supabase
      .from('email_sequences')
      .delete()
      .eq('user_id', userId)
      .eq('sequence_name', 'new_player_onboarding')
      .eq('status', 'pending')

    // Schedule the 3-step onboarding sequence
    const scheduledEmails = [
      {
        user_id: userId,
        sequence_name: 'new_player_onboarding',
        email_number: 1,
        scheduled_at: new Date().toISOString(), // Day 0 - immediate
        metadata: { player_id: playerId }
      },
      {
        user_id: userId,
        sequence_name: 'new_player_onboarding',
        email_number: 2,
        scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day 2
        metadata: { player_id: playerId }
      },
      {
        user_id: userId,
        sequence_name: 'new_player_onboarding',
        email_number: 3,
        scheduled_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // Day 4
        metadata: { player_id: playerId }
      }
    ]

    const { error: insertError } = await supabase
      .from('email_sequences')
      .insert(scheduledEmails)

    if (insertError) {
      console.error('Error scheduling onboarding:', insertError)
      throw insertError
    }

    console.log('Successfully scheduled 3-step onboarding sequence')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Onboarding sequence scheduled',
        emails_scheduled: 3
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in schedule-player-onboarding:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
