"use client";

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./home";
import Invoices from "./invoices";
import Profile from "./profile";

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName =
            route.name === "Home"
              ? "home"
              : route.name === "Invoices"
              ? "document-text"
              : "person";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Create Invoice" component={Invoices} />
      <Tab.Screen name="Profile" component={Profile} />

    </Tab.Navigator>
  );
}
