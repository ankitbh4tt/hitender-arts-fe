import React from "react";
import { View, ViewStyle, StyleSheet, StyleProp } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { PressableScale } from "./PressableScale";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** When provided, the card becomes a springy press target. */
  onPress?: () => void;
  /** "elevated" (default) has a soft shadow; "flat" is border-only. */
  variant?: "elevated" | "flat";
  /** Screen-reader label for the pressable card (recommended when onPress is set). */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Card = ({
  children,
  style,
  onPress,
  variant = "elevated",
  accessibilityLabel,
  accessibilityHint,
}: CardProps) => {
  const cardStyle = [
    styles.card,
    variant === "elevated" ? SHADOWS.light : null,
    style,
  ];

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        scaleTo={0.985}
        style={cardStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {children}
      </PressableScale>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
