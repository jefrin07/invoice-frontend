"use client";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthProvider";
import { api } from "@/services/api";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const { colors } = useTheme();
  const { token, signOut } = useAuth(); // ✅ updated from userToken → token
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  // Toast animation
  const [toast, setToast] = useState("");
  const toastAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (toast) {
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToast(""));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await api.get("/api/auth/getUserProfile"); // ✅ using api instance (auth header set automatically)
      const data = res.data;
      setName(data.name || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
    } catch (err: any) {
      console.error("Profile load error:", err);
      setToast("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [token]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleSave = async () => {
    if (!name || !address || !phone) {
      setToast("All fields are required");
      return;
    }

    try {
      setSaving(true);
      await api.put("/api/auth/updateUserProfile", { name, address, phone });
      setToast("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Update failed:", err);
      setToast("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const toastTranslate = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Toast */}
      {toast ? (
        <Animated.View
          style={[
            styles.toast,
            {
              top: insets.top + 10,
              backgroundColor: colors.notification || "#34C759",
              transform: [{ translateY: toastTranslate }],
              opacity: toastAnim,
            },
          ]}
        >
          <ThemedText style={[styles.toastText, { color: "#fff" }]}>
            {toast}
          </ThemedText>
        </Animated.View>
      ) : null}

      <ThemedView style={styles.container}>
     

        {isEditing ? (
          <>
            <ThemedText style={[styles.label, { color: colors.text }]}>
              Name
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border || "#ccc",
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.primary}
            />

            <ThemedText style={[styles.label, { color: colors.text }]}>
              Address
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border || "#ccc",
                },
              ]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              placeholderTextColor={colors.primary}
            />

            <ThemedText style={[styles.label, { color: colors.text }]}>
              Phone Number
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border || "#ccc",
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.primary}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#34C759" }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText type="subtitle" style={styles.submitText}>
                  Save
                </ThemedText>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.viewRow}>
              <ThemedText style={[styles.viewLabel, { color: colors.text }]}>
                Name:
              </ThemedText>
              <ThemedText style={[styles.viewValue, { color: colors.text }]}>
                {name}
              </ThemedText>
            </View>

            <View style={styles.viewRow}>
              <ThemedText style={[styles.viewLabel, { color: colors.text }]}>
                Address:
              </ThemedText>
              <ThemedText style={[styles.viewValue, { color: colors.text }]}>
                {address}
              </ThemedText>
            </View>

            <View style={styles.viewRow}>
              <ThemedText style={[styles.viewLabel, { color: colors.text }]}>
                Phone:
              </ThemedText>
              <ThemedText style={[styles.viewValue, { color: colors.text }]}>
                {phone}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <ThemedText type="subtitle" style={styles.editText}>
                Edit
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: "#FF3B30" }]}
              onPress={handleLogout}
            >
              <ThemedText type="subtitle" style={styles.logoutText}>
                Logout
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    marginBottom: 5,
    fontFamily: Fonts.rounded,
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  viewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  viewLabel: {
    fontFamily: Fonts.rounded,
    fontWeight: "600",
    fontSize: 16,
  },
  viewValue: { fontFamily: Fonts.rounded, fontSize: 16 },
  editButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  editText: { color: "#fff", fontWeight: "600" },
  logoutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  submitButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  toast: {
    position: "absolute",
    width: "100%",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 999,
  },
  toastText: { fontSize: 14, fontWeight: "600", textAlign: "center" },
});
