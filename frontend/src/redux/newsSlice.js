import { createSlice } from "@reduxjs/toolkit";
import { mockAllNews, getNewsByCategory } from "../utils/mockData";

const initialState = {
  allNews: mockAllNews,
  filteredNews: mockAllNews,
  selectedCategory: "all",
  searchQuery: "",
  viewMode: "grid", // 'grid' or 'list'
  sortBy: "latest", // 'latest', 'popular', 'trending'
  isLoading: false,
  error: null,
  selectedNews: null,
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    // Category Filter
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.filteredNews = getNewsByCategory(action.payload);
    },

    // Search
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      const query = action.payload.toLowerCase();
      state.filteredNews = state.allNews.filter(
        (news) =>
          (state.selectedCategory === "all" ||
            news.categoryId === state.selectedCategory) &&
          (news.title.toLowerCase().includes(query) ||
            news.excerpt.toLowerCase().includes(query) ||
            news.author.toLowerCase().includes(query))
      );
    },

    // View Mode (Grid/List)
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },

    // Sorting
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      const sorted = [...state.filteredNews];

      switch (action.payload) {
        case "latest":
          sorted.sort((a, b) => b.date - a.date);
          break;
        case "popular":
          sorted.sort((a, b) => b.views - a.views);
          break;
        case "trending":
          sorted.sort((a, b) => b.saves - a.saves);
          break;
        default:
          break;
      }

      state.filteredNews = sorted;
    },

    // Select a single news item for detail view
    setSelectedNews: (state, action) => {
      state.selectedNews = state.allNews.find(
        (news) => news.id === action.payload
      );
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

    // Clear filters
    clearAllFilters: (state) => {
      state.selectedCategory = "all";
      state.searchQuery = "";
      state.sortBy = "latest";
      state.filteredNews = mockAllNews;
    },
  },
});

export const {
  setCategory,
  setSearchQuery,
  setViewMode,
  setSortBy,
  setSelectedNews,
  setLoading,
  setError,
  clearError,
  clearAllFilters,
} = newsSlice.actions;

export default newsSlice.reducer;

