import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TabsLayout() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true,

          headerRight: () => (
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
            >
              <Ionicons
                name="menu"
                size={30}
                color="#222"
              />
            </TouchableOpacity>
          ),

          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "home") {
              iconName = "home";
            } else if (route.name === "invoices") {
              iconName = "document-text";
            } else {
              iconName = "person";
            }

            return (
              <Ionicons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
          }}
        />

        <Tabs.Screen
          name="invoices"
          options={{
            title: "Create Invoice",
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />

        <Tabs.Screen
    name="messages"
    options={{
      title: "Messages",
      href: null,
    }}
  />
      </Tabs>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.backgroundOverlay}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/messages");
              }}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={23}
                color="#333"
              />

              <Text style={styles.menuText}>
                Messages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/profile");
              }}
            >
              <Ionicons
                name="person-outline"
                size={23}
                color="#333"
              />

              <Text style={styles.menuText}>
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginRight: 16,
    padding: 6,
  },

  modalContainer: {
    flex: 1,
  },

  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },

  menu: {
    position: "absolute",
    top: 60,
    right: 12,
    width: 210,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    elevation: 8,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 18,
  },

  menuText: {
    marginLeft: 13,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});