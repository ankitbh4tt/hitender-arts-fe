import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, scale } from "../constants/theme";
import { Typography } from "./Typography";
import { FadeInView } from "./FadeInView";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
}

/** Friendly placeholder for empty lists — gently animated in. */
export const EmptyState = ({
  icon = "sparkles-outline",
  title,
  subtitle,
  style,
}: EmptyStateProps) => {
  return (
    <FadeInView style={[styles.wrap, style]}>
      <View style={styles.iconRing}>
        <Ionicons name={icon} size={scale(34)} color={COLORS.secondaryDark} />
      </View>
      <Typography variant="h3" align="center" style={styles.title}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="body" color={COLORS.textLight} align="center">
          {subtitle}
        </Typography>
      ) : null}
    </FadeInView>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxlarge,
    paddingHorizontal: SPACING.large,
  },
  iconRing: {
    width: scale(76),
    height: scale(76),
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.secondaryTint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  title: { marginBottom: SPACING.tiny },
});
