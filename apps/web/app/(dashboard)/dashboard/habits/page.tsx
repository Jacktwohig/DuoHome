"use client";

import React, { useState, useEffect } from "react";
import { Plus, Flame, Check, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, startOfWeek, addDays } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; display_name: string | null };
type Habit = {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  frequency: string;
  color: string;
  icon: string;
};
type HabitLog = { habit_id: string; completed_date: string; completed_by: string };

const ICON_OPTIONS = ["💪", "📚", "🧘", "💊", "❤️", "📓", "🏃", "🥗", "💧", "😴", "🎯", "✍️", "🎨", "🎸", "🧹", "🌿"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState({ title: "", description: "", assignee: "", frequency: "daily", icon: "💪", color: "#06B6D4" });

  const today = format(new Date(), "yyyy-MM-dd");
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i));
  const last35Days = Array.from({ length: 35 }, (_, i) => format(subDays(new Date(), 34 - i), "yyyy-MM-dd"));

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user.id).single();
        if (!profile?.household_id) return;
        setHouseholdId(profile.household_id);

        const [{ data: profilesData }, { data: habitsData }, { data: logsData }] = await Promise.all([
          supabase.from("profiles").select("id, display_name").eq("household_id", profile.household_id),
          supabase.from("habits").select("*").eq("household_id", profile.household_id).order("created_at", { ascending: true }),
          supabase.from("habit_logs").select("habit_id, completed_date, completed_by").gte("completed_date", last35Days[0]),
        ]);

        setMembers(profilesData || []);
        setHabits(habitsData || []);
        setLogs(logsData || []);
        if (profilesData?.[0]) setNewHabit((prev) => ({ ...prev, assignee: profilesData[0].id }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function isCompletedToday(habitId: string) {
    return logs.some((l) => l.habit_id === habitId && l.completed_date === today);
  }

  function isCompletedOn(habitId: string, date: string) {
    return logs.some((l) => l.habit_id === habitId && l.completed_date === date);
  }

  function getStreak(habitId: string) {
    let streak = 0;
    let d = new Date();
    while (true) {
      const dateStr = format(d, "yyyy-MM-dd");
      if (isCompletedOn(habitId, dateStr)) {
        streak++;
        d = subDays(d, 1);
      } else {
        break;
      }
    }
    return streak;
  }

  async function toggleToday(habit: Habit) {
    if (!userId) { setToggleError("Not signed in."); return; }
    setToggleError(null);
    setTogglingId(habit.id);
    const supabase = createClient();
    const done = isCompletedToday(habit.id);
    if (done) {
      const { error } = await supabase.from("habit_logs").delete().eq("habit_id", habit.id).eq("completed_date", today).eq("completed_by", userId);
      if (error) { setToggleError(error.message); }
      else { setLogs((prev) => prev.filter((l) => !(l.habit_id === habit.id && l.completed_date === today))); }
    } else {
      const { data, error } = await supabase.from("habit_logs").insert({ habit_id: habit.id, completed_by: userId, completed_date: today, count: 1 }).select().single();
      if (error) { setToggleError(error.message); }
      else if (data) { setLogs((prev) => [...prev, data]); }
    }
    setTogglingId(null);
  }

  async function addHabit() {
    setSaveError(null);
    if (!newHabit.title.trim()) { setSaveError("Habit name is required."); return; }
    if (!householdId) { setSaveError("No household found. Please sign out and sign back in."); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("habits").insert({
      household_id: householdId,
      title: newHabit.title,
      description: newHabit.description || null,
      assigned_to: newHabit.assignee || null,
      frequency: newHabit.frequency,
      icon: newHabit.icon,
      color: newHabit.color,
      target_count: 1,
    }).select().single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (data) {
      setHabits((prev) => [...prev, data]);
      setNewHabit({ title: "", description: "", assignee: members[0]?.id || "", frequency: "daily", icon: "💪", color: "#06B6D4" });
      setShowAddHabit(false);
    }
  }

  async function deleteHabit(id: string) {
    const supabase = createClient();
    await supabase.from("habits").delete().eq("id", id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setLogs((prev) => prev.filter((l) => l.habit_id !== id));
  }

  function memberName(id: string | null) {
    if (!id) return "Both";
    return members.find((m) => m.id === id)?.display_name || "Member";
  }

  const completedToday = habits.filter((h) => isCompletedToday(h.id)).length;
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => getStreak(h.id)), 0) : 0;

  if (loading) return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Habits</h2>
          <p className="text-sm text-[#78716C]">{completedToday}/{habits.length} completed today</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddHabit(true)}>New Habit</Button>
      </div>

      <Card className="overflow-hidden" padding="none">
        <div className="px-5 py-4 bg-gradient-to-r from-primary-500 to-pink-400">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-white/80 text-sm">Today&apos;s Progress</p>
              <p className="text-3xl font-bold mt-0.5">{completedToday}/{habits.length}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Best streak</p>
              <div className="flex items-center gap-1 justify-end">
                <Flame className="h-5 w-5 text-amber-300" />
                <span className="text-xl font-bold">{bestStreak} days</span>
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={{ width: habits.length > 0 ? `${(completedToday / habits.length) * 100}%` : "0%" }} transition={{ duration: 0.8, ease: "easeOut" }} />
          </div>
        </div>
      </Card>

      {habits.length === 0 ? (
        <div className="text-center py-16 text-[#78716C]">
          <Flame className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No habits yet</p>
          <p className="text-sm mt-1">Build better routines together!</p>
        </div>
      ) : (
        <>
          <div>
            <h3 className="text-base font-semibold text-[#1C1917] mb-4">Today&apos;s Habits</h3>
            {toggleError && <p className="text-sm text-red-500 mb-2">{toggleError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {habits.map((habit, i) => {
                const done = isCompletedToday(habit.id);
                const streak = getStreak(habit.id);
                const isToggling = togglingId === habit.id;
                return (
                  <motion.div key={habit.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className={`transition-all group ${done ? "bg-gray-50" : ""}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleToday(habit)}
                          disabled={isToggling}
                          className="h-12 w-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-60"
                          style={done ? { backgroundColor: habit.color, borderColor: habit.color } : { borderColor: habit.color }}
                        >
                          {done ? <Check className="h-5 w-5 text-white" /> : <span className="text-xl">{habit.icon}</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${done ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>{habit.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-400" />
                              <span className="text-xs font-medium text-orange-600">{streak} day streak</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">{memberName(habit.assigned_to)}</Badge>
                          </div>
                        </div>
                        {done && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Done!</motion.div>}
                        <button onClick={() => deleteHabit(habit.id)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <Card>
            <CardHeader className="mb-5"><CardTitle>This Week</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr>
                      <th className="text-left pb-3 pr-4 text-xs font-medium text-[#78716C] w-1/3">Habit</th>
                      {weekDays.map((d) => (
                        <th key={d.toISOString()} className="pb-3 text-center text-xs font-medium text-[#78716C]">
                          <div>{format(d, "EEE")}</div>
                          <div className={`text-xs rounded-full h-5 w-5 flex items-center justify-center mx-auto mt-0.5 ${format(d, "yyyy-MM-dd") === today ? "bg-primary-500 text-white font-bold" : ""}`}>{format(d, "d")}</div>
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
                        {weekDays.map((d) => {
                          const dateStr = format(d, "yyyy-MM-dd");
                          const completed = isCompletedOn(habit.id, dateStr);
                          return (
                            <td key={dateStr} className="py-2 text-center">
                              <div className="h-6 w-6 rounded-full mx-auto flex items-center justify-center" style={completed ? { backgroundColor: habit.color + "30" } : { backgroundColor: "#F3F4F6" }}>
                                {completed && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="mb-5"><CardTitle>Monthly Overview</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {habits.slice(0, 3).map((habit) => (
                  <div key={habit.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{habit.icon}</span>
                      <span className="text-xs font-medium text-[#1C1917]">{habit.title}</span>
                      <Flame className="h-3 w-3 text-orange-400 ml-auto" />
                      <span className="text-xs font-semibold text-orange-600">{getStreak(habit.id)}</span>
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                      {last35Days.map((dateStr, idx) => {
                        const completed = isCompletedOn(habit.id, dateStr);
                        return (
                          <div key={idx} className="h-4 w-4 rounded-sm" style={{ backgroundColor: completed ? habit.color : "#F0EDEC", opacity: completed ? (0.4 + (idx / last35Days.length) * 0.6) : 1 }} title={dateStr} />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Modal open={showAddHabit} onClose={() => { setShowAddHabit(false); setSaveError(null); }} title="New Habit" size="md">
        <ModalBody className="space-y-4">
          <Input label="Habit name" placeholder="e.g. Morning workout" value={newHabit.title} onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })} />
          <Textarea label="Description (optional)" placeholder="Brief description..." value={newHabit.description} onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Assign to" value={newHabit.assignee} onChange={(e) => setNewHabit({ ...newHabit, assignee: e.target.value })} options={[{ value: "", label: "Both of us" }, ...members.map((m) => ({ value: m.id, label: m.display_name || "Member" }))]} />
            <Select label="Frequency" value={newHabit.frequency} onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })} options={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }]} />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1C1917] mb-2 block">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map((icon) => (
                <button key={icon} onClick={() => setNewHabit({ ...newHabit, icon })} className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all ${newHabit.icon === icon ? "bg-primary-100 ring-2 ring-primary-400" : "bg-gray-50 hover:bg-gray-100"}`}>{icon}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1C1917] mb-2 block">Color</label>
            <div className="flex gap-2">
              {["#06B6D4", "#8B5CF6", "#10B981", "#F59E0B", "#E8526A", "#F97316", "#6366F1", "#EF4444"].map((color) => (
                <button key={color} onClick={() => setNewHabit({ ...newHabit, color })} className={`h-8 w-8 rounded-full transition-all ${newHabit.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          {saveError && <p className="text-sm text-red-500 flex-1">{saveError}</p>}
          <Button variant="outline" onClick={() => { setShowAddHabit(false); setSaveError(null); }}>Cancel</Button>
          <Button onClick={addHabit} loading={saving}>Create Habit</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
