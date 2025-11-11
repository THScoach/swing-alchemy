-- Add missing enum values to context_tag
-- First check if values exist, then add them if they don't
DO $$ 
BEGIN
  -- Add 'Practice' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Practice' AND enumtypid = 'context_tag'::regtype) THEN
    ALTER TYPE context_tag ADD VALUE 'Practice';
  END IF;
  
  -- Add 'Game' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Game' AND enumtypid = 'context_tag'::regtype) THEN
    ALTER TYPE context_tag ADD VALUE 'Game';
  END IF;
  
  -- Add 'Drill' if it doesn't exist  
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'Drill' AND enumtypid = 'context_tag'::regtype) THEN
    ALTER TYPE context_tag ADD VALUE 'Drill';
  END IF;
END $$;