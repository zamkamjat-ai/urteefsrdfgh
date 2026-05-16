import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useRoutes } from "@/contexts/RoutesContext";
import type { Route, Stop } from "@/contexts/RoutesContext";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const genId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 6);

export default function AddRouteModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addRoute } = useRoutes();

  const [name, setName] = useState("");
  const [driver, setDriver] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSave = () => {
    if (!name.trim() || !driver.trim()) {
      Alert.alert("Missing fields", "Please enter a route name and driver name.");
      return;
    }
    const newRoute: Route = {
      id: genId(),
      name: name.trim(),
      date,
      driverName: driver.trim(),
      status: "pending",
      stops: [],
    };
    addRoute(newRoute);
    setName("");
    setDriver("");
    setDate(new Date().toISOString().split("T")[0]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>New Route</Text>
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Save</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Route Name</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. North Zone Morning Run"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Driver Name</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={driver}
            onChangeText={setDriver}
            placeholder="e.g. Alex Johnson"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={date}
            onChangeText={setDate}
            placeholder="2025-05-13"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numbers-and-punctuation"
          />

          <View style={[styles.infoBox, { backgroundColor: colors.accent, borderColor: colors.border }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              You can add stops to this route after creating it.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 99 },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  form: { gap: 8, paddingBottom: 40 },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
  },
  infoText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
});
