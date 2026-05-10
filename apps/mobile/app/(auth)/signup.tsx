import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "@/lib/supabase";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    // Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });

    if (signUpError || !authData.user) {
      Alert.alert("Error", signUpError?.message || "Failed to create account");
      setLoading(false);
      return;
    }

    // Create household
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({ name: `${name}'s Home` })
      .select()
      .single();

    if (householdError || !household) {
      Alert.alert("Error", "Failed to create household");
      setLoading(false);
      return;
    }

    // Create profile
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      household_id: household.id,
      display_name: name,
      is_primary_member: true,
    });

    setLoading(false);
    router.replace("/(tabs)");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>♥</Text>
          </View>
          <Text style={styles.appName}>DuoHome</Text>
          <Text style={styles.tagline}>14 days free — no card required</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Create your account</Text>
          <Text style={styles.formSubtitle}>Start managing your home together</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Alex Johnson"
              placeholderTextColor="#78716C"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#78716C"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor="#78716C"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Create account &amp; start free trial</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account?{" "}
              <Text style={styles.linkText}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  header: {
    backgroundColor: "#E8526A",
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    color: "white",
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  form: {
    padding: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 4,
    marginTop: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: "#78716C",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1917",
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E7E5E4",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1C1917",
    backgroundColor: "white",
  },
  button: {
    height: 52,
    backgroundColor: "#E8526A",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#E8526A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 20,
    alignItems: "center",
    paddingBottom: 32,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "#78716C",
  },
  linkText: {
    color: "#E8526A",
    fontWeight: "600",
  },
});
