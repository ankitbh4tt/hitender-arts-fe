import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Typography, Card, Input } from "../components";
import { COLORS, SPACING } from "../constants/theme";
import { ClientsApi } from "../api/clients.api";
import { Client } from "../api/types";

// ... imports

export const ClientsList = ({ navigation }: any) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClients = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await ClientsApi.getAllClients();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length === 10) {
      setLoading(true);
      const client = await ClientsApi.getClientByMobile(query);
      setLoading(false);
      if (client) {
        setClients([client]);
      } else {
        setClients([]);
      }
    } else if (query.length === 0) {
      fetchClients();
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery(""); // Reset search on refresh
    fetchClients();
  };

  const handleClientPress = (client: Client) => {
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
      <Card key={item.id} style={styles.clientCard}>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Typography variant="h3">{item.name || "Unknown"}</Typography>
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
              {item.currentStatus?.label || "Unknown"}
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

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by mobile number (10 digits)"
          value={searchQuery}
          onChangeText={handleSearch}
          keyboardType="phone-pad"
          maxLength={10}
          style={styles.searchInput}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClient}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={80} color={COLORS.border} />
              <Typography variant="h3" style={styles.emptyTitle}>
                {searchQuery.length === 10 ? "Client Not Found" : "No Clients"}
              </Typography>
              {searchQuery.length === 10 && (
                 <Typography variant="body" color={COLORS.textLight}>
                    No client found with mobile: {searchQuery}
                 </Typography>
              )}
            </View>
          }
        />
      )}

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
  searchContainer: {
    marginBottom: SPACING.medium,
  },
  searchInput: {
    backgroundColor: COLORS.white,
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
    marginBottom: SPACING.small,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
