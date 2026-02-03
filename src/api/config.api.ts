import { client } from "./client";
import {
  ApiResponse,
  ClientStatus,
  AppointmentStatus,
  ReferenceType,
  TattooSize,
} from "./types";

export const ConfigApi = {
  fetchConfig: async (): Promise<{
    tattooSizes: TattooSize[];
    referenceTypes: ReferenceType[];
    appointmentStatuses: AppointmentStatus[];
    clientStatuses: ClientStatus[];
  }> => {
    try {
      const [
        tattooSizesRes,
        referenceTypesRes,
        appointmentStatusesRes,
        clientStatusesRes,
      ] = await Promise.all([
        client.get<any, ApiResponse<TattooSize[]>>("/config/tattoo-sizes"),
        client.get<any, ApiResponse<ReferenceType[]>>("/config/reference-types"),
        client.get<any, ApiResponse<AppointmentStatus[]>>(
          "/config/appointment-statuses"
        ),
        client.get<any, ApiResponse<ClientStatus[]>>("/config/client-statuses"),
      ]);

      return {
        tattooSizes: tattooSizesRes.data || [],
        referenceTypes: referenceTypesRes.data || [],
        appointmentStatuses: appointmentStatusesRes.data || [],
        clientStatuses: clientStatusesRes.data || [],
      };
    } catch (error) {
      console.error("Failed to fetch config", error);
      throw error;
    }
  },
};
