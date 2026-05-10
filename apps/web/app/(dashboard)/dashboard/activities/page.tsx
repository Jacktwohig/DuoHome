"use client";

import React, { useState, useEffect } from "react";
import { Plus, MapPin, DollarSign, Calendar, Heart, Plane, Star, Utensils, Ticket, Mountain, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  cost: number | null;
  status: string;
  notes: string | null;
};

type FilterTab = "all" | "date" | "travel" | "event" | "restaurant" | "activity";
type StatusFilter = "all" | "wishlist" | "planned" | "completed";

const TYPE_ICONS = {
  date: Heart,
  travel: Plane,
  event: Ticket,
  restaurant: Utensils,
  activity: Mountain,
};

const TYPE_COLORS = {
  date: "#E8526A",
  travel: "#6366F1",
  event: "#8B5CF6",
  restaurant: "#F97316",
  activity: "#10B981",
};

const STATUS_STYLES = {
  wishlist: { bg: "bg-gray-100", text: "text-gray-600", label: "Wishlist" },
  planned: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Planned" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "", description: "", activity_type: "date", start_date: "", end_date: "",
    location: "", cost: "", status: "wishlist", notes: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user.id).single();
      if (!profile?.household_id) return;
      setHouseholdId(profile.household_id);
      const { data } = await supabase.from("activities").select("*").eq("household_id", profile.household_id).order("start_date", { ascending: true, nullsFirst: false });
      setActivities(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function addActivity() {
    if (!newActivity.title.trim() || !householdId || !userId) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("activities").insert({
      household_id: householdId,
      created_by: userId,
      title: newActivity.title,
      description: newActivity.description || null,
      activity_type: newActivity.activity_type,
      start_date: newActivity.start_date || null,
      end_date: newActivity.end_date || null,
      location: newActivity.location || null,
      cost: newActivity.cost ? parseFloat(newActivity.cost) : null,
      status: newActivity.status,
      notes: newActivity.notes || null,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setActivities((prev) => [...prev, data]);
      setNewActivity({ title: "", description: "", activity_type: "date", start_date: "", end_date: "", location: "", cost: "", status: "wishlist", notes: "" });
      setShowAddActivity(false);
    }
  }

  async function deleteActivity(id: string) {
    const supabase = createClient();
    await supabase.from("activities").delete().eq("id", id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }

  const filteredActivities = activities.filter((a) => {
    const matchesType = filter === "all" || a.activity_type === filter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const wishlist = filteredActivities.filter((a) => a.status === "wishlist");
  const planned = filteredActivities.filter((a) => a.status === "planned");
  const completed = filteredActivities.filter((a) => a.status === "completed");

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Activities & Travel</h2>
          <p className="text-sm text-[#78716C]">
            {activities.filter((a) => a.status === "planned").length} planned · {activities.filter((a) => a.status === "wishlist").length} on wishlist
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddActivity(true)}>
          Add Activity
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
          {(["all", "date", "travel", "event", "restaurant", "activity"] as FilterTab[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-primary-500 text-white" : "text-[#78716C] hover:text-[#1C1917]"}`}
            >
              {f === "all" ? "All" : f === "date" ? "Date Nights" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
          {(["all", "wishlist", "planned", "completed"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === s ? "bg-gray-800 text-white" : "text-[#78716C] hover:text-[#1C1917]"}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-16 text-[#78716C]">
          <MapPin className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No activities yet</p>
          <p className="text-sm mt-1">Add your first date night, travel plan, or activity!</p>
        </div>
      )}

      {planned.length > 0 && (statusFilter === "all" || statusFilter === "planned") && (
        <div>
          <h3 className="text-base font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" /> Planned
          </h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E7E5E4]" />
            <div className="space-y-4">
              {planned.map((activity, i) => {
                const TypeIcon = TYPE_ICONS[activity.activity_type as keyof typeof TYPE_ICONS] || MapPin;
                const color = TYPE_COLORS[activity.activity_type as keyof typeof TYPE_COLORS] || "#6366F1";
                return (
                  <motion.div key={activity.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 z-10" style={{ backgroundColor: color + "20" }}>
                      <TypeIcon className="h-5 w-5" style={{ color }} />
                    </div>
                    <Card className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#1C1917] mb-1">{activity.title}</h3>
                          {activity.description && <p className="text-sm text-[#78716C] mb-2">{activity.description}</p>}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C]">
                            {activity.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {activity.location}</span>}
                            {activity.start_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(activity.start_date, "MMM d, yyyy")}{activity.end_date && ` – ${formatDate(activity.end_date, "MMM d")}`}</span>}
                            {activity.cost && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatCurrency(activity.cost)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Badge className={`${STATUS_STYLES[activity.status as keyof typeof STATUS_STYLES]?.bg} ${STATUS_STYLES[activity.status as keyof typeof STATUS_STYLES]?.text} text-xs`}>
                            {STATUS_STYLES[activity.status as keyof typeof STATUS_STYLES]?.label}
                          </Badge>
                          <button onClick={() => deleteActivity(activity.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {wishlist.length > 0 && (statusFilter === "all" || statusFilter === "wishlist") && (
        <div>
          <h3 className="text-base font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" /> Wishlist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((activity, i) => {
              const TypeIcon = TYPE_ICONS[activity.activity_type as keyof typeof TYPE_ICONS] || MapPin;
              const color = TYPE_COLORS[activity.activity_type as keyof typeof TYPE_COLORS] || "#6366F1";
              return (
                <motion.div key={activity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card hover className="relative group">
                    <button onClick={() => deleteActivity(activity.id)} className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                        <TypeIcon className="h-4 w-4" style={{ color }} />
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">{activity.activity_type}</Badge>
                    </div>
                    <h3 className="font-semibold text-[#1C1917] mb-1">{activity.title}</h3>
                    {activity.description && <p className="text-xs text-[#78716C] mb-3 line-clamp-2">{activity.description}</p>}
                    <div className="space-y-1.5 text-xs text-[#78716C]">
                      {activity.location && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {activity.location}</div>}
                      {activity.cost && <div className="flex items-center gap-1.5"><DollarSign className="h-3 w-3" /> Est. {formatCurrency(activity.cost)}</div>}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (statusFilter === "all" || statusFilter === "completed") && (
        <div>
          <h3 className="text-base font-semibold text-[#1C1917] mb-4">Completed ✓</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((activity, i) => {
              const TypeIcon = TYPE_ICONS[activity.activity_type as keyof typeof TYPE_ICONS] || MapPin;
              const color = TYPE_COLORS[activity.activity_type as keyof typeof TYPE_COLORS] || "#6366F1";
              return (
                <motion.div key={activity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="opacity-75 hover:opacity-100 transition-opacity relative group">
                    <button onClick={() => deleteActivity(activity.id)} className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                        <TypeIcon className="h-4 w-4" style={{ color }} />
                      </div>
                      <Badge variant="success" className="text-xs">Completed</Badge>
                    </div>
                    <h3 className="font-semibold text-[#1C1917] mb-1">{activity.title}</h3>
                    {activity.start_date && <p className="text-xs text-[#78716C] mb-2">{formatDate(activity.start_date, "MMM d, yyyy")}</p>}
                    {activity.notes && <p className="text-xs text-[#78716C] bg-gray-50 rounded-lg p-2 mt-2 italic">&ldquo;{activity.notes}&rdquo;</p>}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={showAddActivity} onClose={() => setShowAddActivity(false)} title="Add Activity" size="lg">
        <ModalBody className="space-y-4">
          <Input label="Title" placeholder="e.g. Weekend Trip to Asheville" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} />
          <Textarea label="Description (optional)" placeholder="What's this activity about?" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={newActivity.activity_type} onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value })} options={[{ value: "date", label: "Date Night" }, { value: "travel", label: "Travel" }, { value: "event", label: "Event" }, { value: "restaurant", label: "Restaurant" }, { value: "activity", label: "Activity" }]} />
            <Select label="Status" value={newActivity.status} onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })} options={[{ value: "wishlist", label: "Wishlist" }, { value: "planned", label: "Planned" }, { value: "completed", label: "Completed" }]} />
          </div>
          <Input label="Location" placeholder="e.g. Asheville, NC" value={newActivity.location} onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })} leftAddon={<MapPin className="h-4 w-4" />} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={newActivity.start_date} onChange={(e) => setNewActivity({ ...newActivity, start_date: e.target.value })} />
            <Input label="End date (optional)" type="date" value={newActivity.end_date} onChange={(e) => setNewActivity({ ...newActivity, end_date: e.target.value })} />
          </div>
          <Input label="Estimated cost" type="number" placeholder="0" value={newActivity.cost} onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })} leftAddon={<DollarSign className="h-4 w-4" />} />
          <Textarea label="Notes (optional)" placeholder="Things to remember, tips, etc." value={newActivity.notes} onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })} />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddActivity(false)}>Cancel</Button>
          <Button onClick={addActivity} loading={saving}>Add Activity</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
