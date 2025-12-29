import React from "react";
import { View, ViewStyle, StyleSheet } from "react-native";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card = ({ children, style }: CardProps) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
});
