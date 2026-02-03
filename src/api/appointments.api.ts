import { client } from "./client";
import { ApiResponse, Appointment } from "./types";

export const AppointmentsApi = {
  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    const response = await client.get<any, ApiResponse<Appointment[]>>(
      "/appointments/upcoming"
    );
    return response.data || [];
  },

  getAppointmentsByClient: async (clientId: number): Promise<Appointment[]> => {
    const response = await client.get<any, ApiResponse<Appointment[]>>(
      `/appointments/client/${clientId}`
    );
    return response.data || [];
  },

  createAppointment: async (payload: any): Promise<Appointment> => {
    const response = await client.post<any, ApiResponse<Appointment>>(
      "/appointments/new",
      payload
    );
    return response.data!;
  },

  rescheduleAppointment: async (
    id: number,
    date: Date
  ): Promise<Appointment> => {
    const response = await client.patch<any, ApiResponse<Appointment>>(
      `/appointments/reschedule/${id}`,
      {
        rescheduleTime: date.toISOString(),
      }
    );
    return response.data!;
  },

  cancelAppointment: async (id: number): Promise<Appointment> => {
    const response = await client.patch<any, ApiResponse<Appointment>>(
      `/appointments/cancel/${id}`
    );
    return response.data!;
  },

  markNoShow: async (id: number): Promise<Appointment> => {
    const response = await client.patch<any, ApiResponse<Appointment>>(
      `/appointments/no-show/${id}`
    );
    return response.data!;
  },

  completeAppointment: async (id: number): Promise<Appointment> => {
    const response = await client.patch<any, ApiResponse<Appointment>>(
      `/appointments/complete/${id}`
    );
    return response.data!;
  },
};
