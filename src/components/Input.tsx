import React from "react";
import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../constants/theme";
import { Typography } from "./Typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      )}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
      {error && (
        <Typography
          variant="caption"
          color={COLORS.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.medium,
  },
  label: {
    marginBottom: SPACING.tiny,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    marginTop: SPACING.tiny,
  },
});
