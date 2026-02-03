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
import { Appointment } from "../api/types";

export const AppointmentsList = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Fetch upcoming appointments from API
      const data = await AppointmentsApi.getUpcomingAppointments();
      setAppointments(data);
    } catch (error) {
      console.log("Error fetching appointments:", error);
      Alert.alert("Error", "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchAppointments();
    });
    return unsubscribe;
  }, [navigation]);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Filter by selected date
    filtered = filtered.filter((apt) => {
      const aptDate = new Date(apt.appointmentAt);
      return (
        aptDate.getDate() === selectedDate.getDate() &&
        aptDate.getMonth() === selectedDate.getMonth() &&
        aptDate.getFullYear() === selectedDate.getFullYear()
      );
    });

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          (apt.client?.name || "").toLowerCase().includes(query) ||
          (apt.client?.mobile || "").includes(query)
      );
    }
    return filtered;
  }, [appointments, searchQuery, selectedDate]);

  const getAppointmentStatusColor = (status: string | undefined) => {
         // ... implementation same as before but safe access ...
         if(!status) return COLORS.textLight;
         switch (status) {
            case "SCHEDULED": return COLORS.secondary;
            case "COMPLETED": return COLORS.success;
            case "CANCELLED": return COLORS.error;
            default: return COLORS.textLight;
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
    console.log("Trace: handleCancel pressed", appointmentId);
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel", onPress: () => console.log("Cancel cancelled") },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
             console.log("Trace: Confirm cancel pressed");
            try {
              setProcessingId(appointmentId);
              await AppointmentsApi.cancelAppointment(appointmentId);
              console.log("Trace: Cancel success");
              Alert.alert("Success", "Appointment cancelled");
              fetchAppointments();
            } catch (error: any) {
              console.error("Trace: Cancel error", error);
              Alert.alert(
                "Error",
                error.message || "Failed to cancel appointment"
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleNoShow = async (appointmentId: number) => {
    console.log("Trace: handleNoShow pressed", appointmentId);
    Alert.alert("Mark No-Show", "Mark this appointment as No-Show?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: async () => {
          try {
            setProcessingId(appointmentId);
            await AppointmentsApi.markNoShow(appointmentId);
            Alert.alert("Success", "Marked as no-show");
            fetchAppointments();
          } catch (error: any) {
             Alert.alert("Error", error.message || "Failed to mark no-show");
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };


  const handleComplete = async (appointmentId: number) => {
    Alert.alert(
      "Complete Appointment",
      "Mark this appointment as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setProcessingId(appointmentId);
              await AppointmentsApi.completeAppointment(appointmentId);
              Alert.alert("Success", "Appointment marked as completed");
              fetchAppointments();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to complete appointment");
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const renderAppointmentCard = ({ item }: { item: Appointment }) => {
    const isPast = new Date(item.appointmentAt) < new Date();
    const status = item.appointmentStatus?.code || "UNKNOWN";
    const isScheduled = status === "SCHEDULED";
    // const isCompleted = status === "COMPLETED";
    // const isCancelled = status === "CANCELLED";

    return (
      <Card key={item.id} style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Typography variant="h3">{item.client?.name || "Unknown Client"}</Typography>
            <View style={styles.mobileRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color={COLORS.textLight}
              />
              <Typography variant="caption" style={styles.mobile}>
                {item.client?.mobile || "No Mobile"}
              </Typography>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getAppointmentStatusColor(status) },
            ]}
          >
            <Typography variant="caption" color={COLORS.white}>
              {item.appointmentStatus?.label || status}
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
              disabled={processingId !== null}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={processingId !== null ? COLORS.textLight : COLORS.primary}
              />
              <Typography variant="caption" color={processingId !== null ? COLORS.textLight : COLORS.primary}>
                Reschedule
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleComplete(item.id)}
              disabled={processingId === item.id}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={processingId === item.id ? COLORS.textLight : COLORS.success}
              />
              <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.success}>
                {processingId === item.id ? "..." : "Complete"}
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCancel(item.id)}
              disabled={processingId === item.id}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={processingId === item.id ? COLORS.textLight : COLORS.error}
              />
              <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.error}>
                {processingId === item.id ? "..." : "Cancel"}
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {isScheduled && isPast && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleComplete(item.id)}
              disabled={processingId === item.id}
            >
               <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={processingId === item.id ? COLORS.textLight : COLORS.success}
              />
               <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.success}>
                 {processingId === item.id ? "..." : "Complete"}
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNoShow(item.id)}
              disabled={processingId === item.id}
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={processingId === item.id ? COLORS.textLight : COLORS.error}
              />
              <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.error}>
                {processingId === item.id ? "..." : "Mark No-Show"}
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
