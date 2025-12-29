import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { AppointmentsApi } from "../api/appointments.api";
import { DataStore } from "../data/store";
import {
  ScreenContainer,
  Typography,
  Card,
  Input,
  Button,
  DateTimePickerComponent,
} from "../components";

interface Appointment {
  id: number;
  client: {
    id: number;
    name: string;
    mobile: string;
  };
  appointmentAt: string;
  appointmentStatus: string;
  tattooDetail?: string;
  inquiryId: number;
}

export const AppointmentsList = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = () => {
    setLoading(true);
    // Get all appointments instead of filtering by date
    setAppointments(DataStore.appointments);
    setLoading(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;

    const query = searchQuery.toLowerCase();
    return appointments.filter(
      (apt) =>
        apt.client.name.toLowerCase().includes(query) ||
        apt.client.mobile.includes(query)
    );
  }, [appointments, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return COLORS.secondary;
      case "COMPLETED":
        return COLORS.success;
      case "CANCELLED":
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleReschedule = (appointment: Appointment) => {
    navigation.navigate("RescheduleAppointment", { appointment });
  };

  const handleCancel = async (appointmentId: number) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await AppointmentsApi.cancelAppointment(appointmentId);
              Alert.alert("Success", "Appointment cancelled");
              fetchAppointments();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to cancel appointment"
              );
            }
          },
        },
      ]
    );
  };

  const handleNoShow = async (appointmentId: number) => {
    Alert.alert("Mark No-Show", "Mark this appointment as No-Show?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: async () => {
          try {
            await AppointmentsApi.markNoShow(appointmentId);
            Alert.alert("Success", "Marked as no-show");
            fetchAppointments();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to mark no-show");
          }
        },
      },
    ]);
  };

  const renderAppointmentCard = ({ item }: { item: Appointment }) => {
    const isPast = new Date(item.appointmentAt) < new Date();
    const isScheduled = item.appointmentStatus === "SCHEDULED";
    const isCompleted = item.appointmentStatus === "COMPLETED";
    const isCancelled = item.appointmentStatus === "CANCELLED";

    return (
      <Card style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Typography variant="h3">{item.client.name}</Typography>
            <View style={styles.mobileRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color={COLORS.textLight}
              />
              <Typography variant="caption" style={styles.mobile}>
                {item.client.mobile}
              </Typography>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.appointmentStatus) },
            ]}
          >
            <Typography variant="caption" color={COLORS.white}>
              {item.appointmentStatus}
            </Typography>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
            <Typography variant="body" style={styles.detailText}>
              {formatTime(item.appointmentAt)}
            </Typography>
          </View>
          {item.tattooDetail && (
            <View style={styles.detailRow}>
              <Ionicons
                name="brush-outline"
                size={16}
                color={COLORS.textLight}
              />
              <Typography variant="body" style={styles.detailText}>
                {item.tattooDetail}
              </Typography>
            </View>
          )}
        </View>

        {isScheduled && !isPast && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReschedule(item)}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={COLORS.primary}
              />
              <Typography variant="caption" color={COLORS.primary}>
                Reschedule
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCancel(item.id)}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={COLORS.error}
              />
              <Typography variant="caption" color={COLORS.error}>
                Cancel
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {isScheduled && isPast && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNoShow(item.id)}
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={COLORS.error}
              />
              <Typography variant="caption" color={COLORS.error}>
                Mark No-Show
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Typography variant="h2">Appointments</Typography>
        <Typography variant="caption" color={COLORS.textLight}>
          {selectedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </Typography>
      </View>

      <View style={styles.filters}>
        <DateTimePickerComponent
          value={selectedDate}
          onChange={setSelectedDate}
          mode="date"
        />
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or mobile"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointmentCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={80} color={COLORS.border} />
            <Typography variant="h3" style={styles.emptyTitle}>
              No Appointments
            </Typography>
            <Typography variant="body" color={COLORS.textLight}>
              {searchQuery
                ? "No appointments match your search"
                : "No appointments scheduled for this date"}
            </Typography>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.medium,
  },
  filters: {
    marginBottom: SPACING.medium,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    paddingBottom: SPACING.large,
  },
  appointmentCard: {
    marginBottom: SPACING.medium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.small,
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
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 4,
  },
  appointmentDetails: {
    marginBottom: SPACING.small,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.tiny,
  },
  detailText: {
    marginLeft: SPACING.small,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.medium,
    marginTop: SPACING.small,
    paddingTop: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.tiny,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxlarge,
  },
  emptyTitle: {
    marginTop: SPACING.medium,
    marginBottom: SPACING.small,
  },
});
