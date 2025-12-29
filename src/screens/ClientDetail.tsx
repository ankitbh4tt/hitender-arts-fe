import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer, Typography, Card } from "../components";
import { COLORS, SPACING } from "../constants/theme";
import { DataStore, Client, Inquiry, Appointment } from "../data/store";

interface ClientDetailProps {
  route: any;
  navigation: any;
}

export const ClientDetail = ({ route, navigation }: ClientDetailProps) => {
  const { client } = route.params;
  const [activeTab, setActiveTab] = useState<"inquiries" | "appointments">(
    "inquiries"
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [clientName, setClientName] = useState(client.name);

  const inquiries = DataStore.getInquiriesByClient(client.id);
  const appointments = DataStore.appointments.filter(
    (a) => a.clientId === client.id
  );

  const handleSaveName = () => {
    DataStore.updateClient(client.id, { name: clientName });
    setIsEditingName(false);
  };

  const handleAddInquiry = () => {
    navigation.navigate("Inquiry", { client });
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {isEditingName ? (
            <View style={styles.editNameRow}>
              <TextInput
                style={styles.nameInput}
                value={clientName}
                onChangeText={setClientName}
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveName}>
                <Ionicons
                  name="checkmark-circle"
                  size={28}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Typography variant="h2">{clientName}</Typography>
              <TouchableOpacity onPress={() => setIsEditingName(true)}>
                <Ionicons
                  name="pencil-outline"
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.mobileRow}>
            <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
            <Typography
              variant="body"
              color={COLORS.textLight}
              style={styles.mobile}
            >
              {client.mobile}
            </Typography>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "inquiries" && styles.activeTab]}
          onPress={() => setActiveTab("inquiries")}
        >
          <Typography
            variant="body"
            color={
              activeTab === "inquiries" ? COLORS.secondary : COLORS.textLight
            }
          >
            Inquiries ({inquiries.length})
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "appointments" && styles.activeTab]}
          onPress={() => setActiveTab("appointments")}
        >
          <Typography
            variant="body"
            color={
              activeTab === "appointments" ? COLORS.secondary : COLORS.textLight
            }
          >
            Appointments ({appointments.length})
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "inquiries" ? (
          inquiries.length > 0 ? (
            inquiries.map((inquiry) => (
              <Card key={inquiry.id} style={styles.itemCard}>
                <Typography variant="h3">{inquiry.intent}</Typography>
                {inquiry.remark && (
                  <Typography
                    variant="caption"
                    color={COLORS.textLight}
                    style={styles.remark}
                  >
                    {inquiry.remark}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  color={COLORS.textLight}
                  style={styles.date}
                >
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </Typography>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Typography variant="body" color={COLORS.textLight}>
                No inquiries yet
              </Typography>
            </View>
          )
        ) : appointments.length > 0 ? (
          appointments.map((appointment) => (
            <Card key={appointment.id} style={styles.itemCard}>
              <View style={styles.appointmentHeader}>
                <Typography variant="h3">
                  {new Date(appointment.appointmentAt).toLocaleDateString()}
                </Typography>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: COLORS.secondary },
                  ]}
                >
                  <Typography variant="caption" color={COLORS.white}>
                    {appointment.appointmentStatus}
                  </Typography>
                </View>
              </View>
              <Typography variant="body" style={styles.time}>
                {new Date(appointment.appointmentAt).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </Typography>
              {appointment.tattooDetail && (
                <Typography variant="caption" color={COLORS.textLight}>
                  {appointment.tattooDetail}
                </Typography>
              )}
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Typography variant="body" color={COLORS.textLight}>
              No appointments yet
            </Typography>
          </View>
        )}
      </ScrollView>

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
  headerContent: {
    gap: SPACING.tiny,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    paddingVertical: SPACING.tiny,
  },
  mobileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mobile: {
    marginLeft: SPACING.tiny,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.medium,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.medium,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },
  content: {
    flex: 1,
  },
  itemCard: {
    marginBottom: SPACING.medium,
  },
  remark: {
    marginTop: SPACING.tiny,
  },
  date: {
    marginTop: SPACING.tiny,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.tiny,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 4,
  },
  time: {
    marginBottom: SPACING.tiny,
  },
  emptyState: {
    padding: SPACING.xlarge,
    alignItems: "center",
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
