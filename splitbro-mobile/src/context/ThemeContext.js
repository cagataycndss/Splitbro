import React, { createContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export const ThemeContext = createContext();

// Safe Storage Helper to handle Native module issues and Web localStorage fallback
const safeStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === "web") {
        return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.log("safeStorage.getItem error:", error.message || error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.log("safeStorage.setItem error:", error.message || error);
    }
  }
};


export const lightTheme = {
  mode: "light",
  background: "#f1f5f9", // Hafif gri arka plan, bembeyaz olmaması için
  card: "#ffffff", // Kartlar beyaz olacak ki ön plana çıksın
  text: "#0f172a",
  textMuted: "#64748b",
  primary: "#8b5cf6",
  primaryLight: "#ede9fe",
  border: "#e2e8f0",
  danger: "#ef4444",
  dangerBg: "#fee2e2",
  success: "#10b981",
  successBg: "#d1fae5",
  inputBg: "#f8fafc",
  tabBg: "#ffffff",
  tabIconActive: "#8b5cf6",
  tabIconInactive: "#94a3b8",
};

export const darkTheme = {
  mode: "dark",
  background: "#0f172a", // Koyu lacivert/siyah
  card: "#1e293b", // Kartlar biraz daha açık koyu renk
  text: "#f8fafc",
  textMuted: "#94a3b8",
  primary: "#a78bfa",
  primaryLight: "#2e1065",
  border: "#334155",
  danger: "#f87171",
  dangerBg: "#450a0a",
  success: "#34d399",
  successBg: "#064e3b",
  inputBg: "#0f172a",
  tabBg: "#1e293b",
  tabIconActive: "#a78bfa",
  tabIconInactive: "#475569",
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await safeStorage.getItem("theme");
      if (savedTheme === "dark") {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.log("Tema yüklenemedi", error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await safeStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (error) {
      console.log("Tema kaydedilemedi", error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
