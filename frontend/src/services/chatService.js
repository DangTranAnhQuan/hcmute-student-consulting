import api from "./api";

export const chatAPI = {
  history: (userId) =>
    api.get("/chat/history", { params: userId ? { userId } : {} }),
  chatUsers: () => api.get("/chat/users"),
};
