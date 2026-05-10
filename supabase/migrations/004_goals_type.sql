-- Add goal tracking type and optional unit
ALTER TABLE goals ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'none' CHECK (goal_type IN ('none', 'monetary', 'count'));
ALTER TABLE goals ADD COLUMN IF NOT EXISTS unit TEXT;
