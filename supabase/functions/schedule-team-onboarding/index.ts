import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  organizationId: string
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

    const { organizationId, userId }: RequestBody = await req.json()

    console.log('Scheduling team onboarding for organization:', organizationId)

    // Check if onboarding sequence is already scheduled
    const { data: existingSequences, error: sequenceCheckError } = await supabase
      .from('email_sequences')
      .select('id')
      .eq('user_id', userId)
      .eq('sequence_name', 'team_coach_onboarding')
      .eq('status', 'pending')

    if (sequenceCheckError) {
      console.error('Error checking sequences:', sequenceCheckError)
      throw sequenceCheckError
    }

    if (existingSequences && existingSequences.length > 0) {
      console.log('Team onboarding already scheduled for this user')
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
      .eq('sequence_name', 'team_coach_onboarding')
      .eq('status', 'pending')

    // Schedule the team onboarding sequence
    const now = new Date()
    const scheduledEmails = [
      {
        user_id: userId,
        sequence_name: 'team_coach_onboarding',
        email_number: 1,
        scheduled_at: now.toISOString(), // Day 0 - immediate
        metadata: { organization_id: organizationId }
      },
      {
        user_id: userId,
        sequence_name: 'team_coach_onboarding',
        email_number: 2,
        scheduled_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Day 3
        metadata: { organization_id: organizationId }
      },
      {
        user_id: userId,
        sequence_name: 'team_coach_onboarding',
        email_number: 3,
        scheduled_at: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Day 10
        metadata: { organization_id: organizationId }
      },
      {
        user_id: userId,
        sequence_name: 'team_coach_onboarding',
        email_number: 5,
        scheduled_at: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(), // Day 60
        metadata: { organization_id: organizationId }
      }
    ]

    const { error: insertError } = await supabase
      .from('email_sequences')
      .insert(scheduledEmails)

    if (insertError) {
      console.error('Error scheduling team onboarding:', insertError)
      throw insertError
    }

    console.log('Successfully scheduled team onboarding sequence')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Team onboarding sequence scheduled',
        emails_scheduled: 4
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in schedule-team-onboarding:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
