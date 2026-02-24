import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { Typography } from "./Typography";
import { COLORS } from "../constants/theme";

const styles = StyleSheet.create({
  container: {
    width: "92%",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  errorContainer: {
    backgroundColor: "#2B2B2B",
    borderLeftColor: COLORS.error,
  },
  successContainer: {
    backgroundColor: "#2B2B2B",
    borderLeftColor: COLORS.success,
  },
  title: {
    color: "white",
    marginBottom: 6,
  },
  message: {
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  dismissBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export const toastConfig = {
  error: (props: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => Toast.hide()}
      style={[styles.container, styles.errorContainer]}
    >
      <Typography variant="h3" style={styles.title}>
        {props.text1 || "Error"}
      </Typography>
      <Typography variant="body" style={styles.message}>
        {props.text2}
      </Typography>
      <TouchableOpacity style={styles.dismissBtn} onPress={() => Toast.hide()}>
        <Typography variant="caption" color="rgba(255,255,255,0.6)">
          Dismiss
        </Typography>
      </TouchableOpacity>
    </TouchableOpacity>
  ),

  success: (props: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => Toast.hide()}
      style={[styles.container, styles.successContainer]}
    >
      <Typography variant="h3" style={styles.title}>
        {props.text1 || "Success"}
      </Typography>
      <Typography variant="body" style={styles.message}>
        {props.text2}
      </Typography>
    </TouchableOpacity>
  ),
};

