-- Fix missing INSERT/UPDATE policies on households table.
-- Without these, client-side signup cannot create a household and
-- the Settings page cannot update the household name.

-- Allow any authenticated user to create a household (needed for signup)
CREATE POLICY "allow_insert_household" ON households
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow household members to update their own household
CREATE POLICY "allow_update_household" ON households
  FOR UPDATE USING (id = get_household_id());
