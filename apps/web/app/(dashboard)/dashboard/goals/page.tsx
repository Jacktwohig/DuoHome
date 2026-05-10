"use client";

import React, { useState, useEffect } from "react";
import { Plus, Target, Calendar, DollarSign, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, percentage, getDaysRemaining } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Milestone = { id: string; title: string; is_completed: boolean };
type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_amount: number | null;
  current_amount: number;
  target_date: string | null;
  is_completed: boolean;
  milestones?: Milestone[];
};

const CATEGORY_COLORS: Record<string, string> = {
  Finance: "#10B981", Travel: "#6366F1", Home: "#F59E0B", Health: "#EF4444",
  Career: "#8B5CF6", Education: "#06B6D4", Other: "#64748B",
};

const GOAL_ICONS: Record<string, string> = {
  Finance: "💰", Travel: "✈️", Home: "🏠", Health: "🏃", Career: "💼", Education: "📚", Other: "🎯",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [newGoal, setNewGoal] = useState({ title: "", description: "", category: "Finance", target_amount: "", target_date: "" });

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

        const { data: goalsData } = await supabase.from("goals").select("*, goal_milestones(*)").eq("household_id", profile.household_id).order("created_at", { ascending: false });
        setGoals((goalsData || []).map((g) => ({ ...g, milestones: g.goal_milestones || [] })));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function addGoal() {
    setSaveError(null);
    if (!newGoal.title.trim()) { setSaveError("Goal title is required."); return; }
    if (!householdId || !userId) { setSaveError("No household found. Please sign out and sign back in."); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("goals").insert({
      household_id: householdId,
      created_by: userId,
      title: newGoal.title,
      description: newGoal.description || null,
      category: newGoal.category,
      target_amount: newGoal.target_amount ? parseFloat(newGoal.target_amount) : null,
      current_amount: 0,
      target_date: newGoal.target_date || null,
      is_completed: false,
    }).select().single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (data) {
      setGoals((prev) => [{ ...data, milestones: [] }, ...prev]);
      setNewGoal({ title: "", description: "", category: "Finance", target_amount: "", target_date: "" });
      setShowAddGoal(false);
    }
  }

  async function deleteGoal(id: string) {
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (selectedGoal?.id === id) setSelectedGoal(null);
  }

  async function addFunds(goalId: string, amount: number) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const newAmount = goal.current_amount + amount;
    const supabase = createClient();
    await supabase.from("goals").update({ current_amount: newAmount }).eq("id", goalId);
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, current_amount: newAmount } : g)));
    setSelectedGoal((prev) => prev ? { ...prev, current_amount: newAmount } : null);
    setAddFundsAmount("");
  }

  async function toggleMilestone(goalId: string, milestoneId: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("goal_milestones").update({ is_completed: !current }).eq("id", milestoneId);
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, milestones: g.milestones?.map((m) => m.id === milestoneId ? { ...m, is_completed: !current } : m) } : g));
    setSelectedGoal((prev) => prev ? { ...prev, milestones: prev.milestones?.map((m) => m.id === milestoneId ? { ...m, is_completed: !current } : m) } : null);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Goals</h2>
          <p className="text-sm text-[#78716C]">{goals.filter((g) => !g.is_completed).length} active goals</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddGoal(true)}>New Goal</Button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 text-[#78716C]">
          <Target className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No goals yet</p>
          <p className="text-sm mt-1">Set your first goal together!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal, i) => {
            const milestones = goal.milestones || [];
            const pct = goal.target_amount
              ? percentage(goal.current_amount, goal.target_amount)
              : milestones.length > 0
              ? Math.round((milestones.filter((m) => m.is_completed).length / milestones.length) * 100)
              : 0;
            const daysLeft = getDaysRemaining(goal.target_date || "");
            const color = CATEGORY_COLORS[goal.category || "Other"] || "#64748B";
            const icon = GOAL_ICONS[goal.category || "Other"] || "🎯";

            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.07 }}>
                <Card hover className="cursor-pointer relative group" onClick={() => setSelectedGoal(goal)}>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                    className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <h3 className="font-semibold text-[#1C1917]">{goal.title}</h3>
                        <Badge className="text-xs mt-0.5" style={{ backgroundColor: color + "18", color, border: "none" }}>
                          {goal.category || "Other"}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-2xl font-bold" style={{ color }}>{pct}%</span>
                  </div>
                  {goal.description && <p className="text-sm text-[#78716C] mb-4">{goal.description}</p>}
                  <div className="mb-4">
                    <Progress value={pct} color={color} size="md" />
                    {goal.target_amount && (
                      <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-[#78716C]">{formatCurrency(goal.current_amount)} saved</span>
                        <span className="text-xs font-medium text-[#1C1917]">{formatCurrency(goal.target_amount)} goal</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {milestones.length > 0 && (
                        <>
                          <div className="flex gap-1">
                            {milestones.slice(0, 4).map((m, mi) => (
                              <div key={mi} className="h-2 w-2 rounded-full" style={m.is_completed ? { backgroundColor: color } : { backgroundColor: "#E5E7EB" }} />
                            ))}
                          </div>
                          <span className="text-xs text-[#78716C]">{milestones.filter((m) => m.is_completed).length}/{milestones.length} milestones</span>
                        </>
                      )}
                    </div>
                    {goal.target_date && (
                      <div className="flex items-center gap-1 text-xs text-[#78716C]">
                        <Calendar className="h-3 w-3" />
                        <span>{daysLeft > 0 ? `${daysLeft} days left` : "Past due"}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Goal Detail Modal */}
      <AnimatePresence>
        {selectedGoal && (
          <Modal open={!!selectedGoal} onClose={() => setSelectedGoal(null)} title={selectedGoal.title} size="lg">
            <ModalBody className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#1C1917]">Progress</span>
                  {selectedGoal.target_amount && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-[#78716C]" />
                      <span className="text-sm font-semibold text-[#1C1917]">
                        {formatCurrency(selectedGoal.current_amount)} / {formatCurrency(selectedGoal.target_amount)}
                      </span>
                    </div>
                  )}
                </div>
                <Progress
                  value={selectedGoal.target_amount ? percentage(selectedGoal.current_amount, selectedGoal.target_amount) : selectedGoal.milestones?.length ? Math.round((selectedGoal.milestones.filter((m) => m.is_completed).length / selectedGoal.milestones.length) * 100) : 0}
                  color={CATEGORY_COLORS[selectedGoal.category || "Other"] || "#64748B"}
                  size="lg"
                  showLabel
                />
              </div>

              {selectedGoal.target_date && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-xs text-[#78716C] mb-1">Target Date</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-[#1C1917]" />
                      <p className="text-sm font-medium text-[#1C1917]">{formatDate(selectedGoal.target_date)}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-xs text-[#78716C] mb-1">Days Remaining</p>
                    <p className="text-sm font-medium text-[#1C1917]">{getDaysRemaining(selectedGoal.target_date)} days</p>
                  </div>
                </div>
              )}

              {(selectedGoal.milestones || []).length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#1C1917] mb-3">Milestones</p>
                  <div className="space-y-2">
                    {(selectedGoal.milestones || []).map((milestone) => (
                      <button
                        key={milestone.id}
                        onClick={() => toggleMilestone(selectedGoal.id, milestone.id, milestone.is_completed)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E7E5E4] hover:bg-gray-50 transition-colors text-left"
                      >
                        <div
                          className="h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={milestone.is_completed ? { backgroundColor: CATEGORY_COLORS[selectedGoal.category || "Other"] || "#64748B", borderColor: "transparent" } : { borderColor: "#D1D5DB" }}
                        >
                          {milestone.is_completed && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`text-sm ${milestone.is_completed ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>{milestone.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedGoal.target_amount && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-sm font-medium text-emerald-800 mb-2">Add funds</p>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Enter amount" value={addFundsAmount} onChange={(e) => setAddFundsAmount(e.target.value)} className="flex-1" />
                    <Button variant="success" onClick={() => { if (addFundsAmount) addFunds(selectedGoal.id, parseFloat(addFundsAmount)); }}>Add</Button>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="destructive" onClick={() => deleteGoal(selectedGoal.id)}>Delete Goal</Button>
              <Button variant="outline" onClick={() => setSelectedGoal(null)}>Close</Button>
            </ModalFooter>
          </Modal>
        )}
      </AnimatePresence>

      <Modal open={showAddGoal} onClose={() => { setShowAddGoal(false); setSaveError(null); }} title="New Goal" size="md">
        <ModalBody className="space-y-4">
          <Input label="Goal title" placeholder="e.g. Europe Trip 2026" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} />
          <Textarea label="Description (optional)" placeholder="What are you working towards?" value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} />
          <Select label="Category" value={newGoal.category} onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })} options={Object.keys(CATEGORY_COLORS).map((k) => ({ value: k, label: k }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target amount (optional)" type="number" placeholder="e.g. 5000" value={newGoal.target_amount} onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })} leftAddon={<DollarSign className="h-4 w-4" />} />
            <Input label="Target date" type="date" value={newGoal.target_date} onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })} />
          </div>
        </ModalBody>
        <ModalFooter>
          {saveError && <p className="text-sm text-red-500 flex-1">{saveError}</p>}
          <Button variant="outline" onClick={() => { setShowAddGoal(false); setSaveError(null); }}>Cancel</Button>
          <Button onClick={addGoal} loading={saving}>Create Goal</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
