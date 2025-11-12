-- Create email sequences tracking table
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_name TEXT NOT NULL,
  email_number INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for efficient querying
CREATE INDEX idx_email_sequences_user_id ON public.email_sequences(user_id);
CREATE INDEX idx_email_sequences_scheduled_at ON public.email_sequences(scheduled_at);
CREATE INDEX idx_email_sequences_status ON public.email_sequences(status);

-- Enable RLS
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

-- Users can view their own email sequences
CREATE POLICY "Users can view their own email sequences"
  ON public.email_sequences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all sequences
CREATE POLICY "Service role can manage all sequences"
  ON public.email_sequences
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_email_sequences_updated_at
  BEFORE UPDATE ON public.email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to schedule Hybrid onboarding sequence
CREATE OR REPLACE FUNCTION public.schedule_hybrid_onboarding(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete any existing pending sequences for this user
  DELETE FROM public.email_sequences 
  WHERE user_id = p_user_id 
    AND sequence_name = 'hybrid_onboarding' 
    AND status = 'pending';

  -- Schedule Email 1 (immediate)
  INSERT INTO public.email_sequences (user_id, sequence_name, email_number, scheduled_at)
  VALUES (p_user_id, 'hybrid_onboarding', 1, now());

  -- Schedule Email 2 (24 hours later)
  INSERT INTO public.email_sequences (user_id, sequence_name, email_number, scheduled_at)
  VALUES (p_user_id, 'hybrid_onboarding', 2, now() + interval '24 hours');

  -- Schedule Email 3 (48 hours later)
  INSERT INTO public.email_sequences (user_id, sequence_name, email_number, scheduled_at)
  VALUES (p_user_id, 'hybrid_onboarding', 3, now() + interval '48 hours');
END;
$$;