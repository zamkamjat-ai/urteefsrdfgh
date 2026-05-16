import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsScreen() {
  const colors = useColors();
  const { themeMode, setThemeMode, isDarkMode } = useTheme();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.labelGroup}>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Dark mode</Text>
            <Text style={[styles.settingDescription, { color: colors.mutedForeground }]}>Toggle between light and dark themes.</Text>
          </View>
          <Switch
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor={isDarkMode ? colors.primaryForeground : colors.cardForeground}
            value={isDarkMode}
            onValueChange={(value) => setThemeMode(value ? "dark" : "light")}
          />
        </View>
      </View>

      <View style={[styles.infoBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
        <Feather name="info" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.foreground }]}>Your theme choice is saved for next time.</Text>
      </View>

      <Text style={[styles.note, { color: colors.mutedForeground }]}>If you want the app to follow the device appearance, switch back to light mode and update from your device controls.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelGroup: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  note: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginTop: 6,
  },
});
