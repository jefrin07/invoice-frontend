"use client";

import { useTheme } from "@react-navigation/native";
import React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthProvider";
import { api } from "@/services/api";

type InvoiceItem = {
  itemName: string;
  quantity: number;
  price: number;
};

type InvoiceForm = {
  clientName: string;
  items: InvoiceItem[];
};

export default function InvoicesScreen() {
  const { colors } = useTheme();
  const { token } = useAuth();

  const { control, handleSubmit, reset } = useForm<InvoiceForm>({
    defaultValues: {
      clientName: "",
      items: [{ itemName: "", quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: InvoiceForm) => {
    try {
      const response = await api.post("/api/invoices/create-invoice", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (![200, 201].includes(response.status)) {
        throw new Error(response.data?.message || "Failed to create invoice");
      }

      Toast.show({
        type: "success",
        text1: "Invoice saved successfully!",
        position: "top",
      });

      reset({
        clientName: "",
        items: [{ itemName: "", quantity: 1, price: 0 }],
      });
    } catch (error: any) {
      console.error("Invoice error:", error);
      Toast.show({
        type: "error",
        text1: error.message || "Error saving invoice",
        position: "top",
      });
    }
  };

  const FormLabel = ({ text }: { text: string }) => (
    <Text style={[styles.label, { color: colors.text }]}>{text}</Text>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.container}
          enableOnAndroid
          extraScrollHeight={20}
          keyboardOpeningTime={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <IconSymbol size={64} color={colors.primary} name="doc.text.fill" />
          </View>

          {/* Client Name */}
          <FormLabel text="Client Name" />
          <Controller
            control={control}
            name="clientName"
            rules={{ required: "Client name is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border || "#ccc",
                  },
                ]}
                placeholder="Enter client name"
                placeholderTextColor={colors.primary}
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {/* Items Section */}
          <ThemedText
            type="subtitle"
            style={{ marginTop: 20, marginBottom: 10, color: colors.text }}
          >
            Items
          </ThemedText>

          {fields.map((field, index) => (
            <View key={field.id} style={{ marginBottom: 16 }}>
              <View style={styles.itemRow}>
                <View style={{ flex: 2 }}>
                  <FormLabel text="Item Name" />
                  <Controller
                    control={control}
                    name={`items.${index}.itemName`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.card,
                            color: colors.text,
                            borderColor: colors.border || "#ccc",
                          },
                        ]}
                        placeholder="Item name"
                        placeholderTextColor={colors.primary}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 6 }}>
                  <FormLabel text="Qty" />
                  <Controller
                    control={control}
                    name={`items.${index}.quantity`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.card,
                            color: colors.text,
                            borderColor: colors.border || "#ccc",
                          },
                        ]}
                        placeholder="Qty"
                        keyboardType="numeric"
                        value={String(value)}
                        onChangeText={(text) => onChange(Number(text) || 0)}
                      />
                    )}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 6 }}>
                  <FormLabel text="Price" />
                  <Controller
                    control={control}
                    name={`items.${index}.price`}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.card,
                            color: colors.text,
                            borderColor: colors.border || "#ccc",
                          },
                        ]}
                        placeholder="Price"
                        keyboardType="numeric"
                        value={String(value)}
                        onChangeText={(text) => onChange(Number(text) || 0)}
                      />
                    )}
                  />
                </View>
              </View>

              {/* Remove Button */}
              {index > 0 && (
                <TouchableOpacity
                  onPress={() => remove(index)}
                  style={[styles.removeBtn, { alignSelf: "flex-end" }]}
                >
                  <Text style={{ color: "white" }}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Add Item Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => append({ itemName: "", quantity: 1, price: 0 })}
          >
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: "#34C759" }]}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.submitButtonText}>Save Invoice</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { alignItems: "center", marginBottom: 20 },
  label: { marginBottom: 5, fontFamily: Fonts.rounded, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontFamily: Fonts.rounded,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 10,
  },
  removeBtn: {
    backgroundColor: "#ff5c5c",
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  addButton: {
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  submitButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 25,
  },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
