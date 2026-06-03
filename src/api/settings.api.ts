import { client } from "./client";
import { ApiResponse, StudioSettings } from "./types";

export interface UpdateSettingsPayload {
  studioName?: string;
  whatsappNumber?: string | null;
  reminderTemplate?: string | null;
  aftercareTemplate?: string | null;
  logoUrl?: string | null;
}

export const SettingsApi = {
  getSettings: async (): Promise<StudioSettings> => {
    const response = await client.get<any, ApiResponse<StudioSettings>>(
      "/settings"
    );
    return response.data!;
  },

  updateSettings: async (
    payload: UpdateSettingsPayload
  ): Promise<StudioSettings> => {
    const response = await client.patch<any, ApiResponse<StudioSettings>>(
      "/settings",
      payload
    );
    return response.data!;
  },
};
