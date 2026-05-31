import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

// Async thunks
export const getAllCounselors = createAsyncThunk(
  "schedule/getAllCounselors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/counselors");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không tải được danh sách tư vấn viên",
      );
    }
  },
);

export const getCounselorById = createAsyncThunk(
  "schedule/getCounselorById",
  async (counselorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/counselors/${counselorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không tải được thông tin tư vấn viên",
      );
    }
  },
);

export const createBooking = createAsyncThunk(
  "schedule/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post("/schedules", bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không tạo được lịch tư vấn",
      );
    }
  },
);

export const getUserBookings = createAsyncThunk(
  "schedule/getUserBookings",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không tải được lịch tư vấn",
      );
    }
  },
);

export const getCounselorBookings = createAsyncThunk(
  "schedule/getCounselorBookings",
  async (counselorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/schedules/counselor/${counselorId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không tải được lịch tư vấn",
      );
    }
  },
);

export const updateBookingStatus = createAsyncThunk(
  "schedule/updateBookingStatus",
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/schedules/${bookingId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không cập nhật được lịch tư vấn",
      );
    }
  },
);

export const cancelBooking = createAsyncThunk(
  "schedule/cancelBooking",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/schedules/${bookingId}/cancel`, {
        cancelledBy: "user",
        cancellationReason: reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Không hủy được lịch tư vấn",
      );
    }
  },
);

const initialState = {
  counselors: [],
  bookings: [],
  selectedCounselor: null,
  loading: false,
  error: null,
  success: false,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Get all counselors
    builder
      .addCase(getAllCounselors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCounselors.fulfilled, (state, action) => {
        state.loading = false;
        state.counselors = action.payload;
      })
      .addCase(getAllCounselors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get counselor by ID
    builder
      .addCase(getCounselorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCounselorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCounselor = action.payload;
        const index = state.counselors.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index === -1) {
          state.counselors.push(action.payload);
        } else {
          state.counselors[index] = action.payload;
        }
      })
      .addCase(getCounselorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
        state.success = true;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get user bookings
    builder
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get counselor bookings
    builder
      .addCase(getCounselorBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCounselorBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(getCounselorBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update booking status
    builder
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(
          (b) => b._id === action.payload._id,
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cancel booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(
          (b) => b._id === action.payload._id,
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = scheduleSlice.actions;
export default scheduleSlice.reducer;
