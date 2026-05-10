import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: Replace with Supabase queries
const MOCK_TODAY_MEALS = [
  { type: "Breakfast", meal: "Avocado Toast & Eggs", color: "#F59E0B", bg: "#FFFBEB" },
  { type: "Lunch", meal: "Greek Salad", color: "#10B981", bg: "#F0FDF4" },
  { type: "Dinner", meal: "Pasta Primavera", color: "#6366F1", bg: "#EFF6FF" },
];

const MOCK_TOMORROW = "Chicken Stir Fry";

const MOCK_GROCERY = [
  { id: "1", name: "Avocados", quantity: "4", category: "Produce", checked: false },
  { id: "2", name: "Chicken breast", quantity: "2 lbs", category: "Meat", checked: false },
  { id: "3", name: "Cherry tomatoes", quantity: "1 pint", category: "Produce", checked: true },
  { id: "4", name: "Greek yogurt", quantity: "32 oz", category: "Dairy", checked: true },
  { id: "5", name: "Pasta", quantity: "1 lb", category: "Pantry", checked: false },
  { id: "6", name: "Eggs", quantity: "1 dozen", category: "Dairy", checked: false },
];

export default function MealsScreen() {
  const [grocery, setGrocery] = useState(MOCK_GROCERY);
  const [newItem, setNewItem] = useState("");

  function toggleItem(id: string) {
    setGrocery((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }

  function addItem() {
    if (!newItem.trim()) return;
    setGrocery((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newItem, quantity: "", category: "Other", checked: false },
    ]);
    setNewItem("");
  }

  const checkedCount = grocery.filter((i) => i.checked).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Meals</Text>
          <Text style={styles.subtitle}>Week of May 5–11</Text>
        </View>

        {/* Today's meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
          {MOCK_TODAY_MEALS.map((item) => (
            <View key={item.type} style={[styles.mealCard, { borderLeftColor: item.color }]}>
              <View style={[styles.mealBadge, { backgroundColor: item.bg }]}>
                <Text style={[styles.mealBadgeText, { color: item.color }]}>{item.type}</Text>
              </View>
              <Text style={styles.mealName}>{item.meal}</Text>
            </View>
          ))}

          {/* Tomorrow */}
          <View style={styles.tomorrowCard}>
            <Text style={styles.tomorrowLabel}>Tomorrow&apos;s Dinner</Text>
            <Text style={styles.tomorrowMeal}>{MOCK_TOMORROW}</Text>
          </View>
        </View>

        {/* Grocery list */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Grocery List</Text>
            <Text style={styles.checkCount}>{checkedCount}/{grocery.length} checked</Text>
          </View>

          {/* Add item */}
          <View style={styles.addRow}>
            <TextInput
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Add item..."
              placeholderTextColor="#78716C"
              style={styles.addInput}
              onSubmitEditing={addItem}
            />
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {grocery.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.groceryItem}
              onPress={() => toggleItem(item.id)}
            >
              <View style={[styles.groceryCheck, item.checked && styles.groceryCheckDone]}>
                {item.checked && <Text style={styles.groceryCheckIcon}>✓</Text>}
              </View>
              <View style={styles.groceryInfo}>
                <Text style={[styles.groceryName, item.checked && styles.groceryNameDone]}>
                  {item.name}
                </Text>
                {item.quantity ? <Text style={styles.groceryQty}>{item.quantity}</Text> : null}
              </View>
              <Text style={styles.groceryCategory}>{item.category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1C1917",
  },
  subtitle: {
    fontSize: 14,
    color: "#78716C",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 12,
  },
  checkCount: {
    fontSize: 13,
    color: "#78716C",
  },
  mealCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mealBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  mealBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  mealName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
    flex: 1,
  },
  tomorrowCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    marginTop: 4,
  },
  tomorrowLabel: {
    fontSize: 11,
    color: "#78716C",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tomorrowMeal: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1917",
    marginTop: 4,
  },
  addRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
    height: 44,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E7E5E4",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1C1917",
  },
  addButton: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: "#E8526A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  groceryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  groceryCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  groceryCheckDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  groceryCheckIcon: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  groceryInfo: {
    flex: 1,
  },
  groceryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
  },
  groceryNameDone: {
    textDecorationLine: "line-through",
    color: "#78716C",
  },
  groceryQty: {
    fontSize: 12,
    color: "#78716C",
    marginTop: 1,
  },
  groceryCategory: {
    fontSize: 11,
    color: "#78716C",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
});
