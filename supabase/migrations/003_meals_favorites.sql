-- Add week_start to meals for week-based filtering
ALTER TABLE meals ADD COLUMN IF NOT EXISTS week_start DATE;

-- Backfill existing meals based on their created_at
UPDATE meals SET week_start = DATE_TRUNC('week', created_at)::DATE WHERE week_start IS NULL;

-- Favorites bank
CREATE TABLE IF NOT EXISTS favorite_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) DEFAULT 'dinner',
  servings INTEGER DEFAULT 2,
  prep_time_minutes INTEGER,
  tags TEXT[],
  ingredients JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE favorite_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "household_members" ON favorite_meals FOR ALL USING (household_id = get_household_id());
