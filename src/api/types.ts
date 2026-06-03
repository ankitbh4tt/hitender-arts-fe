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

export type PaymentMethod = 'CASH' | 'ONLINE' | 'CARD';

export interface Appointment {
  id: number;
  clientId: number;
  inquiryId: number;
  appointmentAt: string;
  durationMinutes: number;
  tattooDetail?: string | null;
  notes?: string | null;
  referencePhotoUrl?: string | null;
  completedPhotoUrl?: string | null;
  completionNotes?: string | null;
  appointmentStatusId: number;
  appointmentStatus?: AppointmentStatus;
  advanceAmount?: number | string | null;
  paymentMethod?: PaymentMethod | null;
  amount?: number | string | null;
  client?: Client;
  inquiry?: Inquiry;
  createdAt: string;
  updatedAt: string;
}

export type FollowUpType = 'THREE_DAY' | 'FIFTEEN_DAY' | 'THIRTY_DAY';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED';

export interface FollowUp {
  id: number;
  appointmentId: number;
  clientId: number;
  type: FollowUpType;
  dueDate: string;
  status: FollowUpStatus;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  appointment?: Appointment;
}

export interface StudioSettings {
  id: number;
  studioName: string;
  whatsappNumber?: string | null;
  reminderTemplate?: string | null;
  aftercareTemplate?: string | null;
  logoUrl?: string | null;
  updatedAt: string;
}
