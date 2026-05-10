import React from "react";
import { Tabs } from "expo-router";
import { View, Text, Platform } from "react-native";

// Custom tab bar icon component
function TabIcon({
  emoji,
  label,
  focused,
  color,
}: {
  emoji: string;
  label: string;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={{ alignItems: "center", paddingTop: 2 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          color: focused ? "#E8526A" : "#78716C",
          fontWeight: focused ? "600" : "400",
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E8526A",
        tabBarInactiveTintColor: "#78716C",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#E7E5E4",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} color={focused ? "#E8526A" : "#78716C"} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💰" label="Finance" focused={focused} color={focused ? "#10B981" : "#78716C"} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="Calendar" focused={focused} color={focused ? "#6366F1" : "#78716C"} />
          ),
        }}
      />
      <Tabs.Screen
        name="chores"
        options={{
          title: "Chores",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✅" label="Chores" focused={focused} color={focused ? "#F59E0B" : "#78716C"} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🍽️" label="Meals" focused={focused} color={focused ? "#EF4444" : "#78716C"} />
          ),
        }}
      />
    </Tabs>
  );
}
