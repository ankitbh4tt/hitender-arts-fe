import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import Toast from "react-native-toast-message";
import { AppointmentsApi } from "../api/appointments.api";
import {
  FormScreen,
  Typography,
  Input,
  Button,
  DateTimePickerComponent,
  ClientBanner,
  PressableScale,
  FadeInView,
} from "../components";

const DURATION_PRESETS = ["30", "60", "90", "120", "180"];

export const ScheduleAppointment = ({ route, navigation }: any) => {
  const { inquiryId, client } = route.params || {};

  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [tattooDetail, setTattooDetail] = useState("");
  const [duration, setDuration] = useState("60");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const handleConfirmAppointment = async () => {
    // Combine date and time into a single ISO datetime
    const combinedDateTime = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate(),
      appointmentTime.getHours(),
      appointmentTime.getMinutes()
    );

    const parsedDuration = Number(duration);
    const payload = {
      inquiryId,
      appointmentAt: combinedDateTime.toISOString(),
      tattooDetail: tattooDetail || undefined,
      durationMinutes:
        Number.isFinite(parsedDuration) && parsedDuration > 0
          ? parsedDuration
          : undefined,
      advanceAmount: advanceAmount ? Number(advanceAmount) : undefined,
      notes: notes.trim() || undefined,
    };

    setLoading(true);
    try {
      await AppointmentsApi.createAppointment(payload);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Appointment scheduled successfully",
      });
      navigation.navigate("ClientsTab", {
        screen: "ClientDetail",
        params: { client },
      });
    } catch (error) {
      // Error handled globally
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setAppointmentDate(new Date());
    setAppointmentTime(new Date());
    setTattooDetail("");
    setDuration("60");
    setAdvanceAmount("");
    setNotes("");
  };

  return (
    <FormScreen
      title="Schedule Appointment"
      subtitle="New Booking"
      onBack={() => navigation.goBack()}
    >
      <FadeInView>
        <ClientBanner name={client?.name} mobile={client?.mobile} icon="calendar" />

        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
          Date & Time
        </Typography>
        <DateTimePickerComponent
          label="Appointment Date"
          value={appointmentDate}
          onChange={setAppointmentDate}
          mode="date"
        />
        <DateTimePickerComponent
          label="Appointment Time"
          value={appointmentTime}
          onChange={setAppointmentTime}
          mode="time"
        />

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
      </FadeInView>

      <FadeInView index={1}>
        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
          Details
        </Typography>
        <Input
          label="Advance / Deposit (optional)"
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
          placeholder="Advance amount collected"
          keyboardType="numeric"
          icon="cash-outline"
        />
        <Input
          label="Tattoo Execution Details"
          value={tattooDetail}
          onChangeText={setTattooDetail}
          placeholder="Final tattoo execution details (optional)"
          multiline
          numberOfLines={4}
          style={styles.detailsInput}
        />
        <Input
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything to remember for this session"
          multiline
          numberOfLines={3}
          style={styles.detailsInput}
        />

        <View style={styles.actions}>
          <Button
            title="Clear"
            onPress={handleClearForm}
            variant="outline"
            icon="refresh-outline"
          />
          <Button
            title="Confirm Appointment"
            onPress={handleConfirmAppointment}
            variant="secondary"
            icon="checkmark-circle-outline"
            loading={loading}
          />
        </View>
        <View style={{ height: SPACING.medium }} />
      </FadeInView>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.small, marginTop: SPACING.small },
  fieldLabel: { marginBottom: SPACING.small },
  detailsInput: { height: 100, textAlignVertical: "top" },
  actions: { gap: SPACING.medium, marginTop: SPACING.small },
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
