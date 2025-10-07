"use client";

import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/AuthProvider";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type InvoiceItem = {
  itemName: string;
  quantity: number;
  price: number;
};

type Invoice = {
  _id: string;
  clientName: string;
  items: InvoiceItem[];
  totalAmount: number;
  createdAt: string;
};

export default function InvoiceDetail() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const invoiceId = params.id as string;
  const { token, user } = useAuth();
  const router = useRouter();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load logo as base64 safely
  const logoUrl =
    "https://res.cloudinary.com/dolvugojm/image/upload/v1759820190/xexaeilv0aayt617yfvr.png";

  // Fetch invoice data
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }

    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/api/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoice(response.data);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1:
            err.response?.data?.message ||
            err.message ||
            "Error fetching invoice",
          position: "top",
        });
        setError(
          err.response?.data?.message || err.message || "Error fetching invoice"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, token]);

  if (loading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !invoice) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: colors.background }]}
      >
        <ThemedText style={{ color: "red" }}>
          {error || "Invoice not found"}
        </ThemedText>
      </View>
    );
  }

  // Generate PDF
  const generatePDF = async () => {

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 30px; color: #333; font-size: 16px; line-height: 1.6; }
            .header { width: 100%; display: table; margin-bottom: 20px; }
            .header .left, .header .right { display: table-cell; vertical-align: top; }
            .header .left img { height: 150px; }
            .header .right { text-align: right; font-size: 19px; }
            h2 { color: #2563eb; font-size: 24px; margin-top: 15px; }
            h3 { color: #2563eb; font-size: 20px; margin-top: 20px; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; font-size: 16px; page-break-inside: auto; }
            thead { display: table-header-group; }
            tbody { display: table-row-group; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th, td { padding: 8px; border-bottom: 2px solid #ccc; }
            th { text-align: left; }
            td { text-align: right; }
            td:first-child, th:first-child { text-align: left; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="left">
              <img src="${logoUrl}" alt="Logo" />
            </div>
            <div class="right">
              <p style="margin:0; font-weight:700;">${user?.name || ""}</p>
              <p style="margin:0;">${user?.address || ""}</p>
              <p style="margin:0;">${user?.phone || ""}</p>
            </div>
          </div>

          <div style="margin-top: 20px;">
            <h2>Invoice #${invoice._id.slice(-6)}</h2>
            <p style="font-size:18px;">Customer: ${invoice.clientName}</p>
            <p style="font-size:16px;">Date: ${new Date(
              invoice.createdAt
            ).toLocaleDateString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="center">Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item) => `
                  <tr>
                    <td>${item.itemName}</td>
                    <td class="center">${item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>

          <h3>Total: ₹${invoice.totalAmount.toFixed(2)}</h3>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    return uri;
  };

  // Improved Share PDF
  const handleSharePDF = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const tempUri = await generatePDF();
      const pdfUri = `${FileSystem.cacheDirectory}invoice.pdf`;
      await FileSystem.copyAsync({ from: tempUri, to: pdfUri });

      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (!isSharingAvailable) {
        // Fallback for Expo Go
        if (Platform.OS === "android") {
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: pdfUri,
              flags: 1,
              type: "application/pdf",
            }
          );
          Toast.show({
            type: "info",
            text1: "Opened PDF in viewer (Expo Go fallback)",
          });
        } else {
          Toast.show({
            type: "info",
            text1:
              "Sharing is not available in Expo Go. Use a standalone build to share.",
          });
        }
        return;
      }

      // Standalone build sharing
      await Sharing.shareAsync(pdfUri, { mimeType: "application/pdf" });
      Toast.show({ type: "success", text1: "Invoice shared!" });
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to share PDF" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText
            style={[styles.title, { marginLeft: 10, color: colors.text }]}
          >
            Invoice #{invoice._id.slice(-6)}
          </ThemedText>
        </View>

        <ThemedText style={{ color: colors.text }}>
          Client: {invoice.clientName}
        </ThemedText>
        <ThemedText style={{ color: colors.text }}>
          Date: {new Date(invoice.createdAt).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={{ color: "#2563eb", marginVertical: 10 }}>
          Amount: ₹{invoice.totalAmount.toFixed(2)}
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: colors.text }]}>
          Items:
        </ThemedText>
        {invoice.items.map((item, idx) => (
          <ThemedText key={idx} style={{ color: colors.text }}>
            {item.itemName} — {item.quantity} × ₹{item.price.toFixed(2)}
          </ThemedText>
        ))}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#22c55e" }]}
          onPress={handleSharePDF}
        >
          <ThemedText style={styles.buttonText}>
            {isProcessing ? "Processing..." : "Share PDF"}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 10, marginBottom: 5 },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
