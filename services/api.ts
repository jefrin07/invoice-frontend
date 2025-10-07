import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { Alert, Platform } from "react-native";

export const api = axios.create({
  baseURL: "https://invoice-steel-five.vercel.app",
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle invalid/expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 404) {
      // Remove invalid token
      await AsyncStorage.removeItem("token");

      // Optional alert
      if (Platform.OS !== "web") {
        Alert.alert("Session expired", "Please log in again.");
      }

      // Redirect to login
      router.replace("/login");
    }

    return Promise.reject(error);
  }
);
