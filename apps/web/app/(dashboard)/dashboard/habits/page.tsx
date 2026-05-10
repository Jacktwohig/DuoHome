"use client";

import React, { useState } from "react";
import { Plus, Flame, Check } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, startOfWeek, addDays } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

// TODO: Replace with Supabase queries
const MOCK_HABITS = [
  { id: "1", title: "Morning workout", assignee: "Both", color: "#06B6D4", streak: 12, icon: "💪", frequency: "daily", completedToday: true, completions: [true, true, false, true, true, true, false] },
  { id: "2", title: "Read 20 minutes", assignee: "Alex", color: "#8B5CF6", streak: 7, icon: "📚", frequency: "daily", completedToday: true, completions: [true, false, true, true, true, true, true] },
  { id: "3", title: "Meditation", assignee: "Both", color: "#10B981", streak: 5, icon: "🧘", frequency: "daily", completedToday: false, completions: [true, true, true, false, true, true, false] },
  { id: "4", title: "Vitamins", assignee: "Jordan", color: "#F59E0B", streak: 21, icon: "💊", frequency: "daily", completedToday: false, completions: [true, true, true, true, true, true, false] },
  { id: "5", title: "Date night", assignee: "Both", color: "#E8526A", streak: 3, icon: "❤️", frequency: "weekly", completedToday: false, completions: [false, false, false, false, false, true, false] },
  { id: "6", title: "Gratitude journal", assignee: "Alex", color: "#F97316", streak: 9, icon: "📓", frequency: "daily", completedToday: true, completions: [true, true, true, false, true, true, true] },
];

// Generate monthly data (last 35 days)
function generateMonthlyData(completions: boolean[]) {
  const result: { date: Date; completed: boolean }[] = [];
  for (let i = 34; i >= 0; i--) {
    const date = subDays(new Date(), i);
    result.push({ date, completed: Math.random() > 0.3 });
  }
  return result;
}

const ICON_OPTIONS = ["💪", "📚", "🧘", "💊", "❤️", "📓", "🏃", "🥗", "💧", "😴", "🎯", "✍️", "🎨", "🎸", "🧹", "🌿"];

export default function HabitsPage() {
  const [habits, setHabits] = useState(MOCK_HABITS);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: "",
    description: "",
    assignee: "Both",
    frequency: "daily",
    icon: "💪",
    color: "#06B6D4",
  });

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(new Date()), i)
  );

  function toggleHabitToday(id: string) {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completedToday: !h.completedToday } : h))
    );
  }

  const completedToday = habits.filter((h) => h.completedToday).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Habits</h2>
          <p className="text-sm text-[#78716C]">
            {completedToday}/{habits.length} completed today
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddHabit(true)}>
          New Habit
        </Button>
      </div>

      {/* Progress for today */}
      <Card className="overflow-hidden" padding="none">
        <div className="px-5 py-4 bg-gradient-to-r from-primary-500 to-pink-400">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-white/80 text-sm">Today&apos;s Progress</p>
              <p className="text-3xl font-bold mt-0.5">
                {completedToday}/{habits.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Best streak</p>
              <div className="flex items-center gap-1 justify-end">
                <Flame className="h-5 w-5 text-amber-300" />
                <span className="text-xl font-bold">21 days</span>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedToday / habits.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </Card>

      {/* Today's habits */}
      <div>
        <h3 className="text-base font-semibold text-[#1C1917] mb-4">Today&apos;s Habits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {habits.map((habit, i) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`transition-all ${habit.completedToday ? "bg-gray-50" : ""}`}>
                <div className="flex items-center gap-3">
                  {/* Circle completion button */}
                  <button
                    onClick={() => toggleHabitToday(habit.id)}
                    className={`h-12 w-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      habit.completedToday ? "border-transparent" : ""
                    }`}
                    style={
                      habit.completedToday
                        ? { backgroundColor: habit.color, borderColor: habit.color }
                        : { borderColor: habit.color }
                    }
                  >
                    {habit.completedToday ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-xl">{habit.icon}</span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${habit.completedToday ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>
                      {habit.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-400" />
                        <span className="text-xs font-medium text-orange-600">{habit.streak} day streak</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{habit.assignee}</Badge>
                    </div>
                  </div>

                  {habit.completedToday && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full"
                    >
                      Done!
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* This week grid */}
      <Card>
        <CardHeader className="mb-5">
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr>
                  <th className="text-left pb-3 pr-4 text-xs font-medium text-[#78716C] w-1/3">Habit</th>
                  {weekDays.map((d) => (
                    <th key={d.toISOString()} className="pb-3 text-center text-xs font-medium text-[#78716C]">
                      <div>{format(d, "EEE")}</div>
                      <div className={`text-xs rounded-full h-5 w-5 flex items-center justify-center mx-auto mt-0.5 ${
                        format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                          ? "bg-primary-500 text-white font-bold"
                          : ""
                      }`}>
                        {format(d, "d")}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id} className="border-t border-[#E7E5E4]">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{habit.icon}</span>
                        <span className="text-sm text-[#1C1917] font-medium truncate">{habit.title}</span>
                      </div>
                    </td>
                    {habit.completions.map((completed, ci) => (
                      <td key={ci} className="py-2 text-center">
                        <div
                          className={`h-6 w-6 rounded-full mx-auto flex items-center justify-center ${
                            completed ? "" : "bg-gray-100"
                          }`}
                          style={completed ? { backgroundColor: habit.color + "30" } : undefined}
                        >
                          {completed && (
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly heatmap */}
      <Card>
        <CardHeader className="mb-5">
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habits.slice(0, 3).map((habit) => {
              const monthlyData = generateMonthlyData(habit.completions);
              return (
                <div key={habit.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{habit.icon}</span>
                    <span className="text-xs font-medium text-[#1C1917]">{habit.title}</span>
                    <Flame className="h-3 w-3 text-orange-400 ml-auto" />
                    <span className="text-xs font-semibold text-orange-600">{habit.streak}</span>
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {monthlyData.map((d, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-sm"
                        style={{
                          backgroundColor: d.completed ? habit.color : "#F0EDEC",
                          opacity: d.completed ? (0.4 + (i / monthlyData.length) * 0.6) : 1,
                        }}
                        title={format(d.date, "MMM d")}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Habit Modal */}
      <Modal open={showAddHabit} onClose={() => setShowAddHabit(false)} title="New Habit" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Habit name"
            placeholder="e.g. Morning workout"
            value={newHabit.title}
            onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
          />
          <Textarea
            label="Description (optional)"
            placeholder="Brief description..."
            value={newHabit.description}
            onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assign to"
              value={newHabit.assignee}
              onChange={(e) => setNewHabit({ ...newHabit, assignee: e.target.value })}
              options={[
                { value: "Both", label: "Both of us" },
                { value: "Alex", label: "Alex" },
                { value: "Jordan", label: "Jordan" },
              ]}
            />
            <Select
              label="Frequency"
              value={newHabit.frequency}
              onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1C1917] mb-2 block">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewHabit({ ...newHabit, icon })}
                  className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    newHabit.icon === icon
                      ? "bg-primary-100 ring-2 ring-primary-400"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1C1917] mb-2 block">Color</label>
            <div className="flex gap-2">
              {["#06B6D4", "#8B5CF6", "#10B981", "#F59E0B", "#E8526A", "#F97316", "#6366F1", "#EF4444"].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewHabit({ ...newHabit, color })}
                  className={`h-8 w-8 rounded-full transition-all ${
                    newHabit.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddHabit(false)}>Cancel</Button>
          <Button onClick={() => setShowAddHabit(false)}>Create Habit</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
