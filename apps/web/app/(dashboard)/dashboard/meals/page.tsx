"use client";

import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Clock, Users, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { MealSuggestion } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"] as const;
type MealType = typeof MEAL_TYPES[number];

// day_of_week: 0=Mon ... 6=Sun
const DAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

type Meal = { id: string; name: string; meal_type: string; day_of_week: number; servings: number | null; prep_time_minutes: number | null };
type GroceryItem = { id: string; name: string; quantity: string | null; category: string | null; is_checked: boolean };

const MEAL_TYPE_COLORS = {
  Breakfast: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Lunch: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Dinner: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MealSuggestion[]>([]);
  const [newGrocery, setNewGrocery] = useState("");
  const [newMeal, setNewMeal] = useState({ name: "", day: "Mon", type: "Dinner", servings: "2", prepTime: "" });

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekLabel = (() => {
    const s = startOfWeek(new Date(), { weekStartsOn: 1 });
    return `Week of ${format(s, "MMM d")}–${format(addDays(s, 6), "MMM d, yyyy")}`;
  })();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user.id).single();
      if (!profile?.household_id) return;
      setHouseholdId(profile.household_id);

      const [{ data: mealsData }, { data: groceryData }] = await Promise.all([
        supabase.from("meals").select("*").eq("household_id", profile.household_id),
        supabase.from("grocery_items").select("*").eq("household_id", profile.household_id).order("created_at", { ascending: true }),
      ]);

      setMeals(mealsData || []);
      setGroceryItems(groceryData || []);
      setLoading(false);
    }
    load();
  }, []);

  function getMeal(day: string, type: MealType): Meal | undefined {
    const dayIdx = DAY_INDEX[day];
    return meals.find((m) => m.day_of_week === dayIdx && m.meal_type.toLowerCase() === type.toLowerCase());
  }

  async function addMeal() {
    if (!newMeal.name.trim() || !householdId) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("meals").insert({
      household_id: householdId,
      name: newMeal.name,
      meal_type: newMeal.type.toLowerCase(),
      day_of_week: DAY_INDEX[newMeal.day],
      servings: newMeal.servings ? parseInt(newMeal.servings) : 2,
      prep_time_minutes: newMeal.prepTime ? parseInt(newMeal.prepTime) : null,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      // Replace existing meal in same slot if any
      setMeals((prev) => [...prev.filter((m) => !(m.day_of_week === data.day_of_week && m.meal_type === data.meal_type)), data]);
      setNewMeal({ name: "", day: "Mon", type: "Dinner", servings: "2", prepTime: "" });
      setShowAddMeal(false);
    }
  }

  async function deleteMeal(id: string) {
    const supabase = createClient();
    await supabase.from("meals").delete().eq("id", id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  async function addGroceryItem() {
    if (!newGrocery.trim() || !householdId || !userId) return;
    const supabase = createClient();
    const { data } = await supabase.from("grocery_items").insert({ household_id: householdId, name: newGrocery, added_by: userId, is_checked: false }).select().single();
    if (data) setGroceryItems((prev) => [...prev, data]);
    setNewGrocery("");
  }

  async function toggleGrocery(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("grocery_items").update({ is_checked: !current }).eq("id", id);
    setGroceryItems((prev) => prev.map((item) => item.id === id ? { ...item, is_checked: !current } : item));
  }

  async function deleteGroceryItem(id: string) {
    const supabase = createClient();
    await supabase.from("grocery_items").delete().eq("id", id);
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function getSuggestions() {
    setAiLoading(true);
    setShowAISuggest(true);
    try {
      const res = await fetch("/api/meals/suggest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferences: ["Italian", "Mediterranean", "Asian"], restrictions: [], existingMeals: meals.map((m) => m.name) }) });
      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
    } catch {
      setAiSuggestions([
        { name: "Shrimp Tacos", description: "Crispy shrimp with mango salsa and chipotle crema", ingredients: ["shrimp", "mango", "chipotle", "corn tortillas"], prep_time_minutes: 25, tags: ["Mexican", "Seafood"], meal_type: "dinner", servings: 2 },
        { name: "Thai Green Curry", description: "Fragrant green curry with coconut milk and vegetables", ingredients: ["green curry paste", "coconut milk", "vegetables", "rice"], prep_time_minutes: 30, tags: ["Thai", "Vegetarian"], meal_type: "dinner", servings: 2 },
        { name: "Shakshuka", description: "Eggs poached in spiced tomato sauce with feta", ingredients: ["eggs", "tomatoes", "feta", "cumin"], prep_time_minutes: 20, tags: ["Mediterranean", "Brunch"], meal_type: "breakfast", servings: 2 },
        { name: "Beef Bulgogi Bowls", description: "Korean marinated beef over steamed rice", ingredients: ["beef", "soy sauce", "sesame oil", "rice"], prep_time_minutes: 35, tags: ["Korean"], meal_type: "dinner", servings: 2 },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  async function addSuggestionToPlan(suggestion: MealSuggestion) {
    if (!householdId) return;
    const typeKey = suggestion.meal_type.charAt(0).toUpperCase() + suggestion.meal_type.slice(1);
    const targetType = (["Breakfast", "Lunch", "Dinner"].includes(typeKey) ? typeKey : "Dinner") as MealType;
    const emptyDay = DAYS.find((d) => !getMeal(d, targetType));
    if (!emptyDay) return;
    const supabase = createClient();
    const { data } = await supabase.from("meals").insert({ household_id: householdId, name: suggestion.name, meal_type: targetType.toLowerCase(), day_of_week: DAY_INDEX[emptyDay], servings: suggestion.servings }).select().single();
    if (data) setMeals((prev) => [...prev, data]);
  }

  const groceryByCategory = groceryItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  if (loading) return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Meal Planner</h2>
          <p className="text-sm text-[#78716C]">{weekLabel}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Sparkles className="h-4 w-4 text-indigo-500" />} onClick={getSuggestions} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">AI Suggest Meals</Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddMeal(true)}>Add Meal</Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="grid grid-cols-8 border-b border-[#E7E5E4] bg-gray-50">
          <div className="p-3 border-r border-[#E7E5E4]" />
          {DAYS.map((day) => <div key={day} className="p-3 text-center text-sm font-semibold text-[#1C1917] border-r border-[#E7E5E4] last:border-r-0">{day}</div>)}
        </div>
        {MEAL_TYPES.map((mealType) => {
          const style = MEAL_TYPE_COLORS[mealType];
          return (
            <div key={mealType} className="grid grid-cols-8 border-b border-[#E7E5E4] last:border-b-0">
              <div className={`p-3 border-r border-[#E7E5E4] flex items-center ${style.bg}`}>
                <span className={`text-xs font-semibold ${style.text}`}>{mealType}</span>
              </div>
              {DAYS.map((day) => {
                const meal = getMeal(day, mealType);
                return (
                  <div key={day} className="p-2 border-r border-[#E7E5E4] last:border-r-0 min-h-[72px] group">
                    {meal ? (
                      <div className={`h-full p-2 rounded-lg text-xs font-medium ${style.bg} ${style.text} ${style.border} border relative group/meal`}>
                        <span>{meal.name}</span>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover/meal:opacity-100 p-0.5 rounded hover:bg-white/50 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setNewMeal({ ...newMeal, day, type: mealType }); setShowAddMeal(true); }}
                        className="h-full w-full flex items-center justify-center rounded-lg border-2 border-dashed border-[#E7E5E4] text-gray-300 hover:border-primary-300 hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </Card>

      <Card>
        <CardHeader className="mb-5 flex-row items-center justify-between">
          <CardTitle>Grocery List</CardTitle>
          <span className="text-xs text-[#78716C]">{groceryItems.filter((i) => i.is_checked).length}/{groceryItems.length} checked</span>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-5">
            <input
              value={newGrocery}
              onChange={(e) => setNewGrocery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGroceryItem()}
              placeholder="Add grocery item..."
              className="flex-1 h-10 px-4 rounded-xl border border-[#E7E5E4] text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button onClick={addGroceryItem} leftIcon={<Plus className="h-4 w-4" />}>Add</Button>
          </div>
          {groceryItems.length === 0 ? (
            <p className="text-sm text-[#78716C] text-center py-4">No grocery items yet.</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(groceryByCategory).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">{category}</h4>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <motion.div key={item.id} layout className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                        <button onClick={() => toggleGrocery(item.id, item.is_checked)} className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${item.is_checked ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}>
                          {item.is_checked && <Check className="h-3 w-3 text-white" />}
                        </button>
                        <span className={`flex-1 text-sm ${item.is_checked ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>{item.name}</span>
                        {item.quantity && <span className="text-xs text-[#78716C]">{item.quantity}</span>}
                        <button onClick={() => deleteGroceryItem(item.id)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showAddMeal} onClose={() => setShowAddMeal(false)} title="Add Meal" size="md">
        <ModalBody className="space-y-4">
          <Input label="Meal name" placeholder="e.g. Pasta Carbonara" value={newMeal.name} onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Day of week" value={newMeal.day} onChange={(e) => setNewMeal({ ...newMeal, day: e.target.value })} options={DAYS.map((d) => ({ value: d, label: d }))} />
            <Select label="Meal type" value={newMeal.type} onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })} options={[{ value: "Breakfast", label: "Breakfast" }, { value: "Lunch", label: "Lunch" }, { value: "Dinner", label: "Dinner" }]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Servings" type="number" value={newMeal.servings} onChange={(e) => setNewMeal({ ...newMeal, servings: e.target.value })} leftAddon={<Users className="h-4 w-4" />} />
            <Input label="Prep time (min)" type="number" value={newMeal.prepTime} onChange={(e) => setNewMeal({ ...newMeal, prepTime: e.target.value })} leftAddon={<Clock className="h-4 w-4" />} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddMeal(false)}>Cancel</Button>
          <Button onClick={addMeal} loading={saving}>Add Meal</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAISuggest} onClose={() => setShowAISuggest(false)} title="AI Meal Suggestions" description="Powered by Claude" size="xl">
        <ModalBody>
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex gap-1.5 mb-4">
                {[0, 1, 2].map((i) => <motion.div key={i} className="h-2.5 w-2.5 rounded-full bg-indigo-500" animate={{ y: [0, -10, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />)}
              </div>
              <p className="text-[#78716C] text-sm">Claude is crafting meal suggestions just for you...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              {aiSuggestions.map((suggestion, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl border border-[#E7E5E4] hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#1C1917] text-sm">{suggestion.name}</h3>
                    <Badge variant="secondary" className="text-xs capitalize ml-2 flex-shrink-0">{suggestion.meal_type}</Badge>
                  </div>
                  <p className="text-xs text-[#78716C] mb-3 leading-relaxed">{suggestion.description}</p>
                  <div className="flex items-center gap-3 text-xs text-[#78716C] mb-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {suggestion.prep_time_minutes} min</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {suggestion.servings} servings</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {suggestion.tags.map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{tag}</span>)}
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => addSuggestionToPlan(suggestion)}>Add to plan</Button>
                </motion.div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAISuggest(false)}>Close</Button>
          <Button leftIcon={<Sparkles className="h-4 w-4" />} variant="indigo" onClick={getSuggestions} loading={aiLoading}>Refresh suggestions</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
