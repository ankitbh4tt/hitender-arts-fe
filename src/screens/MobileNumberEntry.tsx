import React, { useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useConfigStore } from "../config/store";
import { COLORS, SPACING } from "../constants/theme";
import { ClientsApi } from "../api/clients.api";
import { ScreenContainer, Typography, Input, Button } from "../components";

export const MobileNumberEntry = ({ navigation }: any) => {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const { config } = useConfigStore();

  const verifyIdentity = async () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert("Validation", "Please enter a valid mobile number");
      return;
    }

    setLoading(true);
    try {
      const response = await ClientsApi.resolveClientByMobile(mobile);

      // Navigate to main app
      navigation.replace("CRMRoot", {
        screen: "InquiriesTab",
        params: {
          screen: "Inquiry",
          params: response,
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to verify. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
        <Typography variant="body" align="center" style={styles.greeting}>
          Welcome to HitenderArts Studio
        </Typography>

        <Input
          label="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          placeholder="Enter 10-digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          editable={!loading}
        />

        <Button 
          title="Verify Identity" 
          onPress={verifyIdentity} 
          loading={loading}
          disabled={loading}
        />
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
