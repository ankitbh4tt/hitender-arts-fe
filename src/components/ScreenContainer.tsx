import React from "react";
import {
  StatusBar,
  ViewStyle,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  StyleProp,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, SCREEN, IS_IOS } from "../constants/theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Set false to remove the default horizontal padding (e.g. full-bleed lists). */
  padded?: boolean;
}

export const ScreenContainer = ({
  children,
  style,
  padded = true,
}: ScreenContainerProps) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={IS_IOS ? "padding" : undefined}
        style={styles.flex}
      >
        {/* Centered, width-capped column keeps tablets readable. */}
        <View style={styles.centerer}>
          <View
            style={[
              styles.content,
              padded && styles.padded,
              { maxWidth: SCREEN.maxContentWidth },
              style,
            ]}
          >
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: { flex: 1 },
  centerer: {
    flex: 1,
    alignItems: "center",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  padded: {
    paddingHorizontal: SPACING.large,
  },
});
