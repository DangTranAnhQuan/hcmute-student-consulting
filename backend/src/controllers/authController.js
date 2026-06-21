const authService = require("../services/authService");
const { validationResult } = require("express-validator");

const ACCESS_TOKEN_MAX_AGE =
  Number(process.env.ACCESS_TOKEN_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
};

const sendServerError = (res, action, err, extra = {}) => {
  console.error(`[auth:${action}] server error`, {
    message: err.message,
    stack: err.stack,
    ...extra,
  });

  return res.status(err.statusCode || 500).json({
    message: err.statusCode
      ? err.message
      : "Lỗi server khi xử lý yêu cầu",
    details:
      err.details ||
      err.message ||
      "Vui lòng kiểm tra lại dữ liệu hoặc thử lại sau.",
    errorCode: err.errorCode || "AUTH_SERVER_ERROR",
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    setAccessTokenCookie(res, result.accessToken);

    res.json({
      message: "Đăng nhập thành công!",
      ...result
    });
  } catch (err) {
    return sendServerError(res, "login", err);
  }
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Đăng ký không thành công",
      details: "Một số thông tin đăng ký chưa hợp lệ.",
      errorCode: "REGISTER_VALIDATION_ERROR",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  try {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });

    res.status(201).json({
      message: result.sent
        ? "Đã gửi mã OTP qua email, vui lòng kiểm tra!"
        : result.message,
      devOtp: result.devOtp,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email đã được sử dụng",
        details:
          "Email này đã tồn tại trong hệ thống. Vui lòng dùng email khác.",
        errorCode: "REGISTER_DUPLICATE_EMAIL",
      });
    }
    return sendServerError(res, "register", err, {
      email: req.body?.email,
      username: req.body?.username,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body?.email);

    res.json({
      message: result.sent
        ? "Đã gửi OTP đổi mật khẩu!"
        : result.message,
      devOtp: result.devOtp,
    });
  } catch (err) {
    return sendServerError(res, "forgotPassword", err, {
      email: req.body?.email,
    });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyResetOTP(email, otp);
    return res.json(result);
  } catch (err) {
    return sendServerError(res, "verifyResetOTP", err, {
      email: req.body?.email,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.json(result);
  } catch (err) {
    return sendServerError(res, "resetPassword", err, {
      email: req.body?.email,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp);

    setAccessTokenCookie(res, result.accessToken);

    res.json({
      message: "Xác thực OTP thành công!",
      ...result
    });
  } catch (err) {
    return sendServerError(res, "verifyOTP", err, {
      email: req.body?.email,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Không được xác thực" });
    }
    const user = await authService.getProfile(userId);
    res.json(user);
  } catch (err) {
    return sendServerError(res, "getProfile", err, {
      userId: req.user?.id,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Không được xác thực" });
    }
    const user = await authService.updateProfile(userId, req.body);
    res.json(user);
  } catch (err) {
    return sendServerError(res, "updateProfile", err, {
      userId: req.user?.id,
    });
  }
};

exports.addFavoriteCounselor = async (req, res) => {
  try {
    const userId = req.user?.id;
    const counselorId = req.params.id;
    const user = await authService.addFavoriteCounselor(userId, counselorId);
    res.json(user);
  } catch (err) {
    return sendServerError(res, "addFavoriteCounselor", err, {
      userId: req.user?.id,
      counselorId: req.params.id,
    });
  }
};

exports.removeFavoriteCounselor = async (req, res) => {
  try {
    const userId = req.user?.id;
    const counselorId = req.params.id;
    const user = await authService.removeFavoriteCounselor(userId, counselorId);
    res.json(user);
  } catch (err) {
    return sendServerError(res, "removeFavoriteCounselor", err, {
      userId: req.user?.id,
      counselorId: req.params.id,
    });
  }
};

exports.addFavoriteArticle = async (req, res) => {
  try {
    const userId = req.user?.id;
    const articleId = req.params.id;
    const user = await authService.addFavoriteArticle(userId, articleId);
    res.json(user);
  } catch (err) {
    return sendServerError(res, "addFavoriteArticle", err, {
      userId: req.user?.id,
      articleId: req.params.id,
    });
  }
};

exports.removeFavoriteArticle = async (req, res) => {
  try {
    const userId = req.user?.id;
    const articleId = req.params.id;
    const user = await authService.removeFavoriteArticle(userId, articleId);
    res.json(user);
  } catch (err) {
    return sendServerError(res, "removeFavoriteArticle", err, {
      userId: req.user?.id,
      articleId: req.params.id,
    });
  }
};

exports.markViewedCounselor = async (req, res) => {
  try {
    const userId = req.user?.id;
    const counselorId = req.params.id;
    const user = await authService.markViewedCounselor(userId, counselorId);
    res.json(user);
  } catch (err) {
    return sendServerError(res, "markViewedCounselor", err, {
      userId: req.user?.id,
      counselorId: req.params.id,
    });
  }
};

exports.markViewedArticle = async (req, res) => {
  try {
    const userId = req.user?.id;
    const articleId = req.params.id;
    const user = await authService.markViewedArticle(userId, articleId);
    res.json(user);
  } catch (err) {
    return sendServerError(res, "markViewedArticle", err, {
      userId: req.user?.id,
      articleId: req.params.id,
    });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Không được xác thực" });
    const favorites = await authService.getFavorites(userId);
    res.json(favorites);
  } catch (err) {
    return sendServerError(res, "getFavorites", err, { userId: req.user?.id });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Không được xác thực" });
    const coupons = await authService.getCoupons(userId);
    res.json(coupons);
  } catch (err) {
    return sendServerError(res, "getCoupons", err, { userId: req.user?.id });
  }
};

exports.redeemPoints = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Không được xác thực" });
    const result = await authService.redeemPoints(userId, req.body?.pointsToConvert);
    res.json(result);
  } catch (err) {
    return sendServerError(res, "redeemPoints", err, { userId: req.user?.id });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "strict",
    });
    const result = await authService.logout();
    res.json(result);
  } catch (err) {
    return sendServerError(res, "logout", err);
  }
};
