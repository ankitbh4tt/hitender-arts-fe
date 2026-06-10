import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  View,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS, moderateScale } from "../constants/theme";
import { Typography } from "./Typography";
import { PressableScale } from "./PressableScale";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

const HEIGHTS: Record<Size, number> = {
  sm: moderateScale(40),
  md: moderateScale(50),
  lg: moderateScale(56),
};

export const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  style,
  fullWidth = true,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const bg = () => {
    if (isDisabled) return COLORS.backgroundAlt;
    switch (variant) {
      case "primary":
        return COLORS.primary;
      case "secondary":
        return COLORS.secondary;
      case "danger":
        return COLORS.error;
      default:
        return COLORS.transparent;
    }
  };

  const fg = () => {
    if (isDisabled) return COLORS.textLight;
    switch (variant) {
      case "primary":
      case "danger":
        return COLORS.white;
      case "secondary":
        return COLORS.primary; // dark text on gold reads as premium
      case "outline":
        return COLORS.primary;
      case "ghost":
        return COLORS.secondaryDark;
      default:
        return COLORS.primary;
    }
  };

  const isOutline = variant === "outline";
  const elevated = !isDisabled && (variant === "primary" || variant === "danger");
  const golden = !isDisabled && variant === "secondary";

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={[
        styles.base,
        { height: HEIGHTS[size], backgroundColor: bg() },
        fullWidth && styles.fullWidth,
        isOutline && styles.outline,
        elevated && SHADOWS.light,
        golden && SHADOWS.gold,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg()} />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons
              name={icon}
              size={FONT_SIZE.body + 2}
              color={fg()}
              style={styles.icon}
            />
          ) : null}
          <Typography variant="body" weight="semibold" color={fg()}>
            {title}
          </Typography>
        </View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.large,
  },
  fullWidth: { width: "100%" },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  icon: { marginRight: SPACING.small },
});
