import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

const THEME_MODE_KEY = "@driver-route-planner/themeMode";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    deviceScheme === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY).then((value) => {
      if (value === "dark" || value === "light") {
        setThemeMode(value);
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(THEME_MODE_KEY, themeMode).catch(() => undefined);
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      isDarkMode: themeMode === "dark",
    }),
    [themeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
