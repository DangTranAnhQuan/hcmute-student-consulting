import { createSlice } from "@reduxjs/toolkit";
import {
  mockNotifications,
  mockFeaturedNews,
  mockSchedules,
  mockPopularArticles,
  mockDocuments,
  mockEvents,
} from "../utils/mockData";

const initialState = {
  notifications: mockNotifications,
  featuredNews: mockFeaturedNews,
  schedules: mockSchedules,
  populerArticles: mockPopularArticles,
  documents: mockDocuments,
  events: mockEvents,
  isLoading: false,
  error: null,
  filters: {
    newsCategory: "all",
    searchQuery: "",
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Notifications
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification) {
        notification.read = true;
      }
    },
    clearNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
    },

    // Filters
    setNewsCategory: (state, action) => {
      state.filters.newsCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
    },

    // Loading and Error
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  markAsRead,
  clearNotification,
  setNewsCategory,
  setSearchQuery,
  setLoading,
  setError,
  clearError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

