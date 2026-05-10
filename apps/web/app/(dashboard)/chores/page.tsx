"use client";

import React, { useState } from "react";
import { Plus, Trophy, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

// TODO: Replace with Supabase queries
const MOCK_CHORES = [
  { id: "1", title: "Vacuum living room", description: "", assignee: "Alex", assigneeColor: "#E8526A", dueDate: "2025-05-09", recurrence: "weekly", priority: "medium" as const, points: 10, completed: false },
  { id: "2", title: "Do laundry", description: "Both loads — colors and whites", assignee: "Jordan", assigneeColor: "#6366F1", dueDate: "2025-05-09", recurrence: "weekly", priority: "high" as const, points: 15, completed: true },
  { id: "3", title: "Empty dishwasher", description: "", assignee: "Alex", assigneeColor: "#E8526A", dueDate: "2025-05-09", recurrence: "daily", priority: "low" as const, points: 5, completed: true },
  { id: "4", title: "Take out trash", description: "Recycling too", assignee: "Jordan", assigneeColor: "#6366F1", dueDate: "2025-05-09", recurrence: "weekly", priority: "high" as const, points: 10, completed: false },
  { id: "5", title: "Grocery shopping", description: "", assignee: "Alex", assigneeColor: "#E8526A", dueDate: "2025-05-10", recurrence: "weekly", priority: "high" as const, points: 20, completed: false },
  { id: "6", title: "Clean bathroom", description: "Sink, toilet, and shower", assignee: "Jordan", assigneeColor: "#6366F1", dueDate: "2025-05-11", recurrence: "weekly", priority: "medium" as const, points: 20, completed: false },
  { id: "7", title: "Water plants", description: "", assignee: "Alex", assigneeColor: "#E8526A", dueDate: "2025-05-12", recurrence: "biweekly", priority: "low" as const, points: 5, completed: false },
  { id: "8", title: "Meal prep Sunday", description: "", assignee: "Jordan", assigneeColor: "#6366F1", dueDate: "2025-05-11", recurrence: "weekly", priority: "medium" as const, points: 25, completed: false },
];

const SCORES = {
  Alex: { total: 145, thisWeek: 15, streak: 5 },
  Jordan: { total: 180, thisWeek: 15, streak: 8 },
};

const PRIORITY_COLORS = {
  low: { bg: "bg-slate-100", text: "text-slate-600", label: "Low" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  high: { bg: "bg-red-100", text: "text-red-700", label: "High" },
};

function ConfettiParticle({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none w-2 h-2 rounded-sm"
      style={{ backgroundColor: color }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: (Math.random() - 0.5) * 100,
        y: -60 - Math.random() * 40,
        opacity: 0,
        scale: 0,
        rotate: Math.random() * 360,
      }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    />
  );
}

export default function ChoresPage() {
  const [chores, setChores] = useState(MOCK_CHORES);
  const [showAddChore, setShowAddChore] = useState(false);
  const [confettiId, setConfettiId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "Alex" | "Jordan">("all");
  const [newChore, setNewChore] = useState({
    title: "",
    description: "",
    assignee: "Alex",
    dueDate: "",
    recurrence: "none",
    priority: "medium",
    points: "10",
  });

  function completeChore(id: string) {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
    const chore = chores.find((c) => c.id === id);
    if (chore && !chore.completed) {
      setConfettiId(id);
      setTimeout(() => setConfettiId(null), 800);
    }
  }

  const todayChores = chores.filter((c) => c.dueDate === "2025-05-09");
  const upcomingChores = chores.filter((c) => c.dueDate > "2025-05-09");
  const filteredChores = chores.filter((c) =>
    filter === "all" ? true : c.assignee === filter
  );

  const alexScore = SCORES.Alex;
  const jordanScore = SCORES.Jordan;
  const alexLeads = alexScore.total >= jordanScore.total;

  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <Card className="overflow-hidden" padding="none">
        <div className="px-5 pt-5 pb-4 border-b border-[#E7E5E4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-amber-600" />
            </div>
            <CardTitle>Scoreboard</CardTitle>
          </div>
          <Badge variant="warning" className="text-xs">This month</Badge>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Alex", color: "#E8526A", score: alexScore, leading: alexLeads },
              { name: "Jordan", color: "#6366F1", score: jordanScore, leading: !alexLeads },
            ].map((person) => (
              <motion.div
                key={person.name}
                className={`relative p-4 rounded-xl border-2 ${person.leading ? "border-amber-400 bg-amber-50" : "border-[#E7E5E4]"}`}
                animate={person.leading ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {person.leading && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Trophy className="h-5 w-5 text-amber-500 fill-amber-400" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={person.name} size="md" color={person.color} />
                  <div>
                    <p className="font-semibold text-[#1C1917]">{person.name}</p>
                    {person.leading && (
                      <p className="text-xs text-amber-600 font-medium">Leading! 🏆</p>
                    )}
                  </div>
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold" style={{ color: person.color }}>
                    {person.score.total}
                  </span>
                  <span className="text-sm text-[#78716C] mb-1">pts</span>
                </div>
                <div className="flex gap-4 text-xs text-[#78716C]">
                  <div>
                    <span className="font-medium text-[#1C1917]">+{person.score.thisWeek}</span> this week
                  </div>
                  <div>
                    <Zap className="h-3 w-3 text-amber-400 inline" /> {person.score.streak} day streak
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Today's chores */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#1C1917]">
            Today&apos;s Chores
          </h2>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddChore(true)}>
            Add Chore
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {todayChores.map((chore) => {
            const priorityStyle = PRIORITY_COLORS[chore.priority];
            return (
              <motion.div
                key={chore.id}
                layout
                className="relative"
              >
                {confettiId === chore.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {["#E8526A", "#F59E0B", "#10B981", "#6366F1", "#8B5CF6"].map((color, i) => (
                      <ConfettiParticle key={i} color={color} />
                    ))}
                  </div>
                )}
                <Card className={`transition-all ${chore.completed ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => completeChore(chore.id)}
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priorityStyle.bg} ${priorityStyle.text}`}>
                          {priorityStyle.label}
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
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium text-amber-600">{chore.points} pts</span>
                        </div>
                        {chore.recurrence !== "none" && (
                          <Badge variant="secondary" className="text-xs">{chore.recurrence}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

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
          {filteredChores.map((chore) => {
            const priorityStyle = PRIORITY_COLORS[chore.priority];
            return (
              <Card key={chore.id} className={`${chore.completed ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => completeChore(chore.id)}
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                      {priorityStyle.label}
                    </span>
                    <span className="text-xs font-medium text-amber-600">{chore.points}pts</span>
                  </div>
                </div>
              </Card>
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
          <Input
            label="Points"
            type="number"
            value={newChore.points}
            onChange={(e) => setNewChore({ ...newChore, points: e.target.value })}
            helperText="Gamification points awarded when completed"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddChore(false)}>Cancel</Button>
          <Button onClick={() => setShowAddChore(false)}>Add Chore</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
