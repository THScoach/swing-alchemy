-- Create progress email subscriptions table
CREATE TABLE IF NOT EXISTS progress_email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('instant', 'weekly', 'off')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(player_id)
);

-- Enable RLS
ALTER TABLE progress_email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for progress_email_subscriptions
CREATE POLICY "Users can view email subscriptions for their players"
ON progress_email_subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = progress_email_subscriptions.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can insert email subscriptions for their players"
ON progress_email_subscriptions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = progress_email_subscriptions.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can update email subscriptions for their players"
ON progress_email_subscriptions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = progress_email_subscriptions.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all email subscriptions"
ON progress_email_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert/update subscriptions"
ON progress_email_subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_progress_email_subscriptions_updated_at
BEFORE UPDATE ON progress_email_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();