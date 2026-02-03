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

  const handleConfirmAppointment = async () => {
    // Combine date and time into a single ISO datetime
    const combinedDateTime = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate(),
      appointmentTime.getHours(),
      appointmentTime.getMinutes()
    );

    const payload = {
      inquiryId,
      clientId: client.id,
      appointmentAt: combinedDateTime.toISOString(),
      tattooDetail: tattooDetail || undefined,
    };

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
    }
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
            label="Tattoo Execution Details"
            value={tattooDetail}
            onChangeText={setTattooDetail}
            placeholder="Final tattoo execution details (optional)"
            multiline
            numberOfLines={4}
            style={styles.detailsInput}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Confirm Appointment"
            onPress={handleConfirmAppointment}
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
    marginBottom: SPACING.large,
  },
});
