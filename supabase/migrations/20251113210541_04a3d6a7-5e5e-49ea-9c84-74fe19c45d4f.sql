-- Enable RLS on all tables that need protection
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fourb_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bat_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ball_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Profiles: Users can view and update their own profile, admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Transactions: Users can view their own transactions, admins can view all
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (
    customer_email = (SELECT (raw_user_meta_data->>'email')::text FROM auth.users WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Communications: Users can view communications sent to them, admins can view all
CREATE POLICY "Users can view own communications" ON public.communications
  FOR SELECT USING (
    recipient_phone = (SELECT phone FROM public.profiles WHERE id = auth.uid())
    OR recipient_email = (SELECT (raw_user_meta_data->>'email')::text FROM auth.users WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Players: Already has proper RLS policies, no changes needed

-- Subscriptions: Users can view their own subscriptions, admins can view all
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Sessions: Already has proper RLS policies, no changes needed

-- Video Analyses: Already has proper RLS policies, no changes needed

-- FourB Scores: Already has proper RLS policies, no changes needed

-- Brain Data: Already has proper RLS policies, no changes needed

-- Body Data: Already has proper RLS policies, no changes needed

-- Bat Data: Already has proper RLS policies, no changes needed

-- Ball Data: Already has proper RLS policies, no changes needed