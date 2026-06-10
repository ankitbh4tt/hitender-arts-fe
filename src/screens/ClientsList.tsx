import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Typography,
  Card,
  Input,
  Header,
  FAB,
  EmptyState,
  FadeInView,
} from "../components";
import { COLORS, SPACING, RADIUS, SCREEN, scale } from "../constants/theme";
import { ClientsApi } from "../api/clients.api";
import { Client } from "../api/types";

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
    setSearchQuery("");
    fetchClients();
  };

  const handleClientPress = (client: Client) => {
    navigation.navigate("ClientDetail", { client });
  };

  const handleAddInquiry = () => {
    navigation.navigate("Inquiry", { client: null });
  };

  const renderClient = ({ item, index }: { item: Client; index: number }) => (
    <FadeInView index={Math.min(index, 8)}>
      <Card
        style={styles.clientCard}
        onPress={() => handleClientPress(item)}
        accessibilityLabel={`${item.name || "Unknown"}, ${item.mobile}${
          item.currentStatus?.label ? `, ${item.currentStatus.label}` : ""
        }`}
        accessibilityHint="Opens the client profile"
      >
        <View style={styles.clientRow}>
          <View style={styles.avatar}>
            <Typography variant="h3" color={COLORS.secondaryDark} weight="bold">
              {(item.name || "U").trim()[0]?.toUpperCase() || "U"}
            </Typography>
          </View>
          <View style={styles.clientInfo}>
            <Typography variant="h3" numberOfLines={1}>
              {item.name || "Unknown"}
            </Typography>
            <View style={styles.mobileRow}>
              <Ionicons name="call-outline" size={scale(13)} color={COLORS.textLight} />
              <Typography variant="caption" color={COLORS.textMuted} style={styles.mobile}>
                {item.mobile}
              </Typography>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Typography variant="overline" color={COLORS.secondaryDark}>
              {item.currentStatus?.label || "-"}
            </Typography>
          </View>
          <Ionicons name="chevron-forward" size={scale(18)} color={COLORS.textLight} />
        </View>
      </Card>
    </FadeInView>
  );

  return (
    <View style={styles.root}>
      <Header title="Clients" subtitle={`${clients.length} total`} />

      <View style={styles.searchWrap}>
        <Input
          placeholder="Search by mobile (10 digits)"
          value={searchQuery}
          onChangeText={handleSearch}
          keyboardType="phone-pad"
          maxLength={10}
          icon="search"
          containerStyle={styles.searchInput}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderClient}
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
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={searchQuery.length === 10 ? "No client found" : "No clients yet"}
              subtitle={
                searchQuery.length === 10
                  ? `Nobody with mobile ${searchQuery}`
                  : "Tap + to log a new inquiry"
              }
            />
          }
        />
      )}

      <FAB
        onPress={handleAddInquiry}
        accessibilityLabel="New inquiry"
        accessibilityHint="Opens a form to log a new client inquiry"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  searchWrap: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.medium,
    width: "100%",
    maxWidth: SCREEN.maxContentWidth,
    alignSelf: "center",
  },
  searchInput: { marginBottom: SPACING.small },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.small,
    paddingBottom: scale(96),
    width: "100%",
    maxWidth: SCREEN.maxContentWidth,
    alignSelf: "center",
  },
  clientCard: { marginBottom: SPACING.medium },
  clientRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.secondaryTint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
  },
  clientInfo: { flex: 1 },
  mobileRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  mobile: { marginLeft: 4 },
  statusBadge: {
    backgroundColor: COLORS.secondaryTint,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginRight: SPACING.small,
  },
});
