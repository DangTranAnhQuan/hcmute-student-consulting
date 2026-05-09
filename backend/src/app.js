const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("✅ Đã kết nối MongoDB cho Website Tư vấn sinh viên!"),
  )
  .catch((err) => console.error("❌ Lỗi kết nối DB:", err));

app.use("/api/auth", authRoutes);

// Khởi chạy Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
