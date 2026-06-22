import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch } from "react-redux";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import NewsPage from "./pages/NewsPage";
import ArticlesPage from "./pages/ArticlesPage";
import DetailPage from "./pages/DetailPage";
import SearchPage from "./pages/SearchPage";
import FAQPage from "./pages/FAQPage";
import AdminPage from "./pages/AdminPage";
import ForumPage from "./pages/ForumPage";
import BookCounselorPage from "./pages/BookCounselorPage";
import CounselorsListPage from "./pages/CounselorsListPage";
import ConsultationAdminOrdersPage from "./pages/ConsultationAdminOrdersPage";
import ConsultationCartPage from "./pages/ConsultationCartPage";
import ConsultationCheckoutPage from "./pages/ConsultationCheckoutPage";
import ConsultationOrderDetailPage from "./pages/ConsultationOrderDetailPage";
import ConsultationOrdersPage from "./pages/ConsultationOrdersPage";
import SchedulesPage from "./pages/SchedulesPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminChatPage from "./pages/AdminChatPage";
import ChatWidget from "./components/chat/ChatWidget";

// Components
import { Navbar, Footer } from "./components/Layout";

// Utils
import { ProtectedRoute, PublicRoute } from "./utils/ProtectedRoute";
import { getProfileSuccess, setBannedStatus } from "./redux/authSlice";
import { fetchSystemSettings } from "./redux/systemSettingsSlice";
import { authAPI } from "./services/api";
import { useAuth } from "./redux/hooks";
import ConfirmModal from "./components/common/ConfirmModal";

function AppContent() {
  const dispatch = useDispatch();
  const { user, isBannedAccount, logout } = useAuth();

  React.useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  React.useEffect(() => {
    if (user && !user.fullName) {
      // Chỉ fetch nếu chưa có thông tin đầy đủ
      authAPI
        .getProfile()
        .then((res) => {
          dispatch(getProfileSuccess(res.data));
        })
        .catch((err) => {});
    }
  }, [dispatch, user?.id, user?.fullName]);

  const handleLogout = () => {
    logout();
    dispatch(setBannedStatus(false));
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/detail/:type/:id" element={<DetailPage />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes (General Users: student, counselor, admin) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <ForumPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-counselor"
            element={
              <ProtectedRoute>
                <CounselorsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-counselor/:counselorId"
            element={
              <ProtectedRoute>
                <BookCounselorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedules"
            element={
              <ProtectedRoute>
                <SchedulesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation-cart"
            element={
              <ProtectedRoute>
                <ConsultationCartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation-checkout"
            element={
              <ProtectedRoute>
                <ConsultationCheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation-orders"
            element={
              <ProtectedRoute>
                <ConsultationOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation-orders/:id"
            element={
              <ProtectedRoute>
                <ConsultationOrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Unified Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Dedicated Routes */}
          <Route
            path="/admin/cms"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/consultation-orders"
            element={
              <ProtectedRoute requiredRole="admin">
                <ConsultationAdminOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      {user?.role !== "admin" && <ChatWidget />}

      {/* Custom Modal thông báo tài khoản bị khóa (Redux-based) */}
      <ConfirmModal
        isOpen={isBannedAccount}
        title="Tài khoản đã bị khóa"
        message="Tài khoản của bạn hiện đang bị tạm khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."
        confirmText="Đăng xuất"
        onConfirm={handleLogout}
        type="danger"
        showCancel={false}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
