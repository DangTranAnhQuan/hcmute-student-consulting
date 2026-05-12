# Hướng dẫn tổng quát - Dự án Tư vấn Sinh viên HCMUTE

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

## 🧑‍💻 Team Roles & Responsibilities

Each team member handles one feature:

**Member 1**: Registration + OTP Verification

- Register endpoint with validation
- OTP generation & email sending
- OTP verification endpoint
- Frontend register form & OTP modal

**Member 2**: Login + JWT Authentication

- Login endpoint with JWT generation
- JWT verification middleware
- Token refresh logic (optional)
- Frontend login form & redirect

**Member 3**: Forgot Password + Reset

- Forgot password endpoint
- Reset password endpoint
- OTP verification for reset
- Frontend forgot password flow (multi-step)

**Member 4**: Profile Management

- Get profile endpoint
- Update profile endpoint
- Profile page UI
- Edit profile functionality

**Member 5**: UI/UX & Integration

- Reusable components (Forms, Buttons, etc)
- Responsive design with Tailwind
- Error handling & validation messages
- Integration testing & documentation

## 📝 Git Workflow

### Personal Repository

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/hcmute-student-consulting

# Create feature branch
git checkout -b feat/your-feature

# Make changes and commit
git add .
git commit -m "feat: implement your feature"

# Push to your fork
git push origin feat/your-feature
```

### Group Repository

```bash
# Add upstream (once)
git remote add upstream https://github.com/GROUP_REPO/hcmute-student-consulting

# Keep updated with group repo
git fetch upstream
git merge upstream/main

# Push to group repo
git push origin main
```

## 📋 Commit Message Convention

```
feat: add user registration endpoint
fix: resolve OTP verification bug
docs: update API documentation
style: format code with prettier
refactor: restructure auth flow
test: add login tests
chore: update dependencies
```

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

## 📞 Support

For questions or issues:

1. Check documentation first
2. Review code comments
3. Ask teammates
4. Create GitHub issue

---

**Last Updated**: 2024
**Project**: Tư vấn Sinh viên HCMUTE - Group 6
