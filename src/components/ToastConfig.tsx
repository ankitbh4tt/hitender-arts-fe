import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Typography } from "./Typography";
import { COLORS, SPACING, RADIUS, SHADOWS, scale } from "../constants/theme";

const Base = ({
  icon,
  accent,
  title,
  message,
  fallbackTitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  title?: string;
  message?: string;
  fallbackTitle: string;
}) => (
  <TouchableOpacity
    activeOpacity={0.92}
    onPress={() => Toast.hide()}
    style={[styles.container, { borderLeftColor: accent }]}
  >
    <View style={[styles.iconWrap, { backgroundColor: `${accent}26` }]}>
      <Ionicons name={icon} size={scale(20)} color={accent} />
    </View>
    <View style={styles.body}>
      <Typography variant="body" weight="semibold" color={COLORS.white} numberOfLines={1}>
        {title || fallbackTitle}
      </Typography>
      {message ? (
        <Typography variant="caption" color="rgba(255,255,255,0.82)" numberOfLines={3} style={styles.message}>
          {message}
        </Typography>
      ) : null}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "92%",
    padding: SPACING.medium,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    backgroundColor: COLORS.surfaceDark,
    ...SHADOWS.strong,
  },
  iconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: RADIUS.pill,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
  },
  body: { flex: 1 },
  message: { marginTop: 2 },
});

export const toastConfig = {
  error: (props: any) => (
    <Base
      icon="alert-circle"
      accent={COLORS.error}
      title={props.text1}
      message={props.text2}
      fallbackTitle="Error"
    />
  ),
  success: (props: any) => (
    <Base
      icon="checkmark-circle"
      accent={COLORS.success}
      title={props.text1}
      message={props.text2}
      fallbackTitle="Success"
    />
  ),
};
