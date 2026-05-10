import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: Replace with Supabase queries
const MOCK_CHORES = [
  { id: "1", title: "Vacuum living room", assignee: "Alex", priority: "medium", points: 10, done: false },
  { id: "2", title: "Do laundry", assignee: "Jordan", priority: "high", points: 15, done: true },
  { id: "3", title: "Empty dishwasher", assignee: "Alex", priority: "low", points: 5, done: true },
  { id: "4", title: "Take out trash", assignee: "Jordan", priority: "high", points: 10, done: false },
  { id: "5", title: "Grocery shopping", assignee: "Alex", priority: "high", points: 20, done: false },
  { id: "6", title: "Clean bathroom", assignee: "Jordan", priority: "medium", points: 20, done: false },
];

const PRIORITY_COLORS = {
  low: { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  high: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

export default function ChoresScreen() {
  const [chores, setChores] = useState(MOCK_CHORES);

  const alexScore = 145 + chores.filter((c) => c.assignee === "Alex" && c.done).reduce((s, c) => s + c.points, 0);
  const jordanScore = 180 + chores.filter((c) => c.assignee === "Jordan" && c.done).reduce((s, c) => s + c.points, 0);

  function toggleChore(id: string) {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Chores</Text>
          <Text style={styles.subtitle}>Today's tasks</Text>
        </View>

        {/* Scoreboard */}
        <View style={styles.scoreboard}>
          <Text style={styles.scoreboardTitle}>🏆 Scoreboard</Text>
          <View style={styles.scores}>
            <View style={[styles.scoreCard, { borderColor: "#E8526A" }]}>
              <Text style={styles.scoreName}>Alex</Text>
              <Text style={[styles.scoreValue, { color: "#E8526A" }]}>{alexScore}</Text>
              <Text style={styles.scoreLabel}>points</Text>
            </View>
            <Text style={styles.vs}>vs</Text>
            <View style={[styles.scoreCard, { borderColor: "#6366F1" }]}>
              <Text style={styles.scoreName}>Jordan</Text>
              <Text style={[styles.scoreValue, { color: "#6366F1" }]}>{jordanScore}</Text>
              <Text style={styles.scoreLabel}>points</Text>
            </View>
          </View>
        </View>

        {/* Chores list */}
        <View style={[styles.section, { paddingBottom: 32 }]}>
          <Text style={styles.sectionTitle}>
            Today&apos;s Chores ({chores.filter((c) => c.done).length}/{chores.length} done)
          </Text>
          {chores.map((chore) => {
            const priorityStyle = PRIORITY_COLORS[chore.priority as keyof typeof PRIORITY_COLORS];
            return (
              <TouchableOpacity
                key={chore.id}
                style={styles.choreCard}
                onPress={() => toggleChore(chore.id)}
              >
                <View
                  style={[
                    styles.checkCircle,
                    chore.done && styles.checkCircleDone,
                  ]}
                >
                  {chore.done && <Text style={styles.checkIcon}>✓</Text>}
                </View>
                <View style={styles.choreInfo}>
                  <Text
                    style={[
                      styles.choreTitle,
                      chore.done && styles.choreTitleDone,
                    ]}
                  >
                    {chore.title}
                  </Text>
                  <View style={styles.choreMeta}>
                    <Text style={styles.choreAssignee}>{chore.assignee}</Text>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor: priorityStyle.bg,
                          borderColor: priorityStyle.border,
                        },
                      ]}
                    >
                      <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                        {chore.priority}
                      </Text>
                    </View>
                    <Text style={styles.points}>⭐ {chore.points}pts</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
  scoreboard: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreboardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1917",
    textAlign: "center",
    marginBottom: 16,
  },
  scores: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  scoreCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  scoreName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "800",
  },
  scoreLabel: {
    fontSize: 11,
    color: "#78716C",
    marginTop: 2,
  },
  vs: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78716C",
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 12,
  },
  choreCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkCircleDone: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkIcon: {
    color: "white",
    fontSize: 13,
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
  choreTitleDone: {
    textDecorationLine: "line-through",
    color: "#78716C",
  },
  choreMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  choreAssignee: {
    fontSize: 12,
    color: "#78716C",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  points: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "600",
  },
});
