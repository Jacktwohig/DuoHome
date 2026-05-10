"use client";

import React, { useState } from "react";
import { Plus, MapPin, DollarSign, Calendar, Heart, Plane, Star, Utensils, Ticket, Mountain } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Textarea, Select } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

// TODO: Replace with Supabase queries
const MOCK_ACTIVITIES = [
  {
    id: "1", title: "Weekend in Asheville", description: "Mountain getaway — check out River Arts District and some amazing BBQ", activity_type: "travel", start_date: "2025-06-06", end_date: "2025-06-08",
    location: "Asheville, NC", cost: 650, status: "planned", notes: "Book bed & breakfast early!", image_url: null,
  },
  {
    id: "2", title: "Italian Cooking Class", description: "Learn to make fresh pasta and tiramisu together", activity_type: "activity", start_date: "2025-05-24", end_date: null,
    location: "City Kitchen Studio", cost: 120, status: "planned", notes: "", image_url: null,
  },
  {
    id: "3", title: "Osteria Morini Dinner", description: "Celebrating our anniversary at this lovely Italian spot", activity_type: "restaurant", start_date: "2025-05-14", end_date: null,
    location: "Osteria Morini, NYC", cost: 180, status: "planned", notes: "Make reservation 2 weeks ahead", image_url: null,
  },
  {
    id: "4", title: "Europe Trip 2026", description: "Italy, France, Spain — 2 weeks dream vacation", activity_type: "travel", start_date: "2026-06-01", end_date: "2026-06-15",
    location: "Rome, Paris, Barcelona", cost: 5000, status: "wishlist", notes: "Start saving now!", image_url: null,
  },
  {
    id: "5", title: "Local Jazz Concert", description: "Live jazz at the botanical garden amphitheater", activity_type: "event", start_date: "2025-07-12", end_date: null,
    location: "City Botanical Garden", cost: 60, status: "wishlist", notes: "", image_url: null,
  },
  {
    id: "6", title: "Blue Ridge Hike", description: "Gorgeous waterfall hike we did last spring", activity_type: "activity", start_date: "2025-04-12", end_date: null,
    location: "Blue Ridge Parkway, NC", cost: 30, status: "completed", notes: "Highly recommend! Pack snacks and waterproof boots.", image_url: null,
  },
  {
    id: "7", title: "Paint & Sip Night", description: "Fun evening painting wine glasses together", activity_type: "date", start_date: "2025-03-22", end_date: null,
    location: "Sip & Stroke Studio", cost: 75, status: "completed", notes: "Jordan is surprisingly artistic!", image_url: null,
  },
  {
    id: "8", title: "Weekend Wine Tour", description: "Visiting vineyards in the Hudson Valley", activity_type: "travel", start_date: "2026-09-01", end_date: "2026-09-03",
    location: "Hudson Valley, NY", cost: 400, status: "wishlist", notes: "", image_url: null,
  },
];

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
  const [activities] = useState(MOCK_ACTIVITIES);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "", description: "", activity_type: "date", start_date: "", end_date: "",
    location: "", cost: "", status: "wishlist", notes: "",
  });

  const filteredActivities = activities.filter((a) => {
    const matchesType = filter === "all" || a.activity_type === filter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const wishlist = filteredActivities.filter((a) => a.status === "wishlist");
  const planned = filteredActivities.filter((a) => a.status === "planned");
  const completed = filteredActivities.filter((a) => a.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E7E5E4] p-0.5">
          {(["all", "date", "travel", "event", "restaurant", "activity"] as FilterTab[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f ? "bg-primary-500 text-white" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                statusFilter === s ? "bg-gray-800 text-white" : "text-[#78716C] hover:text-[#1C1917]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Planned activities - timeline */}
      {planned.length > 0 && (statusFilter === "all" || statusFilter === "planned") && (
        <div>
          <h3 className="text-base font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Planned
          </h3>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E7E5E4]" />
            <div className="space-y-4">
              {planned.map((activity, i) => {
                const TypeIcon = TYPE_ICONS[activity.activity_type as keyof typeof TYPE_ICONS] || MapPin;
                const color = TYPE_COLORS[activity.activity_type as keyof typeof TYPE_COLORS] || "#6366F1";

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex gap-4"
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                      style={{ backgroundColor: color + "20" }}
                    >
                      <TypeIcon className="h-5 w-5" style={{ color }} />
                    </div>
                    <Card className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#1C1917]">{activity.title}</h3>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-[#78716C] mb-2">{activity.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C]">
                            {activity.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {activity.location}
                              </span>
                            )}
                            {activity.start_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(activity.start_date, "MMM d, yyyy")}
                                {activity.end_date && ` – ${formatDate(activity.end_date, "MMM d")}`}
                              </span>
                            )}
                            {activity.cost && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> {formatCurrency(activity.cost)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={`${STATUS_STYLES[activity.status as keyof typeof STATUS_STYLES]?.bg} ${STATUS_STYLES[activity.status as keyof typeof STATUS_STYLES]?.text} text-xs ml-3`}>
                          {STATUS_STYLES[activity.status as keyof typeof STATUS_STYLES]?.label}
                        </Badge>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist */}
      {wishlist.length > 0 && (statusFilter === "all" || statusFilter === "wishlist") && (
        <div>
          <h3 className="text-base font-semibold text-[#1C1917] mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Wishlist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((activity, i) => {
              const TypeIcon = TYPE_ICONS[activity.activity_type as keyof typeof TYPE_ICONS] || MapPin;
              const color = TYPE_COLORS[activity.activity_type as keyof typeof TYPE_COLORS] || "#6366F1";

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card hover>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: color + "20" }}
                      >
                        <TypeIcon className="h-4 w-4" style={{ color }} />
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">{activity.activity_type}</Badge>
                    </div>
                    <h3 className="font-semibold text-[#1C1917] mb-1">{activity.title}</h3>
                    {activity.description && (
                      <p className="text-xs text-[#78716C] mb-3 line-clamp-2">{activity.description}</p>
                    )}
                    <div className="space-y-1.5 text-xs text-[#78716C]">
                      {activity.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" /> {activity.location}
                        </div>
                      )}
                      {activity.cost && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3 w-3" /> Est. {formatCurrency(activity.cost)}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (statusFilter === "all" || statusFilter === "completed") && (
        <div>
          <h3 className="text-base font-semibold text-[#1C1917] mb-4">
            Completed ✓
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((activity, i) => {
              const TypeIcon = TYPE_ICONS[activity.activity_type as keyof typeof TYPE_ICONS] || MapPin;
              const color = TYPE_COLORS[activity.activity_type as keyof typeof TYPE_COLORS] || "#6366F1";

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: color + "20" }}
                      >
                        <TypeIcon className="h-4 w-4" style={{ color }} />
                      </div>
                      <Badge variant="success" className="text-xs">Completed</Badge>
                    </div>
                    <h3 className="font-semibold text-[#1C1917] mb-1">{activity.title}</h3>
                    {activity.start_date && (
                      <p className="text-xs text-[#78716C] mb-2">{formatDate(activity.start_date, "MMM d, yyyy")}</p>
                    )}
                    {activity.notes && (
                      <p className="text-xs text-[#78716C] bg-gray-50 rounded-lg p-2 mt-2 italic">
                        &ldquo;{activity.notes}&rdquo;
                      </p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      <Modal open={showAddActivity} onClose={() => setShowAddActivity(false)} title="Add Activity" size="lg">
        <ModalBody className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Weekend Trip to Asheville"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
          />
          <Textarea
            label="Description (optional)"
            placeholder="What's this activity about?"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={newActivity.activity_type}
              onChange={(e) => setNewActivity({ ...newActivity, activity_type: e.target.value })}
              options={[
                { value: "date", label: "Date Night" },
                { value: "travel", label: "Travel" },
                { value: "event", label: "Event" },
                { value: "restaurant", label: "Restaurant" },
                { value: "activity", label: "Activity" },
              ]}
            />
            <Select
              label="Status"
              value={newActivity.status}
              onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}
              options={[
                { value: "wishlist", label: "Wishlist" },
                { value: "planned", label: "Planned" },
                { value: "completed", label: "Completed" },
              ]}
            />
          </div>
          <Input
            label="Location"
            placeholder="e.g. Asheville, NC"
            value={newActivity.location}
            onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
            leftAddon={<MapPin className="h-4 w-4" />}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={newActivity.start_date} onChange={(e) => setNewActivity({ ...newActivity, start_date: e.target.value })} />
            <Input label="End date (optional)" type="date" value={newActivity.end_date} onChange={(e) => setNewActivity({ ...newActivity, end_date: e.target.value })} />
          </div>
          <Input
            label="Estimated cost"
            type="number"
            placeholder="0"
            value={newActivity.cost}
            onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
            leftAddon={<DollarSign className="h-4 w-4" />}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Things to remember, tips, etc."
            value={newActivity.notes}
            onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddActivity(false)}>Cancel</Button>
          <Button onClick={() => setShowAddActivity(false)}>Add Activity</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
