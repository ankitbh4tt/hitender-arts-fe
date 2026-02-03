import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../constants/theme";
import { useConfigStore } from "../config/store";
import { InquiriesApi } from "../api/inquiries.api";
import { ClientsApi } from "../api/clients.api";
import Toast from "react-native-toast-message";
import { Client, Inquiry as InquiryType, TattooSize, ReferenceType } from "../api/types";
import {
  ScreenContainer,
  Typography,
  Card,
  Input,
  Button,
  SearchableSelect,
} from "../components";

export const Inquiry = ({ route, navigation }: any) => {
  const params = route.params || {};
  const prefillClient: Client | undefined = params.client;
  const latestInquiry: InquiryType | undefined = params.latestInquiry;

  const [client, setClient] = useState<Client | undefined>(prefillClient);
  const [mobile, setMobile] = useState(prefillClient?.mobile || "");
  const { config, isLoading } = useConfigStore();

  const [tattooSize, setTattooSize] = useState<TattooSize | null>(null);
  const [referenceType, setReferenceType] = useState<ReferenceType | null>(null);
  const [intent, setIntent] = useState(latestInquiry?.intent || "");
  const [remark, setRemark] = useState(latestInquiry?.remark || "");

  useEffect(() => {
    if (config) {
      if (latestInquiry?.tattooSizeId && !tattooSize) {
        const found = config.tattooSizes.find(
          (s) => s.id === latestInquiry.tattooSizeId
        );
        if (found) setTattooSize(found);
      }
      if (latestInquiry?.referenceTypeId && !referenceType) {
        const found = config.referenceTypes.find(
          (r) => r.id === latestInquiry.referenceTypeId
        );
        if (found) setReferenceType(found);
      }
    }
  }, [config, latestInquiry]);

  // Map reference types to include 'label' property for SearchableSelect
  const referenceTypeOptions =
    config?.referenceTypes?.map((r) => ({
      id: r.id,
      label: r.name, // Use 'name' as 'label'
      original: r, // Keep reference to original object
    })) || [];

  const handleResolveMobile = async () => {
    if (mobile && mobile.length >= 10) {
      try {
        const response = await ClientsApi.resolveClientByMobile(mobile);
        setClient(response.client);
        
        // Auto-fill from latest inquiry if available
        if (response.latestInquiry) {
           const latest = response.latestInquiry;
           setIntent(latest.intent || "");
           setRemark(latest.remark || "");
           
           if (latest.tattooSizeId && config) {
             const foundSize = config.tattooSizes.find(s => s.id === latest.tattooSizeId);
             if (foundSize) setTattooSize(foundSize);
           }
           
           if (latest.referenceTypeId && config) {
             const foundRef = config.referenceTypes.find(r => r.id === latest.referenceTypeId);
             if (foundRef) setReferenceType(foundRef);
           }
        }
      } catch (error) {
        console.error("Failed to resolve client", error);
        // Alert handled globally
      }
    }
  };

  const handleSaveInquiry = async () => {
    if (!client) {
      await handleResolveMobile();
      if (!client) {
         Toast.show({
           type: "error",
           text1: "Error",
           text2: "Please resolve a client first",
         });
         return;
      }
    }

    const payload = {
      clientId: client!.id,
      tattooSizeId: tattooSize?.id,
      referenceTypeId: referenceType?.id,
      intent,
      remark,
    };

    try {
      await InquiriesApi.createInquiry(payload);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Inquiry saved successfully",
      });
      navigation.navigate("ClientsTab", {
        screen: "ClientDetail",
        params: { client },
      });
    } catch (error) {
       // Alert handled globally
    }
  };

  const handleSaveAndSetAppointment = async () => {
    if (!client) {
      await handleResolveMobile();
      if (!client) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please resolve a client first",
          });
          return;
      }
    }

    const payload = {
      clientId: client!.id,
      tattooSizeId: tattooSize?.id,
      referenceTypeId: referenceType?.id,
      intent,
      remark,
    };

    try {
      const response = await InquiriesApi.createInquiry(payload);

      // Navigate to Appointments tab -> ScheduleAppointment
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Inquiry saved. Proceeding to appointment.",
      });
      navigation.navigate("AppointmentsTab", {
        screen: "ScheduleAppointment",
        params: {
          inquiryId: response.id,
          client,
        },
      });
    } catch (error) {
       // Alert handled globally
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        {!prefillClient && (
          <Card style={styles.mobileCard}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Client Mobile
            </Typography>
            <View style={styles.mobileInputRow}>
              <TextInput
                style={styles.mobileInput}
                value={mobile}
                onChangeText={setMobile}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={10}
              />
              <TouchableOpacity
                onPress={handleResolveMobile}
                style={styles.resolveButton}
              >
                <Ionicons name="search" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {client && (
          <Card style={styles.clientCard}>
            <View style={styles.clientHeader}>
              <View style={styles.clientInfo}>
                <Typography variant="h3">{client?.name || "Client"}</Typography>
                <View style={styles.mobileRow}>
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={COLORS.textLight}
                  />
                  <Typography
                    variant="body"
                    color={COLORS.textLight}
                    style={styles.mobile}
                  >
                    {client?.mobile}
                  </Typography>
                </View>
              </View>
              <Ionicons
                name="person-circle-outline"
                size={48}
                color={COLORS.secondary}
              />
            </View>
          </Card>
        )}

        <View style={styles.formSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Tattoo Details
          </Typography>

          <SearchableSelect
            label="Tattoo Size"
            value={tattooSize}
            options={config?.tattooSizes || []}
            onSelect={(item) => setTattooSize(item as TattooSize)}
            placeholder="Select tattoo size"
          />

          <SearchableSelect
            label="Reference Type"
            value={
              referenceType
                ? { id: referenceType.id, label: referenceType.name }
                : null
            }
            options={referenceTypeOptions}
            onSelect={(item: any) => setReferenceType(item.original)}
            placeholder="How did you hear about us?"
          />

          <Input
            label="Intent"
            value={intent}
            onChangeText={setIntent}
            placeholder="Tattoo idea or intent"
          />

          <Input
            label="Remarks"
            value={remark}
            onChangeText={setRemark}
            placeholder="Additional notes or discussion points"
            multiline
            numberOfLines={4}
            style={styles.remarksInput}
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Save Inquiry"
            onPress={handleSaveInquiry}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Save & Set Appointment"
            onPress={handleSaveAndSetAppointment}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: SPACING.medium,
  },
  mobileCard: {
    marginBottom: SPACING.large,
  },
  mobileInputRow: {
    flexDirection: "row",
    gap: SPACING.small,
  },
  mobileInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: 16,
    color: COLORS.text,
  },
  resolveButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: SPACING.medium,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
  clientCard: {
    marginBottom: SPACING.large,
  },
  clientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  formSection: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    marginBottom: SPACING.medium,
  },
  remarksInput: {
    height: 100,
    textAlignVertical: "top",
  },
  actions: {
    gap: SPACING.medium,
  },
  actionButton: {
    marginBottom: SPACING.small,
  },
});
