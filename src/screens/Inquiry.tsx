import React, { useState } from "react";
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
  const prefillClient = params.client;

  const [client, setClient] = useState(prefillClient);
  const [mobile, setMobile] = useState(prefillClient?.mobile || "");
  const { config } = useConfigStore();

  const latestInquiry = client ? params.latestInquiry : null;

  const [tattooSize, setTattooSize] = useState<any>(
    latestInquiry?.tattooSizeId
      ? config?.tattooSizes?.find(
          (s: any) => s.id === latestInquiry.tattooSizeId
        )
      : null
  );
  const [referenceType, setReferenceType] = useState<any>(
    latestInquiry?.referenceTypeId
      ? config?.referenceTypes?.find(
          (r: any) => r.id === latestInquiry.referenceTypeId
        )
      : null
  );
  const [intent, setIntent] = useState(latestInquiry?.intent || "");
  const [remark, setRemark] = useState(latestInquiry?.remark || "");

  const handleResolveMobile = () => {
    if (mobile && mobile.length >= 10) {
      const response = ClientsApi.resolveClientByMobile(mobile);
      setClient(response.client);
    }
  };

  const handleSaveInquiry = () => {
    if (!client) {
      handleResolveMobile();
      if (!client) return;
    }

    const payload = {
      clientId: client.id,
      tattooSizeId: tattooSize?.id,
      referenceTypeId: referenceType?.id,
      intent,
      remark,
    };

    InquiriesApi.createInquiry(payload);
    navigation.goBack();
  };

  const handleSaveAndSetAppointment = () => {
    if (!client) {
      handleResolveMobile();
      if (!client) return;
    }

    const payload = {
      clientId: client.id,
      tattooSizeId: tattooSize?.id,
      referenceTypeId: referenceType?.id,
      intent,
      remark,
    };

    const response = InquiriesApi.createInquiry(payload);

    // Navigate to Appointments tab -> ScheduleAppointment
    navigation.navigate("AppointmentsTab", {
      screen: "ScheduleAppointment",
      params: {
        inquiryId: response.id,
        client,
      },
    });
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
            onSelect={setTattooSize}
            placeholder="Select tattoo size"
          />

          <SearchableSelect
            label="Reference Type"
            value={referenceType}
            options={config?.referenceTypes || []}
            onSelect={setReferenceType}
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
