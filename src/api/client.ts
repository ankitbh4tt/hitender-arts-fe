import axios from "axios";

// Placeholder URL - to be replaced with env var
const BASE_URL = "https://api.hitenderarts.com/v1";

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
    return response;
  },
  (error) => {
    // STRICT ARCHITECTURE RULE:
    // Do NOT map errors to friendly messages here.
    // Pass the backend error through exactly as received.
    // The UI must display what the backend says.

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Backend Error:", error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error:", error.request);
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Client Error:", error.message);
      return Promise.reject({ message: error.message });
    }
  }
);
