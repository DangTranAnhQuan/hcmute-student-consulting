import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { searchAPI } from "../services/api";

const searchOptions = {
  topics: [
    "Academic Affairs",
    "Career",
    "Financial",
    "Giỏ tư vấn",
    "Thanh toán",
    "Theo dõi yêu cầu",
    "Scholarships",
    "Internships",
    "Jobs",
    "Soft Skills",
    "Student Psychology",
    "Training Regulations",
    "Forum",
    "FAQ",
  ],
  faculties: [
    "HCMUTE",
    "Student Support Center",
    "Community",
    "Phòng Công tác Sinh viên",
    "Phòng Đào tạo",
    "Trung tâm Quan hệ Doanh nghiệp",
  ],
  contentTypes: ["News", "Event", "Article", "FAQ", "Forum"],
  publishTimes: ["Last 24 hours", "Last 7 days", "Last 30 days", "All"],
  popularities: ["High", "Medium", "Low", "All"],
};

const initialFilters = {
  keyword: "",
  topic: "",
  faculty: "",
  contentType: "",
  publishTime: "All",
  popularity: "All",
};

export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async (filters) => {
    const response = await searchAPI.search(filters);
    return response.data.results || [];
  },
);

const initialState = {
  allItems: [],
  filteredItems: [],
  filters: initialFilters,
  options: searchOptions,
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
    },
    clearFilters: (state) => {
      state.filters = { ...initialFilters };
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allItems = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Tìm kiếm thất bại";
      });
  },
});

export const { updateFilter, clearFilters, setLoading, setError, clearError } =
  searchSlice.actions;

export default searchSlice.reducer;
