import { useDispatch, useSelector } from "react-redux";
import { authAPI } from "../services/api";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  verifyOTPStart,
  verifyOTPSuccess,
  verifyOTPFailure,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  verifyResetOTPStart,
  verifyResetOTPSuccess,
  verifyResetOTPFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  getProfileStart,
  getProfileSuccess,
  getProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  logout,
} from "./authSlice";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

const logApiError = (action, error, payload) => {
  console.error(`[auth:${action}] failed`, {
    message: error?.message,
    status: error?.response?.status,
    responseData: error?.response?.data,
    payload,
  });
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;
  const status = error?.response?.status;

  if (!error?.response) {
    return `${fallbackMessage}. Không kết nối được server, vui lòng kiểm tra backend hoặc kết nối mạng.`;
  }

  const parts = [];
  const addPart = (value) => {
    if (typeof value === "string" && value.trim()) {
      parts.push(value.trim());
    }
  };

  addPart(responseData?.message);
  addPart(responseData?.details);

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const validationMessages = responseData.errors
      .map((item) => {
        const field = item?.field || item?.path || item?.param;
        const message = item?.msg || item?.message;
        return field && message ? `${field}: ${message}` : message;
      })
      .filter(Boolean)
      .join("\n");

    addPart(validationMessages);
  }

  if (status === 429 && responseData?.retryAfter) {
    const retryAfter = Number(responseData.retryAfter);
    const retryMessage =
      retryAfter >= 60
        ? `Vui lòng thử lại sau khoảng ${Math.ceil(retryAfter / 60)} phút.`
        : `Vui lòng thử lại sau ${retryAfter} giây.`;

    addPart(retryMessage);
  }

  if (parts.length === 0) {
    addPart(error?.message || fallbackMessage);
  }

  return [...new Set(parts)].join("\n");
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const login = async (email, password) => {
    dispatch(loginStart());
    try {
      const response = await authAPI.login({ email, password });
      const user = response.data.user || {
        email,
        role: response.data.role,
      };
      dispatch(
        loginSuccess({ user, token: response.data.accessToken || "" }),
      );
      return response.data;
    } catch (error) {
      logApiError("login", error, { email });
      const errorMessage = getApiErrorMessage(error, "Đăng nhập thất bại");
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  };

  const register = async (username, email, password) => {
    dispatch(registerStart());
    try {
      const response = await authAPI.register({ username, email, password });
      dispatch(registerSuccess());
      return response.data;
    } catch (error) {
      logApiError("register", error, { username, email });
      const errorMessage = getApiErrorMessage(error, "Đăng ký thất bại");
      dispatch(registerFailure(errorMessage));
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    dispatch(verifyOTPStart());
    try {
      const response = await authAPI.verifyOTP(email, otp);
      const user = response.data.user || {
        email,
        role: response.data.role || "user",
      };
      dispatch(
        verifyOTPSuccess({
          user,
          token: response.data.accessToken || "",
        }),
      );
      return response.data;
    } catch (error) {
      logApiError("verify-otp", error, { email, otp });
      const errorMessage = getApiErrorMessage(error, "Xác thực OTP thất bại");
      dispatch(verifyOTPFailure(errorMessage));
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    dispatch(forgotPasswordStart());
    try {
      const response = await authAPI.forgotPassword(email);
      dispatch(forgotPasswordSuccess());
      return response.data;
    } catch (error) {
      logApiError("forgot-password", error, { email });
      const errorMessage = getApiErrorMessage(error, "Gửi yêu cầu thất bại");
      dispatch(forgotPasswordFailure(errorMessage));
      throw error;
    }
  };

  const verifyResetOTP = async (email, otp) => {
    dispatch(verifyResetOTPStart());
    try {
      const response = await authAPI.verifyResetOTP(email, otp);
      dispatch(verifyResetOTPSuccess());
      return response.data;
    } catch (error) {
      logApiError("verify-reset-otp", error, { email, otp });
      const errorMessage = getApiErrorMessage(error, "Xác thực OTP thất bại");
      dispatch(verifyResetOTPFailure(errorMessage));
      throw error;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    dispatch(resetPasswordStart());
    try {
      const response = await authAPI.resetPassword({ email, otp, newPassword });
      dispatch(resetPasswordSuccess());
      return response.data;
    } catch (error) {
      logApiError("reset-password", error, { email, otp });
      const errorMessage = getApiErrorMessage(
        error,
        "Đặt lại mật khẩu thất bại",
      );
      dispatch(resetPasswordFailure(errorMessage));
      throw error;
    }
  };

  const getProfile = async () => {
    dispatch(getProfileStart());
    try {
      const response = await authAPI.getProfile();
      dispatch(getProfileSuccess(response.data));
      return response.data;
    } catch (error) {
      logApiError("get-profile", error, {});
      const errorMessage = getApiErrorMessage(error, "Lấy thông tin thất bại");
      dispatch(getProfileFailure(errorMessage));
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    dispatch(updateProfileStart());
    try {
      const response = await authAPI.updateProfile(userData);
      dispatch(updateProfileSuccess(response.data));
      return response.data;
    } catch (error) {
      logApiError("update-profile", error, userData);
      const errorMessage = getApiErrorMessage(error, "Cập nhật thất bại");
      dispatch(updateProfileFailure(errorMessage));
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    ...auth,
    login,
    register,
    verifyOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    getProfile,
    updateProfile,
    logout: handleLogout,
  };
};
