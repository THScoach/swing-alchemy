-- Create enum for content topics
CREATE TYPE content_topic AS ENUM ('Brain', 'Body', 'Bat', 'Ball');

-- Create enum for source platforms
CREATE TYPE source_platform AS ENUM ('Membership.io', 'YouTube', 'Upload', 'Manual');

-- Create enum for content types
CREATE TYPE content_type AS ENUM ('Video', 'Audio', 'Article', 'Course', 'Drill', 'Note');

-- Create notes table for Coach Rick Knowledge Base
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  body TEXT NOT NULL,
  source source_platform DEFAULT 'Manual',
  source_url TEXT,
  content_type content_type DEFAULT 'Note',
  topic content_topic,
  subtopics TEXT[],
  level_tags player_level[],
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with notes
CREATE POLICY "Admins can view all notes"
  ON public.notes FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert notes"
  ON public.notes FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notes"
  ON public.notes FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notes"
  ON public.notes FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- All authenticated users can read notes
CREATE POLICY "Authenticated users can view notes"
  ON public.notes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for efficient searching
CREATE INDEX idx_notes_topic ON public.notes(topic);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX idx_notes_level_tags ON public.notes USING GIN(level_tags);
CREATE INDEX idx_notes_source ON public.notes(source);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);