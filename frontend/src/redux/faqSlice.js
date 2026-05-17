import { createSlice } from "@reduxjs/toolkit";
import {
  mockFAQs,
  mockFAQCategories,
  mockLibraryTemplates,
} from "../utils/mockData";

const initialState = {
  allFAQs: mockFAQs,
  filteredFAQs: mockFAQs,
  categories: mockFAQCategories,
  selectedCategory: "All",
  query: "",
  expandedIds: [mockFAQs[0]?.id].filter(Boolean),
  libraryItems: mockLibraryTemplates,
  filteredLibrary: mockLibraryTemplates,
};

const filterFAQList = (state) => {
  const keyword = state.query.trim().toLowerCase();
  state.filteredFAQs = state.allFAQs.filter((item) => {
    const matchCategory =
      state.selectedCategory === "All" || item.category === state.selectedCategory;
    const matchKeyword =
      !keyword ||
      item.question.toLowerCase().includes(keyword) ||
      item.answer.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });

  state.filteredLibrary = state.libraryItems.filter((item) => {
    const matchCategory =
      state.selectedCategory === "All" || item.category === state.selectedCategory;
    const matchKeyword =
      !keyword ||
      item.title.toLowerCase().includes(keyword) ||
      item.type.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });
};

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
      filterFAQList(state);
    },
    setQuery: (state, action) => {
      state.query = action.payload;
      filterFAQList(state);
    },
    toggleExpand: (state, action) => {
      const id = action.payload;
      const exists = state.expandedIds.includes(id);
      state.expandedIds = exists
        ? state.expandedIds.filter((itemId) => itemId !== id)
        : [...state.expandedIds, id];
    },
    expandAll: (state) => {
      state.expandedIds = state.filteredFAQs.map((item) => item.id);
    },
    collapseAll: (state) => {
      state.expandedIds = [];
    },
    clearFilters: (state) => {
      state.selectedCategory = "All";
      state.query = "";
      state.filteredFAQs = state.allFAQs;
      state.filteredLibrary = state.libraryItems;
      state.expandedIds = [state.allFAQs[0]?.id].filter(Boolean);
    },
  },
});

export const {
  setCategory,
  setQuery,
  toggleExpand,
  expandAll,
  collapseAll,
  clearFilters,
} = faqSlice.actions;

export default faqSlice.reducer;

