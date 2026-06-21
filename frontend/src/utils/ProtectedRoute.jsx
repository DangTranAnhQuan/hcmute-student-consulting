import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu yêu cầu role cụ thể nhưng user không khớp
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn ({user?.role}) không được phép truy cập khu vực này.
          </p>
          <a href="/" className="text-blue-600 hover:underline">
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    const redirectUrl =
      user?.role === "admin" ? "/admin/cms" : "/profile";
    return <Navigate to={redirectUrl} replace />;
  }

  return children;
};
