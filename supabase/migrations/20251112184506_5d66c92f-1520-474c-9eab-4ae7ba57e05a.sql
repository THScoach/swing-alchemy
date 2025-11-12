-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role can manage webhook events
CREATE POLICY "Service role can manage webhook events"
ON public.webhook_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_webhook_events_event_id ON public.webhook_events(event_id);

-- Add org_name to teams table for renewal matching
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS org_name text;

-- Create index for faster renewal lookups
CREATE INDEX idx_teams_coach_org ON public.teams(coach_user_id, org_name) WHERE org_name IS NOT NULL;