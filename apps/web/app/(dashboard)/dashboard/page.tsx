"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  TrendingUp,
  CalendarDays,
  CheckSquare,
  Target,
  UtensilsCrossed,
  Flame,
  MapPin,
  ArrowRight,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, percentage } from "@/lib/utils";

// TODO: Replace with Supabase queries
const MOCK_DATA = {
  user: { name: "Alex", avatar: null },
  partner: { name: "Jordan", avatar: null, online: true },
  stats: {
    monthlySpending: 2340,
    monthlyBudget: 3000,
    choresCompletedThisWeek: 7,
    totalChoresThisWeek: 10,
    upcomingEvents: 4,
    activeGoals: 3,
  },
  recentTransactions: [
    { id: "1", description: "Whole Foods Market", amount: -87.42, category: "Groceries", date: "2025-05-08", who: "Alex" },
    { id: "2", description: "Netflix", amount: -15.99, category: "Entertainment", date: "2025-05-07", who: "Jordan" },
    { id: "3", description: "Salary Deposit", amount: 3200, category: "Income", date: "2025-05-06", who: "Alex" },
  ],
  upcomingEvents: [
    { id: "1", title: "Dentist Appointment", date: "2025-05-12", color: "#6366F1", time: "2:30 PM" },
    { id: "2", title: "Date Night - Italian Restaurant", date: "2025-05-14", color: "#E8526A", time: "7:00 PM" },
    { id: "3", title: "Mom's Birthday Dinner", date: "2025-05-16", color: "#F59E0B", time: "6:00 PM" },
    { id: "4", title: "Weekend Hike", date: "2025-05-18", color: "#10B981", time: "9:00 AM" },
    { id: "5", title: "Jordan's Work Conference", date: "2025-05-20", color: "#8B5CF6", time: "All day" },
  ],
  todayChores: [
    { id: "1", title: "Vacuum living room", assignee: "Alex", priority: "medium", completed: false },
    { id: "2", title: "Do laundry", assignee: "Jordan", priority: "high", completed: true },
    { id: "3", title: "Empty dishwasher", assignee: "Alex", priority: "low", completed: true },
    { id: "4", title: "Take out trash", assignee: "Jordan", priority: "high", completed: false },
  ],
  todayMeals: {
    breakfast: "Avocado Toast & Eggs",
    lunch: "Greek Salad",
    dinner: "Pasta Primavera",
    tomorrow: "Chicken Stir Fry",
  },
  todayHabits: [
    { id: "1", title: "Morning workout", completed: true, streak: 12, color: "#06B6D4" },
    { id: "2", title: "Read 20 minutes", completed: true, streak: 7, color: "#8B5CF6" },
    { id: "3", title: "Meditation", completed: false, streak: 5, color: "#10B981" },
    { id: "4", title: "Vitamins", completed: false, streak: 21, color: "#F59E0B" },
  ],
  goals: [
    { id: "1", title: "Emergency Fund", current: 6500, target: 10000, color: "#10B981", category: "Finance" },
    { id: "2", title: "Europe Trip 2026", current: 2200, target: 5000, color: "#6366F1", category: "Travel" },
    { id: "3", title: "New Couch", current: 800, target: 1200, color: "#F59E0B", category: "Home" },
  ],
  spendingByCategory: [
    { name: "Housing", value: 1200, color: "#6366F1" },
    { name: "Groceries", value: 420, color: "#10B981" },
    { name: "Transport", value: 180, color: "#F59E0B" },
    { name: "Entertainment", value: 150, color: "#EF4444" },
    { name: "Other", value: 390, color: "#64748B" },
  ],
  upcomingActivities: [
    { id: "1", title: "Weekend in Asheville", type: "travel", date: "Jun 6-8", status: "planned", cost: 650 },
    { id: "2", title: "Rooftop Bar Night", type: "date", date: "May 17", status: "planned", cost: 80 },
    { id: "3", title: "Cooking Class", type: "activity", date: "May 24", status: "wishlist", cost: 120 },
  ],
};

const priorityColors = { low: "#64748B", medium: "#F59E0B", high: "#EF4444" };

export default function DashboardPage() {
  const [completedChores, setCompletedChores] = useState<string[]>(
    MOCK_DATA.todayChores.filter((c) => c.completed).map((c) => c.id)
  );
  const [completedHabits, setCompletedHabits] = useState<string[]>(
    MOCK_DATA.todayHabits.filter((h) => h.completed).map((h) => h.id)
  );

  const today = format(new Date(), "EEEE, MMMM d");
  const spendingPct = percentage(MOCK_DATA.stats.monthlySpending, MOCK_DATA.stats.monthlyBudget);
  const choresPct = percentage(MOCK_DATA.stats.choresCompletedThisWeek, MOCK_DATA.stats.totalChoresThisWeek);

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#1C1917]">
            {greeting}, {MOCK_DATA.user.name}! 👋
          </h2>
          <p className="text-[#78716C] mt-0.5">{today}</p>
        </div>
        {/* Partner status */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-[#E7E5E4] shadow-card">
          <Avatar name={MOCK_DATA.user.name} size="sm" online={true} color="#E8526A" />
          <div className="h-px w-4 bg-[#E7E5E4]" />
          <Avatar name={MOCK_DATA.partner.name} size="sm" online={MOCK_DATA.partner.online} color="#6366F1" />
          <div>
            <p className="text-xs font-medium text-[#1C1917]">
              {MOCK_DATA.partner.name} is{" "}
              <span className="text-emerald-600">
                {MOCK_DATA.partner.online ? "online" : "away"}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Monthly Spending",
            value: formatCurrency(MOCK_DATA.stats.monthlySpending),
            sub: `of ${formatCurrency(MOCK_DATA.stats.monthlyBudget)} budget`,
            pct: spendingPct,
            color: spendingPct > 80 ? "#EF4444" : "#10B981",
            icon: DollarSign,
            href: "/dashboard/finance",
          },
          {
            label: "Chores Done",
            value: `${MOCK_DATA.stats.choresCompletedThisWeek}/${MOCK_DATA.stats.totalChoresThisWeek}`,
            sub: "this week",
            pct: choresPct,
            color: "#F59E0B",
            icon: CheckSquare,
            href: "/dashboard/chores",
          },
          {
            label: "Upcoming Events",
            value: MOCK_DATA.stats.upcomingEvents.toString(),
            sub: "next 7 days",
            pct: null,
            color: "#6366F1",
            icon: CalendarDays,
            href: "/dashboard/calendar",
          },
          {
            label: "Active Goals",
            value: MOCK_DATA.stats.activeGoals.toString(),
            sub: "in progress",
            pct: null,
            color: "#8B5CF6",
            icon: Target,
            href: "/dashboard/goals",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link href={stat.href}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-[#78716C]">{stat.label}</p>
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.color + "18" }}
                  >
                    <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#1C1917] mb-0.5">{stat.value}</p>
                <p className="text-xs text-[#78716C] mb-3">{stat.sub}</p>
                {stat.pct !== null && (
                  <Progress value={stat.pct} color={stat.color} size="sm" />
                )}
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance widget */}
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
              <div className="flex items-center gap-4">
                {/* Donut chart */}
                <div className="h-[100px] w-[100px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_DATA.spendingByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={44}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {MOCK_DATA.spendingByCategory.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #E7E5E4", fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Recent transactions */}
                <div className="flex-1 min-w-0 space-y-2">
                  {MOCK_DATA.recentTransactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#1C1917] truncate">{t.description}</p>
                        <p className="text-xs text-[#78716C]">{t.category}</p>
                      </div>
                      <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${t.amount > 0 ? "text-emerald-600" : "text-[#1C1917]"}`}>
                        {t.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(t.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Calendar widget */}
        <Link href="/dashboard/calendar">
          <Card hover padding="none" className="overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-indigo-600" />
                </div>
                <CardTitle>Calendar</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-[#78716C]" />
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {MOCK_DATA.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <div
                    className="h-8 w-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#1C1917] truncate">{event.title}</p>
                    <p className="text-xs text-[#78716C]">
                      {format(new Date(event.date), "MMM d")} · {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Link>

        {/* Chores widget */}
        <Link href="/dashboard/chores">
          <Card hover padding="none" className="overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle>Today&apos;s Chores</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-[#78716C]" />
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {MOCK_DATA.todayChores.map((chore) => {
                const done = completedChores.includes(chore.id);
                return (
                  <div
                    key={chore.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setCompletedChores((prev) =>
                        done ? prev.filter((id) => id !== chore.id) : [...prev, chore.id]
                      );
                    }}
                  >
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        done ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                      }`}
                    >
                      {done && (
                        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={`flex-1 text-sm ${done ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>
                      {chore.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#78716C]">{chore.assignee}</span>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: priorityColors[chore.priority as keyof typeof priorityColors] }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Link>

        {/* Meals widget */}
        <Link href="/dashboard/meals">
          <Card hover padding="none" className="overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-red-500" />
                </div>
                <CardTitle>Meals</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-[#78716C]" />
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {[
                { label: "Breakfast", meal: MOCK_DATA.todayMeals.breakfast, color: "#F59E0B" },
                { label: "Lunch", meal: MOCK_DATA.todayMeals.lunch, color: "#10B981" },
                { label: "Dinner", meal: MOCK_DATA.todayMeals.dinner, color: "#EF4444" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <Badge
                    className="text-xs px-2 py-0.5 flex-shrink-0"
                    style={{ backgroundColor: item.color + "18", color: item.color, border: "none" }}
                  >
                    {item.label}
                  </Badge>
                  <span className="text-sm text-[#1C1917] font-medium">{item.meal}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#E7E5E4]">
                <p className="text-xs text-[#78716C]">
                  <span className="font-medium">Tomorrow:</span> {MOCK_DATA.todayMeals.tomorrow}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Habits widget */}
        <Link href="/dashboard/habits">
          <Card hover padding="none" className="overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-4 flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-cyan-600" />
                </div>
                <CardTitle>Today&apos;s Habits</CardTitle>
              </div>
              <ArrowRight className="h-4 w-4 text-[#78716C]" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-3">
                {MOCK_DATA.todayHabits.map((habit) => {
                  const done = completedHabits.includes(habit.id);
                  return (
                    <button
                      key={habit.id}
                      onClick={(e) => {
                        e.preventDefault();
                        setCompletedHabits((prev) =>
                          done ? prev.filter((id) => id !== habit.id) : [...prev, habit.id]
                        );
                      }}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E7E5E4] hover:border-gray-300 transition-colors text-left"
                    >
                      <div
                        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          done ? "border-transparent" : ""
                        }`}
                        style={done ? { backgroundColor: habit.color } : { borderColor: habit.color }}
                      >
                        {done && (
                          <svg className="h-4 w-4 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-medium truncate ${done ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>
                          {habit.title}
                        </p>
                        <p className="text-xs text-[#78716C] flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {habit.streak}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Goals widget */}
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
              {MOCK_DATA.goals.map((goal) => {
                const pct = percentage(goal.current, goal.target);
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[#1C1917]">{goal.title}</span>
                      <span className="text-xs text-[#78716C]">{pct}%</span>
                    </div>
                    <Progress value={pct} color={goal.color} size="sm" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-[#78716C]">{formatCurrency(goal.current)}</span>
                      <span className="text-xs text-[#78716C]">{formatCurrency(goal.target)}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Activities widget - full width */}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MOCK_DATA.upcomingActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 rounded-xl border border-[#E7E5E4] hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={activity.status === "planned" ? "indigo" : "secondary"} className="text-xs">
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-[#78716C]">{activity.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#1C1917] mb-1">{activity.title}</p>
                  <div className="flex items-center gap-1 text-xs text-[#78716C]">
                    <Clock className="h-3 w-3" />
                    <span>Est. {formatCurrency(activity.cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
