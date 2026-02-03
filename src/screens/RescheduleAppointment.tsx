import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { AppointmentsApi } from "../api/appointments.api";
import {
  ScreenContainer,
  Typography,
  Card,
  Button,
  DateTimePickerComponent,
} from "../components";

import { Appointment } from "../api/types";


export const RescheduleAppointment = ({ route, navigation }: any) => {
  const { appointment }: { appointment: Appointment } = route.params || {};

  const currentDateTime = new Date(appointment.appointmentAt);
  const [newDate, setNewDate] = useState(currentDateTime);
  const [newTime, setNewTime] = useState(currentDateTime);
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

      await AppointmentsApi.rescheduleAppointment(
        appointment.id,
        combinedDateTime
      );

      Alert.alert("Success", "Appointment rescheduled successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reschedule appointment");
    } finally {
        setLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    // ... same ...
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
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.clientCard}>
          <View style={styles.clientHeader}>
            <View style={styles.clientInfo}>
              <Typography variant="h3">{appointment.client?.name || "Unknown Client"}</Typography>
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
                  {appointment.client?.mobile || "No Mobile"}
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

        <View style={styles.currentSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Current Appointment
          </Typography>
          <Card style={styles.currentCard}>
            <View style={styles.detailRow}>
              <Ionicons
                name="time-outline"
                size={20}
                color={COLORS.textLight}
              />
              <Typography variant="body" style={styles.detailText}>
                {formatDateTime(appointment.appointmentAt)}
              </Typography>
            </View>
          </Card>
        </View>

        <View style={styles.formSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            New Appointment Time
          </Typography>

          <DateTimePickerComponent
            label="New Date"
            value={newDate}
            onChange={setNewDate}
            mode="date"
          />

          <DateTimePickerComponent
            label="New Time"
            value={newTime}
            onChange={setNewTime}
            mode="time"
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Confirm Reschedule"
            onPress={handleConfirmReschedule}
            loading={loading}
            disabled={loading}
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
  currentSection: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    marginBottom: SPACING.medium,
  },
  currentCard: {
    backgroundColor: COLORS.background,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: SPACING.small,
  },
  formSection: {
    marginBottom: SPACING.large,
  },
  actions: {
    marginBottom: SPACING.large,
  },
});
