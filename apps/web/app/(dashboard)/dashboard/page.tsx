"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, addDays, startOfWeek, startOfDay } from "date-fns";
import {
  TrendingUp, CalendarDays, CheckSquare, Target, UtensilsCrossed,
  Flame, MapPin, ArrowRight, DollarSign, Clock,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, percentage } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; display_name: string | null };
type Transaction = { id: string; description: string; amount: number; category: string | null; transaction_date: string; is_income: boolean };
type CalEvent = { id: string; title: string; start_at: string; color: string };
type Chore = { id: string; title: string; assigned_to: string | null; priority: string; is_completed: boolean };
type Meal = { id: string; name: string; meal_type: string; day_of_week: number };
type Habit = { id: string; title: string; icon: string; color: string };
type HabitLog = { habit_id: string; completed_date: string };
type Goal = { id: string; title: string; goal_type: string | null; target_amount: number | null; current_amount: number; unit: string | null; is_completed: boolean; milestones?: { is_completed: boolean }[] };
type Activity = { id: string; title: string; activity_type: string; start_date: string | null; status: string; cost: number | null };

const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#6366F1", Groceries: "#10B981", Transport: "#F59E0B",
  Entertainment: "#EF4444", Food: "#F97316", Health: "#EC4899",
  Shopping: "#8B5CF6", Other: "#64748B",
};

const PRIORITY_COLORS: Record<string, string> = { low: "#64748B", medium: "#F59E0B", high: "#EF4444" };

const today = format(new Date(), "yyyy-MM-dd");
const todayDayIndex = (new Date().getDay() + 6) % 7; // Mon=0 … Sun=6
const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [completedChoreIds, setCompletedChoreIds] = useState<Set<string>>(new Set());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data: profile } = await supabase.from("profiles").select("id, display_name, household_id").eq("id", user.id).single();
        if (!profile?.household_id) return;
        setHouseholdId(profile.household_id);
        setCurrentUser({ id: profile.id, display_name: profile.display_name });

        const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
        const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
        const next7Days = format(addDays(new Date(), 7), "yyyy-MM-dd");

        const [
          { data: membersData },
          { data: txData },
          { data: eventsData },
          { data: choresData },
          { data: mealsData },
          { data: habitsData },
          { data: logsData },
          { data: goalsData },
          { data: activitiesData },
        ] = await Promise.all([
          supabase.from("profiles").select("id, display_name").eq("household_id", profile.household_id),
          supabase.from("transactions").select("id, description, amount, category, transaction_date, is_income").eq("household_id", profile.household_id).gte("transaction_date", monthStart).lte("transaction_date", monthEnd).order("transaction_date", { ascending: false }),
          supabase.from("calendar_events").select("id, title, start_at, color").eq("household_id", profile.household_id).gte("start_at", new Date().toISOString()).lte("start_at", new Date(next7Days).toISOString()).order("start_at", { ascending: true }).limit(5),
          supabase.from("chores").select("id, title, assigned_to, priority, is_completed").eq("household_id", profile.household_id).eq("is_completed", false).order("priority", { ascending: false }).limit(6),
          supabase.from("meals").select("id, name, meal_type, day_of_week").eq("household_id", profile.household_id).eq("week_start", currentWeekStart).eq("day_of_week", todayDayIndex),
          supabase.from("habits").select("id, title, icon, color").eq("household_id", profile.household_id).order("created_at", { ascending: true }),
          supabase.from("habit_logs").select("habit_id, completed_date").eq("completed_date", today),
          supabase.from("goals").select("id, title, goal_type, target_amount, current_amount, unit, is_completed, goal_milestones(is_completed)").eq("household_id", profile.household_id).eq("is_completed", false).order("created_at", { ascending: false }).limit(3),
          supabase.from("activities").select("id, title, activity_type, start_date, status, cost").eq("household_id", profile.household_id).in("status", ["planned", "wishlist"]).order("start_date", { ascending: true }).limit(3),
        ]);

        setMembers(membersData || []);
        setTransactions(txData || []);
        setEvents(eventsData || []);
        setChores(choresData || []);
        setCompletedChoreIds(new Set((choresData || []).filter((c) => c.is_completed).map((c) => c.id)));
        setMeals(mealsData || []);
        setHabits(habitsData || []);
        setHabitLogs(logsData || []);
        setGoals((goalsData || []).map((g) => ({ ...g, milestones: g.goal_milestones || [] })));
        setActivities(activitiesData || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleChore(choreId: string) {
    const supabase = createClient();
    const nowDone = !completedChoreIds.has(choreId);
    await supabase.from("chores").update({ is_completed: nowDone, completed_at: nowDone ? new Date().toISOString() : null }).eq("id", choreId);
    setCompletedChoreIds((prev) => {
      const next = new Set(prev);
      nowDone ? next.add(choreId) : next.delete(choreId);
      return next;
    });
  }

  async function toggleHabit(habit: Habit) {
    if (!userId) return;
    const supabase = createClient();
    const done = habitLogs.some((l) => l.habit_id === habit.id && l.completed_date === today);
    if (done) {
      await supabase.from("habit_logs").delete().eq("habit_id", habit.id).eq("completed_date", today).eq("completed_by", userId);
      setHabitLogs((prev) => prev.filter((l) => !(l.habit_id === habit.id && l.completed_date === today)));
    } else {
      const { data } = await supabase.from("habit_logs").insert({ habit_id: habit.id, completed_by: userId, completed_date: today, count: 1 }).select().single();
      if (data) setHabitLogs((prev) => [...prev, data]);
    }
  }

  // Finance calculations
  const monthlyExpenses = transactions.filter((t) => !t.is_income).reduce((s, t) => s + Math.abs(t.amount), 0);
  const recentTransactions = transactions.slice(0, 3);

  const spendingByCategory = Object.entries(
    transactions.filter((t) => !t.is_income).reduce((acc, t) => {
      const cat = t.category || "Other";
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other }));

  // Chores
  const completedToday = chores.filter((c) => completedChoreIds.has(c.id)).length;

  // Habits
  const habitsCompletedToday = habits.filter((h) => habitLogs.some((l) => l.habit_id === h.id)).length;

  // Stats
  const upcomingEventCount = events.length;
  const activeGoalCount = goals.length;

  // Today's meals by type
  function mealForType(type: string) {
    return meals.find((m) => m.meal_type === type)?.name;
  }

  function goalProgressPct(goal: Goal): number {
    if (goal.goal_type !== "none" && goal.target_amount) {
      return percentage(goal.current_amount, goal.target_amount);
    }
    const milestones = goal.milestones || [];
    if (milestones.length > 0) return Math.round((milestones.filter((m) => m.is_completed).length / milestones.length) * 100);
    return 0;
  }

  function goalLabel(goal: Goal): { current: string; target: string } | null {
    if (goal.goal_type === "monetary" && goal.target_amount) {
      return { current: formatCurrency(goal.current_amount), target: formatCurrency(goal.target_amount) };
    }
    if (goal.goal_type === "count" && goal.target_amount) {
      const unit = goal.unit || "times";
      return { current: `${goal.current_amount} ${unit}`, target: `${goal.target_amount} ${unit}` };
    }
    return null;
  }

  const partner = members.find((m) => m.id !== userId);
  const userName = currentUser?.display_name || "there";

  if (loading) return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1917]">{greeting}, {userName}! 👋</h2>
          <p className="text-[#78716C] mt-0.5">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        {members.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-[#E7E5E4] shadow-card">
            <Avatar name={currentUser?.display_name || "?"} size="sm" color="#E8526A" />
            {partner && (
              <>
                <div className="h-px w-4 bg-[#E7E5E4]" />
                <Avatar name={partner.display_name || "?"} size="sm" color="#6366F1" />
                <p className="text-xs font-medium text-[#1C1917]">{partner.display_name || "Partner"}</p>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Month's Spending", value: formatCurrency(monthlyExpenses), sub: "this month", pct: null, color: "#10B981", icon: DollarSign, href: "/dashboard/finance" },
          { label: "Chores Pending", value: `${completedToday}/${chores.length}`, sub: "completed", pct: chores.length > 0 ? percentage(completedToday, chores.length) : 0, color: "#F59E0B", icon: CheckSquare, href: "/dashboard/chores" },
          { label: "Upcoming Events", value: upcomingEventCount.toString(), sub: "next 7 days", pct: null, color: "#6366F1", icon: CalendarDays, href: "/dashboard/calendar" },
          { label: "Active Goals", value: activeGoalCount.toString(), sub: "in progress", pct: null, color: "#8B5CF6", icon: Target, href: "/dashboard/goals" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <Link href={stat.href}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-[#78716C]">{stat.label}</p>
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "18" }}>
                    <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#1C1917] mb-0.5">{stat.value}</p>
                <p className="text-xs text-[#78716C] mb-3">{stat.sub}</p>
                {stat.pct !== null && <Progress value={stat.pct} color={stat.color} size="sm" />}
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance */}
        <Link href="/dashboard/finance">
          <Card hover padding="none" className="overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle>Finance</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-[#78716C]" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {recentTransactions.length === 0 && spendingByCategory.length === 0 ? (
                <p className="text-sm text-[#78716C] py-4 text-center">No transactions this month.</p>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-[100px] w-[100px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={spendingByCategory.length > 0 ? spendingByCategory : [{ name: "None", value: 1, color: "#E5E7EB" }]} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2} dataKey="value">
                          {(spendingByCategory.length > 0 ? spendingByCategory : [{ color: "#E5E7EB" }]).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: "8px", border: "1px solid #E7E5E4", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    {recentTransactions.length > 0 ? recentTransactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#1C1917] truncate">{t.description}</p>
                          <p className="text-xs text-[#78716C]">{t.category || "Uncategorized"}</p>
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${t.is_income ? "text-emerald-600" : "text-[#1C1917]"}`}>
                          {t.is_income ? "+" : "-"}{formatCurrency(Math.abs(t.amount))}
                        </span>
                      </div>
                    )) : <p className="text-xs text-[#78716C]">No transactions yet.</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Calendar */}
        <Link href="/dashboard/calendar">
          <Card hover padding="none" className="overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-indigo-600" />
                </div>
                <CardTitle>Upcoming Events</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-[#78716C]" />
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {events.length === 0 ? (
                <p className="text-sm text-[#78716C] py-4 text-center">No upcoming events this week.</p>
              ) : events.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1C1917] truncate">{event.title}</p>
                    <p className="text-xs text-[#78716C]">{format(new Date(event.start_at), "MMM d · h:mm a")}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Link>

        {/* Chores */}
        <Card padding="none" className="overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle>Chores</CardTitle>
            </div>
            <Link href="/dashboard/chores"><ArrowRight className="h-4 w-4 text-[#78716C]" /></Link>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-2">
            {chores.length === 0 ? (
              <p className="text-sm text-[#78716C] py-4 text-center">All caught up! No pending chores.</p>
            ) : chores.map((chore) => {
              const done = completedChoreIds.has(chore.id);
              const member = members.find((m) => m.id === chore.assigned_to);
              return (
                <div
                  key={chore.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleChore(chore.id)}
                >
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${done ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                    {done && <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <span className={`flex-1 text-sm ${done ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>{chore.title}</span>
                  <div className="flex items-center gap-2">
                    {member && <span className="text-xs text-[#78716C]">{member.display_name}</span>}
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[chore.priority] || PRIORITY_COLORS.low }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Meals */}
        <Link href="/dashboard/meals">
          <Card hover padding="none" className="overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-red-500" />
                </div>
                <CardTitle>Today&apos;s Meals</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-[#78716C]" />
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {meals.length === 0 ? (
                <p className="text-sm text-[#78716C] py-4 text-center">No meals planned for today.</p>
              ) : (
                [
                  { label: "Breakfast", type: "breakfast", color: "#F59E0B" },
                  { label: "Lunch", type: "lunch", color: "#10B981" },
                  { label: "Dinner", type: "dinner", color: "#EF4444" },
                ].map(({ label, type, color }) => {
                  const meal = mealForType(type);
                  if (!meal) return null;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <Badge className="text-xs px-2 py-0.5 flex-shrink-0" style={{ backgroundColor: color + "18", color, border: "none" }}>{label}</Badge>
                      <span className="text-sm text-[#1C1917] font-medium">{meal}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Habits */}
        <Card padding="none" className="overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Flame className="h-4 w-4 text-cyan-600" />
              </div>
              <CardTitle>Today&apos;s Habits</CardTitle>
              <span className="text-xs text-[#78716C] ml-1">({habitsCompletedToday}/{habits.length})</span>
            </div>
            <Link href="/dashboard/habits"><ArrowRight className="h-4 w-4 text-[#78716C]" /></Link>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {habits.length === 0 ? (
              <p className="text-sm text-[#78716C] py-4 text-center">No habits set up yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {habits.map((habit) => {
                  const done = habitLogs.some((l) => l.habit_id === habit.id);
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(habit)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E7E5E4] hover:border-gray-300 transition-colors text-left"
                    >
                      <div
                        className="h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={done ? { backgroundColor: habit.color, borderColor: habit.color } : { borderColor: habit.color }}
                      >
                        {done
                          ? <svg className="h-4 w-4 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          : <span className="text-sm">{habit.icon}</span>
                        }
                      </div>
                      <p className={`text-xs font-medium truncate ${done ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>{habit.title}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Link href="/dashboard/goals">
          <Card hover padding="none" className="overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Target className="h-4 w-4 text-violet-600" />
                </div>
                <CardTitle>Goals</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-[#78716C]" />
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {goals.length === 0 ? (
                <p className="text-sm text-[#78716C] py-4 text-center">No active goals yet.</p>
              ) : goals.map((goal) => {
                const pct = goalProgressPct(goal);
                const label = goalLabel(goal);
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[#1C1917] truncate flex-1">{goal.title}</span>
                      <span className="text-xs text-[#78716C] ml-2">{pct}%</span>
                    </div>
                    <Progress value={pct} color="#8B5CF6" size="sm" />
                    {label && (
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-[#78716C]">{label.current}</span>
                        <span className="text-xs text-[#78716C]">{label.target}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Activities - full width */}
      <Link href="/dashboard/activities">
        <Card hover padding="none" className="overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-orange-600" />
              </div>
              <CardTitle>Activities &amp; Travel</CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-[#78716C]" />
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {activities.length === 0 ? (
              <p className="text-sm text-[#78716C] py-4 text-center">No upcoming activities planned.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 rounded-xl border border-[#E7E5E4] hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={activity.status === "planned" ? "indigo" : "secondary"} className="text-xs">{activity.status}</Badge>
                      {activity.start_date && <span className="text-xs text-[#78716C]">{format(new Date(activity.start_date), "MMM d")}</span>}
                    </div>
                    <p className="text-sm font-semibold text-[#1C1917] mb-1">{activity.title}</p>
                    {activity.cost && (
                      <div className="flex items-center gap-1 text-xs text-[#78716C]">
                        <Clock className="h-3 w-3" />
                        <span>Est. {formatCurrency(activity.cost)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
