import React from "react";
import { useSelector } from "react-redux";
import { Spinner } from "../components/UI";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import {
  NotificationWidget,
  NewsWidget,
  ScheduleWidget,
  ArticleWidget,
  DocumentWidget,
  EventWidget,
} from "../components/dashboard/DashboardWidgets";

const DashboardPage = () => {
  const { isLoading } = useSelector((state) => state.dashboard);
  const { isLoading: authLoading } = useSelector((state) => state.auth);

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with greeting and stats */}
      <DashboardHeader />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <a
          href="/news"
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition text-center"
        >
          <p className="text-2xl mb-2">📰</p>
          <p className="font-semibold text-gray-900">Tin Tức</p>
          <p className="text-sm text-gray-600">Cập nhật thông tin</p>
        </a>

        <a
          href="/articles"
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition text-center"
        >
          <p className="text-2xl mb-2">✍️</p>
          <p className="font-semibold text-gray-900">Bài Viết</p>
          <p className="text-sm text-gray-600">Đọc hướng dẫn</p>
        </a>

        <a
          href="/book-counselor"
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition text-center"
        >
          <p className="text-2xl mb-2">👤</p>
          <p className="font-semibold text-gray-900">Tư Vấn</p>
          <p className="text-sm text-gray-600">Đặt lịch hẹn</p>
        </a>

        <a
          href="/faq"
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition text-center"
        >
          <p className="text-2xl mb-2">❓</p>
          <p className="font-semibold text-gray-900">Câu Hỏi Thường Gặp</p>
          <p className="text-sm text-gray-600">Tìm câu trả lời</p>
        </a>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Notifications & News */}
        <div className="lg:col-span-2 space-y-6">
          <NotificationWidget />
          <NewsWidget />
          <ArticleWidget />
        </div>

        {/* Right Column - Schedule & Events */}
        <div className="space-y-6">
          <ScheduleWidget />
          <EventWidget />
        </div>
      </div>

      {/* Bottom Row - Documents */}
      <div className="mt-6">
        <DocumentWidget />
      </div>

      {/* Footer CTA */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          📚 Khám Phá Thêm Tài Nguyên
        </h3>
        <p className="text-gray-600 mb-4">
          Truy cập bộ sưu tập đầy đủ các bài viết, hướng dẫn và tài liệu học tập
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="/search"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            🔍 Tìm Kiếm Nâng Cao
          </a>
          <a
            href="/forum"
            className="bg-secondary hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            💬 Hỏi Đáp Cộng Đồng
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

