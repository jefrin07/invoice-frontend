"use client";

import { AuthProvider, useAuth } from "@/contexts/AuthProvider";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, useColorScheme } from "react-native";
import Toast from "react-native-toast-message";

function RootNavigation() {
  const { isAuthenticated, initializing } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Redirect after token restored
  useEffect(() => {
    if (!mounted || initializing) return;

    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      router.replace("/(tabs)/home");
    }
  }, [mounted, initializing, isAuthenticated, router]);

  const colorScheme = useColorScheme();
  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootNavigation />
      </ThemeProvider>
      <Toast />
    </AuthProvider>
  );
}
