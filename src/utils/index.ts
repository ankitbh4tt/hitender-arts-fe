import { Linking } from "react-native";
import Toast from "react-native-toast-message";
import { FollowUpType } from "../api/types";

export const noop = () => {};

// --- Money -----------------------------------------------------------------

// Prisma Decimals arrive as strings over JSON; normalise to a number.
export const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
};

export const formatCurrency = (
  value: number | string | null | undefined
): string => {
  const n = toNumber(value);
  return `₹${n.toLocaleString("en-IN")}`;
};

// --- Follow-up labels ------------------------------------------------------

export const FOLLOWUP_LABELS: Record<FollowUpType, string> = {
  THREE_DAY: "3-day",
  FIFTEEN_DAY: "15-day",
  THIRTY_DAY: "30-day",
};

export const followUpLabel = (type: FollowUpType): string =>
  FOLLOWUP_LABELS[type] ?? type;

// --- Dates -----------------------------------------------------------------

export const formatDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatTime = (value: string | Date): string =>
  new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// Local-time "YYYY-MM-DD" (do NOT use toISOString - that shifts by timezone).
export const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const addDays = (d: Date, n: number): Date => {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// --- WhatsApp --------------------------------------------------------------

// Keep digits only; assume Indian numbers (prefix 91 when a bare 10-digit).
export const normalizeWhatsAppNumber = (mobile: string): string => {
  const digits = (mobile || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

// Fill {{clientName}} / {{followUpType}} / {{studioName}} placeholders.
export const fillTemplate = (
  template: string,
  vars: Record<string, string>
): string =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) =>
    vars[key] !== undefined ? vars[key] : `{{${key}}}`
  );

export const openWhatsApp = async (mobile: string, message: string) => {
  const number = normalizeWhatsAppNumber(mobile);
  if (!number) {
    Toast.show({ type: "error", text1: "No mobile number for this client" });
    return;
  }
  const url = `whatsapp://send?phone=${number}&text=${encodeURIComponent(
    message
  )}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fall back to the wa.me web link if the app isn't installed.
      await Linking.openURL(
        `https://wa.me/${number}?text=${encodeURIComponent(message)}`
      );
    }
  } catch {
    Toast.show({ type: "error", text1: "Could not open WhatsApp" });
  }
};

export const openDialer = async (mobile: string) => {
  const digits = (mobile || "").replace(/[^\d+]/g, "");
  if (!digits) return;
  try {
    await Linking.openURL(`tel:${digits}`);
  } catch {
    Toast.show({ type: "error", text1: "Could not open dialer" });
  }
};
