import CryptoJS from "crypto-js";
import stringify from "fast-json-stable-stringify";

const API_KEY = process.env.EXPO_PUBLIC_APP_API_KEY;
const APP_SECRET = process.env.EXPO_PUBLIC_APP_SECRET;
export function signRequest(data: any) {
  const timestamp = Date.now().toString();

  let payloadData;

  if (!data) {
    payloadData = {};
  } else if (typeof data === "string") {
    // If axios already stringified
    payloadData = JSON.parse(data);
  } else {
    payloadData = data;
  }

  const body = stringify(payloadData);
  const payload = `${timestamp}.${body}`;

  const signature = CryptoJS.HmacSHA256(
    payload,
    APP_SECRET!
  ).toString(CryptoJS.enc.Hex);

  return {
    apiKey: API_KEY!,
    timestamp,
    signature,
  };
}