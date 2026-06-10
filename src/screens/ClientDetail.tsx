import React, { useState, useCallback, useRef, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  COLORS,
  SPACING,
  RADIUS,
  scale,
  statusVisual,
  HIT_SLOP,
} from "../constants/theme";
import { Client, Inquiry, Appointment } from "../api/types";
import { InquiriesApi } from "../api/inquiries.api";
import { AppointmentsApi } from "../api/appointments.api";
import { ClientsApi } from "../api/clients.api";
import {
  Typography,
  Input,
  Button,
  StatusBadge,
  SegmentedControl,
  FAB,
  PressableScale,
  EmptyState,
} from "../components";
import { fillTemplate, formatCurrency, openWhatsApp } from "../utils";
import { useSettingsStore } from "../config/settingsStore";

const HEADER_MAX = scale(190);
const HEADER_MIN = scale(64);
const SCROLL_RANGE = HEADER_MAX - HEADER_MIN;

type TabKey = "activity" | "appointments" | "details";

const TABS = [
  { key: "activity", label: "Activity" },
  { key: "appointments", label: "Appointments" },
  { key: "details", label: "Details" },
];

interface TimelineItem {
  id: string;
  type: "inquiry" | "appointment";
  date: string;
  data: Inquiry | Appointment;
}

export const ClientDetail = ({ route, navigation }: any) => {
  const { client: initialClient }: { client: Client } = route.params;
  const [client, setClient] = useState<Client>(initialClient);
  const [activeTab, setActiveTab] = useState<TabKey>("activity");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Edit state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [clientName, setClientName] = useState(client.name || "");
  const [clientGender, setClientGender] = useState(client.gender || "");
  const [clientLocation, setClientLocation] = useState(client.location || "");
  const [savingClientInfo, setSavingClientInfo] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  // Completion modal state
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedAppointmentForComplete, setSelectedAppointmentForComplete] = useState<number | null>(null);
  const [completeMethod, setCompleteMethod] = useState<"CASH" | "ONLINE" | "CARD">("CASH");
  const [completeAmount, setCompleteAmount] = useState("");
  const [completeNotes, setCompleteNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  const aftercareTemplate = useSettingsStore((s) => s.aftercareTemplate);
  const studioName = useSettingsStore((s) => s.studioName);

  const genderOptions = ["Male", "Female", "Other"];

  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [HEADER_MAX, HEADER_MIN],
    extrapolate: "clamp",
  });
  const avatarScale = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const expandedOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE * 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // ── Data fetching ──
  useFocusEffect(
    useCallback(() => {
      if (route.params?.client) {
        const c = route.params.client;
        setClient(c);
        setClientName(c.name || "");
        setClientGender(c.gender || "");
        setClientLocation(c.location || "");
      }
      fetchClientData();
    }, [route.params?.client])
  );

  const fetchClientData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [inqData, aptData] = await Promise.all([
        InquiriesApi.getInquiriesByClient(client.id),
        AppointmentsApi.getAppointmentsByClient(client.id),
      ]);
      setInquiries(inqData);
      setAppointments(aptData);
    } catch (e) {
      console.error("Failed to fetch client data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClientData();
  };

  // ── Action handlers (all preserved) ──
  const handleCall = () => {
    const url = Platform.OS === "android" ? `tel:${client.mobile}` : `telprompt:${client.mobile}`;
    Linking.openURL(url);
  };

  const handleWhatsApp = () => {
    openWhatsApp(client.mobile, "");
  };

  const handleReschedule = (apt: Appointment) => {
    navigation.navigate("RescheduleAppointment", { appointment: apt });
  };

  const handleCancel = (id: number) => {
    Alert.alert("Cancel Appointment", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            setProcessingId(id);
            await AppointmentsApi.cancelAppointment(id);
            Alert.alert("Success", "Appointment cancelled");
            fetchClientData();
          } catch (e: any) {
            Alert.alert("Error", e.message || "Failed");
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const handleNoShow = (id: number) => {
    Alert.alert("Mark No-Show", "Mark this appointment as No-Show?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: async () => {
          try {
            setProcessingId(id);
            await AppointmentsApi.markNoShow(id);
            Alert.alert("Success", "Marked as no-show");
            fetchClientData();
          } catch (e: any) {
            Alert.alert("Error", e.message || "Failed");
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const handleCompletePress = (id: number) => {
    setSelectedAppointmentForComplete(id);
    setCompleteMethod("CASH");
    setCompleteAmount("");
    setCompleteNotes("");
    setCompleteModalVisible(true);
  };

  const submitCompleteAppointment = async () => {
    if (!selectedAppointmentForComplete) return;
    if (!completeAmount || isNaN(Number(completeAmount))) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      setCompleting(true);
      await AppointmentsApi.completeAppointment(selectedAppointmentForComplete, {
        paymentMethod: completeMethod,
        amount: Number(completeAmount),
        completionNotes: completeNotes.trim() || undefined,
      });
      Alert.alert(
        "Completed",
        "Appointment marked complete. Healing follow-ups have been scheduled."
      );
      setCompleteModalVisible(false);
      fetchClientData();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed");
    } finally {
      setCompleting(false);
      setSelectedAppointmentForComplete(null);
    }
  };

  const handleSaveClientInfo = async () => {
    try {
      setSavingClientInfo(true);
      const d: { name?: string; gender?: string; location?: string } = {};
      if (clientName.trim() !== (client.name || "")) d.name = clientName.trim() || undefined;
      if (clientGender !== (client.gender || "")) d.gender = clientGender.trim() || undefined;
      if (clientLocation.trim() !== (client.location || "")) d.location = clientLocation.trim() || undefined;
      if (Object.keys(d).length === 0) { setEditModalVisible(false); return; }
      const updated = await ClientsApi.updateClientInfo(client.id, d);
      setClient(updated);
      setClientName(updated.name || "");
      setClientGender(updated.gender || "");
      setClientLocation(updated.location || "");
      setEditModalVisible(false);
      Alert.alert("Success", "Client updated");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update");
    } finally {
      setSavingClientInfo(false);
    }
  };

  const handleGenderSelect = (g: string) => {
    setClientGender(g);
    setGenderModalVisible(false);
  };

  const sendAftercare = () => {
    const message = fillTemplate(aftercareTemplate(), {
      clientName: client.name || "there",
      studioName: studioName(),
    });
    openWhatsApp(client.mobile, message);
  };

  // ── Helper data ──
  const timelineData = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = [];
    inquiries.forEach((i) => items.push({ id: `inq-${i.id}`, type: "inquiry", date: i.createdAt, data: i }));
    appointments.forEach((a) => items.push({ id: `apt-${a.id}`, type: "appointment", date: a.appointmentAt, data: a }));
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items;
  }, [inquiries, appointments]);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const fmtTime = (s: string) => new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const navToSchedule = () => {
    const latest = inquiries.length > 0 ? inquiries[0] : undefined;
    navigation.navigate("ScheduleAppointment", { inquiryId: latest?.id, client });
  };

  const navToInquiry = () => {
    const latest = inquiries.length > 0 ? inquiries[0] : undefined;
    navigation.navigate("Inquiry", { client, latestInquiry: latest });
  };

  // ── RENDER ──
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={{ backgroundColor: COLORS.primary }} edges={["top"]} />

      {/* Collapsible Header */}
      <Animated.View style={[s.header, { height: headerHeight }]}>
        <View style={s.headerTop}>
          <PressableScale onPress={() => navigation.goBack()} style={s.hBtn} hitSlop={HIT_SLOP}>
            <Ionicons name="arrow-back" size={scale(22)} color={COLORS.white} />
          </PressableScale>
          <PressableScale
            onPress={() => {
              setClientName(client.name || "");
              setClientGender(client.gender || "");
              setClientLocation(client.location || "");
              setEditModalVisible(true);
            }}
            style={s.hBtn}
            hitSlop={HIT_SLOP}
          >
            <Ionicons name="pencil" size={scale(18)} color={COLORS.white} />
          </PressableScale>
        </View>
        <Animated.View style={[s.avatarWrap, { transform: [{ scale: avatarScale }], opacity: expandedOpacity }]}>
          <View style={s.avatar}>
            <Typography variant="h2" color={COLORS.secondary} weight="bold">{(client.name || "U")[0].toUpperCase()}</Typography>
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: expandedOpacity, alignItems: "center" }}>
          <Typography variant="h3" color={COLORS.white} align="center" weight="semibold">{client.name || "Unknown"}</Typography>
          <View style={s.metaRow}>
            {client.gender ? <View style={s.metaItem}><Ionicons name="person-outline" size={scale(13)} color={COLORS.secondaryLight} /><Typography variant="caption" color="rgba(255,255,255,0.85)" style={{ marginLeft: 3 }}>{client.gender}</Typography></View> : null}
            {client.location ? <View style={s.metaItem}><Ionicons name="location-outline" size={scale(13)} color={COLORS.secondaryLight} /><Typography variant="caption" color="rgba(255,255,255,0.85)" style={{ marginLeft: 3 }}>{client.location}</Typography></View> : null}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Sticky Quick Actions */}
      <View style={s.qBar}>
        <QuickAction icon="call" tint={COLORS.successTint} color={COLORS.success} label="Call" onPress={handleCall} />
        <QuickAction icon="logo-whatsapp" tint="rgba(37,211,102,0.12)" color={COLORS.whatsapp} label="WhatsApp" onPress={handleWhatsApp} />
        <QuickAction icon="calendar" tint={COLORS.infoTint} color={COLORS.info} label="Schedule" onPress={navToSchedule} />
        <QuickAction icon="document-text" tint={COLORS.secondaryTint} color={COLORS.secondaryDark} label="Inquiry" onPress={navToInquiry} />
      </View>

      {/* Tabs */}
      <View style={s.tabWrap}>
        <SegmentedControl
          segments={TABS}
          value={activeTab}
          onChange={(k) => setActiveTab(k as TabKey)}
        />
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={s.scroll}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} colors={[COLORS.secondary]} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <View style={s.center}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
        ) : (
          <>
            {/* Activity Tab */}
            {activeTab === "activity" && (
              timelineData.length === 0 ? (
                <EmptyState icon="time-outline" title="No activity yet" subtitle="Inquiries and appointments show up here" />
              ) : (
                <View style={s.tlWrap}>
                  {timelineData.map((item, idx) => {
                    const isLast = idx === timelineData.length - 1;
                    if (item.type === "inquiry") {
                      const inq = item.data as Inquiry;
                      return (
                        <View key={item.id} style={s.tlItem}>
                          <View style={s.tlGutter}>
                            <View style={[s.tlDot, { backgroundColor: COLORS.secondary }]}><Ionicons name="chatbubble-ellipses" size={scale(11)} color={COLORS.primary} /></View>
                            {!isLast && <View style={s.tlLine} />}
                          </View>
                          <View style={s.tlContent}>
                            <Typography variant="caption" color={COLORS.textLight}>{fmtDate(inq.createdAt)}</Typography>
                            {inq.intent ? <Typography variant="body" weight="medium" numberOfLines={2} style={{ marginTop: 2 }}>{inq.intent}</Typography> : null}
                            {inq.remark ? <Typography variant="caption" color={COLORS.textLight} numberOfLines={2} style={{ marginTop: 2 }}>{inq.remark}</Typography> : null}
                            <View style={s.chipRow}>
                              {inq.referenceType ? <View style={s.chip}><Typography variant="overline" color={COLORS.secondaryDark}>{inq.referenceType.name}</Typography></View> : null}
                              {inq.tattooSize ? <View style={s.chip}><Typography variant="overline" color={COLORS.secondaryDark}>{inq.tattooSize.label}</Typography></View> : null}
                            </View>
                            <PressableScale style={s.tlAction} scaleTo={0.96} onPress={() => navigation.navigate("ScheduleAppointment", { inquiryId: inq.id, client })}>
                              <Ionicons name="calendar-outline" size={scale(14)} color={COLORS.info} />
                              <Typography variant="label" color={COLORS.info} style={{ marginLeft: 4 }}>Schedule</Typography>
                            </PressableScale>
                          </View>
                        </View>
                      );
                    } else {
                      const apt = item.data as Appointment;
                      return (
                        <View key={item.id} style={s.tlItem}>
                          <View style={s.tlGutter}>
                            <View style={[s.tlDot, { backgroundColor: COLORS.info }]}><Ionicons name="calendar" size={scale(11)} color={COLORS.white} /></View>
                            {!isLast && <View style={s.tlLine} />}
                          </View>
                          <View style={s.tlContent}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                              <Typography variant="caption" color={COLORS.textLight}>{fmtDate(apt.appointmentAt)} {fmtTime(apt.appointmentAt)}</Typography>
                              <StatusBadge code={apt.appointmentStatus?.code} label={apt.appointmentStatus?.label} />
                            </View>
                            {apt.tattooDetail ? <Typography variant="body" weight="medium" numberOfLines={1} style={{ marginTop: 2 }}>{apt.tattooDetail}</Typography> : null}
                            {apt.appointmentStatus?.code === "COMPLETED" && apt.paymentMethod && apt.amount && (
                              <View style={s.chipRow}>
                                <View style={s.chip}><Typography variant="overline" color={COLORS.secondaryDark}>{formatCurrency(apt.amount)}</Typography></View>
                                <View style={s.chip}><Typography variant="overline" color={COLORS.secondaryDark}>{apt.paymentMethod}</Typography></View>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    }
                  })}
                </View>
              )
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              appointments.length === 0 ? (
                <EmptyState icon="calendar-outline" title="No appointments" subtitle="Schedule one from the actions above" />
              ) : (
                <View style={s.agWrap}>
                  {appointments.map((apt) => {
                    const d = new Date(apt.appointmentAt);
                    const sc = apt.appointmentStatus?.code;
                    return (
                      <View key={apt.id} style={s.agCard}>
                        <View style={s.agDate}>
                          <Typography variant="h3" align="center" color={COLORS.secondaryDark}>{d.getDate()}</Typography>
                          <Typography variant="overline" color={COLORS.textLight} align="center">{d.toLocaleDateString("en-IN", { month: "short" })}</Typography>
                        </View>
                        <View style={s.agInfo}>
                          <Typography variant="body" weight="semibold">{fmtTime(apt.appointmentAt)} · {apt.durationMinutes || 60} min</Typography>
                          {apt.tattooDetail ? <Typography variant="caption" color={COLORS.textLight} numberOfLines={1}>{apt.tattooDetail}</Typography> : null}
                          {sc === "COMPLETED" && apt.completionNotes ? <Typography variant="caption" color={COLORS.textLight} numberOfLines={2}>📝 {apt.completionNotes}</Typography> : null}
                          {sc === "COMPLETED" && apt.paymentMethod && apt.amount && (
                            <View style={[s.chipRow, { marginTop: 4 }]}>
                              <View style={s.chip}><Typography variant="overline" color={COLORS.secondaryDark}>{formatCurrency(apt.amount)}</Typography></View>
                              <View style={s.chip}><Typography variant="overline" color={COLORS.secondaryDark}>{apt.paymentMethod}</Typography></View>
                            </View>
                          )}
                          {sc === "SCHEDULED" && (
                            <View style={s.agActions}>
                              <PressableScale onPress={() => handleCompletePress(apt.id)} disabled={processingId === apt.id} style={[s.agBtn, s.agBtnPrimary]} scaleTo={0.95}><Typography variant="label" color={COLORS.primary}>Complete</Typography></PressableScale>
                              <PressableScale onPress={() => handleReschedule(apt)} disabled={processingId !== null} style={s.agBtn} scaleTo={0.95}><Typography variant="label" color={COLORS.info}>Reschedule</Typography></PressableScale>
                              <PressableScale onPress={() => handleNoShow(apt.id)} disabled={processingId === apt.id} style={s.agBtn} scaleTo={0.95}><Typography variant="label" color={COLORS.warning}>No Show</Typography></PressableScale>
                              <PressableScale onPress={() => handleCancel(apt.id)} disabled={processingId === apt.id} style={s.agBtn} scaleTo={0.95}><Typography variant="label" color={COLORS.error}>Cancel</Typography></PressableScale>
                            </View>
                          )}
                        </View>
                        <View style={s.agBadge}>
                          <StatusBadge code={sc} label={apt.appointmentStatus?.label} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <View style={s.detList}>
                <DetailRow icon="call-outline" label="Phone" value={client.mobile} onPress={handleCall} />
                <DetailRow icon="person-outline" label="Gender" value={client.gender || "Not set"} />
                <DetailRow icon="location-outline" label="City" value={client.location || "Not set"} />
              </View>
            )}
          </>
        )}
        <View style={{ height: scale(96) }} />
      </Animated.ScrollView>

      {/* FAB */}
      <FAB icon="add" onPress={() => setQuickAddVisible(true)} />

      {/* Edit Client Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={s.mOverlay}>
          <View style={s.mSheet}>
            <View style={s.mHandle} />
            <View style={s.mHeader}><Typography variant="h3">Edit Client</Typography><TouchableOpacity onPress={() => setEditModalVisible(false)} hitSlop={HIT_SLOP}><Ionicons name="close" size={scale(24)} color={COLORS.text} /></TouchableOpacity></View>
            <Input label="Name" value={clientName} onChangeText={setClientName} placeholder="Client Name" icon="person-outline" />
            <Typography variant="label" style={{ marginBottom: SPACING.tiny }}>Gender</Typography>
            <PressableScale style={s.gPicker} scaleTo={0.99} onPress={() => setGenderModalVisible(true)}>
              <Typography variant="body" color={clientGender ? COLORS.text : COLORS.textLight}>{clientGender || "Select"}</Typography>
              <Ionicons name="chevron-down" size={scale(20)} color={COLORS.textLight} />
            </PressableScale>
            <Input label="Location" value={clientLocation} onChangeText={setClientLocation} placeholder="City" icon="location-outline" />
            <View style={s.mActions}>
              <Button title="Cancel" variant="outline" onPress={() => setEditModalVisible(false)} disabled={savingClientInfo} style={{ flex: 1, marginRight: SPACING.small }} />
              <Button title="Save" variant="secondary" onPress={handleSaveClientInfo} loading={savingClientInfo} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
        <Modal visible={genderModalVisible} transparent animationType="slide" onRequestClose={() => setGenderModalVisible(false)}>
          <View style={s.mOverlay}>
            <View style={s.mSheet}>
              <View style={s.mHandle} />
              <View style={s.mHeader}><Typography variant="h3">Select Gender</Typography><TouchableOpacity onPress={() => setGenderModalVisible(false)} hitSlop={HIT_SLOP}><Ionicons name="close" size={scale(24)} color={COLORS.text} /></TouchableOpacity></View>
              {genderOptions.map((g) => (
                <TouchableOpacity key={g} style={[s.gOpt, clientGender === g && s.gOptSel]} onPress={() => handleGenderSelect(g)}>
                  <Typography variant="body" color={clientGender === g ? COLORS.secondaryDark : COLORS.text} weight={clientGender === g ? "semibold" : "regular"}>{g}</Typography>
                  {clientGender === g && <Ionicons name="checkmark" size={scale(22)} color={COLORS.secondaryDark} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={s.gOpt} onPress={() => handleGenderSelect("")}><Typography variant="body" color={COLORS.textLight}>Clear</Typography></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>

      {/* Quick Add Bottom Sheet */}
      <Modal visible={quickAddVisible} transparent animationType="slide" onRequestClose={() => setQuickAddVisible(false)}>
        <TouchableOpacity style={s.mOverlay} activeOpacity={1} onPress={() => setQuickAddVisible(false)}>
          <View style={s.qaSheet}>
            <View style={s.mHandle} />
            <SheetOption icon="document-text-outline" color={COLORS.secondaryDark} label="Add Inquiry" onPress={() => { setQuickAddVisible(false); navToInquiry(); }} />
            <SheetOption icon="calendar-outline" color={COLORS.info} label="Schedule Appointment" onPress={() => { setQuickAddVisible(false); navToSchedule(); }} />
            <SheetOption icon="logo-whatsapp" color={COLORS.whatsapp} label="Send Aftercare (WhatsApp)" onPress={() => { setQuickAddVisible(false); sendAftercare(); }} last />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Completion Modal */}
      {completeModalVisible && (
        <View style={StyleSheet.absoluteFill}>
          <View style={s.cOverlay}>
            <View style={s.cModalContent}>
              <View style={s.mHandle} />
              <Typography variant="h3" style={{ marginBottom: SPACING.medium }}>Complete Appointment</Typography>

              <Input label="Amount" value={completeAmount} onChangeText={setCompleteAmount} keyboardType="numeric" placeholder="Enter amount" icon="cash-outline" />

              <Typography variant="label" style={{ marginBottom: SPACING.small }}>Payment Method</Typography>
              <View style={s.cPaymentGroup}>
                {(["CASH", "ONLINE", "CARD"] as const).map((m) => {
                  const active = completeMethod === m;
                  return (
                    <PressableScale key={m} scaleTo={0.94} style={[s.cPaymentBtn, active && s.cPaymentBtnActive]} onPress={() => setCompleteMethod(m)}>
                      <Typography variant="label" color={active ? COLORS.primary : COLORS.textMuted} weight={active ? "bold" : "medium"}>{m}</Typography>
                    </PressableScale>
                  );
                })}
              </View>

              <Input label="Completion Notes (optional)" value={completeNotes} onChangeText={setCompleteNotes} placeholder="Healing notes, touch-up needed, etc." multiline numberOfLines={3} style={{ height: scale(70), textAlignVertical: "top" }} />

              <View style={s.cModalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setCompleteModalVisible(false)} style={{ flex: 1, marginRight: SPACING.small }} />
                <Button title="Confirm" variant="secondary" onPress={submitCompleteAppointment} loading={completing} style={{ flex: 1 }} />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// ── Small presentational helpers ──
const QuickAction = ({ icon, tint, color, label, onPress }: any) => (
  <PressableScale style={s.qBtn} scaleTo={0.92} onPress={onPress}>
    <View style={[s.qIcon, { backgroundColor: tint }]}><Ionicons name={icon} size={scale(21)} color={color} /></View>
    <Typography variant="overline" color={COLORS.textMuted} style={s.qLabel}>{label}</Typography>
  </PressableScale>
);

const DetailRow = ({ icon, label, value, onPress }: any) => {
  const Wrap: any = onPress ? PressableScale : View;
  const wrapProps = onPress ? { onPress, scaleTo: 0.99 } : {};
  return (
    <Wrap style={s.detRow} {...wrapProps}>
      <View style={s.detIcon}><Ionicons name={icon} size={scale(18)} color={COLORS.secondaryDark} /></View>
      <View style={s.detContent}>
        <Typography variant="caption" color={COLORS.textLight}>{label}</Typography>
        <Typography variant="body">{value}</Typography>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={scale(18)} color={COLORS.textLight} /> : null}
    </Wrap>
  );
};

const SheetOption = ({ icon, color, label, onPress, last }: any) => (
  <PressableScale style={[s.qaOpt, last && { borderBottomWidth: 0 }]} scaleTo={0.98} onPress={onPress}>
    <View style={[s.qaIcon, { backgroundColor: `${color}1A` }]}><Ionicons name={icon} size={scale(20)} color={color} /></View>
    <Typography variant="body" weight="medium" style={{ marginLeft: SPACING.medium }}>{label}</Typography>
  </PressableScale>
);

// ── STYLES ──
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.medium, overflow: "hidden" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: scale(44) },
  hBtn: { width: scale(40), height: scale(40), borderRadius: RADIUS.md, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  avatarWrap: { alignItems: "center", marginBottom: 6 },
  avatar: { width: scale(60), height: scale(60), borderRadius: RADIUS.pill, backgroundColor: "rgba(212,175,55,0.16)", borderWidth: 1.5, borderColor: COLORS.secondary, justifyContent: "center", alignItems: "center" },
  metaRow: { flexDirection: "row", justifyContent: "center", gap: SPACING.medium, marginTop: 4, marginBottom: 4 },
  metaItem: { flexDirection: "row", alignItems: "center" },

  // Quick Actions
  qBar: { flexDirection: "row", justifyContent: "space-around", paddingVertical: SPACING.small, paddingHorizontal: SPACING.small, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  qBtn: { alignItems: "center", flex: 1 },
  qIcon: { width: scale(44), height: scale(44), borderRadius: RADIUS.pill, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  qLabel: {},

  // Tabs
  tabWrap: { paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },

  // Scroll / Content
  scroll: { flex: 1, backgroundColor: COLORS.background },
  center: { alignItems: "center", paddingVertical: SPACING.xxlarge },

  // Timeline
  tlWrap: { paddingHorizontal: SPACING.medium, paddingTop: SPACING.medium },
  tlItem: { flexDirection: "row", minHeight: scale(70) },
  tlGutter: { width: scale(28), alignItems: "center" },
  tlDot: { width: scale(22), height: scale(22), borderRadius: RADIUS.pill, justifyContent: "center", alignItems: "center", zIndex: 1 },
  tlLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginTop: -1 },
  tlContent: { flex: 1, paddingLeft: SPACING.small, paddingBottom: SPACING.large },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { backgroundColor: COLORS.secondaryTint, paddingHorizontal: SPACING.small, paddingVertical: 3, borderRadius: RADIUS.pill },
  tlAction: { flexDirection: "row", alignItems: "center", marginTop: 6, paddingVertical: 4, alignSelf: "flex-start" },

  // Appointments
  agWrap: { padding: SPACING.medium },
  agCard: { flexDirection: "row", alignItems: "flex-start", padding: SPACING.medium, marginBottom: SPACING.medium, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, ...{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 } },
  agDate: { width: scale(46), marginRight: SPACING.medium, alignItems: "center", backgroundColor: COLORS.secondaryTint, borderRadius: RADIUS.md, paddingVertical: SPACING.small },
  agInfo: { flex: 1 },
  agActions: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.small, marginTop: SPACING.small },
  agBtn: { paddingHorizontal: SPACING.small, paddingVertical: 5, borderRadius: RADIUS.sm, backgroundColor: COLORS.backgroundAlt },
  agBtnPrimary: { backgroundColor: COLORS.secondaryTint },
  agBadge: { marginLeft: SPACING.small },

  // Details
  detList: { padding: SPACING.medium },
  detRow: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.medium, paddingHorizontal: SPACING.medium, backgroundColor: COLORS.card, borderRadius: RADIUS.md, marginBottom: SPACING.small, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.medium },
  detIcon: { width: scale(38), height: scale(38), borderRadius: RADIUS.md, backgroundColor: COLORS.secondaryTint, justifyContent: "center", alignItems: "center" },
  detContent: { flex: 1 },

  // Modals
  mOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  mSheet: { backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.large, maxHeight: "85%" },
  mHandle: { width: scale(40), height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: SPACING.medium },
  mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.medium },
  mActions: { flexDirection: "row", marginTop: SPACING.medium },
  gPicker: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: SPACING.medium, paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium, backgroundColor: COLORS.card },
  gOpt: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: SPACING.medium, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  gOptSel: { },

  // Quick Add
  qaSheet: { backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, paddingHorizontal: SPACING.large, paddingBottom: SPACING.xlarge, paddingTop: SPACING.medium },
  qaOpt: { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.medium, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  qaIcon: { width: scale(40), height: scale(40), borderRadius: RADIUS.md, justifyContent: "center", alignItems: "center" },

  // Completion Modal
  cOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay, justifyContent: "center", alignItems: "center", padding: SPACING.large, zIndex: 100 },
  cModalContent: { backgroundColor: COLORS.card, padding: SPACING.large, borderRadius: RADIUS.xl, width: "100%", maxWidth: 460 },
  cPaymentGroup: { flexDirection: "row", gap: SPACING.small, marginBottom: SPACING.medium },
  cPaymentBtn: { flex: 1, paddingVertical: SPACING.small + 2, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, alignItems: "center", backgroundColor: COLORS.card },
  cPaymentBtnActive: { borderColor: COLORS.secondary, backgroundColor: COLORS.secondaryTint },
  cModalActions: { flexDirection: "row", marginTop: SPACING.small },
});
