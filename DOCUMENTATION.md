# Tài liệu Chi tiết Hướng dẫn Xây dựng & Phát triển Ứng dụng Tư vấn Sinh viên HCMUTE

Tài liệu này cung cấp cái nhìn toàn diện về kiến trúc, thiết kế, cơ sở dữ liệu và mã nguồn để phát triển ứng dụng **Tư vấn Sinh viên HCMUTE** (Dựa trên mô hình bài toán e-commerce áp dụng vào đặt lịch tư vấn).

---

## 1. Các Lược đồ (Diagrams)

### 1.1. Lược đồ Use Case (Use Case Diagram)
Hệ thống gồm các tác nhân (Actors) và các chức năng chính (Use cases):

*   **Khách (Guest)**: Xem danh sách tư vấn viên, xem bài viết/FAQ, Đăng ký, Đăng nhập, Quên mật khẩu.
*   **Người dùng (Sinh viên/User)**:
    *   Quản lý tài khoản (Cập nhật hồ sơ, Đổi mật khẩu).
    *   Thêm lịch tư vấn vào giỏ hàng (`Consultation Cart`).
    *   Thanh toán/Xác nhận đặt lịch (COD hoặc MoMo).
    *   Theo dõi trạng thái yêu cầu tư vấn, Hủy yêu cầu.
*   **Tư vấn viên (Counselor)**: Cập nhật lịch rảnh (Availability), Xác nhận tham gia tư vấn, Quản lý hồ sơ tư vấn viên.
*   **Quản trị viên (Admin)**: Quản lý người dùng, Quản lý tư vấn viên, Quản lý yêu cầu/đơn tư vấn, Thống kê doanh thu, Quản lý bài viết/FAQ.

### 1.2. Lược đồ Tuần tự (Sequence Diagram) - Luồng Đặt lịch & Thanh toán MoMo
```text
[Người dùng] -> [Frontend React]: 1. Chọn TVV & Thêm vào Giỏ hàng
[Frontend React] -> [Backend API]: 2. POST /api/cart/add
[Backend API] -> [MongoDB]: 3. Lưu vào ConsultationCart
[Frontend React] -> [Backend API]: 4. POST /api/checkout (Chọn MoMo)
[Backend API] -> [MoMo API]: 5. Gửi yêu cầu tạo thanh toán (createPayment)
[MoMo API] -> [Backend API]: 6. Trả về payUrl
[Backend API] -> [Frontend React]: 7. Trả về payUrl cho User
[Frontend React] -> [Trang MoMo]: 8. Redirect tới payUrl
[Người dùng] -> [Trang MoMo]: 9. Thực hiện thanh toán
[Trang MoMo] -> [Backend API]: 10. Gửi IPN Webhook báo kết quả
[Backend API] -> [MongoDB]: 11. Cập nhật trạng thái ConsultationOrder (Đã thanh toán)
[Trang MoMo] -> [Frontend React]: 12. Redirect về trang kết quả (Return URL)
```

---

## 2. Thiết kế Cơ sở dữ liệu (Database - MongoDB)

Vì dự án sử dụng MongoDB (NoSQL), dữ liệu được tổ chức dưới dạng các Collections. Dưới đây là cấu trúc các schema chính:

### 2.1. Bảng `users`
*   `_id`: ObjectId
*   `email`: String (Unique)
*   `password`: String (Hashed)
*   `role`: String (Enum: 'user', 'admin', 'counselor')
*   `fullName`: String
*   `phone`: String
*   `otp`: String, `otpExpires`: Date
*   `isActivated`: Boolean

### 2.2. Bảng `counselors`
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref to `users`)
*   `specialty`: String (Chuyên môn)
*   `bio`: String
*   `rating`: Number
*   `price`: Number (Giá mỗi ca tư vấn)

### 2.3. Bảng `consultation_carts` (Giỏ hàng)
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref to `users`)
*   `items`: Array
    *   `counselorId`: ObjectId (Ref to `counselors`)
    *   `scheduleTime`: Date
    *   `price`: Number

### 2.4. Bảng `consultation_orders` (Đơn đặt lịch / Yêu cầu tư vấn)
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref to `users`)
*   `items`: Array (Copy từ Giỏ hàng qua khi Checkout)
*   `totalAmount`: Number
*   `paymentMethod`: String (Enum: 'COD', 'MoMo')
*   `paymentStatus`: String (Enum: 'Chưa thanh toán', 'Chờ thanh toán', 'Đã thanh toán', 'Hoàn tiền')
*   `orderStatus`: String (Enum: 'Yêu cầu mới', 'Đang xử lý', 'Đã hoàn tất', 'Đã hủy')
*   `momoTransId`: String

---

## 3. Thiết kế API (API Specifications)

Hệ thống sử dụng RESTful API. Dưới đây là các API cốt lõi:

### 3.1. Xác thực & Tài khoản (Auth API)
*   `POST /api/auth/register`: Đăng ký tài khoản (Gửi OTP qua Email).
*   `POST /api/auth/verify-otp`: Xác nhận OTP để kích hoạt tài khoản.
*   `POST /api/auth/login`: Đăng nhập, trả về JWT Token.
*   `GET /api/auth/profile`: Lấy thông tin user hiện tại (Yêu cầu JWT).

### 3.2. Tư vấn & Giỏ hàng (Consultation API)
*   `GET /api/counselors`: Lấy danh sách tư vấn viên.
*   `GET /api/cart`: Lấy giỏ hàng của user.
*   `POST /api/cart/add`: Thêm lịch tư vấn vào giỏ.
*   `DELETE /api/cart/remove/:itemId`: Xóa item khỏi giỏ.

### 3.3. Thanh toán & Đơn hàng (Checkout & Orders API)
*   `POST /api/checkout`: Tạo đơn hàng mới từ giỏ hàng. Sinh link MoMo nếu chọn MoMo.
*   `POST /api/payment/momo-ipn`: Webhook nhận kết quả từ MoMo (Không cần JWT, nhưng cần xác thực chữ ký MoMo).
*   `GET /api/orders`: Lấy lịch sử đơn hàng của user.
*   `POST /api/orders/:id/cancel`: Hủy yêu cầu đặt lịch.

---

## 4. Hướng dẫn Code App

### 4.1. Cấu trúc thư mục (Folder Structure)
Dự án chia thành 2 phần độc lập: **Frontend (React)** và **Backend (Node.js)**.

```
hcmute-student-consulting/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Chứa logic xử lý API (ví dụ: authController.js, orderController.js)
│   │   ├── models/           # Định nghĩa MongoDB Schema bằng Mongoose
│   │   ├── routes/           # Định nghĩa các endpoint API
│   │   ├── middleware/       # Auth JWT, verify Role, validation, error handler
│   │   ├── utils/            # Helper functions (Momo signature, sendEmail, etc.)
│   │   └── app.js            # Khởi tạo Express Server
│   └── server.js             # Entry point backend
└── frontend/
    ├── src/
    │   ├── components/       # Các UI Component dùng chung (Navbar, Button, Card)
    │   ├── pages/            # Các trang chính (Home, Login, Cart, Checkout, AdminDashboard)
    │   ├── redux/            # Quản lý state tập trung (userSlice, cartSlice)
    │   ├── services/         # Chứa hàm gọi API bằng Axios (auth.service.js)
    │   └── utils/            # Format tiền tệ, date-time helper
    └── App.js                # React Router setup
```

### 4.2. Triển khai Logic cốt lõi

**Backend - Tích hợp MoMo (trong `controllers/paymentController.js`):**
1. Tạo payload gồm `partnerCode`, `orderId`, `amount`, `returnUrl`, `notifyUrl`.
2. Tạo chữ ký `signature` bằng HMAC-SHA256 với `secretKey` của MoMo.
3. Gửi POST request tới Endpoint MoMo Sandbox.
4. Trả `payUrl` về cho Frontend.

**Backend - Middleware Bảo mật (trong `middleware/authMiddleware.js`):**
*   Lấy token từ Header `Authorization: Bearer <token>`.
*   Dùng `jwt.verify` để giải mã token. Nếu hợp lệ, gán `req.user = decoded`.

**Frontend - Quản lý Trạng thái (Redux):**
*   Dùng Redux Toolkit để lưu trữ `user` (đã đăng nhập chưa, role là gì) và `cart` (số lượng item trong giỏ).
*   Sử dụng Axios Interceptor để tự động đính kèm JWT Token vào mỗi request gửi lên Backend.

---

## 5. Thiết kế Giao diện App (UI/UX)

Sử dụng React + Tailwind CSS, giao diện gồm các thành phần:

*   **Trang Chủ (Home)**: Banner giới thiệu, các dịch vụ tư vấn nổi bật, danh sách tư vấn viên rating cao.
*   **Danh mục Tư vấn viên (Counselors List)**: Có bộ lọc theo chuyên môn (Tâm lý, Học vụ, Hướng nghiệp), giá tiền.
*   **Trang Chi tiết Tư vấn viên**: Xem tiểu sử, đánh giá, và chọn ngày giờ trống (Availability) để đưa vào giỏ hàng.
*   **Giỏ Hàng (Cart)**: Hiển thị các ca tư vấn đã chọn, cho phép tick chọn các mục muốn thanh toán, tính tổng tiền.
*   **Thanh Toán (Checkout)**: Form điền thông tin liên hệ, nút chọn Phương thức thanh toán (Tiền mặt/COD hoặc MoMo).
*   **Trang cá nhân (Profile) & Lịch sử**: Xem các đơn đã đặt, xem trạng thái xử lý timeline (Mới -> Đang chuẩn bị -> Hoàn tất). Nút "Thanh toán lại" cho đơn MoMo bị hủy giữa chừng.
*   **Trang Admin**: Giao diện Dashboard (Bảng điều khiển) dùng Sidebar bên trái, hiển thị bảng danh sách Users, Orders, nút Cập nhật trạng thái đơn (Duyệt/Hoàn thành/Hủy).
