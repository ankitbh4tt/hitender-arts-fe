import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT_SIZE } from "../constants/theme";
import { Typography } from "./Typography";

interface DateTimePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode: "date" | "time";
  error?: string;
}

export const DateTimePickerComponent = ({
  label,
  value,
  onChange,
  mode,
  error,
}: DateTimePickerProps) => {
  const [show, setShow] = useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDisplay = () => {
    if (mode === "date") {
      return value.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } else {
      return value.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      )}

      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={mode === "date" ? "calendar-outline" : "time-outline"}
          size={FONT_SIZE.body + 2}
          color={COLORS.secondaryDark}
          style={styles.leadIcon}
        />
        <Typography variant="body" style={styles.value}>
          {formatDisplay()}
        </Typography>
        <Ionicons name="chevron-down" size={18} color={COLORS.textLight} />
      </TouchableOpacity>

      {error && (
        <Typography
          variant="caption"
          color={COLORS.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={false}
          onChange={handleChange}
          display={Platform.OS === "ios" ? "spinner" : "default"}
        />
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
  trigger: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    flexDirection: "row",
    alignItems: "center",
  },
  leadIcon: { marginRight: SPACING.small },
  value: { flex: 1 },
  triggerError: {
    borderColor: COLORS.error,
  },
  errorText: {
    marginTop: SPACING.tiny,
  },
});
