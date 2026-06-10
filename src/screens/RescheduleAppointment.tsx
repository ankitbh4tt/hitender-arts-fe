import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { AppointmentsApi } from "../api/appointments.api";
import {
  FormScreen,
  Typography,
  Button,
  Input,
  DateTimePickerComponent,
  ClientBanner,
  PressableScale,
  FadeInView,
} from "../components";

import { Appointment } from "../api/types";

const DURATION_PRESETS = ["30", "60", "90", "120", "180"];

export const RescheduleAppointment = ({ route, navigation }: any) => {
  const { appointment }: { appointment: Appointment } = route.params || {};

  const currentDateTime = new Date(appointment.appointmentAt);
  const [newDate, setNewDate] = useState(currentDateTime);
  const [newTime, setNewTime] = useState(currentDateTime);
  const [duration, setDuration] = useState(String(appointment.durationMinutes || 60));
  const [loading, setLoading] = useState(false);

  const handleConfirmReschedule = async () => {
    setLoading(true);
    try {
      // Combine new date and time into a single ISO datetime
      const combinedDateTime = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        newTime.getHours(),
        newTime.getMinutes()
      );

      const parsedDuration = Number(duration);
      await AppointmentsApi.rescheduleAppointment(
        appointment.id,
        combinedDateTime,
        Number.isFinite(parsedDuration) && parsedDuration > 0
          ? parsedDuration
          : undefined
      );

      Alert.alert("Success", "Appointment rescheduled successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <FormScreen
      title="Reschedule"
      subtitle="Change Time"
      onBack={() => navigation.goBack()}
    >
      <FadeInView>
        <ClientBanner
          name={appointment.client?.name}
          mobile={appointment.client?.mobile}
          icon="calendar"
        />

        <View style={styles.currentCard}>
          <Ionicons name="time-outline" size={18} color={COLORS.textMuted} />
          <View style={{ marginLeft: SPACING.small, flex: 1 }}>
            <Typography variant="caption" color={COLORS.textLight}>
              Currently scheduled
            </Typography>
            <Typography variant="body" weight="semibold">
              {formatDateTime(appointment.appointmentAt)}
            </Typography>
          </View>
        </View>

        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
          New Time
        </Typography>
        <DateTimePickerComponent label="New Date" value={newDate} onChange={setNewDate} mode="date" />
        <DateTimePickerComponent label="New Time" value={newTime} onChange={setNewTime} mode="time" />

        <Typography variant="label" style={styles.fieldLabel}>
          Estimated Duration
        </Typography>
        <View style={styles.chipRow}>
          {DURATION_PRESETS.map((d) => {
            const active = duration === d;
            return (
              <PressableScale
                key={d}
                scaleTo={0.94}
                onPress={() => setDuration(d)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Typography
                  variant="label"
                  color={active ? COLORS.primary : COLORS.textMuted}
                  weight={active ? "bold" : "medium"}
                >
                  {d}m
                </Typography>
              </PressableScale>
            );
          })}
        </View>
        <Input
          value={duration}
          onChangeText={setDuration}
          placeholder="Custom minutes"
          keyboardType="numeric"
          icon="hourglass-outline"
        />

        <Button
          title="Confirm Reschedule"
          onPress={handleConfirmReschedule}
          variant="secondary"
          icon="swap-horizontal-outline"
          loading={loading}
          disabled={loading}
        />
        <View style={{ height: SPACING.medium }} />
      </FadeInView>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.small, marginTop: SPACING.small },
  fieldLabel: { marginBottom: SPACING.small },
  currentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.medium,
    marginBottom: SPACING.small,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  chip: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  chipActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryTint,
  },
});
