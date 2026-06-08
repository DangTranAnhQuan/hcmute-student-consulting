const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const authRoutes = require("./routes/authRoutes");
const counselorRoutes = require("./routes/counselorRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const adminRoutes = require("./routes/adminRoutes");
const faqRoutes = require("./routes/faqRoutes");
const searchRoutes = require("./routes/searchRoutes");
const forumRoutes = require("./routes/forumRoutes");
const consultationCartRoutes = require("./routes/consultationCartRoutes");
const consultationOrderRoutes = require("./routes/consultationOrderRoutes");
const contentRoutes = require("./routes/contentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { setNotificationIO, attachSocketHandlers } = require("./services/notificationHub");

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3001",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/consultation-cart", consultationCartRoutes);
app.use("/api/consultation-orders", consultationOrderRoutes);
app.use("/api/notifications", notificationRoutes);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setNotificationIO(io);
io.on("connection", attachSocketHandlers);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

const connectDatabase = async (mongoUri = process.env.MONGO_URI) => {
  if (!mongoUri) {
    throw new Error("MONGO_URI chưa được cấu hình");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && mongoose.connection.asPromise) {
    return mongoose.connection.asPromise();
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Đã kết nối MongoDB cho Website Tư vấn sinh viên!");
  return mongoose.connection;
};

const startServer = async ({ port = process.env.PORT || 3000 } = {}) => {
  await connectDatabase();
  return server.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error("❌ Lỗi khởi động server:", err);
    process.exit(1);
  });
}

module.exports = {
  app,
  server,
  startServer,
  connectDatabase,
};
