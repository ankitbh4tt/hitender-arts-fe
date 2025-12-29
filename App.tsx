import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { useConfigStore } from "./src/config/store";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "./src/constants/theme";

export default function App() {
  const { fetchConfig, isLoading } = useConfigStore();

  useEffect(() => {
    // PRE-FETCH CONFIG ON APP LAUNCH
    // The app does not fully "start" until it has checked in with backend.
    fetchConfig();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
