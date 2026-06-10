import React from "react";
import {
  Text,
  TextStyle,
  StyleSheet,
  StyleProp,
  AccessibilityRole,
} from "react-native";
import { COLORS, FONT_SIZE } from "../constants/theme";

type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "caption"
  | "label"
  | "overline";

type Weight = "regular" | "medium" | "semibold" | "bold";

interface TypographyProps {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  numberOfLines?: number;
  weight?: Weight;
  /** Override the inferred accessibility role (headings default to "header"). */
  accessibilityRole?: AccessibilityRole;
  /** Hide from the screen reader (e.g. purely decorative glyphs). */
  accessibilityElementsHidden?: boolean;
}

const WEIGHTS: Record<Weight, TextStyle["fontWeight"]> = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

const HEADING_VARIANTS = new Set<Variant>(["display", "h1", "h2", "h3"]);

export const Typography = ({
  variant = "body",
  color = COLORS.text,
  style,
  children,
  align = "left",
  numberOfLines,
  weight,
  accessibilityRole,
  accessibilityElementsHidden,
}: TypographyProps) => {
  const role = accessibilityRole ?? (HEADING_VARIANTS.has(variant) ? "header" : undefined);
  return (
    <Text
      style={[
        styles[variant],
        { color, textAlign: align },
        weight ? { fontWeight: WEIGHTS[weight] } : null,
        style,
      ]}
      numberOfLines={numberOfLines}
      // Honor the user's OS text-size preference, but cap the growth so premium
      // layouts never break at the largest accessibility sizes.
      allowFontScaling
      maxFontSizeMultiplier={1.3}
      accessibilityRole={role}
      accessibilityElementsHidden={accessibilityElementsHidden}
      importantForAccessibility={accessibilityElementsHidden ? "no-hide-descendants" : undefined}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  display: {
    fontSize: FONT_SIZE.display,
    lineHeight: FONT_SIZE.display * 1.15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  h1: {
    fontSize: FONT_SIZE.h1,
    lineHeight: FONT_SIZE.h1 * 1.2,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  h2: {
    fontSize: FONT_SIZE.h2,
    lineHeight: FONT_SIZE.h2 * 1.22,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  h3: {
    fontSize: FONT_SIZE.h3,
    lineHeight: FONT_SIZE.h3 * 1.3,
    fontWeight: "600",
  },
  body: {
    fontSize: FONT_SIZE.body,
    lineHeight: FONT_SIZE.body * 1.5,
    fontWeight: "400",
  },
  caption: {
    fontSize: FONT_SIZE.caption,
    lineHeight: FONT_SIZE.caption * 1.4,
    fontWeight: "400",
    color: COLORS.textLight,
  },
  label: {
    fontSize: FONT_SIZE.bodySmall,
    lineHeight: FONT_SIZE.bodySmall * 1.4,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  overline: {
    fontSize: FONT_SIZE.overline,
    lineHeight: FONT_SIZE.overline * 1.4,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: COLORS.textLight,
  },
});
