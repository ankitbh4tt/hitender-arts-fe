import React from "react";
import { Text, TextStyle, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

interface TypographyProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "label";
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}

export const Typography = ({
  variant = "body",
  color = COLORS.text,
  style,
  children,
  align = "left",
}: TypographyProps) => {
  return (
    <Text style={[styles[variant], { color, textAlign: align }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textLight,
  },
});
