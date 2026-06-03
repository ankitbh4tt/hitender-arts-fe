import { create } from "zustand";
import { SettingsApi, UpdateSettingsPayload } from "../api/settings.api";
import { StudioSettings } from "../api/types";

export const DEFAULT_REMINDER_TEMPLATE =
  "Hi {{clientName}}, this is Hitender.tattoo. Hope your tattoo is healing well. Please send a clear photo of your tattoo for the {{followUpType}} follow-up.";

export const DEFAULT_AFTERCARE_TEMPLATE =
  "Hi {{clientName}}, thanks for getting tattooed at Hitender.tattoo! Keep it clean, apply a thin layer of aftercare cream, avoid sun and swimming, and don't pick at it. Reach out anytime if you have questions.";

interface SettingsState {
  settings: StudioSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  saveSettings: (payload: UpdateSettingsPayload) => Promise<boolean>;
  reminderTemplate: () => string;
  aftercareTemplate: () => string;
  studioName: () => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await SettingsApi.getSettings();
      set({ settings, isLoading: false });
    } catch (e) {
      set({ error: "Failed to load studio settings", isLoading: false });
    }
  },

  saveSettings: async (payload) => {
    try {
      const settings = await SettingsApi.updateSettings(payload);
      set({ settings });
      return true;
    } catch (e) {
      return false;
    }
  },

  reminderTemplate: () =>
    get().settings?.reminderTemplate || DEFAULT_REMINDER_TEMPLATE,
  aftercareTemplate: () =>
    get().settings?.aftercareTemplate || DEFAULT_AFTERCARE_TEMPLATE,
  studioName: () => get().settings?.studioName || "Hitender Arts",
}));
