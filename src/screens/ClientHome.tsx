import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { ScreenContainer, Typography, Card } from "../components";

export const ClientHome = ({ route }: any) => {
  const { client, latestInquiry } = route.params || {};

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Typography variant="h2">Client Dashboard</Typography>
            <Typography variant="caption">{client?.name}</Typography>
          </View>
          <Ionicons
            name="person-circle-outline"
            size={48}
            color={COLORS.primary}
          />
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={COLORS.secondary}
            />
            <Typography variant="h3" style={styles.cardTitle}>
              Client Info
            </Typography>
          </View>
          <View style={styles.row}>
            <Typography variant="label">Mobile:</Typography>
            <Typography>{client?.mobile}</Typography>
          </View>
          <View style={styles.row}>
            <Typography variant="label">Status:</Typography>
            <Typography style={{ color: COLORS.success, fontWeight: "bold" }}>
              {client?.currentStatus}
            </Typography>
          </View>
        </Card>

        {latestInquiry && (
          <Card>
            <View style={styles.cardHeader}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={COLORS.secondary}
              />
              <Typography variant="h3" style={styles.cardTitle}>
                Latest Inquiry
              </Typography>
            </View>

            <View style={styles.row}>
              <Typography variant="label">Intent:</Typography>
              <Typography>{latestInquiry.intent}</Typography>
            </View>
            <View style={styles.row}>
              <Typography variant="label">Remark:</Typography>
              <Typography>{latestInquiry.remark}</Typography>
            </View>

            <View style={styles.tags}>
              <View style={styles.tag}>
                <Typography variant="caption" color={COLORS.white}>
                  Size: {latestInquiry.tattooSizeId}
                </Typography>
              </View>
              <View style={styles.tag}>
                <Typography variant="caption" color={COLORS.white}>
                  Ref: {latestInquiry.referenceTypeId}
                </Typography>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: SPACING.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.large,
    paddingHorizontal: SPACING.small,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.small,
  },
  cardTitle: {
    marginLeft: SPACING.small,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.small,
  },
  tags: {
    flexDirection: "row",
    marginTop: SPACING.small,
    gap: SPACING.small,
  },
  tag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
