import { DataStore } from "../data/store";

export const AppointmentsApi = {
  getUpcomingAppointments: (date?: string) => {
    const selectedDate = date || new Date().toISOString();
    return DataStore.getAppointmentsByDate(selectedDate);
  },

  createAppointment: (data: any) => {
    return DataStore.createAppointment(data);
  },

  rescheduleAppointment: (id: number, date: string) => {
    return DataStore.updateAppointment(id, {
      appointmentAt: date,
      appointmentStatus: "RESCHEDULED",
    });
  },

  cancelAppointment: (id: number) => {
    return DataStore.updateAppointment(id, { appointmentStatus: "CANCELLED" });
  },

  markNoShow: (id: number) => {
    return DataStore.updateAppointment(id, { appointmentStatus: "NO_SHOW" });
  },
};
