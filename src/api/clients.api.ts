import { client } from "./client";
import { ApiResponse, Client, Inquiry } from "./types";

export const ClientsApi = {
  resolveClientByMobile: async (
    mobile: string
  ): Promise<{ client: Client; latestInquiry: Inquiry | null }> => {
    const response = await client.post<
      any,
      ApiResponse<{ client: Client; latestInquiry: Inquiry | null }>
    >("/clients", { mobile });
    return response.data || { client: {} as Client, latestInquiry: null };
  },

  getClientByMobile: async (mobile: string): Promise<Client | null> => {
    try {
      const response = await client.get<any, ApiResponse<Client>>(
        `/clients/mobile/${mobile}`
      );
      return response.data || null;
    } catch (error) {
      return null;
    }
  },

  getAllClients: async (): Promise<Client[]> => {
    const response = await client.get<any, ApiResponse<Client[]>>("/clients/all");
    return response.data || [];
  },

  updateClientInfo: async (
    clientId: number,
    data: { name?: string; gender?: string; location?: string }
  ): Promise<Client> => {
    const response = await client.patch<any, ApiResponse<Client>>(
      `/clients/${clientId}`,
      data
    );
    return response.data!;
  },
};
