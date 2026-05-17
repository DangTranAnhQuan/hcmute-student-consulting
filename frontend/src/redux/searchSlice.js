import { createSlice } from "@reduxjs/toolkit";
import {
  mockAdvancedSearchItems,
  advancedSearchOptions,
  applyAdvancedFilters,
} from "../utils/mockData";

const initialFilters = {
  keyword: "",
  topic: "",
  faculty: "",
  contentType: "",
  publishTime: "All",
  popularity: "All",
  counselingFormat: "All",
  appointmentStatus: "All",
};

const initialState = {
  allItems: mockAdvancedSearchItems,
  filteredItems: mockAdvancedSearchItems,
  filters: initialFilters,
  options: advancedSearchOptions,
  isLoading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    updateFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.filteredItems = applyAdvancedFilters(state.allItems, state.filters);
    },
    clearFilters: (state) => {
      state.filters = { ...initialFilters };
      state.filteredItems = state.allItems;
    },
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

export const { updateFilter, clearFilters, setLoading, setError, clearError } =
  searchSlice.actions;

export default searchSlice.reducer;

