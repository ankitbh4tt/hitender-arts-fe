import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Typography, Card } from "../components";
import { COLORS, SPACING } from "../constants/theme";
import { DataStore, Client } from "../data/store";

export const ClientsList = ({ navigation }: any) => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(DataStore.clients);
  }, []);

  const handleClientPress = (client: Client) => {
    console.log("Client pressed:", client.name);
    navigation.navigate("ClientDetail", { client });
  };

  const handleAddInquiry = () => {
    navigation.navigate("Inquiry", { client: null });
  };

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity
      onPress={() => handleClientPress(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.clientCard}>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Typography variant="h3">{item.name}</Typography>
            <View style={styles.mobileRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color={COLORS.textLight}
              />
              <Typography variant="caption" style={styles.mobile}>
                {item.mobile}
              </Typography>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: COLORS.secondary }]}
          >
            <Typography variant="caption" color={COLORS.white}>
              {item.currentStatus}
            </Typography>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Typography variant="h2">Clients</Typography>
        <Typography variant="caption" color={COLORS.textLight}>
          {clients.length} total clients
        </Typography>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClient}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color={COLORS.border} />
            <Typography variant="h3" style={styles.emptyTitle}>
              No Clients
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
  clientCard: {
    marginBottom: SPACING.medium,
  },
  clientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
