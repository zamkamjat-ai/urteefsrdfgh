import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useRoutes } from "@/contexts/RoutesContext";
import type { Stop, StopStatus } from "@/contexts/RoutesContext";
import StatusBadge from "@/components/StatusBadge";
import AddStopModal from "@/components/AddStopModal";

const TYPE_COLOR: Record<string, string> = {
  pickup: "#3b82f6",
  delivery: "#10b981",
  stop: "#f59e0b",
};

const TYPE_ICON: Record<string, string> = {
  pickup: "arrow-up-circle",
  delivery: "package",
  stop: "pause-circle",
};

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getRouteById, updateStopStatus, deleteRoute } = useRoutes();
  const [showAddStop, setShowAddStop] = useState(false);
  const [expandedStop, setExpandedStop] = useState<string | null>(null);

  const route = getRouteById(id ?? "");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!route) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.notFoundHeader, { paddingTop: topPad + 16, backgroundColor: colors.navy }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={40} color={colors.border} />
          <Text style={[styles.notFoundText, { color: colors.foreground }]}>Route not found</Text>
        </View>
      </View>
    );
  }

  const handleCycleStatus = (stop: Stop) => {
    const cycle: StopStatus[] = ["pending", "visited", "skipped"];
    const next = cycle[(cycle.indexOf(stop.status) + 1) % cycle.length];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateStopStatus(route.id, stop.id, next);
  };

  const handleDelete = () => {
    Alert.alert("Delete Route", `Delete "${route.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteRoute(route.id);
          router.back();
        },
      },
    ]);
  };

  const visited = route.stops.filter((s) => s.status === "visited").length;
  const total = route.stops.length;
  const progress = total > 0 ? visited / total : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navy, paddingTop: topPad + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.deleteBtn}>
            <Feather name="trash-2" size={18} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>

        <Text style={styles.routeName} numberOfLines={2}>{route.name}</Text>

        <View style={styles.metaRow}>
          <Feather name="user" size={13} color="rgba(255,255,255,0.6)" />
          <Text style={styles.metaText}>{route.driverName}</Text>
          <View style={styles.dot} />
          <Feather name="calendar" size={13} color="rgba(255,255,255,0.6)" />
          <Text style={styles.metaText}>{route.date}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <StatusBadge status={route.status} size="sm" />
            <Text style={styles.progressFraction}>{visited} / {total} stops</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.thText, { color: colors.mutedForeground, flex: 0.35 }]}>#</Text>
        <Text style={[styles.thText, { color: colors.mutedForeground, flex: 2 }]}>Location</Text>
        <Text style={[styles.thText, { color: colors.mutedForeground, flex: 1.2 }]}>Type</Text>
        <Text style={[styles.thText, { color: colors.mutedForeground, flex: 1.2, textAlign: "right" }]}>Status</Text>
      </View>

      <FlatList
        data={route.stops}
        keyExtractor={(s) => s.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        scrollEnabled={!!route.stops.length}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="map-pin" size={36} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No stops yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap + to add stops to this route
            </Text>
          </View>
        )}
        renderItem={({ item: stop }) => (
          <StopRow
            stop={stop}
            expanded={expandedStop === stop.id}
            onToggle={() =>
              setExpandedStop(expandedStop === stop.id ? null : stop.id)
            }
            onCycleStatus={() => handleCycleStatus(stop)}
            colors={colors}
          />
        )}
      />

      <View
        style={[
          styles.fab,
          { backgroundColor: colors.primary, bottom: insets.bottom + 20 },
        ]}
      >
        <Pressable
          style={styles.fabInner}
          onPress={() => setShowAddStop(true)}
        >
          <Feather name="plus" size={24} color="#fff" />
          <Text style={styles.fabText}>Add Stop</Text>
        </Pressable>
      </View>

      <AddStopModal
        visible={showAddStop}
        onClose={() => setShowAddStop(false)}
        routeId={route.id}
        currentStopCount={route.stops.length}
      />
    </View>
  );
}

function StopRow({
  stop,
  expanded,
  onToggle,
  onCycleStatus,
  colors,
}: {
  stop: Stop;
  expanded: boolean;
  onToggle: () => void;
  onCycleStatus: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const typeColor = TYPE_COLOR[stop.type] ?? "#6b7280";
  const typeIcon = TYPE_ICON[stop.type] ?? "circle";

  return (
    <View>
      <Pressable style={[styles.row, { backgroundColor: colors.card }]} onPress={onToggle}>
        <Text style={[styles.orderNum, { color: colors.mutedForeground, flex: 0.35 }]}>
          {stop.order}
        </Text>
        <View style={{ flex: 2 }}>
          <Text style={[styles.locationName, { color: colors.foreground }]} numberOfLines={1}>
            {stop.locationName}
          </Text>
          <Text style={[styles.cityText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {stop.address}, {stop.city}
          </Text>
        </View>
        <View style={[styles.typeTag, { backgroundColor: `${typeColor}18`, flex: 1.2 }]}>
          <Feather name={typeIcon as any} size={11} color={typeColor} />
          <Text style={[styles.typeText, { color: typeColor }]}>
            {stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onCycleStatus}
          style={{ flex: 1.2, alignItems: "flex-end" }}
        >
          <StatusBadge status={stop.status} size="sm" />
        </TouchableOpacity>
      </Pressable>

      {expanded && (
        <View style={[styles.expandedPanel, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {stop.contactName && (
            <DetailRow icon="user" label="Contact" value={stop.contactName} colors={colors} />
          )}
          {stop.phone && (
            <DetailRow icon="phone" label="Phone" value={stop.phone} colors={colors} />
          )}
          {stop.notes && (
            <DetailRow icon="file-text" label="Notes" value={stop.notes} colors={colors} />
          )}
          {!stop.contactName && !stop.phone && !stop.notes && (
            <Text style={[styles.noDetails, { color: colors.mutedForeground }]}>
              No additional details
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon as any} size={13} color={colors.mutedForeground} />
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}:</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  backBtn: { padding: 4 },
  deleteBtn: { padding: 8 },
  routeName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 2,
  },
  progressSection: { gap: 8, marginTop: 4 },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressFraction: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.6)",
  },
  progressBg: {
    height: 5,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#60a5fa",
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  thText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  list: {},
  separator: { height: 1, marginHorizontal: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  orderNum: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  locationName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 19,
  },
  cityText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  typeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  expandedPanel: {
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    minWidth: 52,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  noDetails: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  fabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  fabText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#ffffff",
  },
  notFoundHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
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
