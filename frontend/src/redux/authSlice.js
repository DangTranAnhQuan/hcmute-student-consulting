import { createSlice } from "@reduxjs/toolkit";

const decodeTokenPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalized));
  } catch (error) {
    return null;
  }
};

const getStoredAuth = () => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  const payload = token ? decodeTokenPayload(token) : null;

  if (!token || !payload?.exp || payload.exp * 1000 <= Date.now()) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }

  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
};

const storedAuth = getStoredAuth();

const initialState = {
  user: storedAuth.user,
  token: storedAuth.token,
  isLoading: false,
  error: null,
  isAuthenticated: !!storedAuth.token,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    verifyOTPStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    verifyOTPSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    verifyOTPFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },

    forgotPasswordStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    resetPasswordStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    getProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    getProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    updateProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    updateProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  registerStart,
  registerSuccess,
  registerFailure,
  verifyOTPStart,
  verifyOTPSuccess,
  verifyOTPFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  getProfileStart,
  getProfileSuccess,
  getProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
