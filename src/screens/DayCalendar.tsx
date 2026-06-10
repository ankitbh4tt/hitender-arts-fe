import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SCREEN, scale, statusVisual } from "../constants/theme";
import {
  Typography,
  Input,
  Button,
  Header,
  StatusBadge,
  EmptyState,
  FAB,
  PressableScale,
  FadeInView,
} from "../components";
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

  // Secondary actions tucked into a tidy sheet so the card stays uncluttered.
  const handleMore = (apt: Appointment) =>
    Alert.alert(apt.client?.name || "Appointment", "Choose an action", [
      { text: "Reschedule", onPress: () => handleReschedule(apt) },
      { text: "Mark No-Show", style: "destructive", onPress: () => handleNoShow(apt.id) },
      { text: "Cancel Appointment", style: "destructive", onPress: () => handleCancel(apt.id) },
      { text: "Close", style: "cancel" },
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
      Alert.alert("Completed", "Appointment completed. Healing follow-ups scheduled.");
      setCompleteFor(null);
      fetchForDate(selectedDate);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed");
    } finally {
      setCompleting(false);
    }
  };

  const scheduledCount = appointments.filter(
    (a) => a.appointmentStatus?.code === "SCHEDULED"
  ).length;

  return (
    <View style={styles.root}>
      <Header
        title="Today's Schedule"
        subtitle={studioName()}
        right={
          !isToday ? (
            <PressableScale
              scaleTo={0.92}
              onPress={() => goToDate(new Date())}
              style={styles.todayPill}
            >
              <Typography variant="overline" color={COLORS.primary}>
                Today
              </Typography>
            </PressableScale>
          ) : undefined
        }
      />

      {/* Date stepper */}
      <View style={styles.dateBar}>
        <PressableScale
          scaleTo={0.9}
          onPress={() => goToDate(addDays(selectedDate, -1))}
          style={styles.stepBtn}
        >
          <Ionicons name="chevron-back" size={scale(20)} color={COLORS.text} />
        </PressableScale>
        <View style={styles.dateLabelWrap}>
          <Typography variant="h3">{isToday ? "Today" : dateLabel}</Typography>
          <Typography variant="caption" color={COLORS.textLight}>
            {isToday
              ? dateLabel
              : selectedDate.getFullYear()}
            {scheduledCount > 0 ? ` · ${scheduledCount} upcoming` : ""}
          </Typography>
        </View>
        <PressableScale
          scaleTo={0.9}
          onPress={() => goToDate(addDays(selectedDate, 1))}
          style={styles.stepBtn}
        >
          <Ionicons name="chevron-forward" size={scale(20)} color={COLORS.text} />
        </PressableScale>
      </View>

      {/* Body */}
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.secondary}
              colors={[COLORS.secondary]}
            />
          }
        >
          {appointments.length === 0 ? (
            <EmptyState
              icon="calendar-clear-outline"
              title="No appointments"
              subtitle="Tap + to add one for this day"
            />
          ) : (
            appointments.map((apt, idx) => {
              const sc = apt.appointmentStatus?.code;
              const v = statusVisual(sc);
              const isProcessing = processingId === apt.id;
              return (
                <FadeInView key={apt.id} index={Math.min(idx, 8)}>
                  <View style={styles.row}>
                    {/* Time rail */}
                    <View style={styles.timeRail}>
                      <Typography variant="body" weight="bold">
                        {formatTime(apt.appointmentAt)}
                      </Typography>
                      <Typography variant="caption" color={COLORS.textLight}>
                        {apt.durationMinutes || 60} min
                      </Typography>
                    </View>

                    {/* Block */}
                    <View style={[styles.block, { borderLeftColor: v.color }]}>
                      <View style={styles.blockTop}>
                        <PressableScale
                          onPress={() => handleClientPress(apt)}
                          scaleTo={0.99}
                          style={{ flex: 1 }}
                        >
                          <Typography variant="body" weight="semibold" numberOfLines={1}>
                            {apt.client?.name || "Unknown client"}
                          </Typography>
                          <Typography variant="caption" color={COLORS.textLight}>
                            {apt.client?.mobile}
                          </Typography>
                        </PressableScale>
                        <StatusBadge code={sc} label={apt.appointmentStatus?.label} />
                      </View>

                      {apt.tattooDetail ? (
                        <Typography
                          variant="caption"
                          color={COLORS.textMuted}
                          numberOfLines={2}
                          style={{ marginTop: 4 }}
                        >
                          {apt.tattooDetail}
                        </Typography>
                      ) : null}

                      {sc === "COMPLETED" && apt.amount ? (
                        <View style={styles.paidRow}>
                          <Ionicons name="cash-outline" size={scale(14)} color={COLORS.success} />
                          <Typography variant="caption" color={COLORS.success} style={{ marginLeft: 4 }}>
                            {formatCurrency(apt.amount)} · {apt.paymentMethod}
                          </Typography>
                        </View>
                      ) : null}

                      {/* Actions */}
                      <View style={styles.actions}>
                        <PressableScale
                          style={styles.iconBtn}
                          scaleTo={0.9}
                          onPress={() => apt.client && openWhatsApp(apt.client.mobile, "")}
                        >
                          <Ionicons name="logo-whatsapp" size={scale(18)} color={COLORS.whatsapp} />
                        </PressableScale>

                        {sc === "SCHEDULED" && (
                          <>
                            <PressableScale
                              style={styles.completeBtn}
                              scaleTo={0.94}
                              disabled={isProcessing}
                              onPress={() => openComplete(apt.id)}
                            >
                              <Ionicons name="checkmark-circle" size={scale(16)} color={COLORS.primary} />
                              <Typography variant="label" color={COLORS.primary} style={{ marginLeft: 4 }}>
                                Complete
                              </Typography>
                            </PressableScale>
                            <View style={{ flex: 1 }} />
                            <PressableScale
                              style={styles.iconBtn}
                              scaleTo={0.9}
                              disabled={isProcessing}
                              onPress={() => handleMore(apt)}
                            >
                              <Ionicons name="ellipsis-horizontal" size={scale(20)} color={COLORS.textMuted} />
                            </PressableScale>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                </FadeInView>
              );
            })
          )}
          <View style={{ height: scale(96) }} />
        </ScrollView>
      )}

      {/* FAB */}
      <FAB onPress={() => navigation.navigate("QuickAddAppointment")} />

      {/* Complete modal */}
      <Modal
        visible={completeFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCompleteFor(null)}
      >
        <View style={styles.mOverlay}>
          <FadeInView offsetY={20} style={styles.mContent}>
            <View style={styles.mHandle} />
            <Typography variant="h3" style={{ marginBottom: SPACING.medium }}>
              Complete Appointment
            </Typography>
            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              icon="cash-outline"
            />
            <Typography variant="label" style={{ marginBottom: SPACING.small }}>
              Payment Method
            </Typography>
            <View style={styles.payGroup}>
              {(["CASH", "ONLINE", "CARD"] as const).map((m) => {
                const active = method === m;
                return (
                  <PressableScale
                    key={m}
                    scaleTo={0.94}
                    style={[styles.payBtn, active && styles.payBtnActive]}
                    onPress={() => setMethod(m)}
                  >
                    <Typography
                      variant="label"
                      color={active ? COLORS.primary : COLORS.textMuted}
                      weight={active ? "bold" : "medium"}
                    >
                      {m}
                    </Typography>
                  </PressableScale>
                );
              })}
            </View>
            <Input
              label="Completion Notes (optional)"
              value={completeNotes}
              onChangeText={setCompleteNotes}
              placeholder="Healing notes, touch-up needed, etc."
              multiline
              numberOfLines={3}
              style={{ height: scale(70), textAlignVertical: "top" }}
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
                variant="secondary"
                onPress={submitComplete}
                loading={completing}
                style={{ flex: 1 }}
              />
            </View>
          </FadeInView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  todayPill: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.tiny + 2,
    borderRadius: RADIUS.pill,
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
    width: "100%",
    maxWidth: SCREEN.maxContentWidth,
    alignSelf: "center",
  },
  stepBtn: {
    padding: SPACING.small,
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: RADIUS.md,
  },
  dateLabelWrap: { alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: {
    padding: SPACING.medium,
    width: "100%",
    maxWidth: SCREEN.maxContentWidth,
    alignSelf: "center",
  },
  row: { flexDirection: "row", marginBottom: SPACING.medium },
  timeRail: { width: scale(62), paddingTop: 2, alignItems: "flex-start" },
  block: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    padding: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  blockTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: SPACING.small },
  paidRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    marginTop: SPACING.medium,
  },
  iconBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondaryTint,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  // Complete modal
  mOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.large,
  },
  mContent: {
    backgroundColor: COLORS.card,
    padding: SPACING.large,
    borderRadius: RADIUS.xl,
    width: "100%",
    maxWidth: 460,
  },
  mHandle: {
    width: scale(40),
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: SPACING.medium,
  },
  payGroup: { flexDirection: "row", gap: SPACING.small, marginBottom: SPACING.medium },
  payBtn: {
    flex: 1,
    paddingVertical: SPACING.small + 2,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: "center",
    backgroundColor: COLORS.card,
  },
  payBtnActive: { borderColor: COLORS.secondary, backgroundColor: COLORS.secondaryTint },
  mActions: { flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.small },
});
