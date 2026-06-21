const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const isProduction = process.env.NODE_ENV === "production";
const windowMs =
  Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const makeKeyGenerator = (scope, includeEmail = false) => (req) => {
  const ipKey = ipKeyGenerator(req.ip);
  const email = includeEmail ? normalizeEmail(req.body?.email) : "";

  return email ? `${scope}:${ipKey}:${email}` : `${scope}:${ipKey}`;
};

const createAuthLimiter = ({
  scope,
  max,
  message,
  includeEmail = false,
  skipFailedRequests = false,
  skipSuccessfulRequests = false,
}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: makeKeyGenerator(scope, includeEmail),
    skipFailedRequests,
    skipSuccessfulRequests,
    message,
    handler: (req, res, next, options) => {
      const resetTime = req.rateLimit?.resetTime?.getTime?.();
      const retryAfter = resetTime
        ? Math.max(1, Math.ceil((resetTime - Date.now()) / 1000))
        : Math.ceil(windowMs / 1000);

      return res.status(options.statusCode).json({
        message: options.message,
        retryAfter,
      });
    },
  });

exports.loginLimiter = createAuthLimiter({
  scope: "login",
  max: toPositiveInt(
    process.env.AUTH_LOGIN_RATE_LIMIT_MAX,
    isProduction ? 10 : 100,
  ),
  message: "Quá nhiều lần đăng nhập sai, vui lòng thử lại sau ít phút",
  includeEmail: true,
  skipSuccessfulRequests: true,
});

exports.registerLimiter = createAuthLimiter({
  scope: "register",
  max: toPositiveInt(
    process.env.AUTH_REGISTER_RATE_LIMIT_MAX,
    isProduction ? 10 : 100,
  ),
  message: "Quá nhiều lần đăng ký, vui lòng thử lại sau ít phút",
  includeEmail: true,
  skipFailedRequests: true,
});

exports.forgotPasswordLimiter = createAuthLimiter({
  scope: "forgot-password",
  max: toPositiveInt(
    process.env.AUTH_FORGOT_PASSWORD_RATE_LIMIT_MAX,
    isProduction ? 10 : 100,
  ),
  message: "Quá nhiều yêu cầu quên mật khẩu, vui lòng thử lại sau ít phút",
  includeEmail: true,
  skipFailedRequests: true,
});

exports.resetPasswordLimiter = createAuthLimiter({
  scope: "reset-password",
  max: toPositiveInt(
    process.env.AUTH_RESET_PASSWORD_RATE_LIMIT_MAX,
    isProduction ? 20 : 100,
  ),
  message: "Quá nhiều lần đặt lại mật khẩu, vui lòng thử lại sau ít phút",
  includeEmail: true,
});

/**
 * Giới hạn request cho các thao tác Admin nhạy cảm
 * Max 30 requests trong 15 phút
 */
exports.adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Bạn đã thực hiện quá nhiều thao tác quản trị. Vui lòng thử lại sau 15 phút.",
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      message: options.message,
      errorCode: "ADMIN_RATE_LIMIT",
    });
  },
});
