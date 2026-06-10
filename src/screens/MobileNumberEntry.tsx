import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useConfigStore } from "../config/store";
import { COLORS, SPACING, RADIUS, SCREEN, scale } from "../constants/theme";
import { ClientsApi } from "../api/clients.api";
import {
  ScreenContainer,
  Typography,
  Input,
  Button,
  FadeInView,
} from "../components";

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

      // Navigate to main app (Clients tab → Inquiry, prefilled with the client)
      navigation.replace("CRMRoot", {
        screen: "ClientsTab",
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
      <View style={styles.inner}>
        <FadeInView style={styles.logoArea}>
          <View style={styles.monogram}>
            <Typography variant="display" color={COLORS.secondary} weight="bold">
              H
            </Typography>
          </View>
          <Typography variant="h1" align="center" style={styles.title}>
            Hitender Arts
          </Typography>
          <View style={styles.tagRow}>
            <Ionicons name="sparkles" size={scale(13)} color={COLORS.secondaryDark} />
            <Typography variant="overline" color={COLORS.secondaryDark} style={styles.tagText}>
              Tattoo Studio · Staff Portal
            </Typography>
          </View>
        </FadeInView>

        <FadeInView index={1} style={styles.formArea}>
          <Typography variant="body" align="center" color={COLORS.textMuted} style={styles.greeting}>
            Welcome back. Enter your number to continue.
          </Typography>

          <Input
            label="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            placeholder="Enter 10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading}
            icon="call-outline"
          />

          <Button
            title="Verify Identity"
            onPress={verifyIdentity}
            variant="secondary"
            loading={loading}
            disabled={loading}
          />
        </FadeInView>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: SCREEN.maxContentWidth,
    alignSelf: "center",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: SPACING.xxlarge,
  },
  monogram: {
    width: scale(92),
    height: scale(92),
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  title: {
    marginTop: SPACING.large,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.tiny,
  },
  tagText: { marginLeft: 6 },
  formArea: {
    width: "100%",
  },
  greeting: {
    marginBottom: SPACING.large,
  },
});
