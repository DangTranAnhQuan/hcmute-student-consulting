# Hướng dẫn tổng quát - Dự án Tư vấn Sinh viên HCMUTE

## Bản hoàn chỉnh BT06 nhóm

Bản `hcmute-student-consulting_HoanThanh` đã áp dụng 03 yêu cầu của bài bán hàng vào đề tài tư vấn sinh viên:

- Giỏ hàng tương ứng với **giỏ tư vấn**: người dùng chọn từng tư vấn viên/dịch vụ, có thể chọn riêng lẻ hoặc chọn một nhóm mục trong giỏ trước khi thanh toán. Dữ liệu giỏ lưu bằng MongoDB qua model `ConsultationCart`.
- Thanh toán tương ứng với **xác nhận yêu cầu tư vấn**: hỗ trợ `COD` bắt buộc và `MoMo Sandbox`. MoMo không giả lập; nếu thiếu biến môi trường sandbox thì API trả lỗi thay vì tạo link ảo.
- Theo dõi đơn hàng tương ứng với **theo dõi yêu cầu tư vấn**: người dùng xem lịch sử, chi tiết từng yêu cầu, timeline trạng thái, thanh toán lại MoMo khi thoát giữa chừng, và gửi/hủy yêu cầu theo đúng luật nghiệp vụ.
- Admin có màn riêng `/admin/consultation-orders` để theo dõi đơn/yêu cầu, tiền COD chờ thu, tiền đã thu, yêu cầu hoàn tiền, yêu cầu hủy và cập nhật trạng thái.

### Luồng nghiệp vụ chính

1. Người dùng vào `/book-counselor`, chọn tư vấn viên, chủ đề, thời gian và thêm vào giỏ.
2. Vào `/consultation-cart`, tick các mục muốn đặt. Không bắt buộc thanh toán toàn bộ giỏ.
3. Vào `/consultation-checkout`, nhập thông tin liên hệ và chọn `COD` hoặc `MoMo Sandbox`.
4. Với COD: đơn được tạo ở trạng thái `Yêu cầu mới`, tiền `Chưa thanh toán`; khi admin chuyển đến `Đã hoàn tất`, hệ thống ghi nhận tiền `Đã thanh toán`.
5. Với MoMo: đơn được tạo ở trạng thái `Yêu cầu mới`, tiền `Chờ thanh toán`; nếu người dùng thoát khỏi trang MoMo mà chưa thanh toán thì đơn không được xác nhận/xử lý, sau 15 phút chuyển `Hết hạn thanh toán` và có nút thanh toán lại.
6. Trạng thái xử lý gồm: `Yêu cầu mới`, `Đã xác nhận`, `Đang chuẩn bị hồ sơ`, `Đang tư vấn/đang xử lý`, `Đã hoàn tất`, `Đã hủy`, `Gửi yêu cầu hủy`.
7. Hủy đơn: trước 30 phút hoặc đơn MoMo chưa thanh toán thì hủy trực tiếp; khi đã ở bước chuẩn bị hồ sơ thì chuyển thành yêu cầu hủy chờ admin duyệt; nếu đơn MoMo đã thanh toán và bị hủy thì đánh dấu `Cần xử lý hoàn tiền`.

### Chạy bản hoàn chỉnh

Backend:

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm start
```

Mặc định backend chạy `http://localhost:3000`, frontend chạy `http://localhost:3001`.

Tài khoản demo sau khi chạy seed:

- Admin: `admin@hcmute.edu.vn` / `123456`
- User: `duy@student.hcmute.edu.vn` / `123456`

### Cấu hình MoMo Sandbox

Trong `backend/.env`, điền các biến:

```env
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REQUEST_TYPE=captureWallet
API_PUBLIC_URL=https://your-public-backend-url
CLIENT_URL=http://localhost:3001
```

Khi test MoMo từ máy local, nên dùng tunnel như ngrok cho backend rồi đặt `API_PUBLIC_URL` bằng URL public đó để MoMo gọi được IPN. Nếu chỉ để `http://localhost:3000`, trình duyệt vẫn có thể quay về trang kết quả, nhưng server MoMo không gọi được IPN từ ngoài Internet.

## 📋 Mục đích dự án

Xây dựng website tư vấn sinh viên HCMUTE với đầy đủ tính năng:

- ✅ Đăng ký tài khoản với OTP verification
- ✅ Đăng nhập với JWT authentication
- ✅ Quên mật khẩu với OTP reset
- ✅ Quản lý hồ sơ người dùng
- ✅ Phân quyền admin/user
- ✅ Bảo mật toàn diện (rate limiting, validation, encryption)

## 🏗️ Kiến trúc dự án

```
hcmute-student-consulting/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, validation, rate limit
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   └── app.js           # Express setup
│   ├── package.json
│   ├── .env
│   └── README.md
│
└── frontend/                # React + Redux UI
    ├── public/              # Static files
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── pages/           # Page components
    │   ├── redux/           # State management
    │   ├── services/        # API calls
    │   ├── utils/           # Helper functions
    │   ├── App.jsx
    │   └── index.js
    ├── package.json
    ├── .env
    ├── tailwind.config.js
    └── README.md
```

## 🚀 Quick Start

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file (copy template from .env.example if available)
# Fill in:
# - MONGO_URI
# - ACCESS_TOKEN_SECRET
# - EMAIL_USER & EMAIL_PASS
# - PORT & CLIENT_URL

# 4. Run server
npm run dev    # Development with nodemon
npm start      # Production
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file
# REACT_APP_API_URL=http://localhost:3000/api

# 4. Run application
npm start
```

## 📱 Các tính năng chính

### 1. **Đăng ký (Registration)**

- Form với validation
- Email verification với OTP
- Password hashing
- Role assignment (default: user)

**Flow:**

```
Register Form → OTP Sent to Email → OTP Verification → Account Activated
```

### 2. **Đăng nhập (Login)**

- Email & password authentication
- JWT token generation
- Automatic redirect based on role (admin/user)
- Rate limiting (5 requests / 15 min)

**Response:**

```json
{
  "message": "Đăng nhập thành công!",
  "role": "user/admin"
}
```

### 3. **Quên mật khẩu (Forgot Password)**

- Request password reset
- OTP sent to registered email
- Set new password with OTP verification

**Flow:**

```
Request → OTP Sent → Verify OTP → New Password → Success
```

### 4. **Hồ sơ (Profile)**

- View personal information
- Edit profile (name, phone, address)
- Display user role
- Account management

### 5. **Bảo mật (Security)**

- Rate limiting on sensitive endpoints
- Input validation (email, password, phone)
- Password hashing with bcryptjs
- JWT with 15 min expiry
- CORS protection
- HttpOnly cookies

## 🔌 API Endpoints Summary

| Method | Endpoint                    | Description                 | Auth Required |
| ------ | --------------------------- | --------------------------- | ------------- |
| POST   | `/api/auth/register`        | Register new user           | No            |
| POST   | `/api/auth/verify-otp`      | Verify OTP for registration | No            |
| POST   | `/api/auth/login`           | Login user                  | No            |
| POST   | `/api/auth/forgot-password` | Request password reset      | No            |
| POST   | `/api/auth/reset-password`  | Reset password with OTP     | No            |
| GET    | `/api/auth/profile`         | Get user profile            | Yes           |
| PUT    | `/api/auth/profile`         | Update user profile         | Yes           |

## 🎨 Frontend Components

### Pages

- `HomePage` - Landing page
- `LoginPage` - Login functionality
- `RegisterPage` - Registration with OTP
- `ForgotPasswordPage` - Password reset
- `ProfilePage` - User profile management

### Components

- **UI Components**: Input, Button, Card, Alert, Spinner
- **Layout Components**: Header, Navbar, Footer
- **Form Components**: LoginForm, RegisterForm, OTPForm, etc.

## 🗄️ Database

### MongoDB Collections

- **users** - User accounts with profile info

### User Fields

```javascript
{
  (username,
    email,
    password,
    role,
    fullName,
    phone,
    address,
    otp,
    otpExpires,
    isActivated,
    createdAt,
    updatedAt);
}
```

## 🔐 Security Features

| Feature          | Implementation                       |
| ---------------- | ------------------------------------ |
| Authentication   | JWT with 15 min expiry               |
| Password Storage | Bcryptjs (salt: 10)                  |
| Rate Limiting    | 5 requests / 15 min (login/register) |
| Input Validation | Express-validator                    |
| CORS             | Restricted to frontend origin        |
| OTP              | 6-digit, 5 min expiry                |
| Cookies          | HttpOnly, Secure, SameSite           |

## 📦 Technologies Stack

### Backend

- Node.js / Express.js
- MongoDB / Mongoose
- JWT / bcryptjs
- Nodemailer (Gmail)
- express-rate-limit
- express-validator

### Frontend

- React 18
- Redux Toolkit / React-Redux
- React Router DOM
- Axios
- Tailwind CSS
- React Scripts

## ✅ Checklist antes de Submit

### Backend

- [ ] All API endpoints working
- [ ] Input validation active
- [ ] Rate limiting enabled
- [ ] JWT tokens generating correctly
- [ ] OTP emails sending
- [ ] Error handling complete
- [ ] .env configured
- [ ] MongoDB connected
- [ ] package.json updated with scripts

### Frontend

- [ ] All pages responsive
- [ ] Forms validating client-side
- [ ] Redux state management working
- [ ] Axios interceptors configured
- [ ] Protected routes secured
- [ ] Error messages displaying
- [ ] Loading states implemented
- [ ] .env configured

### Documentation

- [ ] Backend README complete
- [ ] Frontend README complete
- [ ] API documentation clear
- [ ] Setup instructions clear
- [ ] Comments in code where needed

### Testing

- [ ] Test registration flow
- [ ] Test login with correct/wrong credentials
- [ ] Test password reset flow
- [ ] Test profile update
- [ ] Test role-based access
- [ ] Test error scenarios

## 📚 Useful Resources

- [Express.js Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [MongoDB](https://www.mongodb.com)
- [JWT.io](https://jwt.io)

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error

- Check MONGO_URI format
- Ensure MongoDB is running
- Verify connection string

### CORS Error

- Add frontend URL to CORS origins in backend
- Check `CLIENT_URL` in .env

### OTP Not Sending

- Verify Gmail app password
- Check `EMAIL_USER` & `EMAIL_PASS`
- Review Gmail account settings

---

**Last Updated**: 2026
**Project**: Tư vấn Sinh viên HCMUTE - Group 6
