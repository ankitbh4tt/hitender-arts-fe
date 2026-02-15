import React from "react";
import { View, StyleSheet } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { Typography } from "./Typography";
import { COLORS } from "../constants/theme";
const styles = StyleSheet.create({
    container: {
      width: "92%",
      backgroundColor: "#2B2B2B",
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 5,
      borderLeftColor: COLORS.error,
      elevation: 6,
    },
    title: {
      color: "white",
      marginBottom: 6,
    },
    message: {
      color: "white",
      lineHeight: 20,
    },
  });
  
export const toastConfig = {
  error: (props: any) => (
    <View style={styles.container}>
      <Typography variant="h3" style={styles.title}>
        Error
      </Typography>

      {/* IMPORTANT: unlimited lines */}
      <Typography variant="body" style={styles.message}>
        {props.text2}
      </Typography>
    </View>
  ),
};
