import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { RouteStatus, StopStatus } from "@/contexts/RoutesContext";

type Status = RouteStatus | StopStatus;

interface Props {
  status: Status;
  size?: "sm" | "md";
}

const LABEL: Record<Status, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  visited: "Visited",
  skipped: "Skipped",
};

export default function StatusBadge({ status, size = "md" }: Props) {
  const colors = useColors();

  const bg = {
    pending: colors.muted,
    "in-progress": colors.accent,
    completed: "#d1fae5",
    visited: "#d1fae5",
    skipped: "#fee2e2",
  }[status];

  const fg = {
    pending: colors.mutedForeground,
    "in-progress": colors.primary,
    completed: "#065f46",
    visited: "#065f46",
    skipped: "#991b1b",
  }[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, size === "sm" && styles.sm]}>
      <Text style={[styles.text, { color: fg }, size === "sm" && styles.smText]}>
        {LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  smText: {
    fontSize: 10,
  },
});
