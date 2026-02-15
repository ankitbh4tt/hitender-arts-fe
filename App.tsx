import React, { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { useConfigStore } from "./src/config/store";
import { COLORS } from "./src/constants/theme";
import { toastConfig } from "./src/components/ToastConfig"; // 👈 ADD THIS

export default function App() {
  const { fetchConfig, isLoading } = useConfigStore();

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <SafeAreaProvider>

      {/* ALWAYS mounted */}
      {isLoading ? (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          edges={["top", "bottom"]}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </SafeAreaView>
      ) : (
        <AppNavigator />
      )}

      {/* IMPORTANT: outside conditional */}
      <Toast config={toastConfig} position="top" />

    </SafeAreaProvider>
  );
}
