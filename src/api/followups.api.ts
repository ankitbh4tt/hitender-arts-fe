import { client } from "./client";
import { ApiResponse, FollowUp } from "./types";

export const FollowUpsApi = {
  getDueToday: async (): Promise<FollowUp[]> => {
    const response = await client.get<any, ApiResponse<FollowUp[]>>(
      "/follow-ups/today"
    );
    return response.data || [];
  },

  getDueThisWeek: async (): Promise<FollowUp[]> => {
    const response = await client.get<any, ApiResponse<FollowUp[]>>(
      "/follow-ups/week"
    );
    return response.data || [];
  },

  getCompleted: async (): Promise<FollowUp[]> => {
    const response = await client.get<any, ApiResponse<FollowUp[]>>(
      "/follow-ups/completed"
    );
    return response.data || [];
  },

  markComplete: async (id: number): Promise<FollowUp> => {
    const response = await client.patch<any, ApiResponse<FollowUp>>(
      `/follow-ups/${id}/complete`
    );
    return response.data!;
  },
};
