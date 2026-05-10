"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Link2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// TODO: Replace with Supabase queries
const MOCK_EVENTS = [
  { id: "1", title: "Dentist Appointment", date: "2025-05-12", time: "2:30 PM", color: "#6366F1", description: "Alex's dentist checkup" },
  { id: "2", title: "Date Night", date: "2025-05-14", time: "7:00 PM", color: "#E8526A", description: "Italian Restaurant downtown" },
  { id: "3", title: "Mom's Birthday Dinner", date: "2025-05-16", time: "6:00 PM", color: "#F59E0B", description: "Family dinner at Mom's" },
  { id: "4", title: "Weekend Hike", date: "2025-05-18", time: "9:00 AM", color: "#10B981", description: "Blue Ridge trail hike" },
  { id: "5", title: "Jordan's Work Conference", date: "2025-05-20", time: "All day", color: "#8B5CF6", description: "Annual design conference" },
  { id: "6", title: "Couples Cooking Class", date: "2025-05-24", time: "6:00 PM", color: "#EF4444", description: "Italian cooking class" },
  { id: "7", title: "Memorial Day BBQ", date: "2025-05-26", time: "2:00 PM", color: "#F97316", description: "Backyard BBQ with friends" },
  { id: "8", title: "HOA Meeting", date: "2025-05-08", time: "7:00 PM", color: "#64748B", description: "" },
];

type ViewMode = "month" | "week" | "day";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 9)); // May 9, 2025
  const [view, setView] = useState<ViewMode>("month");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    color: "#6366F1",
    description: "",
    recurrence: "none",
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Build calendar grid
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (d: Date) =>
    MOCK_EVENTS.filter((e) => isSameDay(new Date(e.date), d));

  const upcomingEvents = MOCK_EVENTS.filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  view === v
                    ? "bg-primary-500 text-white"
                    : "text-[#78716C] hover:text-[#1C1917]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-[#78716C] transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold text-[#1C1917] min-w-[140px] text-center">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-[#78716C] transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Link2 className="h-4 w-4" />}>
            Google Calendar
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddEvent(true)}>
            Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar grid */}
        <Card padding="none" className="lg:col-span-3 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#E7E5E4]">
            {weekDays.map((wd) => (
              <div key={wd} className="py-2.5 text-center text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                {wd}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const dayEvents = getEventsForDay(d);
              const inMonth = isSameMonth(d, currentDate);
              const today = isToday(d);

              return (
                <div
                  key={i}
                  className={`min-h-[90px] p-1.5 border-b border-r border-[#E7E5E4] last-in-row:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !inMonth ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => {
                    setSelectedDay(d);
                    setNewEvent({ ...newEvent, date: format(d, "yyyy-MM-dd") });
                    setShowAddEvent(true);
                  }}
                >
                  <div
                    className={`h-7 w-7 flex items-center justify-center text-sm font-medium rounded-full mb-1 ${
                      today
                        ? "bg-primary-500 text-white"
                        : inMonth
                        ? "text-[#1C1917]"
                        : "text-gray-300"
                    }`}
                  >
                    {format(d, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="truncate text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{ backgroundColor: event.color + "22", color: event.color }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-[#78716C] px-1.5">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming events sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-[#1C1917] mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div
                    className="h-9 w-1.5 rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1C1917] truncate">{event.title}</p>
                    <p className="text-xs text-[#78716C]">
                      {format(new Date(event.date), "EEE, MMM d")}
                    </p>
                    <p className="text-xs text-[#78716C]">{event.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-[#1C1917] mb-3">Today</h3>
            <div className="space-y-2">
              {getEventsForDay(new Date()).length === 0 ? (
                <p className="text-xs text-[#78716C]">No events today. Enjoy your free day!</p>
              ) : (
                getEventsForDay(new Date()).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ backgroundColor: event.color + "15" }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                    <span className="text-xs font-medium" style={{ color: event.color }}>{event.title}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal open={showAddEvent} onClose={() => setShowAddEvent(false)} title="Add Event" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Event title"
            placeholder="e.g. Date Night"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
          </div>
          <Textarea
            label="Description (optional)"
            placeholder="Add details about this event..."
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          <Select
            label="Recurrence"
            value={newEvent.recurrence}
            onChange={(e) => setNewEvent({ ...newEvent, recurrence: e.target.value })}
            options={[
              { value: "none", label: "No recurrence" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <div>
            <label className="text-sm font-medium text-[#1C1917] mb-2 block">Color</label>
            <div className="flex gap-2">
              {["#6366F1", "#E8526A", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#F97316", "#64748B"].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewEvent({ ...newEvent, color })}
                  className={`h-7 w-7 rounded-full transition-all ${newEvent.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
          <Button onClick={() => setShowAddEvent(false)}>Add Event</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
