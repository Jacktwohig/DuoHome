import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!initialized) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="(auth)" />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
          </>
        )}
      </Stack>
    </SafeAreaProvider>
  );
}
