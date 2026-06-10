import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SCREEN, scale } from "../constants/theme";
import {
  Typography,
  Header,
  SegmentedControl,
  EmptyState,
  PressableScale,
  FadeInView,
} from "../components";
import { FollowUpsApi } from "../api/followups.api";
import { FollowUp } from "../api/types";
import { useSettingsStore } from "../config/settingsStore";
import { fillTemplate, followUpLabel, formatDate, openWhatsApp } from "../utils";

type FilterKey = "today" | "week" | "completed";

const FILTERS = [
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
      <Header title="Follow-Ups" subtitle="Healing Check-ins" />

      <View style={styles.segmentWrap}>
        <SegmentedControl
          segments={FILTERS}
          value={filter}
          onChange={(k) => setFilter(k as FilterKey)}
        />
      </View>

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
          {items.length === 0 ? (
            <EmptyState
              icon="checkmark-done-outline"
              title={filter === "completed" ? "No completed follow-ups" : "All clear"}
              subtitle={
                filter === "completed"
                  ? "Completed check-ins will appear here"
                  : "Nothing due here right now"
              }
            />
          ) : (
            items.map((fu, idx) => {
              const tattoo =
                fu.appointment?.tattooDetail ||
                fu.appointment?.inquiry?.intent ||
                "Tattoo session";
              const overdue = isOverdue(fu);
              const done = fu.status === "COMPLETED";
              const accent = done ? COLORS.success : overdue ? COLORS.error : COLORS.secondary;
              return (
                <FadeInView key={fu.id} index={Math.min(idx, 8)}>
                  <View style={[styles.card, { borderLeftColor: accent }]}>
                    <View style={styles.cardTop}>
                      <PressableScale
                        style={{ flex: 1 }}
                        scaleTo={0.99}
                        onPress={() => goToClient(fu)}
                      >
                        <Typography variant="body" weight="semibold" numberOfLines={1}>
                          {fu.client?.name || "Unknown client"}
                        </Typography>
                        <Typography variant="caption" color={COLORS.textLight}>
                          {fu.client?.mobile}
                        </Typography>
                      </PressableScale>
                      <View style={styles.typeBadge}>
                        <Typography variant="overline" color={COLORS.secondaryDark}>
                          {followUpLabel(fu.type)}
                        </Typography>
                      </View>
                    </View>

                    <Typography
                      variant="caption"
                      color={COLORS.textMuted}
                      numberOfLines={2}
                      style={{ marginTop: 6 }}
                    >
                      {tattoo}
                    </Typography>

                    <View style={styles.metaRow}>
                      <Ionicons
                        name={done ? "checkmark-circle" : "calendar-outline"}
                        size={scale(14)}
                        color={accent}
                      />
                      <Typography variant="caption" color={accent} style={{ marginLeft: 4 }}>
                        {done && fu.completedAt
                          ? `Done ${formatDate(fu.completedAt)}`
                          : `Due ${formatDate(fu.dueDate)}${overdue ? " · overdue" : ""}`}
                      </Typography>
                    </View>

                    {fu.status === "PENDING" && (
                      <View style={styles.actions}>
                        <PressableScale
                          style={styles.waBtn}
                          scaleTo={0.95}
                          onPress={() => handleWhatsApp(fu)}
                        >
                          <Ionicons name="logo-whatsapp" size={scale(17)} color={COLORS.white} />
                          <Typography variant="label" color={COLORS.white} style={{ marginLeft: 6 }}>
                            Send Reminder
                          </Typography>
                        </PressableScale>
                        <PressableScale
                          style={styles.doneBtn}
                          scaleTo={0.95}
                          disabled={processingId === fu.id}
                          onPress={() => handleMarkComplete(fu)}
                        >
                          {processingId === fu.id ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                          ) : (
                            <>
                              <Ionicons name="checkmark" size={scale(16)} color={COLORS.primary} />
                              <Typography variant="label" color={COLORS.primary} style={{ marginLeft: 4 }}>
                                Mark Done
                              </Typography>
                            </>
                          )}
                        </PressableScale>
                      </View>
                    )}
                  </View>
                </FadeInView>
              );
            })
          )}
          <View style={{ height: SPACING.large }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  segmentWrap: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.medium,
    paddingBottom: SPACING.small,
    width: "100%",
    maxWidth: SCREEN.maxContentWidth,
    alignSelf: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.small,
    width: "100%",
    maxWidth: SCREEN.maxContentWidth,
    alignSelf: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  typeBadge: {
    backgroundColor: COLORS.secondaryTint,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: SPACING.small },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.medium,
    marginTop: SPACING.medium,
  },
  waBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.whatsapp,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.md,
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
  },
});
