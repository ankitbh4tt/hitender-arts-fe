import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import {
  FormScreen,
  Typography,
  Input,
  Button,
  DateTimePickerComponent,
  PressableScale,
  FadeInView,
} from "../components";
import { ClientsApi } from "../api/clients.api";
import { InquiriesApi } from "../api/inquiries.api";
import { AppointmentsApi } from "../api/appointments.api";

const DURATION_PRESETS = ["30", "60", "90", "120", "180"];

// One-shot appointment creation: resolves (or creates) the client by mobile,
// logs an inquiry, then schedules the appointment — reusing existing endpoints.
export const QuickAddAppointment = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [tattooDetail, setTattooDetail] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState("60");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!mobile || mobile.length < 10) {
      Toast.show({ type: "error", text1: "Enter a valid 10-digit mobile" });
      return;
    }

    const combined = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );
    if (combined.getTime() <= Date.now()) {
      Toast.show({ type: "error", text1: "Pick a future date & time" });
      return;
    }

    setLoading(true);
    try {
      // 1) Resolve or create the client.
      const { client } = await ClientsApi.resolveClientByMobile(mobile);

      // 2) Save the name if provided and not already set.
      if (name.trim() && !client.name) {
        await ClientsApi.updateClientInfo(client.id, { name: name.trim() });
      }

      // 3) Log an inquiry to carry the tattoo intent (appointments hang off one).
      const inquiry = await InquiriesApi.createInquiry({
        clientId: client.id,
        intent: tattooDetail.trim() || undefined,
      });

      // 4) Schedule the appointment.
      const parsedDuration = Number(duration);
      await AppointmentsApi.createAppointment({
        inquiryId: inquiry.id,
        appointmentAt: combined.toISOString(),
        tattooDetail: tattooDetail.trim() || undefined,
        durationMinutes:
          Number.isFinite(parsedDuration) && parsedDuration > 0
            ? parsedDuration
            : undefined,
        advanceAmount: advanceAmount ? Number(advanceAmount) : undefined,
        notes: notes.trim() || undefined,
      });

      Toast.show({ type: "success", text1: "Appointment scheduled" });
      navigation.goBack();
    } catch (e) {
      // Global interceptor shows the error toast.
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreen
      title="New Appointment"
      subtitle="Quick Add"
      onBack={() => navigation.goBack()}
    >
      <FadeInView>
        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
          Client
        </Typography>
        <Input
          label="Client Name"
          value={name}
          onChangeText={setName}
          placeholder="Full name (optional if known)"
          icon="person-outline"
        />
        <Input
          label="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          placeholder="10-digit mobile"
          keyboardType="phone-pad"
          maxLength={10}
          icon="call-outline"
        />
        <Input
          label="Tattoo Description"
          value={tattooDetail}
          onChangeText={setTattooDetail}
          placeholder="What's the tattoo / session?"
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />
      </FadeInView>

      <FadeInView index={1}>
        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
          Schedule
        </Typography>
        <DateTimePickerComponent label="Date" value={date} onChange={setDate} mode="date" />
        <DateTimePickerComponent label="Time" value={time} onChange={setTime} mode="time" />

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

      <FadeInView index={2}>
        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
          Payment & Notes
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
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything to remember"
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />

        <Button
          title="Schedule Appointment"
          onPress={handleCreate}
          variant="secondary"
          icon="calendar"
          loading={loading}
        />
        <View style={{ height: SPACING.medium }} />
      </FadeInView>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.small,
    marginTop: SPACING.small,
  },
  fieldLabel: { marginBottom: SPACING.small },
  multiline: { height: 80, textAlignVertical: "top" },
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
