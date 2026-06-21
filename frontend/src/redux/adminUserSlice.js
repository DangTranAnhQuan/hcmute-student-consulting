import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminUserAPI } from "../services/api";

export const fetchUsers = createAsyncThunk(
  "adminUser/fetchUsers",
  async (params) => {
    const response = await adminUserAPI.list(params);
    return response.data;
  },
);

export const changeUserRole = createAsyncThunk(
  "adminUser/changeRole",
  async ({ id, newRole }) => {
    const response = await adminUserAPI.updateRole(id, newRole);
    return response.data.user;
  },
);

export const toggleUserBan = createAsyncThunk(
  "adminUser/toggleBan",
  async ({ id, isBanned }) => {
    const response = await adminUserAPI.toggleBan(id, isBanned);
    return response.data.user;
  },
);

const adminUserSlice = createSlice({
  name: "adminUser",
  initialState: {
    users: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAdminUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(toggleUserBan.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export const { clearAdminUserError } = adminUserSlice.actions;
export default adminUserSlice.reducer;
