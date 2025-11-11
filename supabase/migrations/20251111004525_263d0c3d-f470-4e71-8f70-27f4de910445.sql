-- Add contact timing and metadata fields to video_analyses table
ALTER TABLE video_analyses 
ADD COLUMN contact_frame integer,
ADD COLUMN fps integer,
ADD COLUMN contact_time_ms numeric,
ADD COLUMN uploaded_by uuid REFERENCES auth.users(id),
ADD COLUMN camera_angle text,
ADD COLUMN hitter_side text;