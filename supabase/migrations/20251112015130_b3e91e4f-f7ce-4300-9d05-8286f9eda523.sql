-- Update schedule_hybrid_onboarding function to include Day 7 email
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

  -- Schedule Email 4 - Day 7 Progress Check-in (7 days later)
  INSERT INTO public.email_sequences (user_id, sequence_name, email_number, scheduled_at)
  VALUES (p_user_id, 'hybrid_onboarding', 4, now() + interval '7 days');
END;
$$;