import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function Messages() {
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [product, setProduct] = useState("");
  const [message, setMessage] = useState("");

  // ========================================
  // Generate Message
  // ========================================

  const generateMessage = () => {
    if (!customerName.trim()) {
      Toast.show({
        type: "error",
        text1: "Customer name required",
        text2: "Please enter customer name.",
      });
      return;
    }

    if (!mobileNumber.trim()) {
      Toast.show({
        type: "error",
        text1: "Mobile number required",
        text2: "Please enter mobile number.",
      });
      return;
    }

    if (!product.trim()) {
      Toast.show({
        type: "error",
        text1: "Product required",
        text2: "Please enter the product or order.",
      });
      return;
    }

    const generatedMessage = `Hi ${customerName.trim()}! ❤️

Thank you so much for choosing 10th May Bakers!

We hope you enjoyed your ${product.trim()}. 🎂

Your support means a lot to us. We look forward to serving you again! 🧁✨

Thank you,
10th May Bakers ❤️`;

    setMessage(generatedMessage);

    Toast.show({
      type: "success",
      text1: "Message generated",
      text2: "Your thank-you message is ready.",
    });
  };

  // ========================================
  // Copy Message
  // ========================================

  const copyMessage = async () => {
    if (!message) {
      Toast.show({
        type: "error",
        text1: "No message",
        text2: "Please generate a message first.",
      });
      return;
    }

    try {
      await Clipboard.setStringAsync(message);

      Toast.show({
        type: "success",
        text1: "Message copied",
        text2: "Message copied to clipboard.",
      });
    } catch (error) {
      console.error(
        "Copy message error:",
        error
      );

      Toast.show({
        type: "error",
        text1: "Copy failed",
        text2: "Unable to copy the message.",
      });
    }
  };

  // ========================================
  // Send WhatsApp
  // ========================================

  const sendWhatsApp = async () => {
    if (!message) {
      Toast.show({
        type: "error",
        text1: "No message",
        text2: "Please generate a message first.",
      });
      return;
    }

    if (!mobileNumber.trim()) {
      Toast.show({
        type: "error",
        text1: "Mobile number required",
        text2: "Please enter mobile number.",
      });
      return;
    }

    // Remove spaces, +, -, brackets, etc.
    let phoneNumber = mobileNumber.replace(
      /\D/g,
      ""
    );

    // 10 digit Indian number
    if (phoneNumber.length === 10) {
      phoneNumber = `91${phoneNumber}`;
    }

    // 0XXXXXXXXXX
    if (
      phoneNumber.length === 11 &&
      phoneNumber.startsWith("0")
    ) {
      phoneNumber = `91${phoneNumber.substring(1)}`;
    }

    if (phoneNumber.length < 10) {
      Toast.show({
        type: "error",
        text1: "Invalid mobile number",
        text2: "Please enter a valid mobile number.",
      });
      return;
    }

    try {
      const whatsappUrl =
        `https://wa.me/${phoneNumber}` +
        `?text=${encodeURIComponent(message)}`;

      const supported =
        await Linking.canOpenURL(
          whatsappUrl
        );

      if (!supported) {
        Toast.show({
          type: "error",
          text1: "WhatsApp unavailable",
          text2:
            "WhatsApp could not be opened on this device.",
        });
        return;
      }

      await Linking.openURL(
        whatsappUrl
      );
    } catch (error) {
      console.error(
        "WhatsApp error:",
        error
      );

      Toast.show({
        type: "error",
        text1: "Unable to open WhatsApp",
        text2:
          "Something went wrong while opening WhatsApp.",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========================================
            HEADER
        ======================================== */}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Thank You Message
            </Text>

            <Text style={styles.subtitle}>
              Create a personalized message
              for your customer.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="chatbubble-ellipses"
              size={24}
              color="#FAFAFA"
            />
          </View>
        </View>

        {/* ========================================
            CUSTOMER FORM
        ======================================== */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Customer Details
          </Text>

          {/* Customer Name */}

          <Text style={styles.label}>
            Customer Name
          </Text>

          <TextInput
            value={customerName}
            onChangeText={
              setCustomerName
            }
            placeholder="e.g. Anu"
            placeholderTextColor="#71717A"
            autoCapitalize="words"
            returnKeyType="next"
            style={styles.input}
          />

          {/* Mobile Number */}

          <Text style={styles.label}>
            Mobile Number
          </Text>

          <TextInput
            value={mobileNumber}
            onChangeText={
              setMobileNumber
            }
            placeholder="e.g. 9876543210"
            placeholderTextColor="#71717A"
            keyboardType="phone-pad"
            maxLength={15}
            returnKeyType="next"
            style={styles.input}
          />

          {/* Product */}

          <Text style={styles.label}>
            Product / Order
          </Text>

          <TextInput
            value={product}
            onChangeText={setProduct}
            placeholder="e.g. Chocolate Birthday Cake"
            placeholderTextColor="#71717A"
            autoCapitalize="sentences"
            returnKeyType="done"
            style={styles.input}
          />

          {/* Generate Button */}

          <TouchableOpacity
            style={
              styles.generateButton
            }
            onPress={
              generateMessage
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="sparkles"
              size={20}
              color="#18181B"
            />

            <Text
              style={
                styles.generateButtonText
              }
            >
              Generate Message
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================
            MESSAGE PREVIEW
        ======================================== */}

        {message !== "" && (
          <View
            style={
              styles.previewCard
            }
          >
            <View
              style={
                styles.previewHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Message Preview
                </Text>

                <Text
                  style={
                    styles.previewSubtitle
                  }
                >
                  Ready to send to your
                  customer
                </Text>
              </View>

              <Ionicons
                name="checkmark-circle"
                size={25}
                color="#22C55E"
              />
            </View>

            {/* Message */}

            <View
              style={
                styles.messageBox
              }
            >
              <Text
                style={
                  styles.messageText
                }
              >
                {message}
              </Text>
            </View>

            {/* Actions */}

            <View
              style={
                styles.actionRow
              }
            >
              {/* Copy */}

              <TouchableOpacity
                style={
                  styles.copyButton
                }
                onPress={
                  copyMessage
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="copy-outline"
                  size={20}
                  color="#E4E4E7"
                />

                <Text
                  style={
                    styles.copyButtonText
                  }
                >
                  Copy
                </Text>
              </TouchableOpacity>

              {/* WhatsApp */}

              <TouchableOpacity
                style={
                  styles.whatsappButton
                }
                onPress={
                  sendWhatsApp
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={21}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.whatsappText
                  }
                >
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ========================================
  // SCREEN
  // ========================================

  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // ========================================
  // HEADER
  // ========================================

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
    paddingRight: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FAFAFA",
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#A1A1AA",
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
    alignItems: "center",
    justifyContent: "center",
  },

  // ========================================
  // CUSTOMER FORM CARD
  // ========================================

  card: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#27272A",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FAFAFA",
    marginBottom: 4,
  },

  // ========================================
  // FORM LABEL
  // ========================================

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D4D4D8",
    marginTop: 16,
    marginBottom: 7,
  },

  // ========================================
  // INPUT
  // ========================================

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#3F3F46",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#FAFAFA",
    backgroundColor: "#0F0F11",
  },

  // ========================================
  // GENERATE BUTTON
  // ========================================

  generateButton: {
    height: 50,
    marginTop: 22,
    borderRadius: 11,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  generateButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#18181B",
  },

  // ========================================
  // MESSAGE PREVIEW
  // ========================================

  previewCard: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#27272A",
  },

  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  previewSubtitle: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 3,
  },

  messageBox: {
    backgroundColor: "#0F0F11",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#27272A",
  },

  messageText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#E4E4E7",
  },

  // ========================================
  // ACTIONS
  // ========================================

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  copyButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3F3F46",
    backgroundColor: "#27272A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  copyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E4E4E7",
  },

  whatsappButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#25D366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  whatsappText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});