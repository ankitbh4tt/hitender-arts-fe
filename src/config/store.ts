import { create } from "zustand";
import { ConfigApi } from "../api/config.api";

interface ConfigState {
  config: Record<string, any> | null;
  isLoading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  isLoading: false,
  error: null,
  fetchConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await ConfigApi.fetchConfig();
      set({ config: data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to load configuration", isLoading: false });
    }
  },
}));
