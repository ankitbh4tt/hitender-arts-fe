import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Typography, Card } from "../components";
import { COLORS, SPACING } from "../constants/theme";
import { DataStore, Inquiry } from "../data/store";

export const InquiriesList = ({ navigation }: any) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    setInquiries(DataStore.inquiries);
  }, []);

  const handleAddInquiry = () => {
    navigation.navigate("Inquiry", { client: null });
  };

  const renderInquiry = ({ item }: { item: Inquiry }) => {
    const client = DataStore.clients.find((c) => c.id === item.clientId);

    return (
      <Card style={styles.inquiryCard}>
        <View style={styles.inquiryHeader}>
          <Typography variant="h3">{item.intent}</Typography>
        </View>
        <View style={styles.inquiryDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={COLORS.textLight}
            />
            <Typography variant="body" style={styles.detailText}>
              {client?.name || "Unknown Client"}
            </Typography>
          </View>
          {item.remark && (
            <View style={styles.detailRow}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color={COLORS.textLight}
              />
              <Typography variant="caption" style={styles.detailText}>
                {item.remark}
              </Typography>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Typography variant="h2">Inquiries</Typography>
        <Typography variant="caption" color={COLORS.textLight}>
          {inquiries.length} total inquiries
        </Typography>
      </View>

      <FlatList
        data={inquiries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderInquiry}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={80}
              color={COLORS.border}
            />
            <Typography variant="h3" style={styles.emptyTitle}>
              No Inquiries
            </Typography>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddInquiry}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.medium,
  },
  listContent: {
    paddingBottom: SPACING.large,
  },
  inquiryCard: {
    marginBottom: SPACING.medium,
  },
  inquiryHeader: {
    marginBottom: SPACING.small,
  },
  inquiryDetails: {
    gap: SPACING.tiny,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: SPACING.small,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxlarge,
  },
  emptyTitle: {
    marginTop: SPACING.medium,
  },
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
