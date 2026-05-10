"use client";

import React, { useState } from "react";
import { Plus, Target, Calendar, DollarSign, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, percentage, getDaysRemaining } from "@/lib/utils";

// TODO: Replace with Supabase queries
const MOCK_GOALS = [
  {
    id: "1",
    title: "Emergency Fund",
    description: "6 months of living expenses in savings",
    category: "Finance",
    target_amount: 10000,
    current_amount: 6500,
    target_date: "2025-12-31",
    is_completed: false,
    color: "#10B981",
    icon: "💰",
    milestones: [
      { id: "m1", title: "Save $2,000", is_completed: true },
      { id: "m2", title: "Save $5,000", is_completed: true },
      { id: "m3", title: "Save $8,000", is_completed: false },
      { id: "m4", title: "Reach full $10,000", is_completed: false },
    ],
  },
  {
    id: "2",
    title: "Europe Trip 2026",
    description: "2-week trip through Italy, France, and Spain",
    category: "Travel",
    target_amount: 5000,
    current_amount: 2200,
    target_date: "2026-06-01",
    is_completed: false,
    color: "#6366F1",
    icon: "✈️",
    milestones: [
      { id: "m1", title: "Book flights", is_completed: false },
      { id: "m2", title: "Save $2,500", is_completed: false },
      { id: "m3", title: "Plan itinerary", is_completed: false },
    ],
  },
  {
    id: "3",
    title: "New Living Room Couch",
    description: "Upgrade from the old IKEA couch",
    category: "Home",
    target_amount: 1200,
    current_amount: 800,
    target_date: "2025-07-01",
    is_completed: false,
    color: "#F59E0B",
    icon: "🛋️",
    milestones: [
      { id: "m1", title: "Research options", is_completed: true },
      { id: "m2", title: "Save $600", is_completed: true },
      { id: "m3", title: "Order couch", is_completed: false },
    ],
  },
  {
    id: "4",
    title: "Run a 5K together",
    description: "Train and complete our first 5K race",
    category: "Health",
    target_amount: null,
    current_amount: 0,
    target_date: "2025-09-15",
    is_completed: false,
    color: "#EF4444",
    icon: "🏃",
    milestones: [
      { id: "m1", title: "Sign up for race", is_completed: true },
      { id: "m2", title: "Complete Week 4 of training", is_completed: false },
      { id: "m3", title: "Run 3 miles without stopping", is_completed: false },
      { id: "m4", title: "Complete the race!", is_completed: false },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Finance: "#10B981",
  Travel: "#6366F1",
  Home: "#F59E0B",
  Health: "#EF4444",
  Career: "#8B5CF6",
  Education: "#06B6D4",
  Other: "#64748B",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState(MOCK_GOALS);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<typeof MOCK_GOALS[0] | null>(null);
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Finance",
    target_amount: "",
    target_date: "",
  });

  function toggleMilestone(goalId: string, milestoneId: string) {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, is_completed: !m.is_completed } : m
              ),
            }
          : g
      )
    );
  }

  function openGoalDetail(goal: typeof MOCK_GOALS[0]) {
    setSelectedGoal(goal);
    setShowGoalDetail(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Goals</h2>
          <p className="text-sm text-[#78716C]">{goals.filter((g) => !g.is_completed).length} active goals</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddGoal(true)}>
          New Goal
        </Button>
      </div>

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal, i) => {
          const pct = goal.target_amount
            ? percentage(goal.current_amount, goal.target_amount)
            : Math.round((goal.milestones.filter((m) => m.is_completed).length / goal.milestones.length) * 100);
          const daysLeft = getDaysRemaining(goal.target_date);
          const completedMilestones = goal.milestones.filter((m) => m.is_completed).length;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
            >
              <Card hover className="cursor-pointer" onClick={() => openGoalDetail(goal)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-semibold text-[#1C1917]">{goal.title}</h3>
                      <Badge
                        className="text-xs mt-0.5"
                        style={{
                          backgroundColor: (CATEGORY_COLORS[goal.category] || "#64748B") + "18",
                          color: CATEGORY_COLORS[goal.category] || "#64748B",
                          border: "none",
                        }}
                      >
                        {goal.category}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: goal.color }}>
                    {pct}%
                  </span>
                </div>

                {goal.description && (
                  <p className="text-sm text-[#78716C] mb-4">{goal.description}</p>
                )}

                {/* Progress bar */}
                <div className="mb-4">
                  <Progress value={pct} color={goal.color} size="md" />
                  {goal.target_amount && (
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-[#78716C]">{formatCurrency(goal.current_amount)} saved</span>
                      <span className="text-xs font-medium text-[#1C1917]">{formatCurrency(goal.target_amount)} goal</span>
                    </div>
                  )}
                </div>

                {/* Milestones preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {goal.milestones.slice(0, 4).map((m, mi) => (
                        <div
                          key={mi}
                          className={`h-2 w-2 rounded-full ${m.is_completed ? "" : "bg-gray-200"}`}
                          style={m.is_completed ? { backgroundColor: goal.color } : undefined}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#78716C]">
                      {completedMilestones}/{goal.milestones.length} milestones
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#78716C]">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {daysLeft > 0 ? `${daysLeft} days left` : "Past due"}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Goal Detail Modal */}
      <AnimatePresence>
        {showGoalDetail && selectedGoal && (
          <Modal open={showGoalDetail} onClose={() => setShowGoalDetail(false)} title={selectedGoal.title} size="lg">
            <ModalBody className="space-y-6">
              {/* Progress */}
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
                  value={selectedGoal.target_amount
                    ? percentage(selectedGoal.current_amount, selectedGoal.target_amount)
                    : Math.round((selectedGoal.milestones.filter((m) => m.is_completed).length / selectedGoal.milestones.length) * 100)}
                  color={selectedGoal.color}
                  size="lg"
                  showLabel
                />
              </div>

              {/* Details */}
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
                  <p className="text-sm font-medium text-[#1C1917]">
                    {getDaysRemaining(selectedGoal.target_date)} days
                  </p>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <p className="text-sm font-semibold text-[#1C1917] mb-3">Milestones</p>
                <div className="space-y-2">
                  {selectedGoal.milestones.map((milestone) => (
                    <button
                      key={milestone.id}
                      onClick={() => {
                        toggleMilestone(selectedGoal.id, milestone.id);
                        setSelectedGoal((prev) =>
                          prev
                            ? {
                                ...prev,
                                milestones: prev.milestones.map((m) =>
                                  m.id === milestone.id ? { ...m, is_completed: !m.is_completed } : m
                                ),
                              }
                            : null
                        );
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E7E5E4] hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          milestone.is_completed ? "border-transparent" : "border-gray-300"
                        }`}
                        style={milestone.is_completed ? { backgroundColor: selectedGoal.color } : undefined}
                      >
                        {milestone.is_completed && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={`text-sm ${milestone.is_completed ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}
                      >
                        {milestone.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add funds (if financial goal) */}
              {selectedGoal.target_amount && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-sm font-medium text-emerald-800 mb-2">Add funds</p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      className="flex-1"
                    />
                    <Button variant="success" size="default">Add</Button>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowGoalDetail(false)}>Close</Button>
              <Button>Edit Goal</Button>
            </ModalFooter>
          </Modal>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <Modal open={showAddGoal} onClose={() => setShowAddGoal(false)} title="New Goal" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Goal title"
            placeholder="e.g. Europe Trip 2026"
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target amount (optional)"
              type="number"
              placeholder="e.g. 5000"
              value={newGoal.target_amount}
              onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
              leftAddon={<DollarSign className="h-4 w-4" />}
            />
            <Input
              label="Target date"
              type="date"
              value={newGoal.target_date}
              onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddGoal(false)}>Cancel</Button>
          <Button onClick={() => setShowAddGoal(false)}>Create Goal</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
