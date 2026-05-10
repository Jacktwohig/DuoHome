import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: Replace with Supabase queries
const MOCK_EVENTS = [
  { id: "1", title: "Dentist Appointment", date: "Monday, May 12", time: "2:30 PM", color: "#6366F1", description: "Alex's checkup" },
  { id: "2", title: "Date Night", date: "Wednesday, May 14", time: "7:00 PM", color: "#E8526A", description: "Italian Restaurant" },
  { id: "3", title: "Mom's Birthday Dinner", date: "Friday, May 16", time: "6:00 PM", color: "#F59E0B", description: "Family dinner" },
  { id: "4", title: "Weekend Hike", date: "Sunday, May 18", time: "9:00 AM", color: "#10B981", description: "Blue Ridge trail" },
  { id: "5", title: "Jordan's Conference", date: "Tuesday, May 20", time: "All day", color: "#8B5CF6", description: "Design conference" },
  { id: "6", title: "Cooking Class", date: "Saturday, May 24", time: "6:00 PM", color: "#EF4444", description: "Italian cooking" },
];

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Upcoming events</Text>
        </View>

        {/* Current month mini-card */}
        <View style={styles.monthCard}>
          <Text style={styles.monthTitle}>May 2025</Text>
          <Text style={styles.monthStat}>{MOCK_EVENTS.length} events this month</Text>
        </View>

        {/* Events list (agenda view) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {MOCK_EVENTS.map((event, index) => (
            <View key={event.id}>
              <View style={styles.eventCard}>
                <View style={[styles.colorBar, { backgroundColor: event.color }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                  {event.description && (
                    <Text style={styles.eventDesc}>{event.description}</Text>
                  )}
                </View>
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
  monthCard: {
    backgroundColor: "#6366F1",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  monthStat: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  colorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1917",
  },
  eventDate: {
    fontSize: 13,
    color: "#78716C",
    marginTop: 3,
  },
  eventTime: {
    fontSize: 13,
    color: "#78716C",
    fontWeight: "500",
  },
  eventDesc: {
    fontSize: 12,
    color: "#78716C",
    marginTop: 4,
  },
});
