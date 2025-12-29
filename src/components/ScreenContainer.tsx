import React from "react";
import {
  SafeAreaView,
  StatusBar,
  ViewStyle,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, SPACING } from "../constants/theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenContainer = ({ children, style }: ScreenContainerProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, style]}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.large,
  },
});
