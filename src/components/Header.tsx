import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT_SIZE, HIT_SLOP } from "../constants/theme";
import { Typography } from "./Typography";
import { PressableScale } from "./PressableScale";

interface HeaderProps {
  title: string;
  /** Small gold eyebrow above the title. */
  subtitle?: string;
  onBack?: () => void;
  /** Custom element rendered on the trailing side (e.g. a "Today" pill). */
  right?: React.ReactNode;
  /** "dark" = black premium surface (default); "light" = blends into the page. */
  variant?: "dark" | "light";
  style?: StyleProp<ViewStyle>;
}

export const Header = ({
  title,
  subtitle,
  onBack,
  right,
  variant = "dark",
  style,
}: HeaderProps) => {
  const dark = variant === "dark";
  const bg = dark ? COLORS.primary : COLORS.background;
  const titleColor = dark ? COLORS.white : COLORS.text;
  const iconColor = dark ? COLORS.white : COLORS.text;

  return (
    <View style={[{ backgroundColor: bg }, dark && styles.darkShadow]}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: bg }} />
      <View style={[styles.bar, style]}>
        {onBack ? (
          <PressableScale
            onPress={onBack}
            hitSlop={HIT_SLOP}
            style={[styles.backBtn, dark ? styles.backBtnDark : styles.backBtnLight]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={FONT_SIZE.h3 + 4} color={iconColor} />
          </PressableScale>
        ) : null}

        <View style={styles.titles}>
          {subtitle ? (
            <Typography variant="overline" color={COLORS.secondary}>
              {subtitle}
            </Typography>
          ) : null}
          <Typography variant="h2" color={titleColor} numberOfLines={1}>
            {title}
          </Typography>
        </View>

        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  darkShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.small,
    paddingBottom: SPACING.medium,
    gap: SPACING.small,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnDark: { backgroundColor: "rgba(255,255,255,0.10)" },
  backBtnLight: { backgroundColor: COLORS.backgroundAlt },
  titles: { flex: 1, justifyContent: "center" },
  right: { marginLeft: SPACING.small },
});
