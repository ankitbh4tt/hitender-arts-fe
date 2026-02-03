export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface Client {
  id: number;
  name: string | null;
  mobile: string;
  gender: string | null;
  location: string | null;
  currentStatusId: number;
  currentStatus?: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ClientStatus {
  id: number;
  code: string;
  label: string;
  isActive: boolean;
}

export interface AppointmentStatus {
  id: number;
  code: string;
  label: string;
  isActive: boolean;
}

export interface ReferenceType {
  id: number;
  name: string;
  isActive: boolean;
}

export interface TattooSize {
  id: number;
  label: string;
  isActive: boolean;
}

export interface Inquiry {
  id: number;
  clientId: number;
  tattooSizeId?: number | null;
  referenceTypeId?: number | null;
  intent?: string | null;
  remark?: string | null;
  createdAt: string;
  client?: Client;
  tattooSize?: TattooSize;
  referenceType?: ReferenceType;
}

export interface Appointment {
  id: number;
  clientId: number;
  inquiryId: number;
  appointmentAt: string;
  tattooDetail?: string | null;
  appointmentStatusId: number;
  appointmentStatus?: AppointmentStatus;
  client?: Client;
  inquiry?: Inquiry;
  createdAt: string;
  updatedAt: string;
}
