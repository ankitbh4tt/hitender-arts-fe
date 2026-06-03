import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import { COLORS, SPACING } from "../constants/theme";
import { ScreenContainer, Typography, Input, Button } from "../components";
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

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Typography variant="h2" style={styles.title}>
          Studio Settings
        </Typography>

        <Input
          label="Studio Name"
          value={studioName}
          onChangeText={setStudioName}
          placeholder="Hitender Arts"
        />
        <Input
          label="Studio WhatsApp Number"
          value={whatsappNumber}
          onChangeText={setWhatsappNumber}
          placeholder="10-digit number"
          keyboardType="phone-pad"
        />
        <Input
          label="Logo URL (optional)"
          value={logoUrl}
          onChangeText={setLogoUrl}
          placeholder="https://..."
          autoCapitalize="none"
        />

        <View style={styles.help}>
          <Typography variant="caption" color={COLORS.textLight}>
            Templates support placeholders:{" "}
            <Typography variant="caption" color={COLORS.primary}>
              {"{{clientName}}"}
            </Typography>
            ,{" "}
            <Typography variant="caption" color={COLORS.primary}>
              {"{{followUpType}}"}
            </Typography>
            ,{" "}
            <Typography variant="caption" color={COLORS.primary}>
              {"{{studioName}}"}
            </Typography>
          </Typography>
        </View>

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

        <Button title="Save Settings" onPress={handleSave} loading={saving} />
        <View style={{ height: SPACING.large }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { paddingVertical: SPACING.medium },
  title: { marginBottom: SPACING.large },
  help: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  multiline: { height: 120, textAlignVertical: "top" },
});
