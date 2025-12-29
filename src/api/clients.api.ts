import { DataStore } from "../data/store";

export const ClientsApi = {
  resolveClientByMobile: (mobile: string) => {
    const client = DataStore.getClientByMobile(mobile);
    const latestInquiry = client ? DataStore.getLatestInquiry(client.id) : null;

    return {
      client,
      latestInquiry,
    };
  },
};
