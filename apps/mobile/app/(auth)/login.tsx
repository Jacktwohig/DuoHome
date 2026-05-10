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
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/(tabs)");
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Header gradient area */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>♥</Text>
        </View>
        <Text style={styles.appName}>DuoHome</Text>
        <Text style={styles.tagline}>Run your home together</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Welcome back</Text>
        <Text style={styles.formSubtitle}>Sign in to your account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
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
            placeholder="Your password"
            placeholderTextColor="#78716C"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.secondaryButtonText}>
            Don&apos;t have an account?{" "}
            <Text style={styles.linkText}>Sign up free</Text>
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 80,
    paddingBottom: 40,
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
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  form: {
    flex: 1,
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1917",
    marginBottom: 4,
    marginTop: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: "#78716C",
    marginBottom: 28,
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
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 20,
    alignItems: "center",
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
