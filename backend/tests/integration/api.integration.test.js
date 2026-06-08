process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.ACCESS_TOKEN_EXPIRES_IN = "1h";
process.env.ACCESS_TOKEN_MAX_AGE_MS = "3600000";
process.env.AUTH_RATE_LIMIT_WINDOW_MS = "1000";
process.env.EMAIL_USER = "your_gmail@gmail.com";
process.env.EMAIL_PASS = "your_gmail_app_password";
process.env.CLIENT_URL = "http://localhost:3001";

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");

let app;
let connectDatabase;
let mongoServer;

const uniqueEmail = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@hcmute.edu.vn`;

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const registerActivatedUser = async (prefix = "duy") => {
  const email = uniqueEmail(prefix);
  const password = "Password123";

  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send({
      username: `${prefix}-user`,
      email,
      password,
    })
    .expect(201);

  expect(registerResponse.body.devOtp).toMatch(/^\d{6}$/);

  const verifyResponse = await request(app)
    .post("/api/auth/verify-otp")
    .send({
      email,
      otp: registerResponse.body.devOtp,
    })
    .expect(200);

  return {
    email,
    password,
    token: verifyResponse.body.accessToken,
    user: verifyResponse.body.user,
  };
};

const deleteAllCollections = async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  ({ app, connectDatabase } = require("../../src/app"));
  await connectDatabase();
});

afterEach(async () => {
  await deleteAllCollections();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("backend integration API", () => {
  test("GET /api/health returns server status", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toEqual({ message: "Server is running" });
  });

  test("auth flow registers with dev OTP, verifies, logs in, and updates profile", async () => {
    const { email, password, token } = await registerActivatedUser("auth");

    const profileResponse = await request(app)
      .get("/api/auth/profile")
      .set(authHeader(token))
      .expect(200);

    expect(profileResponse.body.email).toBe(email);

    const updateResponse = await request(app)
      .put("/api/auth/profile")
      .set(authHeader(token))
      .send({
        username: "duy-integration",
        fullName: "Duy Integration Tester",
        phone: "0912345678",
        address: "HCMUTE",
      })
      .expect(200);

    expect(updateResponse.body.fullName).toBe("Duy Integration Tester");

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    expect(loginResponse.body.accessToken).toBeTruthy();
    expect(loginResponse.headers["set-cookie"]?.join(";")).toContain(
      "accessToken=",
    );
  });

  test("protected endpoints reject requests without access token", async () => {
    const response = await request(app).get("/api/auth/profile").expect(401);

    expect(response.body.message).toContain("Token");
  });

  test("consultation cart adds, updates, removes, and clears a valid future slot", async () => {
    const User = require("../../src/models/User");
    const Counselor = require("../../src/models/Counselor");
    const Availability = require("../../src/models/Availability");

    const { token } = await registerActivatedUser("cart");
    const counselorUser = await User.create({
      username: "advisor-user",
      email: uniqueEmail("advisor"),
      password: await bcrypt.hash("Password123", 10),
      isActivated: true,
    });

    const counselor = await Counselor.create({
      userId: counselorUser._id,
      fullName: "Cố vấn học tập",
      expertise: ["Academic"],
      hourlyRate: 200000,
      isActive: true,
    });

    const slot = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    slot.setHours(10, 0, 0, 0);

    await Availability.create({
      counselorId: counselor._id,
      dayOfWeek: slot.getDay(),
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 60,
      isActive: true,
    });

    const addResponse = await request(app)
      .post("/api/consultation-cart/items")
      .set(authHeader(token))
      .send({
        counselorId: counselor._id.toString(),
        topic: "Tư vấn đăng ký môn học",
        preferredDate: slot.toISOString(),
        meetingType: "online",
        note: "Cần tư vấn học phần tự chọn",
      })
      .expect(201);

    expect(addResponse.body.totalItems).toBe(1);
    expect(addResponse.body.subtotal).toBe(200000);

    const itemId = addResponse.body.items[0]._id;
    const updateResponse = await request(app)
      .put(`/api/consultation-cart/items/${itemId}`)
      .set(authHeader(token))
      .send({ topic: "Tư vấn kế hoạch học kỳ" })
      .expect(200);

    expect(updateResponse.body.items[0].topic).toBe("Tư vấn kế hoạch học kỳ");

    const removeResponse = await request(app)
      .delete(`/api/consultation-cart/items/${itemId}`)
      .set(authHeader(token))
      .expect(200);

    expect(removeResponse.body.totalItems).toBe(0);

    const clearResponse = await request(app)
      .delete("/api/consultation-cart")
      .set(authHeader(token))
      .expect(200);

    expect(clearResponse.body.items).toEqual([]);
  });

  test("notification API lists scoped notifications and marks them as read", async () => {
    const Notification = require("../../src/models/Notification");
    const { token, user } = await registerActivatedUser("notification");

    const personalNotification = await Notification.create({
      recipientUserId: user.id,
      targetRoles: [],
      type: "consultation",
      title: "Cập nhật yêu cầu tư vấn",
      message: "Yêu cầu tư vấn của bạn đã được xác nhận.",
      link: "/consultation-orders/demo",
    });

    await Notification.create({
      targetRoles: ["user"],
      type: "article",
      title: "Bài viết mới",
      message: "Có bài viết hỗ trợ học tập mới.",
    });

    await Notification.create({
      targetRoles: ["admin"],
      type: "admin-only",
      title: "Thông báo quản trị",
      message: "User thường không thấy thông báo này.",
    });

    const listResponse = await request(app)
      .get("/api/notifications")
      .set(authHeader(token))
      .expect(200);

    expect(listResponse.body.data).toHaveLength(2);
    expect(listResponse.body.data.map((item) => item.title)).not.toContain(
      "Thông báo quản trị",
    );

    const summaryBefore = await request(app)
      .get("/api/notifications/summary")
      .set(authHeader(token))
      .expect(200);

    expect(summaryBefore.body.unreadCount).toBe(2);

    await request(app)
      .patch(`/api/notifications/${personalNotification._id}/read`)
      .set(authHeader(token))
      .expect(200);

    const summaryAfterOne = await request(app)
      .get("/api/notifications/summary")
      .set(authHeader(token))
      .expect(200);

    expect(summaryAfterOne.body.unreadCount).toBe(1);

    await request(app)
      .patch("/api/notifications/read-all")
      .set(authHeader(token))
      .expect(200);

    const summaryAfterAll = await request(app)
      .get("/api/notifications/summary")
      .set(authHeader(token))
      .expect(200);

    expect(summaryAfterAll.body.unreadCount).toBe(0);
  });
});
