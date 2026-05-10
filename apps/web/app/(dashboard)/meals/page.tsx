"use client";

import React, { useState } from "react";
import { Plus, Sparkles, Clock, Users, Check, X as XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import type { MealSuggestion } from "@duohome/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"] as const;

// TODO: Replace with Supabase queries
const MOCK_MEAL_PLAN: Record<string, Record<string, string>> = {
  Mon: {
    Breakfast: "Avocado Toast & Eggs",
    Lunch: "Greek Salad",
    Dinner: "Pasta Primavera",
  },
  Tue: {
    Breakfast: "Greek Yogurt & Berries",
    Dinner: "Chicken Stir Fry",
  },
  Wed: {
    Breakfast: "Overnight Oats",
    Lunch: "Turkey Sandwich",
    Dinner: "Tacos",
  },
  Thu: {
    Dinner: "Lemon Herb Salmon",
  },
  Fri: {
    Breakfast: "Pancakes",
    Dinner: "Homemade Pizza",
  },
  Sat: {
    Breakfast: "Weekend Brunch",
    Lunch: "Grilled Cheese",
    Dinner: "Date Night — Restaurant",
  },
  Sun: {
    Breakfast: "French Toast",
    Dinner: "Roast Chicken",
  },
};

// TODO: Replace with Supabase queries
const MOCK_GROCERY_ITEMS = [
  { id: "1", name: "Chicken breast", quantity: "2 lbs", category: "Meat & Seafood", is_checked: false },
  { id: "2", name: "Salmon fillet", quantity: "1 lb", category: "Meat & Seafood", is_checked: true },
  { id: "3", name: "Avocados", quantity: "4", category: "Produce", is_checked: false },
  { id: "4", name: "Cherry tomatoes", quantity: "1 pint", category: "Produce", is_checked: false },
  { id: "5", name: "Greek yogurt", quantity: "32 oz", category: "Dairy", is_checked: true },
  { id: "6", name: "Eggs", quantity: "1 dozen", category: "Dairy", is_checked: false },
  { id: "7", name: "Pasta", quantity: "1 lb", category: "Pantry", is_checked: false },
  { id: "8", name: "Olive oil", quantity: "1 bottle", category: "Pantry", is_checked: true },
  { id: "9", name: "Pizza dough", quantity: "1 pack", category: "Bakery", is_checked: false },
];

const MEAL_TYPE_COLORS = {
  Breakfast: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Lunch: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Dinner: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

export default function MealsPage() {
  const [mealPlan, setMealPlan] = useState(MOCK_MEAL_PLAN);
  const [groceryItems, setGroceryItems] = useState(MOCK_GROCERY_ITEMS);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MealSuggestion[]>([]);
  const [newGrocery, setNewGrocery] = useState("");
  const [selectedCell, setSelectedCell] = useState<{ day: string; type: string } | null>(null);
  const [newMeal, setNewMeal] = useState({ name: "", day: "Mon", type: "Dinner", servings: "2", prepTime: "" });

  const groceryByCategory = groceryItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof groceryItems>
  );

  async function getSuggestions() {
    setAiLoading(true);
    setShowAISuggest(true);
    try {
      const res = await fetch("/api/meals/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: ["Italian", "Mediterranean", "Asian"],
          restrictions: [],
          existingMeals: Object.values(mealPlan).flatMap((day) => Object.values(day)),
        }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      // Show mock suggestions on error for demo
      setAiSuggestions([
        { name: "Shrimp Tacos", description: "Crispy shrimp with mango salsa and chipotle crema in warm corn tortillas", ingredients: ["shrimp", "mango", "chipotle", "cilantro", "corn tortillas"], prep_time_minutes: 25, tags: ["Mexican", "Seafood"], meal_type: "dinner", servings: 2 },
        { name: "Thai Green Curry", description: "Fragrant green curry with coconut milk, vegetables, and jasmine rice", ingredients: ["green curry paste", "coconut milk", "vegetables", "rice", "basil"], prep_time_minutes: 30, tags: ["Thai", "Vegetarian"], meal_type: "dinner", servings: 2 },
        { name: "Shakshuka", description: "Eggs poached in spiced tomato sauce with feta cheese and crusty bread", ingredients: ["eggs", "tomatoes", "feta", "cumin", "paprika", "bread"], prep_time_minutes: 20, tags: ["Mediterranean", "Brunch"], meal_type: "breakfast", servings: 2 },
        { name: "Beef Bulgogi Bowls", description: "Korean marinated beef over steamed rice with pickled vegetables", ingredients: ["beef", "soy sauce", "sesame oil", "garlic", "rice", "cucumber"], prep_time_minutes: 35, tags: ["Korean", "Meal Prep"], meal_type: "dinner", servings: 2 },
        { name: "Mushroom Risotto", description: "Creamy arborio rice with mixed mushrooms, parmesan and fresh thyme", ingredients: ["arborio rice", "mushrooms", "parmesan", "white wine", "thyme"], prep_time_minutes: 40, tags: ["Italian", "Vegetarian"], meal_type: "dinner", servings: 2 },
        { name: "Smoked Salmon Bagels", description: "Everything bagels topped with cream cheese, smoked salmon, capers and red onion", ingredients: ["bagels", "cream cheese", "smoked salmon", "capers", "red onion"], prep_time_minutes: 10, tags: ["Quick", "Brunch"], meal_type: "breakfast", servings: 2 },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  function addSuggestionToPlan(suggestion: MealSuggestion) {
    // Find first empty slot for this meal type
    const typeKey = suggestion.meal_type.charAt(0).toUpperCase() + suggestion.meal_type.slice(1);
    const targetType = typeKey === "Breakfast" || typeKey === "Lunch" || typeKey === "Dinner" ? typeKey : "Dinner";
    const emptyDay = DAYS.find((d) => !mealPlan[d]?.[targetType]);
    if (emptyDay) {
      setMealPlan((prev) => ({
        ...prev,
        [emptyDay]: { ...prev[emptyDay], [targetType]: suggestion.name },
      }));
    }
  }

  function toggleGrocery(id: string) {
    setGroceryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_checked: !item.is_checked } : item))
    );
  }

  function addGroceryItem() {
    if (!newGrocery.trim()) return;
    setGroceryItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newGrocery, quantity: "", category: "Other", is_checked: false },
    ]);
    setNewGrocery("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917]">Meal Planner</h2>
          <p className="text-sm text-[#78716C]">Week of May 5–11, 2025</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="h-4 w-4 text-indigo-500" />}
            onClick={getSuggestions}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            AI Suggest Meals
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddMeal(true)}
          >
            Add Meal
          </Button>
        </div>
      </div>

      {/* Weekly planner grid */}
      <Card padding="none" className="overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-[#E7E5E4] bg-gray-50">
          <div className="p-3 border-r border-[#E7E5E4]" />
          {DAYS.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-[#1C1917] border-r border-[#E7E5E4] last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Meal type rows */}
        {MEAL_TYPES.map((mealType) => {
          const style = MEAL_TYPE_COLORS[mealType];
          return (
            <div key={mealType} className="grid grid-cols-8 border-b border-[#E7E5E4] last:border-b-0">
              <div className={`p-3 border-r border-[#E7E5E4] flex items-center ${style.bg}`}>
                <span className={`text-xs font-semibold ${style.text}`}>{mealType}</span>
              </div>
              {DAYS.map((day) => {
                const meal = mealPlan[day]?.[mealType];
                return (
                  <div
                    key={day}
                    className="p-2 border-r border-[#E7E5E4] last:border-r-0 min-h-[72px] group"
                  >
                    {meal ? (
                      <div className={`h-full p-2 rounded-lg text-xs font-medium ${style.bg} ${style.text} ${style.border} border`}>
                        {meal}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedCell({ day, type: mealType });
                          setNewMeal({ ...newMeal, day, type: mealType });
                          setShowAddMeal(true);
                        }}
                        className="h-full w-full flex items-center justify-center rounded-lg border-2 border-dashed border-[#E7E5E4] text-gray-300 hover:border-primary-300 hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Add ${mealType} for ${day}`}
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

      {/* Grocery list */}
      <Card>
        <CardHeader className="mb-5 flex-row items-center justify-between">
          <CardTitle>Grocery List</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C]">
              {groceryItems.filter((i) => i.is_checked).length}/{groceryItems.length} checked
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add item */}
          <div className="flex gap-2 mb-5">
            <input
              value={newGrocery}
              onChange={(e) => setNewGrocery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGroceryItem()}
              placeholder="Add grocery item..."
              className="flex-1 h-10 px-4 rounded-xl border border-[#E7E5E4] text-sm text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Button onClick={addGroceryItem} leftIcon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </div>

          <div className="space-y-5">
            {Object.entries(groceryByCategory).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">
                  {category}
                </h4>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => toggleGrocery(item.id)}
                        className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          item.is_checked ? "border-emerald-500 bg-emerald-500" : "border-gray-300 hover:border-emerald-400"
                        }`}
                      >
                        {item.is_checked && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.is_checked ? "line-through text-[#78716C]" : "text-[#1C1917]"}`}>
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="text-xs text-[#78716C]">{item.quantity}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Meal Modal */}
      <Modal open={showAddMeal} onClose={() => setShowAddMeal(false)} title="Add Meal" size="md">
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
              label="Prep time (minutes)"
              type="number"
              value={newMeal.prepTime}
              onChange={(e) => setNewMeal({ ...newMeal, prepTime: e.target.value })}
              leftAddon={<Clock className="h-4 w-4" />}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddMeal(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (newMeal.name && newMeal.day && newMeal.type) {
                setMealPlan((prev) => ({
                  ...prev,
                  [newMeal.day]: { ...prev[newMeal.day], [newMeal.type]: newMeal.name },
                }));
              }
              setShowAddMeal(false);
            }}
          >
            Add Meal
          </Button>
        </ModalFooter>
      </Modal>

      {/* AI Suggestions Modal */}
      <Modal open={showAISuggest} onClose={() => setShowAISuggest(false)} title="AI Meal Suggestions" description="Powered by Claude" size="xl">
        <ModalBody>
          {aiLoading ? (
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
              <p className="text-[#78716C] text-sm">Claude is crafting meal suggestions just for you...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              {aiSuggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-4 rounded-xl border border-[#E7E5E4] hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[#1C1917] text-sm">{suggestion.name}</h3>
                    <Badge variant="secondary" className="text-xs capitalize ml-2 flex-shrink-0">{suggestion.meal_type}</Badge>
                  </div>
                  <p className="text-xs text-[#78716C] mb-3 leading-relaxed">{suggestion.description}</p>
                  <div className="flex items-center gap-3 text-xs text-[#78716C] mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {suggestion.prep_time_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {suggestion.servings} servings
                    </span>
                    <span>{suggestion.ingredients.length} ingredients</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {suggestion.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => addSuggestionToPlan(suggestion)}
                  >
                    Add to plan
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAISuggest(false)}>Close</Button>
          <Button
            leftIcon={<Sparkles className="h-4 w-4" />}
            variant="indigo"
            onClick={getSuggestions}
            loading={aiLoading}
          >
            Refresh suggestions
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
