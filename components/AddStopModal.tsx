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
import type { Route, Stop, StopType } from "@/contexts/RoutesContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  routeId: string;
  currentStopCount: number;
}

const genId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 6);

const TYPES: StopType[] = ["pickup", "delivery", "stop"];

export default function AddStopModal({ visible, onClose, routeId, currentStopCount }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateRoute, getRouteById } = useRoutes();

  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<StopType>("delivery");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!locationName.trim() || !address.trim() || !city.trim()) {
      Alert.alert("Missing fields", "Location name, address and city are required.");
      return;
    }
    const route = getRouteById(routeId);
    if (!route) return;

    const newStop: Stop = {
      id: genId(),
      order: currentStopCount + 1,
      locationName: locationName.trim(),
      address: address.trim(),
      city: city.trim(),
      type,
      contactName: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      status: "pending",
    };

    const updatedRoute: Route = { ...route, stops: [...route.stops, newStop] };
    updateRoute(updatedRoute);
    setLocationName("");
    setAddress("");
    setCity("");
    setType("delivery");
    setContactName("");
    setPhone("");
    setNotes("");
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
          <Text style={[styles.title, { color: colors.foreground }]}>Add Stop</Text>
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Add</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Location Name *</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="e.g. Central Warehouse"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Address *</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. 12 Industrial Ave"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>City *</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Springfield"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: type === t ? colors.primary : colors.card,
                    borderColor: type === t ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    { color: type === t ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Contact Name</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={contactName}
            onChangeText={setContactName}
            placeholder="Optional"
            placeholderTextColor={colors.mutedForeground}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Phone</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Optional"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textarea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional instructions..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
          />
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
  title: { fontSize: 17, fontFamily: "Inter_700Bold" },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 99 },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  form: { gap: 4, paddingBottom: 40 },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 14,
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
  textarea: { height: 80, textAlignVertical: "top" },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  typeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
