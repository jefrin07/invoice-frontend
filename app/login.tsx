"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function Login() {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogin = async () => {
    try {
      setError("");
      await signIn(email, password);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      {/* Logo */}
      <Image
        source={require("../assets/10thmaylogo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        Login
      </Text>

      {error ? (
        <Text style={[styles.error, { color: "#ff6b6b" }]}>{error}</Text>
      ) : null}

      <TextInput
        placeholder="Email"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#444" : "#ccc",
          },
        ]}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#444" : "#ccc",
          },
        ]}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? "#2563eb" : "#007bff" },
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { width: "100%", borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8 },
  button: { width: "100%", padding: 15, borderRadius: 8 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  error: { textAlign: "center", marginBottom: 10 },
});
