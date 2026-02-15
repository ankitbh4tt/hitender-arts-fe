import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { Typography } from "./Typography";
import { COLORS, SPACING } from "../constants/theme";

type Props = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

export const ErrorModal = ({ visible, message, onClose }: Props) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Typography variant="h3" style={styles.title}>
            Cannot Schedule
          </Typography>

          <Typography variant="body" style={styles.message}>
            {message}
          </Typography>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Typography color={COLORS.white}>OK</Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: SPACING.large,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SPACING.large,
  },
  title: {
    marginBottom: SPACING.small,
  },
  message: {
    marginBottom: SPACING.large,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
