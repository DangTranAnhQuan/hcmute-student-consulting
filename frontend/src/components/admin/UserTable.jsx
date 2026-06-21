import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, changeUserRole, toggleUserBan } from "../../redux/adminUserSlice";
import { Spinner } from "../UI";
import ConfirmModal from "../common/ConfirmModal";

const UserTable = () => {
  const dispatch = useDispatch();
  const { users, pagination, isLoading } = useSelector((state) => state.adminUser);
  const { searchQuery } = useSelector((state) => state.admin);
  const [page, setPage] = useState(1);

  // State cho Custom Confirm Modal
  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "primary"
  });

  // Debounce search để tránh rate limit
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchUsers({ q: searchQuery, page, limit: 10 }));
    }, 500); // Chờ 500ms sau khi ngừng gõ mới gọi API

    return () => clearTimeout(timer);
  }, [dispatch, searchQuery, page]);

  const handleRoleChange = (userId, newRole) => {
    setConfirmData({
      isOpen: true,
      title: "Thay đổi quyền hạn",
      message: `Bạn có chắc chắn muốn đổi quyền của người dùng này sang "${newRole}"?`,
      type: "primary",
      onConfirm: () => {
        dispatch(changeUserRole({ id: userId, newRole }));
        setConfirmData(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleToggleBan = (userId, currentBanStatus) => {
    const action = currentBanStatus ? "mở khóa" : "khóa";
    setConfirmData({
      isOpen: true,
      title: currentBanStatus ? "Mở khóa tài khoản" : "Khóa tài khoản",
      message: `Bạn có chắc chắn muốn ${action} tài khoản người dùng này?`,
      type: currentBanStatus ? "primary" : "danger",
      onConfirm: () => {
        dispatch(toggleUserBan({ id: userId, isBanned: !currentBanStatus }));
        setConfirmData(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Confirm Modal thay thế window.confirm */}
      <ConfirmModal
        isOpen={confirmData.isOpen}
        title={confirmData.title}
        message={confirmData.message}
        type={confirmData.type}
        onConfirm={confirmData.onConfirm}
        onCancel={() => setConfirmData(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center">
                  <Spinner />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">Không tìm thấy người dùng</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{user.fullName || user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="counselor">Counselor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.isBanned ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    <button
                      onClick={() => handleToggleBan(user._id, user.isBanned)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                        user.isBanned
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                          : 'text-red-600 bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      {user.isBanned ? 'Mở khóa' : 'Khóa'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                p === page
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTable;

