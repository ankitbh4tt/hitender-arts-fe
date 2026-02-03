import { client } from "./client";
import { ApiResponse, Inquiry } from "./types";

export const InquiriesApi = {
  createInquiry: async (payload: Partial<Inquiry>): Promise<Inquiry> => {
    const response = await client.post<any, ApiResponse<Inquiry>>(
      "/inquiries",
      payload
    );
    return response.data!;
  },

  getInquiriesByClient: async (clientId: number): Promise<Inquiry[]> => {
    const response = await client.get<any, ApiResponse<Inquiry[]>>(
      `/inquiries/client/${clientId}`
    );
    return response.data || [];
  },
};
