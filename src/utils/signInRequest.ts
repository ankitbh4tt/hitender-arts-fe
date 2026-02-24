import CryptoJS from "crypto-js";

const API_KEY = process.env.EXPO_PUBLIC_APP_API_KEY;
const APP_SECRET = process.env.EXPO_PUBLIC_APP_SECRET;
export function signRequest(data: any) {

  const timestamp = Date.now().toString();

  // body stringify — VERY IMPORTANT
  const body = data ? JSON.stringify(data) : "";

  const payload = `${timestamp}.${body}`;

  const signature = CryptoJS.HmacSHA256(payload, APP_SECRET).toString(
    CryptoJS.enc.Hex
  );

  return {
    apiKey: API_KEY,
    timestamp,
    signature,
  };
}