"use client";

import React, { useState, useEffect } from "react";
import { Plus, Target, Calendar, DollarSign, Hash, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, percentage, getDaysRemaining } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type GoalType = "none" | "monetary" | "count";

type Milestone = { id: string; title: string; is_completed: boolean };
type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  goal_type: GoalType;
  unit: string | null;
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

function goalProgress(goal: Goal): number {
  if (goal.goal_type !== "none" && goal.target_amount) {
    return percentage(goal.current_amount, goal.target_amount);
  }
  const milestones = goal.milestones || [];
  if (milestones.length > 0) {
    return Math.round((milestones.filter((m) => m.is_completed).length / milestones.length) * 100);
  }
  return 0;
}

function progressLabel(goal: Goal): { current: string; target: string } | null {
  if (goal.goal_type === "monetary" && goal.target_amount) {
    return { current: formatCurrency(goal.current_amount), target: formatCurrency(goal.target_amount) };
  }
  if (goal.goal_type === "count" && goal.target_amount) {
    const unit = goal.unit || "times";
    return { current: `${goal.current_amount} ${unit}`, target: `${goal.target_amount} ${unit}` };
  }
  return null;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressInput, setProgressInput] = useState("");

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Other",
    goal_type: "none" as GoalType,
    unit: "",
    target_amount: "",
    target_date: "",
  });

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

        const { data: goalsData } = await supabase
          .from("goals")
          .select("*, goal_milestones(*)")
          .eq("household_id", profile.household_id)
          .order("created_at", { ascending: false });

        setGoals((goalsData || []).map((g) => ({
          ...g,
          goal_type: (g.goal_type as GoalType) || "none",
          milestones: g.goal_milestones || [],
        })));
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
    if (newGoal.goal_type !== "none" && !newGoal.target_amount) {
      setSaveError("Please enter a target amount for this goal type.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("goals").insert({
      household_id: householdId,
      created_by: userId,
      title: newGoal.title,
      description: newGoal.description || null,
      category: newGoal.category,
      goal_type: newGoal.goal_type,
      unit: newGoal.goal_type === "count" ? (newGoal.unit.trim() || "times") : null,
      target_amount: newGoal.target_amount ? parseFloat(newGoal.target_amount) : null,
      current_amount: 0,
      target_date: newGoal.target_date || null,
      is_completed: false,
    }).select().single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (data) {
      setGoals((prev) => [{ ...data, goal_type: (data.goal_type as GoalType) || "none", milestones: [] }, ...prev]);
      setNewGoal({ title: "", description: "", category: "Other", goal_type: "none", unit: "", target_amount: "", target_date: "" });
      setShowAddGoal(false);
    }
  }

  async function deleteGoal(id: string) {
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (selectedGoal?.id === id) setSelectedGoal(null);
  }

  async function logProgress(goalId: string, amount: number) {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const newAmount = Math.min(goal.current_amount + amount, goal.target_amount ?? Infinity);
    const supabase = createClient();
    await supabase.from("goals").update({ current_amount: newAmount }).eq("id", goalId);
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, current_amount: newAmount } : g));
    setSelectedGoal((prev) => prev ? { ...prev, current_amount: newAmount } : null);
    setProgressInput("");
  }

  async function toggleMilestone(goalId: string, milestoneId: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("goal_milestones").update({ is_completed: !current }).eq("id", milestoneId);
    const update = (milestones: Milestone[]) =>
      milestones.map((m) => m.id === milestoneId ? { ...m, is_completed: !current } : m);
    setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, milestones: update(g.milestones || []) } : g));
    setSelectedGoal((prev) => prev ? { ...prev, milestones: update(prev.milestones || []) } : null);
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
            const pct = goalProgress(goal);
            const label = progressLabel(goal);
            const daysLeft = getDaysRemaining(goal.target_date || "");
            const color = CATEGORY_COLORS[goal.category || "Other"] || "#64748B";
            const icon = GOAL_ICONS[goal.category || "Other"] || "🎯";
            const milestones = goal.milestones || [];

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
                    {goal.goal_type !== "none" && goal.target_amount ? (
                      <span className="text-2xl font-bold" style={{ color }}>{pct}%</span>
                    ) : null}
                  </div>

                  {goal.description && <p className="text-sm text-[#78716C] mb-4">{goal.description}</p>}

                  {goal.goal_type !== "none" && goal.target_amount ? (
                    <div className="mb-4">
                      <Progress value={pct} color={color} size="md" />
                      {label && (
                        <div className="flex justify-between mt-1.5">
                          <span className="text-xs text-[#78716C]">{label.current}</span>
                          <span className="text-xs font-medium text-[#1C1917]">{label.target}</span>
                        </div>
                      )}
                    </div>
                  ) : milestones.length > 0 ? (
                    <div className="mb-4">
                      <Progress value={pct} color={color} size="md" />
                    </div>
                  ) : null}

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
        {selectedGoal && (() => {
          const pct = goalProgress(selectedGoal);
          const label = progressLabel(selectedGoal);
          const color = CATEGORY_COLORS[selectedGoal.category || "Other"] || "#64748B";
          return (
            <Modal open={!!selectedGoal} onClose={() => setSelectedGoal(null)} title={selectedGoal.title} size="lg">
              <ModalBody className="space-y-6">
                {selectedGoal.goal_type !== "none" && selectedGoal.target_amount && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[#1C1917]">Progress</span>
                      {label && (
                        <span className="text-sm font-semibold text-[#1C1917]">
                          {label.current} / {label.target}
                        </span>
                      )}
                    </div>
                    <Progress value={pct} color={color} size="lg" showLabel />
                  </div>
                )}

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
                            style={milestone.is_completed ? { backgroundColor: color, borderColor: "transparent" } : { borderColor: "#D1D5DB" }}
                          >
                            {milestone.is_completed && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span className={`text-sm ${milestone.is_completed ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>
                            {milestone.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGoal.goal_type === "monetary" && selectedGoal.target_amount && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-sm font-medium text-emerald-800 mb-2">Add funds</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={progressInput}
                        onChange={(e) => setProgressInput(e.target.value)}
                        leftAddon={<DollarSign className="h-4 w-4" />}
                      />
                      <Button variant="success" onClick={() => { if (progressInput) logProgress(selectedGoal.id, parseFloat(progressInput)); }}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {selectedGoal.goal_type === "count" && selectedGoal.target_amount && (
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <p className="text-sm font-medium text-indigo-800 mb-2">
                      Log progress · {selectedGoal.current_amount} / {selectedGoal.target_amount} {selectedGoal.unit || "times"}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => logProgress(selectedGoal.id, 1)}>
                        + 1 {selectedGoal.unit || "time"}
                      </Button>
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        value={progressInput}
                        onChange={(e) => setProgressInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="indigo" onClick={() => { if (progressInput) logProgress(selectedGoal.id, parseInt(progressInput)); }}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="destructive" onClick={() => deleteGoal(selectedGoal.id)}>Delete Goal</Button>
                <Button variant="outline" onClick={() => setSelectedGoal(null)}>Close</Button>
              </ModalFooter>
            </Modal>
          );
        })()}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <Modal open={showAddGoal} onClose={() => { setShowAddGoal(false); setSaveError(null); }} title="New Goal" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Goal title"
            placeholder="e.g. Run a marathon"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
          />
          <Textarea
            label="Description (optional)"
            placeholder="What are you working towards?"
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
          />
          <Select
            label="Category"
            value={newGoal.category}
            onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
            options={Object.keys(CATEGORY_COLORS).map((k) => ({ value: k, label: k }))}
          />

          {/* Tracking type */}
          <div>
            <p className="text-sm font-medium text-[#1C1917] mb-2">How do you want to track this?</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "none", icon: "🎯", label: "No target" },
                { value: "monetary", icon: "💵", label: "Dollar amount" },
                { value: "count", icon: "#", label: "Count" },
              ] as { value: GoalType; icon: string; label: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewGoal({ ...newGoal, goal_type: opt.value, target_amount: "", unit: "" })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    newGoal.goal_type === opt.value
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-[#E7E5E4] text-[#78716C] hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {newGoal.goal_type === "monetary" && (
            <Input
              label="Target amount"
              type="number"
              placeholder="e.g. 5000"
              value={newGoal.target_amount}
              onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
              leftAddon={<DollarSign className="h-4 w-4" />}
            />
          )}

          {newGoal.goal_type === "count" && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Target count"
                type="number"
                placeholder="e.g. 3"
                value={newGoal.target_amount}
                onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                leftAddon={<Hash className="h-4 w-4" />}
              />
              <Input
                label="Unit (optional)"
                placeholder="e.g. camping trips"
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              />
            </div>
          )}

          <Input
            label="Target date (optional)"
            type="date"
            value={newGoal.target_date}
            onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
          />
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
