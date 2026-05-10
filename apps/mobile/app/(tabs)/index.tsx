import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

// TODO: Replace with Supabase queries
const MOCK_DATA = {
  userName: "Alex",
  partnerName: "Jordan",
  partnerOnline: true,
  stats: {
    monthlySpending: 2340,
    monthlyBudget: 3000,
    choresThisWeek: "7/10",
    upcomingEvents: 4,
  },
  todayChores: [
    { id: "1", title: "Vacuum living room", assignee: "Alex", done: false },
    { id: "2", title: "Do laundry", assignee: "Jordan", done: true },
    { id: "3", title: "Take out trash", assignee: "Jordan", done: false },
  ],
  todayMeals: {
    breakfast: "Avocado Toast",
    dinner: "Pasta Primavera",
  },
  upcomingEvents: [
    { id: "1", title: "Dentist Appointment", date: "May 12", color: "#6366F1" },
    { id: "2", title: "Date Night", date: "May 14", color: "#E8526A" },
  ],
};

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [chores, setChores] = useState(MOCK_DATA.todayChores);

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  async function onRefresh() {
    setRefreshing(true);
    // TODO: Refresh data from Supabase
    setTimeout(() => setRefreshing(false), 1000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8526A" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {greeting}, {MOCK_DATA.userName}! 👋
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
          </View>
          {/* Partner bubble */}
          <View style={styles.partnerBubble}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.partnerInitial}>
                {MOCK_DATA.partnerName[0]}
              </Text>
            </View>
            <View style={[styles.onlineIndicator, { backgroundColor: MOCK_DATA.partnerOnline ? "#10B981" : "#D1D5DB" }]} />
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statCard, { borderLeftColor: "#10B981" }]} onPress={() => router.push("/(tabs)/finance")}>
            <Text style={styles.statLabel}>Monthly Budget</Text>
            <Text style={styles.statValue}>${MOCK_DATA.stats.monthlySpending}</Text>
            <Text style={styles.statSub}>of ${MOCK_DATA.stats.monthlyBudget}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { borderLeftColor: "#F59E0B" }]} onPress={() => router.push("/(tabs)/chores")}>
            <Text style={styles.statLabel}>Chores Done</Text>
            <Text style={styles.statValue}>{MOCK_DATA.stats.choresThisWeek}</Text>
            <Text style={styles.statSub}>this week</Text>
          </TouchableOpacity>
        </View>

        {/* Today's chores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Chores</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/chores")}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {chores.map((chore) => (
            <TouchableOpacity
              key={chore.id}
              style={styles.choreCard}
              onPress={() =>
                setChores((prev) =>
                  prev.map((c) => (c.id === chore.id ? { ...c, done: !c.done } : c))
                )
              }
            >
              <View style={[styles.choreCheck, chore.done && styles.choreCheckDone]}>
                {chore.done && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={styles.choreInfo}>
                <Text style={[styles.choreTitle, chore.done && styles.choreDoneText]}>
                  {chore.title}
                </Text>
                <Text style={styles.choreAssignee}>{chore.assignee}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/meals")}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mealsCard}>
            <View style={styles.mealItem}>
              <View style={[styles.mealBadge, { backgroundColor: "#FEF3C7" }]}>
                <Text style={[styles.mealBadgeText, { color: "#D97706" }]}>Breakfast</Text>
              </View>
              <Text style={styles.mealName}>{MOCK_DATA.todayMeals.breakfast}</Text>
            </View>
            <View style={[styles.mealItem, { borderTopWidth: 1, borderTopColor: "#F0EDEC" }]}>
              <View style={[styles.mealBadge, { backgroundColor: "#EFF6FF" }]}>
                <Text style={[styles.mealBadgeText, { color: "#3B82F6" }]}>Dinner</Text>
              </View>
              <Text style={styles.mealName}>{MOCK_DATA.todayMeals.dinner}</Text>
            </View>
          </View>
        </View>

        {/* Upcoming events */}
        <View style={[styles.section, { paddingBottom: 24 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/calendar")}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {MOCK_DATA.upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={[styles.eventBar, { backgroundColor: event.color }]} />
              <View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
            </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1917",
  },
  date: {
    fontSize: 14,
    color: "#78716C",
    marginTop: 2,
  },
  partnerBubble: {
    position: "relative",
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerInitial: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FAFAF8",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#78716C",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1917",
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: "#78716C",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  },
  seeAll: {
    fontSize: 13,
    color: "#E8526A",
    fontWeight: "600",
  },
  choreCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  choreCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  choreCheckDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkMark: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  choreInfo: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1917",
  },
  choreDoneText: {
    textDecorationLine: "line-through",
    color: "#78716C",
  },
  choreAssignee: {
    fontSize: 12,
    color: "#78716C",
    marginTop: 2,
  },
  mealsCard: {
    backgroundColor: "white",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  mealBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  mealBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  mealName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
    flex: 1,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  eventBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
  },
  eventDate: {
    fontSize: 12,
    color: "#78716C",
    marginTop: 2,
  },
});
