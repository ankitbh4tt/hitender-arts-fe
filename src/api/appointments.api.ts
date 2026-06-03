import { client } from "./client";
import { ApiResponse, Appointment, PaymentMethod } from "./types";

export interface CreateAppointmentPayload {
  inquiryId: number;
  appointmentAt: string; // ISO
  tattooDetail?: string;
  durationMinutes?: number;
  notes?: string;
  advanceAmount?: number;
  referencePhotoUrl?: string;
}

export interface CompleteAppointmentPayload {
  paymentMethod: PaymentMethod;
  amount: number;
  completionNotes?: string;
  completedPhotoUrl?: string;
}

export const AppointmentsApi = {
  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    const response = await client.get<any, ApiResponse<Appointment[]>>(
      "/appointments/upcoming"
    );
    return response.data || [];
  },

  // All appointments (any status) for a calendar day. date = "YYYY-MM-DD".
  getAppointmentsByDate: async (date: string): Promise<Appointment[]> => {
    const response = await client.get<any, ApiResponse<Appointment[]>>(
      `/appointments/by-date`,
      { params: { date } }
    );
    return response.data || [];
  },

  getAppointmentsByClient: async (clientId: number): Promise<Appointment[]> => {
    const response = await client.get<any, ApiResponse<Appointment[]>>(
      `/appointments/client/${clientId}`
    );
    return response.data || [];
  },

  createAppointment: async (
    payload: CreateAppointmentPayload
  ): Promise<Appointment> => {
    const response = await client.post<any, ApiResponse<Appointment>>(
      "/appointments/new",
      payload
    );
    return response.data!;
  },

  rescheduleAppointment: async (
    id: number,
    date: Date,
    durationMinutes?: number
  ): Promise<Appointment> => {
    const body: Record<string, unknown> = { rescheduleTime: date.toISOString() };
    if (durationMinutes !== undefined) body.durationMinutes = durationMinutes;
    const response = await client.patch<any, ApiResponse<Appointment>>(
      `/appointments/reschedule/${id}`,
      body
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

  completeAppointment: async (
    id: number,
    payload: CompleteAppointmentPayload
  ): Promise<Appointment> => {
    const response = await client.patch<any, ApiResponse<Appointment>>(
      `/appointments/complete/${id}`,
      payload
    );
    return response.data!;
  },
};
