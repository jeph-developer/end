import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — useful for debugging
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor — centralized error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;
