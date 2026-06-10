import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { RADIUS, SPACING, statusVisual } from "../constants/theme";
import { Typography } from "./Typography";

interface StatusBadgeProps {
  /** Appointment/follow-up status code (SCHEDULED, COMPLETED, …). */
  code?: string;
  /** Override the displayed label (falls back to the status' default label). */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/** A pill that colors itself from the unified status palette in theme.ts. */
export const StatusBadge = ({ code, label, style }: StatusBadgeProps) => {
  const v = statusVisual(code);
  return (
    <View style={[styles.badge, { backgroundColor: v.tint }, style]}>
      <View style={[styles.dot, { backgroundColor: v.color }]} />
      <Typography variant="overline" color={v.color}>
        {label || v.label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
});
