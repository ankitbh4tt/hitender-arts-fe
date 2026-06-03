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
import { COLORS, SPACING } from "../constants/theme";
import { Client, Inquiry, Appointment } from "../api/types";
import { InquiriesApi } from "../api/inquiries.api";
import { AppointmentsApi } from "../api/appointments.api";
import { ClientsApi } from "../api/clients.api";
import { Typography, Input, Button } from "../components";
import { fillTemplate, formatCurrency, openWhatsApp } from "../utils";
import { useSettingsStore } from "../config/settingsStore";

const GOLD = "#F6C200";
const GOLD_DARK = "#E2A900";
const HEADER_MAX = 200;
const HEADER_MIN = 64;
const SCROLL_RANGE = HEADER_MAX - HEADER_MIN;

type TabKey = "activity" | "appointments" | "details";

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
      // Healing follow-ups (3/15/30-day) are auto-created by the backend.
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

  const statusColor = (code?: string) => {
    switch (code) {
      case "SCHEDULED": return "#1976D2";
      case "COMPLETED": return "#2E7D32";
      case "CANCELLED": return "#D32F2F";
      case "NO_SHOW": return "#F57C00";
      default: return COLORS.textLight;
    }
  };

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
      <StatusBar barStyle="dark-content" backgroundColor={GOLD} />
      <SafeAreaView style={{ backgroundColor: GOLD }} edges={["top"]} />

      {/* Collapsible Header */}
      <Animated.View style={[s.header, { height: headerHeight }]}>
        <View style={s.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.hBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setClientName(client.name || ""); setClientGender(client.gender || ""); setClientLocation(client.location || ""); setEditModalVisible(true); }} style={s.hBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="pencil-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Animated.View style={[s.avatarWrap, { transform: [{ scale: avatarScale }], opacity: expandedOpacity }]}>
          <View style={s.avatar}>
            <Typography variant="h2" color="#FFF" style={{ fontWeight: "700" }}>{(client.name || "U")[0].toUpperCase()}</Typography>
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: expandedOpacity, alignItems: "center" }}>
          <Typography variant="h3" color="#FFF" align="center" style={{ fontWeight: "600" }}>{client.name || "Unknown"}</Typography>
          <View style={s.metaRow}>
            {client.gender ? <View style={s.metaItem}><Ionicons name="person-outline" size={13} color="rgba(255,255,255,0.8)" /><Typography variant="caption" color="rgba(255,255,255,0.8)" style={{ marginLeft: 3 }}>{client.gender}</Typography></View> : null}
            {client.location ? <View style={s.metaItem}><Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" /><Typography variant="caption" color="rgba(255,255,255,0.8)" style={{ marginLeft: 3 }}>{client.location}</Typography></View> : null}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Sticky Quick Actions */}
      <View style={s.qBar}>
        <TouchableOpacity style={s.qBtn} onPress={handleCall}>
          <View style={[s.qIcon, { backgroundColor: "#E8F5E9" }]}><Ionicons name="call" size={22} color="#2E7D32" /></View>
          <Typography variant="caption" color={COLORS.text} style={s.qLabel}>Call</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={s.qBtn} onPress={handleWhatsApp}>
          <View style={[s.qIcon, { backgroundColor: "#E8F5E9" }]}><Ionicons name="logo-whatsapp" size={22} color="#25D366" /></View>
          <Typography variant="caption" color={COLORS.text} style={s.qLabel}>WhatsApp</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={s.qBtn} onPress={navToSchedule}>
          <View style={[s.qIcon, { backgroundColor: "#E3F2FD" }]}><Ionicons name="calendar" size={22} color="#1565C0" /></View>
          <Typography variant="caption" color={COLORS.text} style={s.qLabel}>Schedule</Typography>
        </TouchableOpacity>
        <TouchableOpacity style={s.qBtn} onPress={navToInquiry}>
          <View style={[s.qIcon, { backgroundColor: "#F3E5F5" }]}><Ionicons name="document-text" size={22} color="#6A1B9A" /></View>
          <Typography variant="caption" color={COLORS.text} style={s.qLabel}>Inquiry</Typography>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {(["activity", "appointments", "details"] as TabKey[]).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)}>
            <Typography variant="body" color={activeTab === t ? GOLD_DARK : COLORS.textLight} style={activeTab === t ? { fontWeight: "600" } : undefined}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={s.scroll}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GOLD]} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <View style={s.center}><ActivityIndicator size="large" color={GOLD} /></View>
        ) : (
          <>
            {/* Activity Tab */}
            {activeTab === "activity" && (
              timelineData.length === 0 ? (
                <View style={s.center}><Ionicons name="time-outline" size={48} color={COLORS.border} /><Typography variant="body" color={COLORS.textLight} style={{ marginTop: 12 }}>No activity yet</Typography></View>
              ) : (
                <View style={s.tlWrap}>
                  {timelineData.map((item, idx) => {
                    const isLast = idx === timelineData.length - 1;
                    if (item.type === "inquiry") {
                      const inq = item.data as Inquiry;
                      return (
                        <View key={item.id} style={s.tlItem}>
                          <View style={s.tlGutter}>
                            <View style={[s.tlDot, { backgroundColor: GOLD }]}><Ionicons name="chatbubble-outline" size={11} color="#FFF" /></View>
                            {!isLast && <View style={s.tlLine} />}
                          </View>
                          <View style={s.tlContent}>
                            <Typography variant="caption" color={COLORS.textLight}>{fmtDate(inq.createdAt)}</Typography>
                            {inq.intent ? <Typography variant="body" numberOfLines={2} style={{ fontWeight: "500", marginTop: 2 }}>{inq.intent}</Typography> : null}
                            {inq.remark ? <Typography variant="caption" color={COLORS.textLight} numberOfLines={2} style={{ marginTop: 2 }}>{inq.remark}</Typography> : null}
                            <View style={s.chipRow}>
                              {inq.referenceType ? <View style={s.chip}><Typography variant="caption" color={GOLD_DARK}>{inq.referenceType.name}</Typography></View> : null}
                              {inq.tattooSize ? <View style={s.chip}><Typography variant="caption" color={GOLD_DARK}>{inq.tattooSize.label}</Typography></View> : null}
                            </View>
                            <TouchableOpacity style={s.tlAction} onPress={() => navigation.navigate("ScheduleAppointment", { inquiryId: inq.id, client })}>
                              <Ionicons name="calendar-outline" size={14} color="#1565C0" />
                              <Typography variant="caption" color="#1565C0" style={{ marginLeft: 4 }}>Schedule</Typography>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    } else {
                      const apt = item.data as Appointment;
                      return (
                        <View key={item.id} style={s.tlItem}>
                          <View style={s.tlGutter}>
                            <View style={[s.tlDot, { backgroundColor: "#1565C0" }]}><Ionicons name="calendar-outline" size={11} color="#FFF" /></View>
                            {!isLast && <View style={s.tlLine} />}
                          </View>
                          <View style={s.tlContent}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                              <Typography variant="caption" color={COLORS.textLight}>{fmtDate(apt.appointmentAt)} {fmtTime(apt.appointmentAt)}</Typography>
                              <View style={[s.badge, { backgroundColor: statusColor(apt.appointmentStatus?.code) + "20" }]}>
                                <Typography variant="caption" color={statusColor(apt.appointmentStatus?.code)}>{apt.appointmentStatus?.label || "Unknown"}</Typography>
                              </View>
                            </View>
                            {apt.tattooDetail ? <Typography variant="body" numberOfLines={1} style={{ fontWeight: "500", marginTop: 2 }}>{apt.tattooDetail}</Typography> : null}
                            {apt.appointmentStatus?.code === "COMPLETED" && apt.paymentMethod && apt.amount && (
                              <View style={s.chipRow}>
                                <View style={s.chip}><Typography variant="caption" color={GOLD_DARK}>{formatCurrency(apt.amount)}</Typography></View>
                                <View style={s.chip}><Typography variant="caption" color={GOLD_DARK}>{apt.paymentMethod}</Typography></View>
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
                <View style={s.center}><Ionicons name="calendar-outline" size={48} color={COLORS.border} /><Typography variant="body" color={COLORS.textLight} style={{ marginTop: 12 }}>No appointments</Typography></View>
              ) : (
                <View>
                  {appointments.map((apt) => {
                    const d = new Date(apt.appointmentAt);
                    const sc = apt.appointmentStatus?.code;
                    return (
                      <View key={apt.id} style={s.agRow}>
                        <View style={s.agDate}>
                          <Typography variant="h3" align="center">{d.getDate()}</Typography>
                          <Typography variant="caption" color={COLORS.textLight} align="center">{d.toLocaleDateString("en-IN", { month: "short" })}</Typography>
                        </View>
                        <View style={s.agInfo}>
                          <Typography variant="body">{fmtTime(apt.appointmentAt)} · {apt.durationMinutes || 60} min</Typography>
                          {apt.tattooDetail ? <Typography variant="caption" color={COLORS.textLight} numberOfLines={1}>{apt.tattooDetail}</Typography> : null}
                          {sc === "COMPLETED" && apt.completionNotes ? <Typography variant="caption" color={COLORS.textLight} numberOfLines={2}>📝 {apt.completionNotes}</Typography> : null}
                          {sc === "COMPLETED" && apt.paymentMethod && apt.amount && (
                            <View style={[s.chipRow, { marginTop: 4 }]}>
                              <View style={s.chip}><Typography variant="caption" color={GOLD_DARK}>{formatCurrency(apt.amount)}</Typography></View>
                              <View style={s.chip}><Typography variant="caption" color={GOLD_DARK}>{apt.paymentMethod}</Typography></View>
                            </View>
                          )}
                          {sc === "SCHEDULED" && (
                            <View style={s.agActions}>
                              <TouchableOpacity onPress={() => handleReschedule(apt)} disabled={processingId !== null} style={s.agActBtn}><Typography variant="caption" color={processingId !== null ? COLORS.textLight : "#1565C0"}>Reschedule</Typography></TouchableOpacity>
                              <TouchableOpacity onPress={() => handleCompletePress(apt.id)} disabled={processingId === apt.id} style={s.agActBtn}><Typography variant="caption" color={processingId === apt.id ? COLORS.textLight : "#2E7D32"}>Complete</Typography></TouchableOpacity>
                              <TouchableOpacity onPress={() => handleNoShow(apt.id)} disabled={processingId === apt.id} style={s.agActBtn}><Typography variant="caption" color={processingId === apt.id ? COLORS.textLight : "#F57C00"}>No Show</Typography></TouchableOpacity>
                              <TouchableOpacity onPress={() => handleCancel(apt.id)} disabled={processingId === apt.id} style={s.agActBtn}><Typography variant="caption" color={processingId === apt.id ? COLORS.textLight : "#D32F2F"}>Cancel</Typography></TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <View style={[s.badge, { backgroundColor: statusColor(sc) + "20" }]}>
                          <Typography variant="caption" color={statusColor(sc)}>{apt.appointmentStatus?.label || "Unknown"}</Typography>
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
                <TouchableOpacity style={s.detRow} onPress={handleCall}>
                  <Ionicons name="call-outline" size={20} color={COLORS.textLight} />
                  <View style={s.detContent}><Typography variant="caption" color={COLORS.textLight}>Phone</Typography><Typography variant="body">{client.mobile}</Typography></View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
                <View style={s.detDiv} />
                <View style={s.detRow}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textLight} />
                  <View style={s.detContent}><Typography variant="caption" color={COLORS.textLight}>Gender</Typography><Typography variant="body">{client.gender || "Not set"}</Typography></View>
                </View>
                <View style={s.detDiv} />
                <View style={s.detRow}>
                  <Ionicons name="location-outline" size={20} color={COLORS.textLight} />
                  <View style={s.detContent}><Typography variant="caption" color={COLORS.textLight}>City</Typography><Typography variant="body">{client.location || "Not set"}</Typography></View>
                </View>
              </View>
            )}
          </>
        )}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setQuickAddVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Edit Client Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={s.mOverlay}>
          <View style={s.mSheet}>
            <View style={s.mHeader}><Typography variant="h3">Edit Client</Typography><TouchableOpacity onPress={() => setEditModalVisible(false)}><Ionicons name="close" size={28} color={COLORS.text} /></TouchableOpacity></View>
            <Input label="Name" value={clientName} onChangeText={setClientName} placeholder="Client Name" />
            <TouchableOpacity style={s.gPicker} onPress={() => setGenderModalVisible(true)}>
              <Typography variant="caption" color={COLORS.textLight} style={{ marginBottom: 4 }}>Gender</Typography>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body" color={clientGender ? COLORS.text : COLORS.textLight}>{clientGender || "Select"}</Typography>
                <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
              </View>
            </TouchableOpacity>
            <Input label="Location" value={clientLocation} onChangeText={setClientLocation} placeholder="City" />
            <View style={s.mActions}>
              <TouchableOpacity style={s.mCancel} onPress={() => setEditModalVisible(false)} disabled={savingClientInfo}><Typography variant="body" color={COLORS.error}>Cancel</Typography></TouchableOpacity>
              <TouchableOpacity style={s.mSave} onPress={handleSaveClientInfo} disabled={savingClientInfo}>
                {savingClientInfo ? <ActivityIndicator size="small" color="#FFF" /> : <Typography variant="body" color="#FFF">Save</Typography>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Modal visible={genderModalVisible} transparent animationType="slide" onRequestClose={() => setGenderModalVisible(false)}>
          <View style={s.mOverlay}>
            <View style={s.mSheet}>
              <View style={s.mHeader}><Typography variant="h3">Select Gender</Typography><TouchableOpacity onPress={() => setGenderModalVisible(false)}><Ionicons name="close" size={28} color={COLORS.text} /></TouchableOpacity></View>
              {genderOptions.map((g) => (
                <TouchableOpacity key={g} style={[s.gOpt, clientGender === g && s.gOptSel]} onPress={() => handleGenderSelect(g)}>
                  <Typography variant="body" color={clientGender === g ? GOLD_DARK : COLORS.text}>{g}</Typography>
                  {clientGender === g && <Ionicons name="checkmark" size={24} color={GOLD_DARK} />}
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
            <View style={s.qaHandle} />
            <TouchableOpacity style={s.qaOpt} onPress={() => { setQuickAddVisible(false); navToInquiry(); }}>
              <Ionicons name="document-text-outline" size={24} color="#6A1B9A" />
              <Typography variant="body" style={{ marginLeft: 16 }}>Add Inquiry</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={s.qaOpt} onPress={() => { setQuickAddVisible(false); navToSchedule(); }}>
              <Ionicons name="calendar-outline" size={24} color="#1565C0" />
              <Typography variant="body" style={{ marginLeft: 16 }}>Schedule Appointment</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={s.qaOpt} onPress={() => { setQuickAddVisible(false); sendAftercare(); }}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Typography variant="body" style={{ marginLeft: 16 }}>Send Aftercare (WhatsApp)</Typography>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Completion Modal */}
      {completeModalVisible && (
        <View style={StyleSheet.absoluteFill}>
          <View style={s.cOverlay}>
            <View style={s.cModalContent}>
              <Typography variant="h3" style={{ marginBottom: SPACING.medium }}>Complete Appointment</Typography>
              
              <Input
                label="Amount"
                value={completeAmount}
                onChangeText={setCompleteAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
              />

              <Typography variant="caption" color={COLORS.textLight} style={{ marginBottom: SPACING.small }}>Payment Method</Typography>
              <View style={s.cPaymentGroup}>
                {(["CASH", "ONLINE", "CARD"] as const).map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[s.cPaymentBtn, completeMethod === method && s.cPaymentBtnActive]}
                    onPress={() => setCompleteMethod(method)}
                  >
                    <Typography variant="caption" color={completeMethod === method ? COLORS.primary : COLORS.text}>{method}</Typography>
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

              <View style={s.cModalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setCompleteModalVisible(false)} style={{ flex: 1, marginRight: SPACING.small }} />
                <Button title="Confirm" onPress={submitCompleteAppointment} loading={completing} style={{ flex: 1 }} />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// ── STYLES ──
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFF" },

  // Header
  header: { backgroundColor: GOLD, paddingHorizontal: 16, overflow: "hidden" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 44 },
  hBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  avatarWrap: { alignItems: "center", marginBottom: 6 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,0,0,0.15)", justifyContent: "center", alignItems: "center" },
  metaRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 4, marginBottom: 4 },
  metaItem: { flexDirection: "row", alignItems: "center" },

  // Quick Actions
  qBar: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, paddingHorizontal: 8, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  qBtn: { alignItems: "center", flex: 1, minHeight: 48 },
  qIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  qLabel: { fontSize: 11 },

  // Tabs
  tabBar: { flexDirection: "row", backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: GOLD },

  // Scroll / Content
  scroll: { flex: 1, backgroundColor: "#FAFAFA" },
  center: { alignItems: "center", paddingVertical: 48 },

  // Timeline
  tlWrap: { paddingHorizontal: 16, paddingTop: 16 },
  tlItem: { flexDirection: "row", minHeight: 72 },
  tlGutter: { width: 28, alignItems: "center" },
  tlDot: { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center", zIndex: 1 },
  tlLine: { width: 2, flex: 1, backgroundColor: "#E0E0E0", marginTop: -1 },
  tlContent: { flex: 1, paddingLeft: 12, paddingBottom: 20 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { backgroundColor: GOLD + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tlAction: { flexDirection: "row", alignItems: "center", marginTop: 6, paddingVertical: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },

  // Appointments Agenda
  agRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E0E0E0", backgroundColor: "#FFF", minHeight: 72 },
  agDate: { width: 44, marginRight: 12, alignItems: "center" },
  agInfo: { flex: 1, marginRight: 8 },
  agActions: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 6 },
  agActBtn: { paddingVertical: 4 },

  // Details
  detList: { paddingHorizontal: 16, paddingTop: 12 },
  detRow: { flexDirection: "row", alignItems: "center", minHeight: 48, paddingVertical: 8, gap: 12 },
  detContent: { flex: 1 },
  detDiv: { height: 1, backgroundColor: "#E0E0E0", marginLeft: 32 },

  // FAB
  fab: { position: "absolute", bottom: 24, right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: GOLD, justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4 },

  // Modals
  mOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  mSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, maxHeight: "80%" },
  mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  mActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  mCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  mSave: { backgroundColor: GOLD_DARK, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  gPicker: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12, backgroundColor: COLORS.background },
  gOpt: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  gOptSel: { backgroundColor: GOLD + "10" },

  // Quick Add
  qaSheet: { backgroundColor: "#FFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 24, paddingBottom: 32, paddingTop: 12 },
  qaHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#DDD", alignSelf: "center", marginBottom: 16 },
  qaOpt: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },

  // Completion Modal
  cOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 100 },
  cModalContent: { backgroundColor: COLORS.white, padding: SPACING.large, borderRadius: SPACING.small, width: "90%" },
  cPaymentGroup: { flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.large },
  cPaymentBtn: { flex: 1, paddingVertical: SPACING.small, borderWidth: 1, borderColor: COLORS.border, borderRadius: SPACING.small, alignItems: "center", marginHorizontal: SPACING.tiny },
  cPaymentBtnActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
  cModalActions: { flexDirection: "row", justifyContent: "space-between" },
});
