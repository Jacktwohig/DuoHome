-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Households (couples)
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Our Home',
  invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id),
  display_name TEXT,
  avatar_url TEXT,
  is_primary_member BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT CHECK (plan IN ('monthly', 'yearly')),
  status TEXT CHECK (status IN ('trialing', 'active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance: Bank accounts (connected via Plaid - stub)
CREATE TABLE finance_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'credit', 'investment')),
  balance NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  plaid_account_id TEXT,
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance: Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  account_id UUID REFERENCES finance_accounts(id),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_income BOOLEAN DEFAULT false,
  plaid_transaction_id TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance: Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  period TEXT CHECK (period IN ('weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
  start_date DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  allocated_amount NUMERIC(12,2) NOT NULL,
  color TEXT DEFAULT '#6366F1',
  icon TEXT DEFAULT 'circle'
);

-- Calendar: Events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#6366F1',
  recurrence TEXT,
  created_by UUID REFERENCES profiles(id),
  google_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chores
CREATE TABLE chores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  due_date DATE,
  recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'biweekly', 'monthly')),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  points INTEGER DEFAULT 10,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12,2),
  current_amount NUMERIC(12,2) DEFAULT 0,
  target_date DATE,
  category TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  due_date DATE
);

-- Meals
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  recipe_url TEXT,
  image_url TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) DEFAULT 'dinner',
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  servings INTEGER DEFAULT 2,
  prep_time_minutes INTEGER,
  tags TEXT[],
  ingredients JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grocery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT,
  category TEXT,
  is_checked BOOLEAN DEFAULT false,
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  frequency TEXT CHECK (frequency IN ('daily', 'weekly')) DEFAULT 'daily',
  target_count INTEGER DEFAULT 1,
  color TEXT DEFAULT '#06B6D4',
  icon TEXT DEFAULT 'circle',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES profiles(id),
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  UNIQUE(habit_id, completed_by, completed_date)
);

-- Notes & Documents
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes INTEGER,
  category TEXT CHECK (category IN ('insurance', 'legal', 'medical', 'financial', 'property', 'other')) DEFAULT 'other',
  expiry_date DATE,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities & Travel
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT CHECK (activity_type IN ('date', 'travel', 'event', 'restaurant', 'activity')) DEFAULT 'activity',
  start_date DATE,
  end_date DATE,
  location TEXT,
  cost NUMERIC(10,2),
  status TEXT CHECK (status IN ('wishlist', 'planned', 'completed')) DEFAULT 'wishlist',
  notes TEXT,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's household_id
CREATE OR REPLACE FUNCTION get_household_id()
RETURNS UUID AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- RLS: household members can see household data
CREATE POLICY "household_members" ON profiles FOR ALL USING (household_id = get_household_id() OR id = auth.uid());
CREATE POLICY "household_members" ON finance_accounts FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON transactions FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON budgets FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON budget_categories FOR ALL USING (budget_id IN (SELECT id FROM budgets WHERE household_id = get_household_id()));
CREATE POLICY "household_members" ON calendar_events FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON chores FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON goals FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON goal_milestones FOR ALL USING (goal_id IN (SELECT id FROM goals WHERE household_id = get_household_id()));
CREATE POLICY "household_members" ON meal_plans FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON meals FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON grocery_items FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON habits FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON habit_logs FOR ALL USING (habit_id IN (SELECT id FROM habits WHERE household_id = get_household_id()));
CREATE POLICY "household_members" ON notes FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON documents FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON activities FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON subscriptions FOR ALL USING (household_id = get_household_id());
CREATE POLICY "household_members" ON households FOR SELECT USING (id = get_household_id());
