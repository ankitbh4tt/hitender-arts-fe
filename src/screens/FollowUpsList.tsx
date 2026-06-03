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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../constants/theme";
import { Typography } from "../components";
import { FollowUpsApi } from "../api/followups.api";
import { FollowUp } from "../api/types";
import { useSettingsStore } from "../config/settingsStore";
import { fillTemplate, followUpLabel, formatDate, openWhatsApp } from "../utils";

type FilterKey = "today" | "week" | "completed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "today", label: "Due Today" },
  { key: "week", label: "This Week" },
  { key: "completed", label: "Completed" },
];

export const FollowUpsList = ({ navigation }: any) => {
  const [filter, setFilter] = useState<FilterKey>("today");
  const [items, setItems] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const reminderTemplate = useSettingsStore((s) => s.reminderTemplate);
  const studioName = useSettingsStore((s) => s.studioName);

  const fetchItems = async (key: FilterKey, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      let data: FollowUp[];
      if (key === "today") data = await FollowUpsApi.getDueToday();
      else if (key === "week") data = await FollowUpsApi.getDueThisWeek();
      else data = await FollowUpsApi.getCompleted();
      setItems(data);
    } catch (e) {
      // global toast
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems(filter);
    }, [filter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems(filter, true);
  };

  const handleWhatsApp = (fu: FollowUp) => {
    const clientName = fu.client?.name || "there";
    const message = fillTemplate(reminderTemplate(), {
      clientName,
      followUpType: followUpLabel(fu.type),
      studioName: studioName(),
    });
    if (fu.client?.mobile) openWhatsApp(fu.client.mobile, message);
  };

  const handleMarkComplete = (fu: FollowUp) => {
    Alert.alert("Mark Complete", `Mark the ${followUpLabel(fu.type)} follow-up as done?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Done",
        onPress: async () => {
          try {
            setProcessingId(fu.id);
            await FollowUpsApi.markComplete(fu.id);
            fetchItems(filter);
          } catch (e: any) {
            Alert.alert("Error", e.message || "Failed");
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const goToClient = (fu: FollowUp) => {
    if (fu.client) {
      navigation.navigate("ClientsTab", {
        screen: "ClientDetail",
        params: { client: fu.client },
      });
    }
  };

  const isOverdue = (fu: FollowUp) =>
    fu.status === "PENDING" && new Date(fu.dueDate).getTime() < Date.now();

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: COLORS.primary }} />
      <View style={styles.header}>
        <Typography variant="h2" color={COLORS.white}>
          Follow-Ups
        </Typography>
        <Typography variant="caption" color={COLORS.secondary}>
          Healing check-ins
        </Typography>
      </View>

      {/* Segmented filter */}
      <View style={styles.segment}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.segBtn, filter === f.key && styles.segBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Typography
              variant="caption"
              color={filter === f.key ? COLORS.primary : COLORS.textLight}
              style={filter === f.key ? { fontWeight: "700" } : undefined}
            >
              {f.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {items.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="checkmark-done-outline" size={64} color={COLORS.border} />
              <Typography variant="body" color={COLORS.textLight} style={{ marginTop: 12 }}>
                {filter === "completed" ? "No completed follow-ups" : "Nothing due here"}
              </Typography>
            </View>
          ) : (
            items.map((fu) => {
              const tattoo =
                fu.appointment?.tattooDetail ||
                fu.appointment?.inquiry?.intent ||
                "Tattoo session";
              const overdue = isOverdue(fu);
              return (
                <View key={fu.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => goToClient(fu)}>
                      <Typography variant="body" style={{ fontWeight: "600" }}>
                        {fu.client?.name || "Unknown client"}
                      </Typography>
                      <Typography variant="caption" color={COLORS.textLight}>
                        {fu.client?.mobile}
                      </Typography>
                    </TouchableOpacity>
                    <View style={[styles.typeBadge, { backgroundColor: COLORS.secondary + "22" }]}>
                      <Typography variant="caption" color={COLORS.primary}>
                        {followUpLabel(fu.type)}
                      </Typography>
                    </View>
                  </View>

                  <Typography variant="caption" color={COLORS.text} numberOfLines={2} style={{ marginTop: 6 }}>
                    {tattoo}
                  </Typography>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={overdue ? COLORS.error : COLORS.textLight}
                    />
                    <Typography
                      variant="caption"
                      color={overdue ? COLORS.error : COLORS.textLight}
                      style={{ marginLeft: 4 }}
                    >
                      {fu.status === "COMPLETED" && fu.completedAt
                        ? `Done ${formatDate(fu.completedAt)}`
                        : `Due ${formatDate(fu.dueDate)}${overdue ? " · overdue" : ""}`}
                    </Typography>
                  </View>

                  {fu.status === "PENDING" && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.waBtn} onPress={() => handleWhatsApp(fu)}>
                        <Ionicons name="logo-whatsapp" size={18} color={COLORS.white} />
                        <Typography variant="caption" color={COLORS.white} style={{ marginLeft: 6 }}>
                          Send Reminder
                        </Typography>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.doneBtn}
                        disabled={processingId === fu.id}
                        onPress={() => handleMarkComplete(fu)}
                      >
                        {processingId === fu.id ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                          <Typography variant="caption" color={COLORS.primary}>
                            Mark Done
                          </Typography>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
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
  },
  segment: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  segBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.medium,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  segBtnActive: { borderBottomColor: COLORS.secondary },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 64 },
  listContent: { padding: SPACING.medium },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  actions: { flexDirection: "row", alignItems: "center", gap: SPACING.medium, marginTop: SPACING.medium },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
  },
  doneBtn: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
