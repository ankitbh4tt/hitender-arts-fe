import axios from "axios";
import Toast from "react-native-toast-message";

// Placeholder URL - to be replaced with env var
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor
client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Backend Error:", error.response.data);
      const message = error.response.data?.message || "Something went wrong";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
      });
      return Promise.reject({ message });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", error.request);
      Toast.show({
        type: "error",
        text1: "Connection Error",
        text2: "Network error. Please check your connection.",
      });
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Client Error:", error.message);
      Toast.show({
        type: "error",
        text1: "Client Error",
        text2: error.message,
      });
      return Promise.reject({ message: error.message });
    }
  }
);
