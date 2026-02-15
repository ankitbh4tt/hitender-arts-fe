import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHADOWS } from "../constants/theme";
import { Client, Inquiry, Appointment } from "../api/types";
import { InquiriesApi } from "../api/inquiries.api";
import { AppointmentsApi } from "../api/appointments.api";
import { ClientsApi } from "../api/clients.api";
import {
  ScreenContainer,
  Typography,
  Card,
  Button,
  Input,
} from "../components";

export const ClientDetail = ({ route, navigation }: any) => {
  const { client: initialClient }: { client: Client } = route.params;
  const [client, setClient] = useState<Client>(initialClient);
  const [activeTab, setActiveTab] = useState<"inquiries" | "appointments">(
    "inquiries"
  );
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState(client.name || "");
  const [clientGender, setClientGender] = useState(client.gender || "");
  const [clientLocation, setClientLocation] = useState(client.location || "");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [savingClientInfo, setSavingClientInfo] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const genderOptions = ["Male", "Female", "Other"];

  useFocusEffect(
    useCallback(() => {
      // Sync client from route params in case it was updated elsewhere
      if (route.params?.client) {
        const updatedClient = route.params.client;
        setClient(updatedClient);
        setClientName(updatedClient.name || "");
        setClientGender(updatedClient.gender || "");
        setClientLocation(updatedClient.location || "");
      }
      fetchClientData();
    }, [route.params?.client])
  );

  const fetchClientData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [inquiriesData, appointmentsData] = await Promise.all([
        InquiriesApi.getInquiriesByClient(client.id),
        AppointmentsApi.getAppointmentsByClient(client.id),
      ]);
      setInquiries(inquiriesData);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Failed to fetch client history", error);
      // Alert handled globally
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClientData();
  };

  const handleCall = () => {
    let phoneNumber = "";
    if (Platform.OS === "android") {
      phoneNumber = `tel:${client.mobile}`;
    } else {
      phoneNumber = `telprompt:${client.mobile}`;
    }
    Linking.openURL(phoneNumber);
  };

  const handleWhatsApp = () => {
    let phoneNumber = "91" + client.mobile;
    let url = `whatsapp://send?phone=${phoneNumber}`;
    Linking.openURL(url);
  };

  const handleSaveClientInfo = async () => {
    try {
      setSavingClientInfo(true);
      const updateData: { name?: string; gender?: string; location?: string } = {};
      
      if (clientName.trim() !== (client.name || "")) {
        updateData.name = clientName.trim() || undefined;
      }
      if (clientGender !== (client.gender || "")) {
        updateData.gender = clientGender.trim() || undefined;
      }
      if (clientLocation.trim() !== (client.location || "")) {
        updateData.location = clientLocation.trim() || undefined;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedClient = await ClientsApi.updateClientInfo(client.id, updateData);
      setClient(updatedClient);
      setClientName(updatedClient.name || "");
      setClientGender(updatedClient.gender || "");
      setClientLocation(updatedClient.location || "");
      setIsEditing(false);
      Alert.alert("Success", "Client information updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update client information");
    } finally {
      setSavingClientInfo(false);
    }
  };

  const handleCancelEdit = () => {
    setClientName(client.name || "");
    setClientGender(client.gender || "");
    setClientLocation(client.location || "");
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleGenderSelect = (gender: string) => {
    setClientGender(gender);
    setGenderModalVisible(false);
  };

  const handleReschedule = (appointment: Appointment) => {
    navigation.navigate("AppointmentsTab", {
      screen: "RescheduleAppointment",
      params: { appointment },
    });
  };

  const handleCancel = async (appointmentId: number) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(appointmentId);
              await AppointmentsApi.cancelAppointment(appointmentId);
              Alert.alert("Success", "Appointment cancelled");
              fetchClientData();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to cancel appointment"
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleNoShow = async (appointmentId: number) => {
    Alert.alert("Mark No-Show", "Mark this appointment as No-Show?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: async () => {
          try {
            setProcessingId(appointmentId);
            await AppointmentsApi.markNoShow(appointmentId);
            Alert.alert("Success", "Marked as no-show");
            fetchClientData();
          } catch (error: any) {
             Alert.alert("Error", error.message || "Failed to mark no-show");
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };


  const handleComplete = async (appointmentId: number) => {
    Alert.alert(
      "Complete Appointment",
      "Mark this appointment as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setProcessingId(appointmentId);
              await AppointmentsApi.completeAppointment(appointmentId);
              Alert.alert("Success", "Appointment marked as completed");
              fetchClientData();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to complete appointment");
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const renderInquiryItem = (item: Inquiry) => (
    <Card key={item.id} style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Typography variant="h3">
          {new Date(item.createdAt).toLocaleDateString()}
        </Typography>
        <View style={styles.tag}>
          <Typography variant="caption" color={COLORS.primary}>
            {item.tattooSize?.label || "Unknown Size"}
          </Typography>
        </View>
      </View>
      <Typography variant="body" style={styles.historyBody}>
        {item.intent || "No details provided"}
      </Typography>
      {item.referenceType && (
        <View style={styles.metaRow}>
          <Ionicons
            name="pricetag-outline"
            size={12}
            color={COLORS.textLight}
          />
          <Typography variant="caption" color={COLORS.textLight}>
            Ref: {item.referenceType.name}
          </Typography>
        </View>
      )}
      
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.scheduleBtn}
          onPress={() => {
            navigation.navigate("AppointmentsTab", {
              screen: "ScheduleAppointment",
              params: {
                inquiryId: item.id,
                client: client,
              },
            });
          }}
        >
          <Ionicons name="calendar" size={16} color={COLORS.white} />
          <Typography variant="caption" color={COLORS.white}>
            Schedule Appointment
          </Typography>
        </TouchableOpacity>
      </View>
    </Card>
  );

  // ... rest of component

  const renderAppointmentItem = (item: Appointment) => (
    <Card key={item.id} style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Typography variant="h3">
          {new Date(item.appointmentAt).toLocaleDateString()}
        </Typography>
        <View
          style={[
            styles.tag,
            {
              backgroundColor:
                item.appointmentStatus?.code === "SCHEDULED"
                  ? COLORS.success + "20"
                  : COLORS.border,
            },
          ]}
        >
          <Typography
            variant="caption"
            color={
              item.appointmentStatus?.code === "SCHEDULED"
                ? COLORS.success
                : COLORS.textLight
            }
          >
            {item.appointmentStatus?.label}
          </Typography>
        </View>
      </View>
      <Typography variant="caption" style={styles.timeLabel}>
        {new Date(item.appointmentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Typography>
      {item.tattooDetail && (
        <Typography variant="body" style={styles.historyBody}>
          {item.tattooDetail}
        </Typography>
      )}

      {item.appointmentStatus?.code === "SCHEDULED" && (
        <View style={styles.cardActions}>
          {new Date(item.appointmentAt) < new Date() ? (
             <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleComplete(item.id)}
                  disabled={processingId === item.id}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={processingId === item.id ? COLORS.textLight : COLORS.success}
                  />
                  <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.success}>
                    Complete
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleNoShow(item.id)}
                  disabled={processingId === item.id}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={processingId === item.id ? COLORS.textLight : COLORS.error}
                  />
                  <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.error}>
                    No-Show
                  </Typography>
                </TouchableOpacity>
             </>
          ) : (
             <>
               <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleReschedule(item)}
                  disabled={processingId !== null}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={processingId !== null ? COLORS.textLight : COLORS.primary}
                  />
                  <Typography variant="caption" color={processingId !== null ? COLORS.textLight : COLORS.primary}>
                    Reschedule
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleComplete(item.id)}
                  disabled={processingId === item.id}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={processingId === item.id ? COLORS.textLight : COLORS.success}
                  />
                   <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.success}>
                    Complete
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleNoShow(item.id)}
                  disabled={processingId === item.id}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={processingId === item.id ? COLORS.textLight : COLORS.error}
                  />
                  <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.error}>
                    No-Show
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCancel(item.id)}
                  disabled={processingId === item.id}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color={processingId === item.id ? COLORS.textLight : COLORS.error}
                  />
                  <Typography variant="caption" color={processingId === item.id ? COLORS.textLight : COLORS.error}>
                    Cancel
                  </Typography>
                </TouchableOpacity>
             </>
          )}
        </View>
      )}
    </Card>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Typography variant="h3">Client Details</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Typography variant="h1" color={COLORS.white}>
              {(client.name || "U")[0].toUpperCase()}
            </Typography>
          </View>
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.editRow}>
                <Typography variant="label" style={styles.editLabel}>
                  Name
                </Typography>
                <Input
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="Client Name"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>

              <View style={styles.editRow}>
                <Typography variant="label" style={styles.editLabel}>
                  Gender
                </Typography>
                <TouchableOpacity
                  style={styles.genderPicker}
                  onPress={() => setGenderModalVisible(true)}
                >
                  <Typography
                    variant="body"
                    color={clientGender ? COLORS.text : COLORS.textLight}
                  >
                    {clientGender || "Select Gender"}
                  </Typography>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>

              <View style={styles.editRow}>
                <Typography variant="label" style={styles.editLabel}>
                  Location
                </Typography>
                <Input
                  value={clientLocation}
                  onChangeText={setClientLocation}
                  placeholder="Location"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={styles.cancelBtn}
                  disabled={savingClientInfo}
                >
                  <Typography variant="body" color={COLORS.error}>
                    Cancel
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveClientInfo}
                  style={styles.saveBtn}
                  disabled={savingClientInfo}
                >
                  {savingClientInfo ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Typography variant="body" color={COLORS.white}>
                      Save
                    </Typography>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.nameRow}>
                <Typography variant="h2">{clientName || "Unknown"}</Typography>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                <Typography
                  variant="body"
                  color={clientGender ? COLORS.text : COLORS.textLight}
                >
                  {clientGender || "Not set"}
                </Typography>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                <Typography
                  variant="body"
                  color={clientLocation ? COLORS.text : COLORS.textLight}
                >
                  {clientLocation || "Not set"}
                </Typography>
              </View>

              <TouchableOpacity
                onPress={handleStartEdit}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={18} color={COLORS.white} />
                <Typography variant="body" color={COLORS.white}>
                  Edit Info
                </Typography>
              </TouchableOpacity>
            </>
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

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color={COLORS.white} />
              <Typography variant="caption" color={COLORS.white}>
                Call
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#25D366" }]}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
              <Typography variant="caption" color={COLORS.white}>
                WhatsApp
              </Typography>
            </TouchableOpacity>
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
            style={[
              styles.tab,
              activeTab === "appointments" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("appointments")}
          >
            <Typography
              variant="body"
              color={
                activeTab === "appointments"
                  ? COLORS.secondary
                  : COLORS.textLight
              }
            >
              Appointments ({appointments.length})
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={COLORS.secondary} />
          ) : activeTab === "inquiries" ? (
            inquiries.length > 0 ? (
              inquiries.map((item) => renderInquiryItem(item))
            ) : (
              <Typography
                variant="body"
                align="center"
                color={COLORS.textLight}
                style={{ marginTop: 20 }}
              >
                No inquiries found
              </Typography>
            )
          ) : appointments.length > 0 ? (
            appointments.map((item) => renderAppointmentItem(item))
          ) : (
            <Typography
              variant="body"
              align="center"
              color={COLORS.textLight}
              style={{ marginTop: 20 }}
            >
              No appointments found
            </Typography>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Pass the latest inquiry (first in the list since they should be ordered by date desc)
          const latestInquiry = inquiries.length > 0 ? inquiries[0] : undefined;
          navigation.navigate("InquiriesTab", {
            screen: "Inquiry",
            params: { client, latestInquiry }
          });
        }}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      <Modal
        visible={genderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h3">Select Gender</Typography>
              <TouchableOpacity onPress={() => setGenderModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {genderOptions.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  clientGender === gender && styles.genderOptionSelected,
                ]}
                onPress={() => handleGenderSelect(gender)}
              >
                <Typography
                  variant="body"
                  color={
                    clientGender === gender ? COLORS.secondary : COLORS.text
                  }
                >
                  {gender}
                </Typography>
                {clientGender === gender && (
                  <Ionicons
                    name="checkmark"
                    size={24}
                    color={COLORS.secondary}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.genderOption}
              onPress={() => handleGenderSelect("")}
            >
              <Typography variant="body" color={COLORS.textLight}>
                Clear
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.medium,
  },
  backBtn: {
    padding: SPACING.tiny,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: SPACING.large,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.medium,
    ...SHADOWS.light,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    marginBottom: SPACING.tiny,
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    gap: SPACING.small,
  },
  saveIconBtn: {
    padding: SPACING.tiny,
  },
  editForm: {
    width: "85%",
    marginBottom: SPACING.medium,
  },
  editRow: {
    marginBottom: SPACING.medium,
  },
  editLabel: {
    marginBottom: SPACING.tiny,
    color: COLORS.textLight,
  },
  genderPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.small,
    backgroundColor: COLORS.background,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.medium,
    marginTop: SPACING.small,
  },
  cancelBtn: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.small,
    gap: SPACING.tiny,
  },
  infoValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.tiny,
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    gap: SPACING.tiny,
    marginTop: SPACING.small,
    alignSelf: "center",
    ...SHADOWS.light,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.large,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  genderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.background,
  },
  mobileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  mobile: {
    marginLeft: SPACING.tiny,
  },
  actionRow: {
    flexDirection: "row",
    gap: SPACING.medium,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 20,
    gap: SPACING.tiny,
    ...SHADOWS.light,
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
  listContainer: {
    flex: 1,
  },
  historyCard: {
    marginBottom: SPACING.medium,
    padding: SPACING.medium,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.tiny,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.small,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyBody: {
    marginBottom: SPACING.small,
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeLabel: {
    color: COLORS.textLight,
    marginBottom: SPACING.tiny,
  },
  cardActions: {
    marginTop: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.small,
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: SPACING.tiny,
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: SPACING.medium,
    borderRadius: 4,
    gap: SPACING.tiny,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.tiny,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
  },
  fab: {
    position: "absolute",
    right: SPACING.large,
    bottom: SPACING.large,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
  },
});
