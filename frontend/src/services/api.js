import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[api] request failed", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      responseData: error?.response?.data,
      message: error?.message,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export default api;
