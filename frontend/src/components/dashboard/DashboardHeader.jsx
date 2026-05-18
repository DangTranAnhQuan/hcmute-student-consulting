import React from "react";
import { useSelector } from "react-redux";
import { mockUserData } from "../../utils/mockData";

export const DashboardHeader = () => {
  const { user } = useSelector((state) => state.auth);
  const { notifications, populerArticles } = useSelector(
    (state) => state.dashboard,
  );

  const userData = user || mockUserData;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buổi sáng tốt";
    if (hour < 18) return "Bây giờ chào";
    return "Buổi tối tốt";
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <img
            src={userData.avatar}
            alt={userData.fullName}
            className="w-16 h-16 rounded-full object-cover border-4 border-white"
          />
          <div>
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {userData.fullName}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Đang học tại {userData.faculty}
            </p>
          </div>
        </div>
        <div className="text-sm bg-white/20 px-3 py-2 rounded-lg">
          MSSV: {userData.studentId}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-blue-100 text-sm mb-1">📬 Thông Báo</p>
          <p className="text-2xl font-bold">
            {unreadNotifications}
            <span className="text-lg font-normal ml-1">mới</span>
          </p>
        </div>

        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-blue-100 text-sm mb-1">💬 Bài Viết Đã Xem</p>
          <p className="text-2xl font-bold">{userData.articlesRead}</p>
        </div>

        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-blue-100 text-sm mb-1">❤️ Đã Lưu</p>
          <p className="text-2xl font-bold">{userData.savedCount}</p>
        </div>

        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-blue-100 text-sm mb-1">📊 Hoạt Động</p>
          <p className="text-2xl font-bold">
            {populerArticles.length + unreadNotifications}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

