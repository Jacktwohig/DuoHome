"use client";

import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Clock, Users, Check, Trash2, ChefHat, ShoppingBasket, Heart } from "lucide-react";
import { motion } from "framer-motion";
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
type MealTypeKey = (typeof MEAL_TYPES)[number];

const DAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const MEAL_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Breakfast: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Lunch: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Dinner: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

type MealIngredients = { items: string[]; instructions: string[] };

type Meal = {
  id: string;
  name: string;
  meal_type: string;
  day_of_week: number;
  servings: number | null;
  prep_time_minutes: number | null;
  description: string | null;
  tags: string[] | null;
  ingredients: MealIngredients | null;
  week_start: string | null;
};

type FavoriteMeal = {
  id: string;
  name: string;
  description: string | null;
  meal_type: string;
  servings: number | null;
  prep_time_minutes: number | null;
  tags: string[] | null;
  ingredients: MealIngredients | null;
};

type GroceryItem = {
  id: string;
  name: string;
  quantity: string | null;
  category: string | null;
  is_checked: boolean;
};

type CopyTarget = {
  name: string;
  description: string | null;
  meal_type: string;
  servings: number | null;
  prep_time_minutes: number | null;
  tags: string[] | null;
  ingredients: MealIngredients | null;
};

type Tab = "week" | "history" | "favorites";

const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

function capitalizeFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("week");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [historyMeals, setHistoryMeals] = useState<Record<string, Meal[]>>({});
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [aiStep, setAiStep] = useState<"type" | "suggestions">("type");
  const [aiMealType, setAiMealType] = useState("dinner");
  const [aiSelectedDay, setAiSelectedDay] = useState("Mon");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [copyTarget, setCopyTarget] = useState<CopyTarget | null>(null);
  const [copyDay, setCopyDay] = useState("Mon");
  const [copyType, setCopyType] = useState("Dinner");

  // Action state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [addingToPlan, setAddingToPlan] = useState<string | null>(null);
  const [togglingFav, setTogglingFav] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MealSuggestion[]>([]);
  const [newGrocery, setNewGrocery] = useState("");
  const [newMeal, setNewMeal] = useState({ name: "", day: "Mon", type: "Dinner", servings: "2", prepTime: "" });

  const weekLabel = `Week of ${format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d")}–${format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), "MMM d, yyyy")}`;

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

        const [{ data: mealsData }, { data: groceryData }, { data: favsData }] = await Promise.all([
          supabase
            .from("meals")
            .select("id, name, meal_type, day_of_week, servings, prep_time_minutes, description, tags, ingredients, week_start")
            .eq("household_id", profile.household_id)
            .order("created_at", { ascending: true }),
          supabase
            .from("grocery_items")
            .select("*")
            .eq("household_id", profile.household_id)
            .order("created_at", { ascending: true }),
          supabase
            .from("favorite_meals")
            .select("id, name, description, meal_type, servings, prep_time_minutes, tags, ingredients")
            .eq("household_id", profile.household_id)
            .order("created_at", { ascending: false }),
        ]);

        const allMeals = (mealsData || []) as Meal[];
        setMeals(allMeals.filter((m) => m.week_start === currentWeekStart || !m.week_start));

        const pastMeals = allMeals.filter((m) => m.week_start && m.week_start < currentWeekStart);
        const grouped: Record<string, Meal[]> = {};
        pastMeals.forEach((m) => {
          const key = m.week_start!;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(m);
        });
        setHistoryMeals(grouped);
        setFavorites((favsData || []) as FavoriteMeal[]);
        setGroceryItems(groceryData || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function getMeal(day: string, type: MealTypeKey): Meal | undefined {
    const dayIdx = DAY_INDEX[day];
    return meals.find((m) => m.day_of_week === dayIdx && m.meal_type.toLowerCase() === type.toLowerCase());
  }

  function isFavorited(mealName: string): boolean {
    return favorites.some((f) => f.name === mealName);
  }

  async function addMeal() {
    setSaveError(null);
    if (!newMeal.name.trim()) { setSaveError("Meal name is required."); return; }
    if (!householdId) { setSaveError("No household found. Please sign out and sign back in."); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("meals").insert({
      household_id: householdId,
      name: newMeal.name,
      meal_type: newMeal.type.toLowerCase(),
      day_of_week: DAY_INDEX[newMeal.day],
      servings: newMeal.servings ? parseInt(newMeal.servings) : 2,
      prep_time_minutes: newMeal.prepTime ? parseInt(newMeal.prepTime) : null,
      week_start: currentWeekStart,
    }).select("id, name, meal_type, day_of_week, servings, prep_time_minutes, description, tags, ingredients, week_start").single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (data) {
      const meal = data as Meal;
      setMeals((prev) => [...prev.filter((m) => !(m.day_of_week === meal.day_of_week && m.meal_type === meal.meal_type)), meal]);
      setNewMeal({ name: "", day: "Mon", type: "Dinner", servings: "2", prepTime: "" });
      setShowAddMeal(false);
    }
  }

  async function deleteMeal(id: string) {
    const supabase = createClient();
    await supabase.from("meals").delete().eq("id", id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    if (selectedMeal?.id === id) setSelectedMeal(null);
  }

  async function toggleFavorite(meal: Meal) {
    if (!householdId || !userId) return;
    const existingFav = favorites.find((f) => f.name === meal.name);
    setTogglingFav(meal.id);
    const supabase = createClient();
    if (existingFav) {
      await supabase.from("favorite_meals").delete().eq("id", existingFav.id);
      setFavorites((prev) => prev.filter((f) => f.id !== existingFav.id));
    } else {
      const { data } = await supabase.from("favorite_meals").insert({
        household_id: householdId,
        name: meal.name,
        description: meal.description,
        meal_type: meal.meal_type,
        servings: meal.servings,
        prep_time_minutes: meal.prep_time_minutes,
        tags: meal.tags,
        ingredients: meal.ingredients,
        created_by: userId,
      }).select("id, name, description, meal_type, servings, prep_time_minutes, tags, ingredients").single();
      if (data) setFavorites((prev) => [data as FavoriteMeal, ...prev]);
    }
    setTogglingFav(null);
  }

  async function getSuggestions(mealType?: string) {
    const type = mealType || aiMealType;
    setAiLoading(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/meals/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: ["Italian", "Mediterranean", "Asian"],
          restrictions: [],
          existingMeals: meals.map((m) => m.name),
          mealType: type,
        }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to get suggestions. Please try again.");
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  }

  async function addSuggestionToPlan(suggestion: MealSuggestion, day: string) {
    setSaveError(null);
    if (!householdId) { setSaveError("No household found. Please sign out and sign back in."); return; }
    const typeKey = capitalizeFirst(suggestion.meal_type) as MealTypeKey;
    if (getMeal(day, typeKey)) {
      setSaveError(`There's already a ${typeKey} for ${day}. Choose a different day above.`);
      return;
    }
    setAddingToPlan(suggestion.name);
    const supabase = createClient();
    const { data, error } = await supabase.from("meals").insert({
      household_id: householdId,
      name: suggestion.name,
      description: suggestion.description,
      meal_type: suggestion.meal_type,
      day_of_week: DAY_INDEX[day],
      servings: suggestion.servings,
      prep_time_minutes: suggestion.prep_time_minutes,
      tags: suggestion.tags,
      ingredients: { items: suggestion.ingredients, instructions: suggestion.instructions || [] },
      week_start: currentWeekStart,
    }).select("id, name, meal_type, day_of_week, servings, prep_time_minutes, description, tags, ingredients, week_start").single();
    setAddingToPlan(null);
    if (error) { setSaveError(error.message); return; }
    if (data) setMeals((prev) => [...prev, data as Meal]);
  }

  async function copyMealToWeek() {
    setSaveError(null);
    if (!copyTarget || !householdId) return;
    const typeKey = copyType as MealTypeKey;
    if (getMeal(copyDay, typeKey)) {
      setSaveError(`There's already a ${copyType} for ${copyDay}. Choose a different day.`);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("meals").insert({
      household_id: householdId,
      name: copyTarget.name,
      description: copyTarget.description,
      meal_type: copyType.toLowerCase(),
      day_of_week: DAY_INDEX[copyDay],
      servings: copyTarget.servings,
      prep_time_minutes: copyTarget.prep_time_minutes,
      tags: copyTarget.tags,
      ingredients: copyTarget.ingredients,
      week_start: currentWeekStart,
    }).select("id, name, meal_type, day_of_week, servings, prep_time_minutes, description, tags, ingredients, week_start").single();
    setSaving(false);
    if (error) { setSaveError(error.message); return; }
    if (data) {
      setMeals((prev) => [...prev, data as Meal]);
      setCopyTarget(null);
      setSaveError(null);
    }
  }

  async function deleteFavorite(id: string) {
    const supabase = createClient();
    await supabase.from("favorite_meals").delete().eq("id", id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  async function addGroceryItem() {
    if (!newGrocery.trim() || !householdId || !userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("grocery_items")
      .insert({ household_id: householdId, name: newGrocery, added_by: userId, is_checked: false })
      .select()
      .single();
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

  const groceryByCategory = groceryItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const sortedHistoryWeeks = Object.keys(historyMeals).sort((a, b) => b.localeCompare(a));

  if (loading) return <div className="flex items-center justify-center h-64 text-[#78716C]">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Meal Planner</h2>
          <p className="text-sm text-[#78716C]">{weekLabel}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="h-4 w-4 text-indigo-500" />}
            onClick={() => { setAiStep("type"); setAiSuggestions([]); setSaveError(null); setShowAISuggest(true); }}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            AI Suggest Meals
          </Button>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddMeal(true)}>Add Meal</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {([
          { key: "week", label: "This Week" },
          { key: "history", label: "History" },
          { key: "favorites", label: "Favorites" },
        ] as { key: Tab; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-white shadow-sm text-[#1C1917]" : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── This Week ── */}
      {activeTab === "week" && (
        <>
          <Card padding="none" className="overflow-hidden">
            <div className="grid grid-cols-8 border-b border-[#E7E5E4] bg-gray-50">
              <div className="p-3 border-r border-[#E7E5E4]" />
              {DAYS.map((day) => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-[#1C1917] border-r border-[#E7E5E4] last:border-r-0">
                  {day}
                </div>
              ))}
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
                      <div key={day} className="p-2 border-r border-[#E7E5E4] last:border-r-0 min-h-[80px] group">
                        {meal ? (
                          <div
                            className={`h-full p-2 rounded-lg text-xs font-medium ${style.bg} ${style.text} ${style.border} border relative group/meal cursor-pointer`}
                            onClick={() => setSelectedMeal(meal)}
                          >
                            <span className="line-clamp-2 pr-4">{meal.name}</span>
                            {meal.ingredients && (
                              <span className="text-[10px] opacity-60 mt-0.5 block">tap for recipe</span>
                            )}
                            <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover/meal:opacity-100 transition-all">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(meal); }}
                                disabled={togglingFav === meal.id}
                                className="p-0.5 rounded hover:bg-white/50 transition-all"
                              >
                                <Heart className={`h-3 w-3 ${isFavorited(meal.name) ? "fill-red-500 text-red-500" : ""}`} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteMeal(meal.id); }}
                                className="p-0.5 rounded hover:bg-white/50 transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
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

          {/* Grocery List */}
          <Card>
            <CardHeader className="mb-5 flex-row items-center justify-between">
              <CardTitle>Grocery List</CardTitle>
              <span className="text-xs text-[#78716C]">
                {groceryItems.filter((i) => i.is_checked).length}/{groceryItems.length} checked
              </span>
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
                          <motion.div
                            key={item.id}
                            layout
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                          >
                            <button
                              onClick={() => toggleGrocery(item.id, item.is_checked)}
                              className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                item.is_checked ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"
                              }`}
                            >
                              {item.is_checked && <Check className="h-3 w-3 text-white" />}
                            </button>
                            <span className={`flex-1 text-sm ${item.is_checked ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>
                              {item.name}
                            </span>
                            {item.quantity && <span className="text-xs text-[#78716C]">{item.quantity}</span>}
                            <button
                              onClick={() => deleteGroceryItem(item.id)}
                              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all"
                            >
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
        </>
      )}

      {/* ── History ── */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {sortedHistoryWeeks.length === 0 ? (
            <Card>
              <p className="text-sm text-[#78716C] text-center py-8">
                No past meal plans yet. Your history will appear here after meals are saved with a week tag.
              </p>
            </Card>
          ) : (
            sortedHistoryWeeks.map((weekStart) => {
              const weekMeals = historyMeals[weekStart];
              const d = new Date(weekStart + "T12:00:00");
              const weekBegin = format(d, "MMM d");
              const weekEnd = format(addDays(d, 6), "MMM d, yyyy");
              return (
                <Card key={weekStart}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[#1C1917]">
                      Week of {weekBegin}–{weekEnd}
                    </h3>
                    <span className="text-xs text-[#78716C]">{weekMeals.length} meals</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {weekMeals.map((meal) => {
                      const typeKey = capitalizeFirst(meal.meal_type) as MealTypeKey;
                      const style = MEAL_TYPE_COLORS[typeKey] || MEAL_TYPE_COLORS.Dinner;
                      const dayName = DAYS[meal.day_of_week] ?? "?";
                      return (
                        <div key={meal.id} className={`flex items-center justify-between p-3 rounded-xl ${style.bg} border ${style.border}`}>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${style.text} truncate`}>{meal.name}</p>
                            <p className="text-xs text-[#78716C] mt-0.5">{dayName} · {typeKey}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 flex-shrink-0 text-xs h-7"
                            onClick={() => {
                              setCopyTarget({ name: meal.name, description: meal.description, meal_type: meal.meal_type, servings: meal.servings, prep_time_minutes: meal.prep_time_minutes, tags: meal.tags, ingredients: meal.ingredients });
                              setCopyType(typeKey);
                              setCopyDay(dayName === "?" ? "Mon" : dayName);
                              setSaveError(null);
                            }}
                          >
                            Copy to this week
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── Favorites ── */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <Card>
              <div className="py-10 text-center">
                <Heart className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-[#78716C]">No favorites yet.</p>
                <p className="text-xs text-[#78716C] mt-1">Hover over a meal in your plan and click the heart icon to save it here.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((fav) => {
                const typeKey = capitalizeFirst(fav.meal_type) as MealTypeKey;
                const style = MEAL_TYPE_COLORS[typeKey] || MEAL_TYPE_COLORS.Dinner;
                return (
                  <motion.div
                    key={fav.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-[#E7E5E4] bg-white flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1C1917] text-sm truncate">{fav.name}</p>
                        {fav.description && (
                          <p className="text-xs text-[#78716C] mt-0.5 line-clamp-2">{fav.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteFavorite(fav.id)}
                        className="ml-2 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>{typeKey}</span>
                      {fav.prep_time_minutes && (
                        <span className="flex items-center gap-1 text-xs text-[#78716C]">
                          <Clock className="h-3 w-3" /> {fav.prep_time_minutes} min
                        </span>
                      )}
                      {fav.servings && (
                        <span className="flex items-center gap-1 text-xs text-[#78716C]">
                          <Users className="h-3 w-3" /> {fav.servings} servings
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setCopyTarget({ name: fav.name, description: fav.description, meal_type: fav.meal_type, servings: fav.servings, prep_time_minutes: fav.prep_time_minutes, tags: fav.tags, ingredients: fav.ingredients });
                        setCopyType(typeKey);
                        setCopyDay("Mon");
                        setSaveError(null);
                      }}
                    >
                      Add to this week
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Meal Detail Modal ── */}
      {selectedMeal && (
        <Modal open={!!selectedMeal} onClose={() => setSelectedMeal(null)} title={selectedMeal.name} size="lg">
          <ModalBody className="space-y-5">
            {selectedMeal.description && (
              <p className="text-sm text-[#78716C] leading-relaxed">{selectedMeal.description}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {selectedMeal.prep_time_minutes && (
                <div className="flex items-center gap-1.5 text-sm text-[#78716C]">
                  <Clock className="h-4 w-4" /> {selectedMeal.prep_time_minutes} min
                </div>
              )}
              {selectedMeal.servings && (
                <div className="flex items-center gap-1.5 text-sm text-[#78716C]">
                  <Users className="h-4 w-4" /> {selectedMeal.servings} servings
                </div>
              )}
              <Badge variant="secondary" className="text-xs capitalize">{selectedMeal.meal_type}</Badge>
              {(selectedMeal.tags || []).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{tag}</span>
              ))}
            </div>

            {selectedMeal.ingredients?.items && selectedMeal.ingredients.items.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBasket className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-[#1C1917]">Ingredients</h3>
                </div>
                <ul className="space-y-1.5">
                  {selectedMeal.ingredients.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#1C1917]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedMeal.ingredients?.instructions && selectedMeal.ingredients.instructions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-[#1C1917]">Instructions</h3>
                </div>
                <ol className="space-y-2.5">
                  {selectedMeal.ingredients.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#1C1917]">
                      <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step.replace(/^Step \d+:\s*/i, "")}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {!selectedMeal.ingredients && (
              <p className="text-sm text-[#78716C] italic">No recipe details saved for this meal.</p>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="flex-1">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Heart className={`h-4 w-4 ${isFavorited(selectedMeal.name) ? "fill-red-500 text-red-500" : ""}`} />}
                onClick={() => toggleFavorite(selectedMeal)}
                loading={togglingFav === selectedMeal.id}
              >
                {isFavorited(selectedMeal.name) ? "Unfavorite" : "Favorite"}
              </Button>
            </div>
            <Button variant="destructive" onClick={() => deleteMeal(selectedMeal.id)}>Delete Meal</Button>
            <Button variant="outline" onClick={() => setSelectedMeal(null)}>Close</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ── Add Meal Modal ── */}
      <Modal open={showAddMeal} onClose={() => { setShowAddMeal(false); setSaveError(null); }} title="Add Meal" size="md">
        <ModalBody className="space-y-4">
          <Input
            label="Meal name"
            placeholder="e.g. Pasta Carbonara"
            value={newMeal.name}
            onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Day of week"
              value={newMeal.day}
              onChange={(e) => setNewMeal({ ...newMeal, day: e.target.value })}
              options={DAYS.map((d) => ({ value: d, label: d }))}
            />
            <Select
              label="Meal type"
              value={newMeal.type}
              onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
              options={[
                { value: "Breakfast", label: "Breakfast" },
                { value: "Lunch", label: "Lunch" },
                { value: "Dinner", label: "Dinner" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Servings"
              type="number"
              value={newMeal.servings}
              onChange={(e) => setNewMeal({ ...newMeal, servings: e.target.value })}
              leftAddon={<Users className="h-4 w-4" />}
            />
            <Input
              label="Prep time (min)"
              type="number"
              value={newMeal.prepTime}
              onChange={(e) => setNewMeal({ ...newMeal, prepTime: e.target.value })}
              leftAddon={<Clock className="h-4 w-4" />}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          {saveError && <p className="text-sm text-red-500 flex-1">{saveError}</p>}
          <Button variant="outline" onClick={() => { setShowAddMeal(false); setSaveError(null); }}>Cancel</Button>
          <Button onClick={addMeal} loading={saving}>Add Meal</Button>
        </ModalFooter>
      </Modal>

      {/* ── AI Suggestions Modal ── */}
      <Modal
        open={showAISuggest}
        onClose={() => { setShowAISuggest(false); setAiSuggestions([]); setSaveError(null); }}
        title={aiStep === "type" ? "What are you planning?" : "AI Meal Suggestions"}
        description={aiStep === "suggestions" ? `${capitalizeFirst(aiMealType)} ideas · Powered by Claude` : undefined}
        size="xl"
      >
        <ModalBody>
          {aiStep === "type" ? (
            <div className="py-4">
              <p className="text-sm text-[#78716C] mb-6 text-center">
                Choose a meal type to get personalized suggestions.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: "breakfast", emoji: "🌅", label: "Breakfast", hover: "border-amber-200 hover:bg-amber-50 hover:border-amber-400" },
                  { type: "lunch", emoji: "☀️", label: "Lunch", hover: "border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400" },
                  { type: "dinner", emoji: "🌙", label: "Dinner", hover: "border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400" },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${opt.hover}`}
                    onClick={() => {
                      setAiMealType(opt.type);
                      setAiStep("suggestions");
                      getSuggestions(opt.type);
                    }}
                  >
                    <span className="text-4xl mb-3">{opt.emoji}</span>
                    <span className="text-sm font-semibold text-[#1C1917]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : aiLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex gap-1.5 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-indigo-500"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
              <p className="text-[#78716C] text-sm">
                Claude is crafting {capitalizeFirst(aiMealType)} suggestions just for you...
              </p>
            </div>
          ) : (
            <>
              {/* Day selector */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl flex-wrap">
                <span className="text-sm font-medium text-[#1C1917]">Add to:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setAiSelectedDay(day)}
                      className={`h-8 w-11 rounded-lg text-xs font-medium transition-all ${
                        aiSelectedDay === day
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-[#E7E5E4] text-[#78716C] hover:border-indigo-300"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {saveError && <p className="text-sm text-red-500 mb-3">{saveError}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                {aiSuggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-xl border border-[#E7E5E4] hover:border-indigo-200 transition-all flex flex-col"
                  >
                    <h3 className="font-semibold text-[#1C1917] text-sm mb-2">{suggestion.name}</h3>
                    <p className="text-xs text-[#78716C] mb-3 leading-relaxed flex-1">{suggestion.description}</p>

                    {suggestion.ingredients && suggestion.ingredients.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-[#78716C] mb-1.5 flex items-center gap-1">
                          <ShoppingBasket className="h-3 w-3" /> Ingredients
                        </p>
                        <ul className="space-y-0.5">
                          {suggestion.ingredients.slice(0, 4).map((ing, j) => (
                            <li key={j} className="text-xs text-[#1C1917] flex items-start gap-1.5">
                              <span className="h-1 w-1 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                              {ing}
                            </li>
                          ))}
                          {suggestion.ingredients.length > 4 && (
                            <li className="text-xs text-[#78716C]">+{suggestion.ingredients.length - 4} more</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-[#78716C] mb-3">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {suggestion.prep_time_minutes} min</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {suggestion.servings} servings</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {suggestion.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{tag}</span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      loading={addingToPlan === suggestion.name}
                      onClick={() => addSuggestionToPlan(suggestion, aiSelectedDay)}
                    >
                      {addingToPlan === suggestion.name ? "Adding..." : `Add to ${aiSelectedDay}`}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {aiStep === "suggestions" && (
            <Button
              variant="outline"
              onClick={() => { setAiStep("type"); setAiSuggestions([]); setSaveError(null); }}
              className="mr-auto"
            >
              ← Back
            </Button>
          )}
          <Button variant="outline" onClick={() => { setShowAISuggest(false); setAiSuggestions([]); setSaveError(null); }}>
            Close
          </Button>
          {aiStep === "suggestions" && !aiLoading && (
            <Button
              leftIcon={<Sparkles className="h-4 w-4" />}
              variant="indigo"
              onClick={() => getSuggestions()}
              loading={aiLoading}
            >
              Refresh
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* ── Copy to Week Modal ── */}
      <Modal
        open={!!copyTarget}
        onClose={() => { setCopyTarget(null); setSaveError(null); }}
        title="Add to this week"
        size="sm"
      >
        <ModalBody className="space-y-4">
          {copyTarget && (
            <>
              <p className="text-sm font-medium text-[#1C1917]">{copyTarget.name}</p>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Day"
                  value={copyDay}
                  onChange={(e) => setCopyDay(e.target.value)}
                  options={DAYS.map((d) => ({ value: d, label: d }))}
                />
                <Select
                  label="Meal type"
                  value={copyType}
                  onChange={(e) => setCopyType(e.target.value)}
                  options={[
                    { value: "Breakfast", label: "Breakfast" },
                    { value: "Lunch", label: "Lunch" },
                    { value: "Dinner", label: "Dinner" },
                  ]}
                />
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {saveError && <p className="text-sm text-red-500 flex-1">{saveError}</p>}
          <Button variant="outline" onClick={() => { setCopyTarget(null); setSaveError(null); }}>Cancel</Button>
          <Button onClick={copyMealToWeek} loading={saving}>Add to Plan</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
