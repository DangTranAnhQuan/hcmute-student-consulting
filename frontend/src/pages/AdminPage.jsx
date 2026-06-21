import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminTabs from "../components/admin/AdminTabs";
import AdminToolbar from "../components/admin/AdminToolbar";
import AdminDataTable from "../components/admin/AdminDataTable";
import AdminFormModal from "../components/admin/AdminFormModal";
import { fetchAdminResource, clearAdminError } from "../redux/adminSlice";
import { useCustomToast } from "../context/CustomToastContext";

const AdminPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useCustomToast();
  const { activeModule, error } = useSelector((state) => state.admin);

  useEffect(() => {
    // Xóa sạch lỗi cũ khi đổi tab để tránh hiện "Resource không tồn tại"
    dispatch(clearAdminError());

    if (["articles", "faqs", "counselors"].includes(activeModule)) {
      dispatch(fetchAdminResource({ resource: activeModule }));
    }
  }, [dispatch, activeModule]);

  // Hiển thị Toast cho lỗi Rate Limit
  useEffect(() => {
    if (error && (error.includes("quá nhiều thao tác") || error.includes("15 phút"))) {
      showToast(error, "error");
      dispatch(clearAdminError());
    }
  }, [error, dispatch, showToast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Admin CMS
        </h1>
        <p className="text-gray-600">
          Quản lý nội dung xuất bản, FAQ và tư vấn viên. Dữ liệu Published sẽ hiển thị cho người dùng, tư vấn viên tạm ẩn sẽ không còn được đặt yêu cầu mới.
        </p>
        <a
          href="/admin/consultation-orders"
          className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Quản lý yêu cầu tư vấn
        </a>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AdminTabs />
      <AdminToolbar />
      <AdminDataTable />
      <AdminFormModal />
    </div>
  );
};

export default AdminPage;
