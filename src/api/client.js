// src/api/client.js
import axios from "axios";
import { getBasicAuthHeader, clearAuth as clearAuthStore } from "../auth/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// ✅ gắn Basic Auth tự động từ authStore
api.interceptors.request.use(
  (config) => {
    const authHeader = getBasicAuthHeader(); // "Basic xxx"
    if (authHeader) {
      config.headers = config.headers || {};
      config.headers.Authorization = authHeader;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ nếu 401 -> clear auth để khỏi kẹt session
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthStore();
    }
    return Promise.reject(error);
  }
);

// ✅ support legacy imports
export default api;
