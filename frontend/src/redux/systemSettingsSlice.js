import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { systemSettingsAPI } from "../services/api";

export const fetchSystemSettings = createAsyncThunk(
  "systemSettings/fetch",
  async () => {
    const response = await systemSettingsAPI.get();
    return response.data;
  },
);

export const updateSystemSettings = createAsyncThunk(
  "systemSettings/update",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await systemSettingsAPI.update(formData);
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message, status: error.response?.status });
    }
  },
);

const systemSettingsSlice = createSlice({
  name: "systemSettings",
  initialState: {
    settings: null,
    isLoading: false,
    isUpdating: false,
    error: null,
  },
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateSystemSettings.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.settings = action.payload;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.isUpdating = false;
        const errorPayload = action.payload;
        if (errorPayload?.status === 429 || errorPayload?.errorCode === "ADMIN_RATE_LIMIT") {
          state.error = errorPayload.message || "Bạn đã thực hiện quá nhiều thao tác quản trị. Vui lòng thử lại sau 15 phút.";
        } else {
          state.error = action.error?.message;
        }
      });
  },
});

export const { clearSettingsError } = systemSettingsSlice.actions;
export default systemSettingsSlice.reducer;
