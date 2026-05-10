"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type CalendarEvent = { id: string; title: string; description: string | null; start_at: string; end_at: string | null; color: string; recurrence: string | null };

type ViewMode = "month" | "week" | "day";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("month");
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: format(new Date(), "yyyy-MM-dd"), time: "", color: "#6366F1", description: "", recurrence: "none" });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user.id).single();
      if (!profile?.household_id) return;
      setHouseholdId(profile.household_id);
      const { data } = await supabase.from("calendar_events").select("*").eq("household_id", profile.household_id).order("start_at", { ascending: true });
      setEvents(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function addEvent() {
    if (!newEvent.title.trim() || !newEvent.date || !householdId || !userId) return;
    setSaving(true);
    const supabase = createClient();
    const startAt = newEvent.time ? `${newEvent.date}T${newEvent.time}:00` : `${newEvent.date}T00:00:00`;
    const { data, error } = await supabase.from("calendar_events").insert({
      household_id: householdId,
      created_by: userId,
      title: newEvent.title,
      description: newEvent.description || null,
      start_at: startAt,
      color: newEvent.color,
      recurrence: newEvent.recurrence !== "none" ? newEvent.recurrence : null,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setEvents((prev) => [...prev, data].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()));
      setNewEvent({ title: "", date: format(new Date(), "yyyy-MM-dd"), time: "", color: "#6366F1", description: "", recurrence: "none" });
      setShowAddEvent(false);
    }
  }

  async function deleteEvent(id: string) {
    const supabase = createClient();
    await supabase.from("calendar_events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const monthStart = startOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(endOfMonth(currentDate));
  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) { days.push(day); day = addDays(day, 1); }

  function getEventsForDay(d: Date) {
    return events.filter((e) => isSameDay(new Date(e.start_at), d));
  }

  const upcomingEvents = events.filter((e) => new Date(e.start_at) >= new Date()).slice(0, 8);
  const todayEvents = getEventsForDay(new Date());
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function eventTime(e: CalendarEvent) {
    try {
      const d = new Date(e.start_at);
      if (d.getHours() === 0 && d.getMinutes() === 0) return "All day";
      return format(d, "h:mm a");
    } catch { return ""; }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
            {(["month", "week", "day"] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${view === v ? "bg-primary-500 text-white" : "text-[#78716C] hover:text-[#1C1917]"}`}>{v}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#78716C] transition-colors"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-base font-semibold text-[#1C1917] min-w-[140px] text-center">{format(currentDate, "MMMM yyyy")}</h2>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#78716C] transition-colors"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddEvent(true)}>Add Event</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card padding="none" className="lg:col-span-3 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#E7E5E4]">
            {weekDays.map((wd) => (
              <div key={wd} className="py-2.5 text-center text-xs font-semibold text-[#78716C] uppercase tracking-wider">{wd}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              const dayEvents = getEventsForDay(d);
              const inMonth = isSameMonth(d, currentDate);
              const todayDay = isToday(d);
              return (
                <div
                  key={i}
                  className={`min-h-[90px] p-1.5 border-b border-r border-[#E7E5E4] cursor-pointer hover:bg-gray-50 transition-colors ${!inMonth ? "bg-gray-50/50" : ""}`}
                  onClick={() => { setNewEvent((prev) => ({ ...prev, date: format(d, "yyyy-MM-dd") })); setShowAddEvent(true); }}
                >
                  <div className={`h-7 w-7 flex items-center justify-center text-sm font-medium rounded-full mb-1 ${todayDay ? "bg-primary-500 text-white" : inMonth ? "text-[#1C1917]" : "text-gray-300"}`}>
                    {format(d, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="truncate text-xs px-1.5 py-0.5 rounded font-medium group flex items-center justify-between"
                        style={{ backgroundColor: event.color + "22", color: event.color }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="truncate">{event.title}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }} className="opacity-0 group-hover:opacity-100 flex-shrink-0 ml-1">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-xs text-[#78716C] px-1.5">+{dayEvents.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-[#1C1917] mb-4">Upcoming Events</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-[#78716C]">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="h-9 w-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: event.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1C1917] truncate">{event.title}</p>
                      <p className="text-xs text-[#78716C]">{format(new Date(event.start_at), "EEE, MMM d")}</p>
                      <p className="text-xs text-[#78716C]">{eventTime(event)}</p>
                    </div>
                    <button onClick={() => deleteEvent(event.id)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-[#1C1917] mb-3">Today</h3>
            {todayEvents.length === 0 ? (
              <p className="text-xs text-[#78716C]">No events today. Enjoy your free day!</p>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: event.color + "15" }}>
                    <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                    <span className="text-xs font-medium" style={{ color: event.color }}>{event.title}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal open={showAddEvent} onClose={() => setShowAddEvent(false)} title="Add Event" size="md">
        <ModalBody className="space-y-4">
          <Input label="Event title" placeholder="e.g. Date Night" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
            <Input label="Time (optional)" type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
          </div>
          <Textarea label="Description (optional)" placeholder="Add details about this event..." value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
          <Select label="Recurrence" value={newEvent.recurrence} onChange={(e) => setNewEvent({ ...newEvent, recurrence: e.target.value })} options={[{ value: "none", label: "No recurrence" }, { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} />
          <div>
            <label className="text-sm font-medium text-[#1C1917] mb-2 block">Color</label>
            <div className="flex gap-2">
              {["#6366F1", "#E8526A", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#F97316", "#64748B"].map((color) => (
                <button key={color} onClick={() => setNewEvent({ ...newEvent, color })} className={`h-7 w-7 rounded-full transition-all ${newEvent.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`} style={{ backgroundColor: color }} aria-label={`Select ${color}`} />
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
          <Button onClick={addEvent} loading={saving}>Add Event</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
