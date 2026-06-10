import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, FONT_SIZE } from "../constants/theme";
import { useConfigStore } from "../config/store";
import { InquiriesApi } from "../api/inquiries.api";
import { ClientsApi } from "../api/clients.api";
import Toast from "react-native-toast-message";
import { Client, Inquiry as InquiryType, TattooSize, ReferenceType } from "../api/types";
import {
  FormScreen,
  Typography,
  Input,
  Button,
  SearchableSelect,
  ClientBanner,
  PressableScale,
  FadeInView,
} from "../components";

export const Inquiry = ({ route, navigation }: any) => {
  const params = route.params || {};
  const prefillClient: Client | undefined = params.client;
  const latestInquiry: InquiryType | undefined = params.latestInquiry;

  const [client, setClient] = useState<Client | undefined>(prefillClient);
  const [mobile, setMobile] = useState(prefillClient?.mobile || "");
  const { config } = useConfigStore();

  const [tattooSize, setTattooSize] = useState<TattooSize | null>(null);
  const [referenceType, setReferenceType] = useState<ReferenceType | null>(null);
  const [intent, setIntent] = useState(latestInquiry?.intent || "");
  const [remark, setRemark] = useState(latestInquiry?.remark || "");

  useEffect(() => {
    if (config) {
      if (latestInquiry?.tattooSizeId && !tattooSize) {
        const found = config.tattooSizes.find((s) => s.id === latestInquiry.tattooSizeId);
        if (found) setTattooSize(found);
      }
      if (latestInquiry?.referenceTypeId && !referenceType) {
        const found = config.referenceTypes.find((r) => r.id === latestInquiry.referenceTypeId);
        if (found) setReferenceType(found);
      }
    }
  }, [config, latestInquiry]);

  // Map reference types to include 'label' property for SearchableSelect
  const referenceTypeOptions =
    config?.referenceTypes?.map((r) => ({
      id: r.id,
      label: r.name,
      original: r,
    })) || [];

  const handleResolveMobile = async () => {
    if (mobile && mobile.length >= 10) {
      try {
        const response = await ClientsApi.resolveClientByMobile(mobile);
        setClient(response.client);

        if (response.latestInquiry) {
          const latest = response.latestInquiry;
          setIntent(latest.intent || "");
          setRemark(latest.remark || "");

          if (latest.tattooSizeId && config) {
            const foundSize = config.tattooSizes.find((s) => s.id === latest.tattooSizeId);
            if (foundSize) setTattooSize(foundSize);
          }
          if (latest.referenceTypeId && config) {
            const foundRef = config.referenceTypes.find((r) => r.id === latest.referenceTypeId);
            if (foundRef) setReferenceType(foundRef);
          }
        }
      } catch (error) {
        console.error("Failed to resolve client", error);
      }
    }
  };

  const handleSaveInquiry = async () => {
    if (!client) {
      await handleResolveMobile();
      if (!client) {
        Toast.show({ type: "error", text1: "Error", text2: "Please resolve a client first" });
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
      Toast.show({ type: "success", text1: "Success", text2: "Inquiry saved successfully" });
      navigation.navigate("ClientDetail", { client });
    } catch (error) {
      // Alert handled globally
    }
  };

  const handleClearForm = () => {
    setTattooSize(null);
    setReferenceType(null);
    setIntent("");
    setRemark("");
  };

  const handleSaveAndSetAppointment = async () => {
    if (!client) {
      await handleResolveMobile();
      if (!client) {
        Toast.show({ type: "error", text1: "Error", text2: "Please resolve a client first" });
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
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Inquiry saved. Proceeding to appointment.",
      });
      navigation.navigate("ScheduleAppointment", { inquiryId: response.id, client });
    } catch (error) {
      // Alert handled globally
    }
  };

  return (
    <FormScreen
      title={prefillClient ? "New Inquiry" : "New Inquiry"}
      subtitle="Lead"
      onBack={() => navigation.goBack()}
    >
      <FadeInView>
        {!prefillClient && (
          <>
            <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
              Client Mobile
            </Typography>
            <View style={styles.mobileRow}>
              <View style={styles.mobileField}>
                <Ionicons name="call-outline" size={FONT_SIZE.body + 2} color={COLORS.textLight} />
                <TextInput
                  style={styles.mobileInput}
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Enter mobile number"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <PressableScale onPress={handleResolveMobile} scaleTo={0.92} style={styles.resolveBtn}>
                <Ionicons name="search" size={FONT_SIZE.body + 4} color={COLORS.primary} />
              </PressableScale>
            </View>
          </>
        )}

        {client && (
          <ClientBanner name={client?.name} mobile={client?.mobile} icon="person-circle-outline" />
        )}
      </FadeInView>

      <FadeInView index={1}>
        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
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
          value={referenceType ? { id: referenceType.id, label: referenceType.name } : null}
          options={referenceTypeOptions}
          onSelect={(item: any) => setReferenceType(item.original)}
          placeholder="How did you hear about us?"
        />

        <Input
          label="Intent"
          value={intent}
          onChangeText={setIntent}
          placeholder="Tattoo idea or intent"
          icon="bulb-outline"
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
      </FadeInView>

      <FadeInView index={2} style={styles.actions}>
        <Button
          title="Clear Form"
          onPress={handleClearForm}
          variant="outline"
          icon="refresh-outline"
        />
        <Button
          title="Save Inquiry"
          onPress={handleSaveInquiry}
          variant="outline"
          icon="save-outline"
        />
        <Button
          title="Save & Set Appointment"
          onPress={handleSaveAndSetAppointment}
          variant="secondary"
          icon="calendar"
        />
        <View style={{ height: SPACING.medium }} />
      </FadeInView>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.small, marginTop: SPACING.small },
  mobileRow: {
    flexDirection: "row",
    gap: SPACING.small,
    marginBottom: SPACING.large,
  },
  mobileField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.medium,
  },
  mobileInput: {
    flex: 1,
    paddingVertical: SPACING.medium,
    marginLeft: SPACING.small,
    fontSize: FONT_SIZE.body,
    color: COLORS.text,
  },
  resolveBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.medium,
  },
  remarksInput: { height: 100, textAlignVertical: "top" },
  actions: { gap: SPACING.medium },
});
