import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../constants/theme";
import { Typography, Input, Button } from "../components";
import { AppointmentsApi } from "../api/appointments.api";
import { Appointment, PaymentMethod } from "../api/types";
import { useSettingsStore } from "../config/settingsStore";
import {
  addDays,
  formatCurrency,
  formatTime,
  isSameDay,
  openWhatsApp,
  toDateKey,
} from "../utils";

const statusColor = (code?: string) => {
  switch (code) {
    case "SCHEDULED":
      return "#1976D2";
    case "COMPLETED":
      return "#2E7D32";
    case "CANCELLED":
      return "#D32F2F";
    case "NO_SHOW":
      return "#F57C00";
    default:
      return COLORS.textLight;
  }
};

export const DayCalendar = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Complete modal
  const [completeFor, setCompleteFor] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState("");
  const [completeNotes, setCompleteNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  const studioName = useSettingsStore((s) => s.studioName);

  const fetchForDate = async (date: Date, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const data = await AppointmentsApi.getAppointmentsByDate(toDateKey(date));
      setAppointments(data);
    } catch (e) {
      // errors surfaced via global toast
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchForDate(selectedDate);
    }, [selectedDate])
  );

  const goToDate = (date: Date) => setSelectedDate(date);

  const onRefresh = () => {
    setRefreshing(true);
    fetchForDate(selectedDate, true);
  };

  const isToday = isSameDay(selectedDate, new Date());

  const dateLabel = selectedDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  // ── Actions ──
  const handleReschedule = (apt: Appointment) =>
    navigation.navigate("RescheduleAppointment", { appointment: apt });

  const handleClientPress = (apt: Appointment) => {
    if (apt.client) {
      navigation.navigate("ClientsTab", {
        screen: "ClientDetail",
        params: { client: apt.client },
      });
    }
  };

  const runAction = async (
    id: number,
    fn: () => Promise<unknown>,
    successMsg: string
  ) => {
    try {
      setProcessingId(id);
      await fn();
      Alert.alert("Success", successMsg);
      fetchForDate(selectedDate);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = (id: number) =>
    Alert.alert("Cancel Appointment", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () =>
          runAction(id, () => AppointmentsApi.cancelAppointment(id), "Cancelled"),
      },
    ]);

  const handleNoShow = (id: number) =>
    Alert.alert("Mark No-Show", "Mark this as no-show?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () =>
          runAction(id, () => AppointmentsApi.markNoShow(id), "Marked as no-show"),
      },
    ]);

  const openComplete = (id: number) => {
    setCompleteFor(id);
    setMethod("CASH");
    setAmount("");
    setCompleteNotes("");
  };

  const submitComplete = async () => {
    if (!completeFor) return;
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    try {
      setCompleting(true);
      await AppointmentsApi.completeAppointment(completeFor, {
        paymentMethod: method,
        amount: Number(amount),
        completionNotes: completeNotes.trim() || undefined,
      });
      Alert.alert(
        "Completed",
        "Appointment completed. Healing follow-ups scheduled."
      );
      setCompleteFor(null);
      fetchForDate(selectedDate);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: COLORS.primary }} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="caption" color={COLORS.secondary}>
            {studioName()}
          </Typography>
          <Typography variant="h2" color={COLORS.white}>
            Today's Schedule
          </Typography>
        </View>
        <TouchableOpacity
          style={styles.todayBtn}
          onPress={() => goToDate(new Date())}
        >
          <Typography variant="caption" color={COLORS.primary}>
            Today
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Date stepper */}
      <View style={styles.dateBar}>
        <TouchableOpacity
          onPress={() => goToDate(addDays(selectedDate, -1))}
          style={styles.stepBtn}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.dateLabelWrap}>
          <Typography variant="h3">{isToday ? "Today" : dateLabel}</Typography>
          {!isToday && (
            <Typography variant="caption" color={COLORS.textLight}>
              {selectedDate.getFullYear()}
            </Typography>
          )}
        </View>
        <TouchableOpacity
          onPress={() => goToDate(addDays(selectedDate, 1))}
          style={styles.stepBtn}
        >
          <Ionicons name="chevron-forward" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {appointments.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="calendar-clear-outline" size={64} color={COLORS.border} />
              <Typography variant="body" color={COLORS.textLight} style={{ marginTop: 12 }}>
                No appointments this day
              </Typography>
              <Typography variant="caption" color={COLORS.textLight} style={{ marginTop: 4 }}>
                Tap + to add one
              </Typography>
            </View>
          ) : (
            appointments.map((apt) => {
              const sc = apt.appointmentStatus?.code;
              const color = statusColor(sc);
              const isProcessing = processingId === apt.id;
              return (
                <View key={apt.id} style={styles.row}>
                  {/* Time rail */}
                  <View style={styles.timeRail}>
                    <Typography variant="body" style={{ fontWeight: "600" }}>
                      {formatTime(apt.appointmentAt)}
                    </Typography>
                    <Typography variant="caption" color={COLORS.textLight}>
                      {apt.durationMinutes || 60} min
                    </Typography>
                  </View>

                  {/* Block */}
                  <View style={[styles.block, { borderLeftColor: color }]}>
                    <View style={styles.blockTop}>
                      <TouchableOpacity
                        onPress={() => handleClientPress(apt)}
                        style={{ flex: 1 }}
                      >
                        <Typography variant="body" style={{ fontWeight: "600" }}>
                          {apt.client?.name || "Unknown client"}
                        </Typography>
                        <Typography variant="caption" color={COLORS.textLight}>
                          {apt.client?.mobile}
                        </Typography>
                      </TouchableOpacity>
                      <View style={[styles.badge, { backgroundColor: color + "20" }]}>
                        <Typography variant="caption" color={color}>
                          {apt.appointmentStatus?.label || "—"}
                        </Typography>
                      </View>
                    </View>

                    {apt.tattooDetail ? (
                      <Typography variant="caption" color={COLORS.text} numberOfLines={2} style={{ marginTop: 4 }}>
                        {apt.tattooDetail}
                      </Typography>
                    ) : null}

                    {sc === "COMPLETED" && apt.amount ? (
                      <Typography variant="caption" color="#2E7D32" style={{ marginTop: 4 }}>
                        {formatCurrency(apt.amount)} · {apt.paymentMethod}
                      </Typography>
                    ) : null}

                    {/* WhatsApp always available */}
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actBtn}
                        onPress={() => apt.client && openWhatsApp(apt.client.mobile, "")}
                      >
                        <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                      </TouchableOpacity>

                      {sc === "SCHEDULED" && (
                        <>
                          <TouchableOpacity
                            style={styles.actBtn}
                            disabled={isProcessing}
                            onPress={() => openComplete(apt.id)}
                          >
                            <Typography variant="caption" color="#2E7D32">Complete</Typography>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actBtn}
                            disabled={isProcessing}
                            onPress={() => handleReschedule(apt)}
                          >
                            <Typography variant="caption" color="#1565C0">Reschedule</Typography>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actBtn}
                            disabled={isProcessing}
                            onPress={() => handleNoShow(apt.id)}
                          >
                            <Typography variant="caption" color="#F57C00">No-Show</Typography>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actBtn}
                            disabled={isProcessing}
                            onPress={() => handleCancel(apt.id)}
                          >
                            <Typography variant="caption" color="#D32F2F">Cancel</Typography>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 90 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("QuickAddAppointment")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Complete modal */}
      <Modal
        visible={completeFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCompleteFor(null)}
      >
        <View style={styles.mOverlay}>
          <View style={styles.mContent}>
            <Typography variant="h3" style={{ marginBottom: SPACING.medium }}>
              Complete Appointment
            </Typography>
            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
            />
            <Typography variant="caption" color={COLORS.textLight} style={{ marginBottom: SPACING.small }}>
              Payment Method
            </Typography>
            <View style={styles.payGroup}>
              {(["CASH", "ONLINE", "CARD"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.payBtn, method === m && styles.payBtnActive]}
                  onPress={() => setMethod(m)}
                >
                  <Typography variant="caption" color={method === m ? COLORS.primary : COLORS.text}>
                    {m}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
            <Input
              label="Completion Notes (optional)"
              value={completeNotes}
              onChangeText={setCompleteNotes}
              placeholder="Healing notes, touch-up needed, etc."
              multiline
              numberOfLines={3}
              style={{ height: 70, textAlignVertical: "top" }}
            />
            <View style={styles.mActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setCompleteFor(null)}
                style={{ flex: 1, marginRight: SPACING.small }}
              />
              <Button
                title="Confirm"
                onPress={submitComplete}
                loading={completing}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.medium,
    paddingTop: SPACING.small,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.tiny,
    borderRadius: 16,
  },
  dateBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepBtn: { padding: SPACING.small },
  dateLabelWrap: { alignItems: "center" },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 64 },
  listContent: { padding: SPACING.medium },
  row: { flexDirection: "row", marginBottom: SPACING.medium },
  timeRail: { width: 64, paddingTop: 2, alignItems: "flex-start" },
  block: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: SPACING.medium,
    ...{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
  },
  blockTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  actions: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 14, marginTop: 10 },
  actBtn: { paddingVertical: 2 },
  fab: {
    position: "absolute",
    right: SPACING.large,
    bottom: SPACING.large,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  mOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.large,
  },
  mContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.large,
    borderRadius: SPACING.small,
    width: "100%",
  },
  payGroup: { flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.medium },
  payBtn: {
    flex: 1,
    paddingVertical: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.small,
    alignItems: "center",
    marginHorizontal: SPACING.tiny,
  },
  payBtnActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
  mActions: { flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.small },
});
