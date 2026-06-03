import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import Toast from "react-native-toast-message";
import { AppointmentsApi } from "../api/appointments.api";
import {
  ScreenContainer,
  Typography,
  Card,
  Input,
  Button,
  DateTimePickerComponent,
} from "../components";

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
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.clientCard}>
          <View style={styles.clientHeader}>
            <View style={styles.clientInfo}>
              <Typography variant="h3">{client?.name || "Client"}</Typography>
              <View style={styles.mobileRow}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={COLORS.textLight}
                />
                <Typography
                  variant="body"
                  color={COLORS.textLight}
                  style={styles.mobile}
                >
                  {client?.mobile}
                </Typography>
              </View>
            </View>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={COLORS.secondary}
            />
          </View>
        </Card>

        <View style={styles.formSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Appointment Details
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

          <Input
            label="Estimated Duration (minutes)"
            value={duration}
            onChangeText={setDuration}
            placeholder="60"
            keyboardType="numeric"
          />

          <Input
            label="Advance / Deposit (optional)"
            value={advanceAmount}
            onChangeText={setAdvanceAmount}
            placeholder="Advance amount collected"
            keyboardType="numeric"
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
        </View>

        <View style={styles.actions}>
          <Button
            title="Clear Form"
            onPress={handleClearForm}
            variant="outline"
            style={styles.clearButton}
          />
          <Button
            title="Confirm Appointment"
            onPress={handleConfirmAppointment}
            loading={loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: SPACING.medium,
  },
  clientCard: {
    marginBottom: SPACING.large,
  },
  clientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientInfo: {
    flex: 1,
  },
  mobileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.tiny,
  },
  mobile: {
    marginLeft: SPACING.tiny,
  },
  formSection: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    marginBottom: SPACING.medium,
  },
  detailsInput: {
    height: 100,
    textAlignVertical: "top",
  },
  actions: {
    gap: SPACING.medium,
    marginBottom: SPACING.large,
  },
  clearButton: {
    borderColor: COLORS.textLight,
  },
});
