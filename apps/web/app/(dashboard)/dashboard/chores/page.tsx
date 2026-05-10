"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

// TODO: Replace with Supabase queries
const MOCK_CHORES = [
  { id: "1", title: "Vacuum living room", description: "", assignee: "Alex", assigneeColor: "#E8526A", dueDate: "2025-05-09", recurrence: "weekly", priority: "medium" as const, completed: false },
  { id: "2", title: "Do laundry", description: "Both loads — colors and whites", assignee: "Jordan", assigneeColor: "#6366F1", dueDate: "2025-05-09", recurrence: "weekly", priority: "high" as const, completed: true },
  { id: "3", title: "Empty dishwasher", description: "", assignee: "Alex", assigneeColor: "#E8526A", dueDate: "2025-05-09", recurrence: "daily", priority: "low" as const, completed: true },
  { id: "4", title: "Take out trash", description: "Recycling too", assignee: "Jordan", assigneeColor: "#6366F1", dueDate: "2025-05-09", recurrence: "weekly", priority: "high" as const, completed: false },
  { id: "5", title: "Grocery shopping", description: "", assignee: "Alex", assigneeColor: "#E8526A", dueDate: "2025-05-10", recurrence: "weekly", priority: "high" as const, completed: false },
  { id: "6", title: "Clean bathroom", description: "Sink, toilet, and shower", assignee: "Jordan", assigneeColor: "#6366F1", dueDate: "2025-05-11", recurrence: "weekly", priority: "medium" as const, completed: false },
  { id: "7", title: "Water plants", description: "", assignee: "Alex", assigneeColor: "#E8526A", dueDate: "2025-05-12", recurrence: "biweekly", priority: "low" as const, completed: false },
  { id: "8", title: "Meal prep Sunday", description: "", assignee: "Jordan", assigneeColor: "#6366F1", dueDate: "2025-05-11", recurrence: "weekly", priority: "medium" as const, completed: false },
];

const PRIORITY_COLORS = {
  low: { bg: "bg-slate-100", text: "text-slate-600", label: "Low" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  high: { bg: "bg-red-100", text: "text-red-700", label: "High" },
};

const RECURRENCE_LABELS: Record<string, string> = {
  none: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
};

export default function ChoresPage() {
  const [chores, setChores] = useState(MOCK_CHORES);
  const [showAddChore, setShowAddChore] = useState(false);
  const [filter, setFilter] = useState<"all" | "Alex" | "Jordan">("all");
  const [newChore, setNewChore] = useState({
    title: "",
    description: "",
    assignee: "Alex",
    dueDate: "",
    recurrence: "none",
    priority: "medium",
  });

  function toggleChore(id: string) {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  }

  function addChore() {
    if (!newChore.title.trim()) return;
    setChores((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        ...newChore,
        priority: newChore.priority as "low" | "medium" | "high",
        completed: false,
      },
    ]);
    setNewChore({ title: "", description: "", assignee: "Alex", dueDate: "", recurrence: "none", priority: "medium" });
    setShowAddChore(false);
  }

  const today = "2025-05-09";
  const todayChores = chores.filter((c) => c.dueDate === today);
  const upcomingChores = chores.filter((c) => c.dueDate > today);
  const filteredAll = chores.filter((c) => filter === "all" || c.assignee === filter);

  const completedToday = todayChores.filter((c) => c.completed).length;

  return (
    <div className="space-y-6">

      {/* Progress summary */}
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
          <p className="text-2xl font-bold text-[#1C1917]">{chores.filter((c) => c.completed).length}</p>
          <p className="text-xs text-[#78716C] mt-0.5">Total done</p>
        </div>
      </div>

      {/* Today's chores */}
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
              const priority = PRIORITY_COLORS[chore.priority];
              return (
                <motion.div key={chore.id} layout>
                  <div className={`bg-white rounded-2xl border border-[#E7E5E4] p-4 shadow-card transition-opacity ${chore.completed ? "opacity-50" : ""}`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleChore(chore.id)}
                        className={`h-6 w-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                          chore.completed
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-300 hover:border-emerald-400"
                        }`}
                      >
                        {chore.completed && (
                          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${chore.completed ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>
                            {chore.title}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priority.bg} ${priority.text}`}>
                            {priority.label}
                          </span>
                        </div>
                        {chore.description && (
                          <p className="text-xs text-[#78716C] mt-0.5">{chore.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={chore.assignee} size="xs" color={chore.assigneeColor} />
                            <span className="text-xs text-[#78716C]">{chore.assignee}</span>
                          </div>
                          {chore.recurrence !== "none" && (
                            <Badge variant="secondary" className="text-xs">{RECURRENCE_LABELS[chore.recurrence]}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming chores */}
      {upcomingChores.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#1C1917] mb-3">Upcoming</h2>
          <div className="space-y-2">
            {upcomingChores.map((chore) => {
              const priority = PRIORITY_COLORS[chore.priority];
              return (
                <div key={chore.id} className="bg-white rounded-2xl border border-[#E7E5E4] p-3.5 shadow-card flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1C1917]">{chore.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[#78716C]">{formatDate(chore.dueDate, "MMM d")}</span>
                    <Avatar name={chore.assignee} size="xs" color={chore.assigneeColor} />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>
                      {priority.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All chores with filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#1C1917]">All Chores</h2>
          <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
            {(["all", "Alex", "Jordan"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f ? "bg-primary-500 text-white" : "text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredAll.map((chore) => {
            const priority = PRIORITY_COLORS[chore.priority];
            return (
              <div
                key={chore.id}
                className={`bg-white rounded-2xl border border-[#E7E5E4] p-3.5 shadow-card flex items-center gap-3 ${chore.completed ? "opacity-50" : ""}`}
              >
                <button
                  onClick={() => toggleChore(chore.id)}
                  className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    chore.completed ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"
                  }`}
                >
                  {chore.completed && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm ${chore.completed ? "line-through text-[#78716C]" : "font-medium text-[#1C1917]"}`}>
                  {chore.title}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#78716C]">{formatDate(chore.dueDate, "MMM d")}</span>
                  <Avatar name={chore.assignee} size="xs" color={chore.assigneeColor} />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>
                    {priority.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Chore Modal */}
      <Modal open={showAddChore} onClose={() => setShowAddChore(false)} title="Add Chore" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Chore name"
            placeholder="e.g. Vacuum living room"
            value={newChore.title}
            onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
          />
          <Textarea
            label="Description (optional)"
            placeholder="Any extra details..."
            value={newChore.description}
            onChange={(e) => setNewChore({ ...newChore, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assign to"
              value={newChore.assignee}
              onChange={(e) => setNewChore({ ...newChore, assignee: e.target.value })}
              options={[
                { value: "Alex", label: "Alex" },
                { value: "Jordan", label: "Jordan" },
              ]}
            />
            <Input
              label="Due date"
              type="date"
              value={newChore.dueDate}
              onChange={(e) => setNewChore({ ...newChore, dueDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Recurrence"
              value={newChore.recurrence}
              onChange={(e) => setNewChore({ ...newChore, recurrence: e.target.value })}
              options={[
                { value: "none", label: "One-time" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "biweekly", label: "Every 2 weeks" },
                { value: "monthly", label: "Monthly" },
              ]}
            />
            <Select
              label="Priority"
              value={newChore.priority}
              onChange={(e) => setNewChore({ ...newChore, priority: e.target.value })}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddChore(false)}>Cancel</Button>
          <Button onClick={addChore}>Add Chore</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
