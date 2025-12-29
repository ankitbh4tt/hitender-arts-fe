// In-memory data store for the CRM
// All mutations happen synchronously

export interface Client {
  id: number;
  name: string;
  mobile: string;
  currentStatus: string;
}

export interface Inquiry {
  id: number;
  clientId: number;
  intent: string;
  remark?: string;
  tattooSizeId?: number;
  referenceTypeId?: number;
  createdAt: string;
}

export interface Appointment {
  id: number;
  clientId: number;
  inquiryId: number;
  appointmentAt: string;
  appointmentStatus: string;
  tattooDetail?: string;
  client: {
    id: number;
    name: string;
    mobile: string;
  };
}

// Seed data
const CLIENTS: Client[] = [
  { id: 1, name: "Aman Verma", mobile: "9876543210", currentStatus: "ACTIVE" },
  { id: 2, name: "Rohit Singh", mobile: "9123456789", currentStatus: "ACTIVE" },
  { id: 3, name: "Karan Mehta", mobile: "9988776655", currentStatus: "ACTIVE" },
  { id: 4, name: "Neha Kapoor", mobile: "9090909090", currentStatus: "ACTIVE" },
  {
    id: 5,
    name: "Pooja Sharma",
    mobile: "9812345678",
    currentStatus: "ACTIVE",
  },
  { id: 6, name: "Arjun Patel", mobile: "9345612789", currentStatus: "ACTIVE" },
];

const INQUIRIES: Inquiry[] = [
  {
    id: 101,
    clientId: 1,
    intent: "Forearm dragon tattoo",
    remark: "Black and grey",
    tattooSizeId: 2,
    referenceTypeId: 1,
    createdAt: "2025-12-20T10:00:00Z",
  },
  {
    id: 102,
    clientId: 2,
    intent: "Back piece tribal design",
    remark: "Full back coverage",
    tattooSizeId: 3,
    referenceTypeId: 2,
    createdAt: "2025-12-21T12:00:00Z",
  },
  {
    id: 103,
    clientId: 3,
    intent: "Minimal wrist tattoo",
    remark: "Small symbol",
    tattooSizeId: 1,
    referenceTypeId: 1,
    createdAt: "2025-12-22T15:00:00Z",
  },
  {
    id: 104,
    clientId: 1,
    intent: "Cover-up old tattoo",
    remark: "Chest area",
    tattooSizeId: 2,
    referenceTypeId: 1,
    createdAt: "2025-12-23T11:30:00Z",
  },
  {
    id: 105,
    clientId: 4,
    intent: "Mandala shoulder design",
    remark: "Detailed work",
    tattooSizeId: 2,
    referenceTypeId: 2,
    createdAt: "2025-12-24T17:00:00Z",
  },
  {
    id: 106,
    clientId: 5,
    intent: "Name tattoo on collarbone",
    remark: "Cursive font",
    tattooSizeId: 1,
    referenceTypeId: 1,
    createdAt: "2025-12-25T14:00:00Z",
  },
  {
    id: 107,
    clientId: 6,
    intent: "Full sleeve tattoo",
    remark: "Japanese style",
    tattooSizeId: 3,
    referenceTypeId: 2,
    createdAt: "2025-12-26T16:00:00Z",
  },
];

const APPOINTMENTS: Appointment[] = [
  {
    id: 201,
    clientId: 1,
    client: { id: 1, name: "Aman Verma", mobile: "9876543210" },
    inquiryId: 101,
    appointmentAt: "2025-12-30T11:00:00.000Z",
    appointmentStatus: "SCHEDULED",
    tattooDetail: "Forearm dragon - black and grey shading",
  },
  {
    id: 202,
    clientId: 2,
    client: { id: 2, name: "Rohit Singh", mobile: "9123456789" },
    inquiryId: 102,
    appointmentAt: "2025-12-28T13:00:00.000Z",
    appointmentStatus: "COMPLETED",
    tattooDetail: "Back tribal design completed",
  },
  {
    id: 203,
    clientId: 3,
    client: { id: 3, name: "Karan Mehta", mobile: "9988776655" },
    inquiryId: 103,
    appointmentAt: "2025-12-29T16:00:00.000Z",
    appointmentStatus: "SCHEDULED",
    tattooDetail: "Minimal wrist symbol",
  },
  {
    id: 204,
    clientId: 4,
    client: { id: 4, name: "Neha Kapoor", mobile: "9090909090" },
    inquiryId: 105,
    appointmentAt: "2025-12-27T10:00:00.000Z",
    appointmentStatus: "NO_SHOW",
    tattooDetail: "Mandala shoulder design",
  },
  {
    id: 205,
    clientId: 5,
    client: { id: 5, name: "Pooja Sharma", mobile: "9812345678" },
    inquiryId: 106,
    appointmentAt: "2025-12-31T18:00:00.000Z",
    appointmentStatus: "SCHEDULED",
    tattooDetail: "Name tattoo - cursive font",
  },
  {
    id: 206,
    clientId: 6,
    client: { id: 6, name: "Arjun Patel", mobile: "9345612789" },
    inquiryId: 107,
    appointmentAt: "2025-12-30T14:30:00.000Z",
    appointmentStatus: "SCHEDULED",
    tattooDetail: "Full sleeve - Japanese style (session 1)",
  },
  {
    id: 207,
    clientId: 1,
    client: { id: 1, name: "Aman Verma", mobile: "9876543210" },
    inquiryId: 104,
    appointmentAt: "2026-01-02T15:00:00.000Z",
    appointmentStatus: "SCHEDULED",
    tattooDetail: "Cover-up chest tattoo",
  },
  {
    id: 208,
    clientId: 2,
    client: { id: 2, name: "Rohit Singh", mobile: "9123456789" },
    inquiryId: 102,
    appointmentAt: "2025-12-26T11:30:00.000Z",
    appointmentStatus: "CANCELLED",
    tattooDetail: "Back tribal (cancelled - rescheduled)",
  },
];

// Data store
export const DataStore = {
  clients: CLIENTS,
  inquiries: INQUIRIES,
  appointments: APPOINTMENTS,

  // Client operations
  getClientByMobile(mobile: string): Client | undefined {
    return this.clients.find((c) => c.mobile === mobile) || this.clients[0];
  },

  updateClient(id: number, updates: Partial<Client>): Client | null {
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.clients[index] = { ...this.clients[index], ...updates };
    return this.clients[index];
  },

  // Inquiry operations
  getInquiriesByClient(clientId: number): Inquiry[] {
    return this.inquiries.filter((i) => i.clientId === clientId);
  },

  getLatestInquiry(clientId: number): Inquiry | null {
    const inquiries = this.getInquiriesByClient(clientId);
    return inquiries[inquiries.length - 1] || null;
  },

  createInquiry(data: Partial<Inquiry>): Inquiry {
    const newId = Math.max(...this.inquiries.map((i) => i.id), 100) + 1;
    const inquiry: Inquiry = {
      id: newId,
      clientId: data.clientId!,
      intent: data.intent || "",
      remark: data.remark,
      tattooSizeId: data.tattooSizeId,
      referenceTypeId: data.referenceTypeId,
      createdAt: new Date().toISOString(),
    };
    this.inquiries.push(inquiry);
    return inquiry;
  },

  // Appointment operations
  getAppointmentsByDate(date: string): Appointment[] {
    const selectedDay = date.split("T")[0];
    return this.appointments.filter((apt) => {
      const aptDay = apt.appointmentAt.split("T")[0];
      return aptDay === selectedDay;
    });
  },

  createAppointment(data: any): Appointment {
    const newId = Math.max(...this.appointments.map((a) => a.id), 200) + 1;
    const client =
      this.clients.find((c) => c.id === data.clientId) || this.clients[0];
    const appointment: Appointment = {
      id: newId,
      clientId: data.clientId,
      inquiryId: data.inquiryId,
      appointmentAt: data.appointmentAt,
      appointmentStatus: "SCHEDULED",
      tattooDetail: data.tattooDetail,
      client: {
        id: client.id,
        name: client.name,
        mobile: client.mobile,
      },
    };
    this.appointments.push(appointment);
    return appointment;
  },

  updateAppointment(
    id: number,
    updates: Partial<Appointment>
  ): Appointment | null {
    const index = this.appointments.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.appointments[index] = { ...this.appointments[index], ...updates };
    return this.appointments[index];
  },
};
