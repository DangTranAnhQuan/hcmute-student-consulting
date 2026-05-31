import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

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
    const message = error.response?.data?.message || "";
    if (message) {
      error.message = message;
    }
    const isTokenError =
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
        message.toLowerCase().includes("token"));

    if (isTokenError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  verifyResetOTP: (email, otp) =>
    api.post("/auth/verify-reset-otp", { email, otp }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const adminAPI = {
  list: (resource, q = "") => api.get(`/admin/${resource}`, { params: { q } }),
  create: (resource, data) => api.post(`/admin/${resource}`, data),
  update: (resource, id, data) => api.put(`/admin/${resource}/${id}`, data),
  remove: (resource, id) => api.delete(`/admin/${resource}/${id}`),
};

export const counselorAPI = {
  list: () => api.get("/counselors"),
  detail: (id) => api.get(`/counselors/${id}`),
  availableSlots: (id, date) =>
    api.get(`/counselors/${id}/available-slots`, { params: { date } }),
  similar: (id) => api.get(`/counselors/${id}/similar`),
  stats: (id) => api.get(`/counselors/${id}/stats`),
};

export const userAPI = {
  addFavoriteCounselor: (id) => api.post(`/auth/favorite-counselors/${id}`),
  removeFavoriteCounselor: (id) =>
    api.delete(`/auth/favorite-counselors/${id}`),
  markViewedCounselor: (id) => api.post(`/auth/viewed-counselors/${id}`),
  getFavorites: () => api.get("/auth/favorites"),
  getCoupons: () => api.get("/auth/coupons"),
  redeemPoints: (pointsToConvert) =>
    api.patch("/auth/points/redeem", { pointsToConvert }),
};

export const consultationCartAPI = {
  get: () => api.get("/consultation-cart"),
  addItem: (data) => api.post("/consultation-cart/items", data),
  updateItem: (id, data) => api.put(`/consultation-cart/items/${id}`, data),
  removeItem: (id) => api.delete(`/consultation-cart/items/${id}`),
  clear: () => api.delete("/consultation-cart"),
};

export const consultationOrderAPI = {
  paymentMethods: () => api.get("/consultation-orders/payment-methods"),
  checkout: (data) => api.post("/consultation-orders/checkout", data),
  list: () => api.get("/consultation-orders"),
  detail: (id) => api.get(`/consultation-orders/${id}`),
  cancel: (id, reason) =>
    api.post(`/consultation-orders/${id}/cancel`, { reason }),
  payMomo: (id) => api.post(`/consultation-orders/${id}/pay/momo`),
  reviewItem: (id, itemIndex, data) =>
    api.post(`/consultation-orders/${id}/items/${itemIndex}/review`, data),
  rewardHistory: () => api.get("/consultation-orders/rewards/history"),
  adminDashboard: () => api.get("/consultation-orders/admin/dashboard"),
  adminList: (params = {}) =>
    api.get("/consultation-orders/admin/all", { params }),
  updateStatus: (id, status, note = "") =>
    api.put(`/consultation-orders/admin/${id}/status`, { status, note }),
  updatePaymentStatus: (id, paymentStatus, note = "") =>
    api.put(`/consultation-orders/admin/${id}/payment`, {
      paymentStatus,
      note,
    }),
};

export const faqAPI = {
  list: (params = {}) => api.get("/faqs", { params }),
};

export const searchAPI = {
  search: (params = {}) => api.get("/search", { params }),
};

export const contentAPI = {
  list: (params = {}) => api.get("/content/articles", { params }),
  detail: (id) => api.get(`/content/articles/${id}`),
};

export const forumAPI = {
  listThreads: (q = "") => api.get("/forum/threads", { params: { q } }),
  getThread: (id) => api.get(`/forum/threads/${id}`),
  createThread: (data) => api.post("/forum/threads", data),
  createReply: (threadId, data) =>
    api.post(`/forum/threads/${threadId}/replies`, data),
  upvoteThread: (threadId) => api.patch(`/forum/threads/${threadId}/upvote`),
  toggleSolved: (threadId) => api.patch(`/forum/threads/${threadId}/solved`),
  togglePin: (threadId) => api.patch(`/forum/threads/${threadId}/pin`),
  deleteThread: (threadId) => api.delete(`/forum/threads/${threadId}`),
  deleteReply: (threadId, replyId) =>
    api.delete(`/forum/threads/${threadId}/replies/${replyId}`),
};

export default api;
