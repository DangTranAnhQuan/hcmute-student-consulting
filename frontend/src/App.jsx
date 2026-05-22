import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

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

// Components
import { Navbar, Footer } from "./components/Layout";

// Utils
import { ProtectedRoute, PublicRoute } from "./utils/ProtectedRoute";
import { logout } from "./redux/authSlice";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
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

            {/* Protected Routes (General Users) */}
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
            
            {/* Profile Routes (Support specific or fallback profiles) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute requiredRole="user">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute requiredRole="admin">
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
      </div>
    </Router>
  );
}

export default App;
