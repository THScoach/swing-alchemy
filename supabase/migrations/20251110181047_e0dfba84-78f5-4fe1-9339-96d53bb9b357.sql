-- Create user roles table and enum
CREATE TYPE public.app_role AS ENUM ('user', 'coach', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  date_of_birth DATE,
  dominant_hand TEXT CHECK (dominant_hand IN ('left', 'right')),
  height INTEGER,
  gender TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'self_service', 'group_coaching', 'one_on_one', 'team', 'enterprise')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile and role on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update players table to reference profiles
ALTER TABLE public.players
DROP COLUMN IF EXISTS user_id CASCADE;

ALTER TABLE public.players
ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update RLS policies for players table
DROP POLICY IF EXISTS "Users can view their own players" ON public.players;
DROP POLICY IF EXISTS "Users can create their own players" ON public.players;
DROP POLICY IF EXISTS "Users can update their own players" ON public.players;
DROP POLICY IF EXISTS "Users can delete their own players" ON public.players;

CREATE POLICY "Users can view their own players"
ON public.players
FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own players"
ON public.players
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own players"
ON public.players
FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own players"
ON public.players
FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- Update video_analyses RLS policies
DROP POLICY IF EXISTS "Users can view analyses for their players" ON public.video_analyses;
DROP POLICY IF EXISTS "Users can create analyses for their players" ON public.video_analyses;
DROP POLICY IF EXISTS "Users can update analyses for their players" ON public.video_analyses;
DROP POLICY IF EXISTS "Users can delete analyses for their players" ON public.video_analyses;

CREATE POLICY "Users can view analyses for their players"
ON public.video_analyses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = video_analyses.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can create analyses for their players"
ON public.video_analyses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = video_analyses.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can update analyses for their players"
ON public.video_analyses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = video_analyses.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can delete analyses for their players"
ON public.video_analyses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = video_analyses.player_id
    AND players.profile_id = auth.uid()
  )
);