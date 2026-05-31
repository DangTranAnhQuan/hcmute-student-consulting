import React from "react";
import { useSelector } from "react-redux";
import { contentAPI, consultationOrderAPI, forumAPI } from "../../services/api";

export const DashboardHeader = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = React.useState({
    totalOrders: 0,
    activeOrders: 0,
    newContent: 0,
    forumThreads: 0,
  });

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const [ordersRes, contentRes, forumRes] = await Promise.all([
          consultationOrderAPI.list(),
          contentAPI.list({ contentType: "News,Event,Article", sortBy: "latest" }),
          forumAPI.listThreads(""),
        ]);
        const orders = ordersRes.data.data || [];
        setStats({
          totalOrders: orders.length,
          activeOrders: orders.filter(
            (order) => !["COMPLETED", "CANCELLED"].includes(order.status),
          ).length,
          newContent: contentRes.data.total || 0,
          forumThreads: forumRes.data.threads?.length || 0,
        });
      } catch (error) {
        setStats((current) => current);
      }
    };

    loadStats();
  }, []);

  const displayName = user?.fullName || user?.username || user?.email || "Sinh viên";
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-6 mb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-blue-100 mt-2">
            Theo dõi yêu cầu tư vấn, nội dung học vụ và thảo luận cộng đồng từ dữ liệu hệ thống.
          </p>
        </div>
        <a
          href="/book-counselor"
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-blue-50"
        >
          Đặt tư vấn mới
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-blue-100 text-sm mb-1">Yêu cầu tư vấn</p>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>

        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-blue-100 text-sm mb-1">Đang xử lý</p>
          <p className="text-2xl font-bold">{stats.activeOrders}</p>
        </div>

        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-blue-100 text-sm mb-1">Nội dung hệ thống</p>
          <p className="text-2xl font-bold">{stats.newContent}</p>
        </div>

        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-blue-100 text-sm mb-1">Chủ đề forum</p>
          <p className="text-2xl font-bold">{stats.forumThreads}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
