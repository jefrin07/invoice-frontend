"use client";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/contexts/AuthProvider";
import { api } from "@/services/api";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Invoice = {
  _id: string;
  client: string;
  date: string;
  amount: number;
};

// 💫 Skeleton shimmer card (for loading state)
const SkeletonInvoiceCard = ({ colors }: { colors: any }) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.invoiceCard,
        { backgroundColor: colors.card, overflow: "hidden" },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.skeletonBar, { width: 120, height: 16 }]} />
        <View style={[styles.skeletonBar, { width: 60, height: 14 }]} />
      </View>
      <View style={styles.cardBody}>
        <View
          style={[
            styles.skeletonBar,
            { width: 80, height: 14, marginBottom: 6 },
          ]}
        />
        <View style={[styles.skeletonBar, { width: 60, height: 16 }]} />
      </View>
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "30%",
          backgroundColor: "rgba(255,255,255,0.2)",
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { token } = useAuth();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 15;

  const fetchInvoices = async (pageNumber = 1, refresh = false) => {
    try {
      if (!refresh) setLoading(true);

      const res = await api.get(
        `/api/invoices/all-invoice?page=${pageNumber}&limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;
      const mappedInvoices: Invoice[] = Array.isArray(data.invoices)
        ? data.invoices.map((inv: any) => ({
            _id: inv._id,
            client: inv.clientName || "Unknown Client",
            date: inv.createdAt
              ? new Date(inv.createdAt).toLocaleDateString()
              : "N/A",
            amount: inv.totalAmount || 0,
          }))
        : [];

      if (refresh) {
        setInvoices(mappedInvoices);
      } else {
        setInvoices((prev) => [...prev, ...mappedInvoices]);
      }

      setHasMore(data.invoices.length === pageSize);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error fetching invoices");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔁 Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setPage(1);
      fetchInvoices(1, true);
    }, [token])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchInvoices(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchInvoices(nextPage);
    }
  };

  // 🧭 Loading skeletons
  if (loading && invoices.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonInvoiceCard colors={colors} />}
            contentContainerStyle={styles.listContainer}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  // ⚠️ Error state
  if (error) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: colors.background }]}
      >
        <ThemedText style={{ color: "red" }}>{error}</ThemedText>
      </View>
    );
  }

  // ✅ Render invoice list
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <FlatList
          data={invoices}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && invoices.length > 0 ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                console.log("Navigating to:", `/invoicedetail/${item._id}`);
                router.push(`/invoicedetail/${item._id}`);
              }}
            >
              <View
                style={[styles.invoiceCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.cardHeader}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={[styles.clientName, { color: colors.text }]}
                  >
                    {item.client}
                  </ThemedText>
                  <ThemedText
                    style={[styles.invoiceId, { color: colors.border }]}
                  >
                    #{item._id.slice(-6).toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.cardBody}>
                  <ThemedText style={[styles.dateText, { color: colors.text }]}>
                    📅 {item.date}
                  </ThemedText>
                  <ThemedText style={[styles.amountText, { color: "#2563eb" }]}>
                    ₹{item.amount.toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  listContainer: { paddingBottom: 30 },
  invoiceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  clientName: { fontSize: 16, fontWeight: "600" },
  invoiceId: { fontSize: 12 },
  cardBody: { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8 },
  dateText: { fontSize: 13, marginBottom: 6 },
  amountText: { fontSize: 16, fontWeight: "700" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  skeletonBar: { borderRadius: 8, backgroundColor: "#e0e0e0" },
});
