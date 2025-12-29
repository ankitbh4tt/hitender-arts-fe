import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useConfigStore } from "../config/store";
import { COLORS, SPACING } from "../constants/theme";
import { ClientsApi } from "../api/clients.api";
import { ScreenContainer, Typography, Input, Button } from "../components";

export const MobileNumberEntry = ({ navigation }: any) => {
  const [mobile, setMobile] = useState("");
  const { config } = useConfigStore();

  const verifyIdentity = () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert("Validation", "Please enter a valid mobile number");
      return;
    }

    // Synchronous API call
    const response = ClientsApi.resolveClientByMobile(mobile);

    // Replace with CRM tabs and navigate to Inquiry
    navigation.replace("CRMRoot", {
      screen: "InquiriesTab",
      params: {
        screen: "Inquiry",
        params: response,
      },
    });
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.logoArea}>
        <Ionicons name="flower-outline" size={80} color={COLORS.primary} />
        <Typography variant="h1" align="center" style={styles.title}>
          HitenderArts
        </Typography>
        <Typography variant="body" align="center" color={COLORS.textLight}>
          Staff Access Portal
        </Typography>
      </View>

      <View style={styles.formArea}>
        {config?.labels?.welcome && (
          <Typography variant="body" align="center" style={styles.greeting}>
            {config.labels.welcome}
          </Typography>
        )}

        <Input
          label="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          placeholder="Enter 10-digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Button title="Verify Identity" onPress={verifyIdentity} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: SPACING.xxlarge,
  },
  title: {
    marginTop: SPACING.large,
    marginBottom: SPACING.tiny,
  },
  formArea: {
    paddingHorizontal: SPACING.large,
  },
  greeting: {
    marginBottom: SPACING.large,
  },
});
