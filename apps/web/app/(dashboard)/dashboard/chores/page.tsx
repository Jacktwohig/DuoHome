"use client";

import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; display_name: string | null };
type Chore = {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  recurrence: string | null;
  priority: "low" | "medium" | "high";
  is_completed: boolean;
};

const MEMBER_COLORS = ["#E8526A", "#6366F1"];

const PRIORITY_COLORS = {
  low: { bg: "bg-slate-100", text: "text-slate-600", label: "Low" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  high: { bg: "bg-red-100", text: "text-red-700", label: "High" },
};

const RECURRENCE_LABELS: Record<string, string> = {
  none: "One-time", daily: "Daily", weekly: "Weekly", biweekly: "Every 2 weeks", monthly: "Monthly",
};

export default function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddChore, setShowAddChore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [newChore, setNewChore] = useState({ title: "", description: "", assignee: "", dueDate: "", recurrence: "none", priority: "medium" });

  const today = format(new Date(), "yyyy-MM-dd");

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

        const [{ data: profilesData }, { data: choresData }] = await Promise.all([
          supabase.from("profiles").select("id, display_name").eq("household_id", profile.household_id),
          supabase.from("chores").select("*").eq("household_id", profile.household_id).order("due_date", { ascending: true, nullsFirst: false }),
        ]);

        setMembers(profilesData || []);
        setChores(choresData || []);
        if (profilesData?.[0]) setNewChore((prev) => ({ ...prev, assignee: profilesData[0].id }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleChore(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("chores").update({ is_completed: !current, completed_at: !current ? new Date().toISOString() : null }).eq("id", id);
    setChores((prev) => prev.map((c) => (c.id === id ? { ...c, is_completed: !current } : c)));
  }

  async function addChore() {
    setSaveError(null);
    if (!newChore.title.trim()) { setSaveError("Chore name is required."); return; }
    if (!householdId || !userId) { setSaveError("No household found. Please sign out and sign back in."); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("chores").insert({
      household_id: householdId,
      created_by: userId,
      title: newChore.title,
      description: newChore.description || null,
      assigned_to: newChore.assignee || null,
      due_date: newChore.dueDate || null,
      recurrence: newChore.recurrence,
      priority: newChore.priority,
      is_completed: false,
    }).select().single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (data) {
      setChores((prev) => [...prev, data]);
      setNewChore({ title: "", description: "", assignee: members[0]?.id || "", dueDate: "", recurrence: "none", priority: "medium" });
      setShowAddChore(false);
    }
  }

  async function deleteChore(id: string) {
    const supabase = createClient();
    await supabase.from("chores").delete().eq("id", id);
    setChores((prev) => prev.filter((c) => c.id !== id));
  }

  function memberName(id: string | null) {
    if (!id) return "Anyone";
    return members.find((m) => m.id === id)?.display_name || "Member";
  }

  function memberColor(id: string | null) {
    if (!id) return "#64748B";
    const idx = members.findIndex((m) => m.id === id);
    return MEMBER_COLORS[idx % MEMBER_COLORS.length] || "#64748B";
  }

  const todayChores = chores.filter((c) => c.due_date === today);
  const upcomingChores = chores.filter((c) => c.due_date && c.due_date > today);
  const filteredAll = chores.filter((c) => filter === "all" || c.assigned_to === filter);
  const completedToday = todayChores.filter((c) => c.is_completed).length;

  if (loading) return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-[#1C1917]">{completedToday}/{todayChores.length}</p>
          <p className="text-xs text-[#78716C] mt-0.5">Done today</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-[#1C1917]">{upcomingChores.length}</p>
          <p className="text-xs text-[#78716C] mt-0.5">Coming up</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-4 text-center shadow-card">
          <p className="text-2xl font-bold text-[#1C1917]">{chores.filter((c) => c.is_completed).length}</p>
          <p className="text-xs text-[#78716C] mt-0.5">Total done</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#1C1917]">Today&apos;s Chores</h2>
          <Button size="sm" onClick={() => setShowAddChore(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Chore
          </Button>
        </div>

        {todayChores.length === 0 ? (
          <div className="text-center py-10 text-[#78716C]">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-400" />
            <p className="font-medium">All clear for today!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {todayChores.map((chore) => {
              const priority = PRIORITY_COLORS[chore.priority] || PRIORITY_COLORS.medium;
              return (
                <motion.div key={chore.id} layout>
                  <div className={`bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-card transition-opacity ${chore.is_completed ? "opacity-50" : ""} group`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleChore(chore.id, chore.is_completed)}
                        className={`h-6 w-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${chore.is_completed ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}
                      >
                        {chore.is_completed && <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${chore.is_completed ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>{chore.title}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priority.bg} ${priority.text}`}>{priority.label}</span>
                        </div>
                        {chore.description && <p className="text-xs text-[#78716C] mt-0.5">{chore.description}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={memberName(chore.assigned_to)} size="xs" color={memberColor(chore.assigned_to)} />
                            <span className="text-xs text-[#78716C]">{memberName(chore.assigned_to)}</span>
                          </div>
                          {chore.recurrence && chore.recurrence !== "none" && (
                            <Badge variant="secondary" className="text-xs">{RECURRENCE_LABELS[chore.recurrence]}</Badge>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteChore(chore.id)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {upcomingChores.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#1C1917] mb-3">Upcoming</h2>
          <div className="space-y-2">
            {upcomingChores.map((chore) => {
              const priority = PRIORITY_COLORS[chore.priority] || PRIORITY_COLORS.medium;
              return (
                <div key={chore.id} className="bg-white rounded-2xl border border-[#E7E5E4] p-3.5 shadow-card flex items-center gap-3 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1917]">{chore.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {chore.due_date && <span className="text-xs text-[#78716C]">{formatDate(chore.due_date, "MMM d")}</span>}
                    <Avatar name={memberName(chore.assigned_to)} size="xs" color={memberColor(chore.assigned_to)} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>{priority.label}</span>
                    <button onClick={() => deleteChore(chore.id)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#1C1917]">All Chores</h2>
          <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-primary-500 text-white" : "text-[#78716C] hover:text-[#1C1917]"}`}>All</button>
            {members.map((m) => (
              <button key={m.id} onClick={() => setFilter(m.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === m.id ? "bg-primary-500 text-white" : "text-[#78716C] hover:text-[#1C1917]"}`}>
                {m.display_name || "Member"}
              </button>
            ))}
          </div>
        </div>
        {filteredAll.length === 0 ? (
          <p className="text-sm text-[#78716C] text-center py-8">No chores yet. Add one to get started!</p>
        ) : (
          <div className="space-y-2">
            {filteredAll.map((chore) => {
              const priority = PRIORITY_COLORS[chore.priority] || PRIORITY_COLORS.medium;
              return (
                <div key={chore.id} className={`bg-white rounded-2xl border border-[#E7E5E4] p-3.5 shadow-card flex items-center gap-3 ${chore.is_completed ? "opacity-50" : ""} group`}>
                  <button
                    onClick={() => toggleChore(chore.id, chore.is_completed)}
                    className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${chore.is_completed ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}
                  >
                    {chore.is_completed && <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                  <span className={`flex-1 text-sm ${chore.is_completed ? "line-through text-[#78716C]" : "font-medium text-[#1C1917]"}`}>{chore.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {chore.due_date && <span className="text-xs text-[#78716C]">{formatDate(chore.due_date, "MMM d")}</span>}
                    <Avatar name={memberName(chore.assigned_to)} size="xs" color={memberColor(chore.assigned_to)} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>{priority.label}</span>
                    <button onClick={() => deleteChore(chore.id)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showAddChore} onClose={() => { setShowAddChore(false); setSaveError(null); }} title="Add Chore" size="md">
        <ModalBody className="space-y-4">
          <Input label="Chore name" placeholder="e.g. Vacuum living room" value={newChore.title} onChange={(e) => setNewChore({ ...newChore, title: e.target.value })} />
          <Textarea label="Description (optional)" placeholder="Any extra details..." value={newChore.description} onChange={(e) => setNewChore({ ...newChore, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assign to"
              value={newChore.assignee}
              onChange={(e) => setNewChore({ ...newChore, assignee: e.target.value })}
              options={members.map((m) => ({ value: m.id, label: m.display_name || "Member" }))}
            />
            <Input label="Due date" type="date" value={newChore.dueDate} onChange={(e) => setNewChore({ ...newChore, dueDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Recurrence" value={newChore.recurrence} onChange={(e) => setNewChore({ ...newChore, recurrence: e.target.value })} options={[{ value: "none", label: "One-time" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "biweekly", label: "Every 2 weeks" }, { value: "monthly", label: "Monthly" }]} />
            <Select label="Priority" value={newChore.priority} onChange={(e) => setNewChore({ ...newChore, priority: e.target.value })} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
          </div>
        </ModalBody>
        <ModalFooter>
          {saveError && <p className="text-sm text-red-500 flex-1">{saveError}</p>}
          <Button variant="outline" onClick={() => { setShowAddChore(false); setSaveError(null); }}>Cancel</Button>
          <Button onClick={addChore} loading={saving}>Add Chore</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
