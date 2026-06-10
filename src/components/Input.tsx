import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  Animated,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT_SIZE, ANIM } from "../constants/theme";
import { Typography } from "./Typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Input = ({
  label,
  error,
  style,
  containerStyle,
  icon,
  multiline,
  onFocus,
  onBlur,
  accessibilityLabel,
  ...props
}: InputProps) => {
  const [focused, setFocused] = useState(false);
  const focus = useRef(new Animated.Value(0)).current;

  const animate = (to: number) =>
    Animated.timing(focus, {
      toValue: to,
      duration: ANIM.fast,
      useNativeDriver: false,
    }).start();

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (e) => {
    setFocused(true);
    animate(1);
    onFocus?.(e);
  };
  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (e) => {
    setFocused(false);
    animate(0);
    onBlur?.(e);
  };

  const borderColor = error
    ? COLORS.error
    : focus.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.border, COLORS.secondary],
      });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      )}
      <Animated.View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          { borderColor },
          focused && !error ? styles.fieldFocused : null,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={FONT_SIZE.body + 2}
            color={focused ? COLORS.secondaryDark : COLORS.textLight}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={COLORS.textLight}
          multiline={multiline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={accessibilityLabel ?? label}
          {...(error ? { accessibilityHint: error } : null)}
          {...props}
        />
      </Animated.View>
      {error && (
        <Typography variant="caption" color={COLORS.error} style={styles.errorText}>
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
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.medium,
  },
  fieldMultiline: {
    alignItems: "flex-start",
  },
  fieldFocused: {
    backgroundColor: COLORS.white,
  },
  icon: {
    marginRight: SPACING.small,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.medium,
    fontSize: FONT_SIZE.body,
    color: COLORS.text,
  },
  inputMultiline: {
    textAlignVertical: "top",
  },
  errorText: {
    marginTop: SPACING.tiny,
  },
});
