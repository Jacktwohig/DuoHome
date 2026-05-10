-- Ensure habit_logs has RLS and a working policy
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "household_members" ON habit_logs;
CREATE POLICY "household_members" ON habit_logs FOR ALL USING (
  habit_id IN (SELECT id FROM habits WHERE household_id = get_household_id())
) WITH CHECK (
  habit_id IN (SELECT id FROM habits WHERE household_id = get_household_id())
);
