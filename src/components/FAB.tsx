import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, StyleProp, ViewStyle, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS, scale, ANIM } from "../constants/theme";
import { PressableScale } from "./PressableScale";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  iconColor?: string;
  /** Screen-reader label — required since the FAB is icon-only. */
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** Override positioning / offsets. */
  style?: StyleProp<ViewStyle>;
}

const SIZE = scale(58);

/** Gold floating action button that pops in on mount. */
export const FAB = ({
  onPress,
  icon = "add",
  color = COLORS.secondary,
  iconColor = COLORS.primary,
  accessibilityLabel,
  accessibilityHint,
  style,
}: FABProps) => {
  const reduceMotion = useReducedMotion();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      enter.setValue(1);
      return;
    }
    const animation = Animated.timing(enter, {
      toValue: 1,
      duration: ANIM.slow,
      delay: 120,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        SHADOWS.strong,
        { opacity: enter, transform: [{ scale: enter }] },
        style,
      ]}
    >
      <PressableScale
        onPress={onPress}
        scaleTo={0.9}
        style={[styles.fab, { backgroundColor: color }]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        <Ionicons name={icon} size={scale(28)} color={iconColor} />
      </PressableScale>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: SPACING.large,
    bottom: SPACING.large,
  },
  fab: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
