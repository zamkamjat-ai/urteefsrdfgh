import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Route } from "@/contexts/RoutesContext";
import StatusBadge from "./StatusBadge";

interface Props {
  route: Route;
}

export default function RouteCard({ route }: Props) {
  const colors = useColors();
  const visited = route.stops.filter((s) => s.status === "visited").length;
  const total = route.stops.length;
  const progress = total > 0 ? visited / total : 0;

  const dateLabel = (() => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    if (route.date === today) return "Today";
    if (route.date === tomorrow) return "Tomorrow";
    return route.date;
  })();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
      onPress={() => router.push(`/route/${route.id}`)}
    >
      <View style={styles.header}>
        <View style={styles.dateChip}>
          <Text style={[styles.dateText, { color: colors.primary }]}>{dateLabel}</Text>
        </View>
        <StatusBadge status={route.status} size="sm" />
      </View>

      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
        {route.name}
      </Text>

      <View style={styles.meta}>
        <Feather name="user" size={13} color={colors.mutedForeground} />
        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
          {route.driverName}
        </Text>
        <View style={styles.dot} />
        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
          {total} stops
        </Text>
      </View>

      <View style={styles.progressRow}>
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progress * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {visited}/{total}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    lineHeight: 22,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    backgroundColor: "#9ca3af",
    marginHorizontal: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  progressBg: {
    flex: 1,
    height: 5,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    minWidth: 30,
    textAlign: "right",
  },
});
