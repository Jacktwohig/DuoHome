// DuoHome Shared TypeScript Types

export interface Household {
  id: string;
  name: string;
  invite_token: string;
  created_at: string;
}

export interface Profile {
  id: string;
  household_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_primary_member: boolean;
  trial_ends_at: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  household_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'monthly' | 'yearly' | null;
  status: 'trialing' | 'active' | 'canceled' | 'past_due' | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceAccount {
  id: string;
  household_id: string;
  name: string;
  institution: string | null;
  account_type: 'checking' | 'savings' | 'credit' | 'investment' | null;
  balance: number;
  currency: string;
  plaid_account_id: string | null;
  is_manual: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  household_id: string;
  account_id: string | null;
  amount: number;
  description: string;
  category: string | null;
  transaction_date: string;
  is_income: boolean;
  plaid_transaction_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  household_id: string;
  name: string;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  created_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  name: string;
  allocated_amount: number;
  color: string;
  icon: string;
}

export interface CalendarEvent {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  color: string;
  recurrence: string | null;
  created_by: string | null;
  google_event_id: string | null;
  created_at: string;
}

export interface Chore {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  recurrence: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: 'low' | 'medium' | 'high';
  points: number;
  created_by: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  target_amount: number | null;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  is_completed: boolean;
  created_by: string | null;
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  is_completed: boolean;
  due_date: string | null;
}

export interface MealPlan {
  id: string;
  household_id: string;
  week_start: string;
  created_at: string;
}

export interface Meal {
  id: string;
  meal_plan_id: string | null;
  household_id: string;
  name: string;
  description: string | null;
  recipe_url: string | null;
  image_url: string | null;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day_of_week: number | null;
  servings: number;
  prep_time_minutes: number | null;
  tags: string[] | null;
  ingredients: Record<string, unknown> | null;
  created_at: string;
}

export interface GroceryItem {
  id: string;
  household_id: string;
  name: string;
  quantity: string | null;
  category: string | null;
  is_checked: boolean;
  added_by: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  frequency: 'daily' | 'weekly';
  target_count: number;
  color: string;
  icon: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  completed_by: string | null;
  completed_date: string;
  count: number;
}

export interface Note {
  id: string;
  household_id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  household_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  category: 'insurance' | 'legal' | 'medical' | 'financial' | 'property' | 'other';
  expiry_date: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  activity_type: 'date' | 'travel' | 'event' | 'restaurant' | 'activity';
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  cost: number | null;
  status: 'wishlist' | 'planned' | 'completed';
  notes: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
}

// Utility types
export type PlanType = 'monthly' | 'yearly';
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due';
export type ActivityType = 'date' | 'travel' | 'event' | 'restaurant' | 'activity';
export type ActivityStatus = 'wishlist' | 'planned' | 'completed';
export type ChoreRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type ChorePriority = 'low' | 'medium' | 'high';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DocumentCategory = 'insurance' | 'legal' | 'medical' | 'financial' | 'property' | 'other';
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment';
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
export type HabitFrequency = 'daily' | 'weekly';

// AI Meal Suggestion type
export interface MealSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  prep_time_minutes: number;
  tags: string[];
  meal_type: MealType;
  servings: number;
}
