import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { COLORS, SPACING } from "../constants/theme";
import { Typography } from "./Typography";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.border;
    if (variant === "primary") return COLORS.primary;
    if (variant === "secondary") return COLORS.secondary;
    return "transparent";
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textLight;
    if (variant === "primary" || variant === "secondary") return COLORS.white;
    if (variant === "outline") return COLORS.primary;
    return COLORS.primary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: variant === "outline" ? COLORS.primary : "transparent",
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Typography
          variant="label"
          style={{
            color: getTextColor(),
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.large,
    width: "100%",
  },
});
