import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import {
  FormScreen,
  Typography,
  Input,
  Button,
  Card,
  FadeInView,
} from "../components";
import { useSettingsStore } from "../config/settingsStore";
import {
  DEFAULT_AFTERCARE_TEMPLATE,
  DEFAULT_REMINDER_TEMPLATE,
} from "../config/settingsStore";

export const Settings = () => {
  const { settings, fetchSettings, saveSettings } = useSettingsStore();

  const [studioName, setStudioName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [reminderTemplate, setReminderTemplate] = useState("");
  const [aftercareTemplate, setAftercareTemplate] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Hydrate the form whenever the stored settings change.
  useEffect(() => {
    if (settings) {
      setStudioName(settings.studioName || "");
      setWhatsappNumber(settings.whatsappNumber || "");
      setReminderTemplate(settings.reminderTemplate || DEFAULT_REMINDER_TEMPLATE);
      setAftercareTemplate(settings.aftercareTemplate || DEFAULT_AFTERCARE_TEMPLATE);
      setLogoUrl(settings.logoUrl || "");
    } else {
      fetchSettings();
    }
  }, [settings]);

  const handleSave = async () => {
    if (!studioName.trim()) {
      Toast.show({ type: "error", text1: "Studio name is required" });
      return;
    }
    setSaving(true);
    const ok = await saveSettings({
      studioName: studioName.trim(),
      whatsappNumber: whatsappNumber.trim() || null,
      reminderTemplate: reminderTemplate.trim() || null,
      aftercareTemplate: aftercareTemplate.trim() || null,
      logoUrl: logoUrl.trim() || null,
    });
    setSaving(false);
    Toast.show({
      type: ok ? "success" : "error",
      text1: ok ? "Settings saved" : "Failed to save settings",
    });
  };

  const Placeholder = ({ text }: { text: string }) => (
    <View style={styles.chip}>
      <Typography variant="overline" color={COLORS.secondaryDark}>
        {text}
      </Typography>
    </View>
  );

  return (
    <FormScreen title="Studio Settings" subtitle="Preferences" headerVariant="dark">
      <FadeInView>
        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
          Studio
        </Typography>
        <Input
          label="Studio Name"
          value={studioName}
          onChangeText={setStudioName}
          placeholder="Hitender Arts"
          icon="business-outline"
        />
        <Input
          label="Studio WhatsApp Number"
          value={whatsappNumber}
          onChangeText={setWhatsappNumber}
          placeholder="10-digit number"
          keyboardType="phone-pad"
          icon="logo-whatsapp"
        />
        <Input
          label="Logo URL (optional)"
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://..."
          autoCapitalize="none"
          icon="image-outline"
        />
      </FadeInView>

      <FadeInView index={1}>
        <Typography variant="overline" color={COLORS.textLight} style={styles.section}>
          Message Templates
        </Typography>

        <Card variant="flat" style={styles.help}>
          <View style={styles.helpHeader}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.secondaryDark} />
            <Typography variant="label" color={COLORS.textMuted} style={{ marginLeft: 6 }}>
              Available placeholders
            </Typography>
          </View>
          <View style={styles.chipRow}>
            <Placeholder text="{{clientName}}" />
            <Placeholder text="{{followUpType}}" />
            <Placeholder text="{{studioName}}" />
          </View>
        </Card>

        <Input
          label="Follow-Up Reminder Template"
          value={reminderTemplate}
          onChangeText={setReminderTemplate}
          placeholder={DEFAULT_REMINDER_TEMPLATE}
          multiline
          numberOfLines={5}
          style={styles.multiline}
        />
        <Input
          label="Aftercare Message Template"
          value={aftercareTemplate}
          onChangeText={setAftercareTemplate}
          placeholder={DEFAULT_AFTERCARE_TEMPLATE}
          multiline
          numberOfLines={5}
          style={styles.multiline}
        />

        <Button
          title="Save Settings"
          onPress={handleSave}
          variant="secondary"
          icon="checkmark-circle-outline"
          loading={saving}
        />
        <View style={{ height: SPACING.large }} />
      </FadeInView>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.small,
    marginTop: SPACING.small,
  },
  help: {
    backgroundColor: COLORS.secondaryTint,
    borderColor: "transparent",
    padding: SPACING.medium,
  },
  helpHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.small,
  },
  chip: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
  },
  multiline: { height: 120, textAlignVertical: "top" },
});
