import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, scale } from "../constants/theme";
import { Typography } from "./Typography";

interface ClientBannerProps {
  name?: string | null;
  mobile?: string | null;
  /** Trailing accent icon (e.g. calendar for scheduling). */
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

/** Compact client identity banner shown atop scheduling / inquiry forms. */
export const ClientBanner = ({
  name,
  mobile,
  icon = "person",
  style,
}: ClientBannerProps) => {
  const initial = (name || "U").trim()[0]?.toUpperCase() || "U";
  return (
    <View style={[styles.banner, style]}>
      <View style={styles.avatar}>
        <Typography variant="h3" color={COLORS.secondary} weight="bold">
          {initial}
        </Typography>
      </View>
      <View style={styles.info}>
        <Typography variant="h3" color={COLORS.white} numberOfLines={1}>
          {name || "Client"}
        </Typography>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={scale(13)} color="rgba(255,255,255,0.7)" />
          <Typography variant="caption" color="rgba(255,255,255,0.8)" style={styles.mobile}>
            {mobile || "No mobile"}
          </Typography>
        </View>
      </View>
      <Ionicons name={icon} size={scale(22)} color={COLORS.secondary} />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.medium,
    marginBottom: SPACING.large,
  },
  avatar: {
    width: scale(46),
    height: scale(46),
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(212,175,55,0.16)",
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
  },
  info: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  mobile: { marginLeft: 4 },
});
