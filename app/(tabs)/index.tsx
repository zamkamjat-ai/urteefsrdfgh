import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useRoutes } from "@/contexts/RoutesContext";
import RouteCard from "@/components/RouteCard";
import AddRouteModal from "@/components/AddRouteModal";

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { routes } = useRoutes();
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayRoutes = routes.filter((r) => r.date === today);
  const pendingCount = todayRoutes.filter((r) => r.status === "pending").length;
  const inProgressCount = todayRoutes.filter((r) => r.status === "in-progress").length;
  const completedCount = todayRoutes.filter((r) => r.status === "completed").length;
  const totalStops = todayRoutes.reduce((acc, r) => acc + r.stops.length, 0);
  const visitedStops = todayRoutes.reduce(
    (acc, r) => acc + r.stops.filter((s) => s.status === "visited").length,
    0
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.navy, paddingTop: topPad + 16 },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.dateLabel}>{dateStr}</Text>
            <Text style={styles.headerTitle}>Today's Routes</Text>
          </View>
          <Pressable
            onPress={() => setShowAddRoute(true)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.statsRow, { backgroundColor: colors.navyMuted }]}>
          <StatCell label="Routes" value={todayRoutes.length} colors={colors} />
          <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
          <StatCell label="In Progress" value={inProgressCount} colors={colors} highlight />
          <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
          <StatCell label="Stops Done" value={`${visitedStops}/${totalStops}`} colors={colors} />
          <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
          <StatCell label="Complete" value={completedCount} colors={colors} />
        </View>
      </View>

      <FlatList
        data={todayRoutes}
        keyExtractor={(r) => r.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        scrollEnabled={!!todayRoutes.length}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="map" size={44} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No routes today
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap + to plan a new route for today
            </Text>
          </View>
        )}
        renderItem={({ item }) => <RouteCard route={item} />}
      />

      <AddRouteModal
        visible={showAddRoute}
        onClose={() => setShowAddRoute(false)}
      />
    </View>
  );
}

function StatCell({
  label,
  value,
  colors,
  highlight,
}: {
  label: string;
  value: string | number;
  colors: ReturnType<typeof useColors>;
  highlight?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text
        style={[
          styles.statValue,
          { color: highlight ? "#60a5fa" : "#ffffff" },
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 4,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
  },
  divider: { width: 1, marginVertical: 4 },
  list: { padding: 16, paddingTop: 20 },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
