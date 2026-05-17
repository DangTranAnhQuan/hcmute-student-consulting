import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllCounselors } from "../redux/scheduleSlice";
import { Spinner } from "../components/UI";

export default function CounselorsListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filterExpertise, setFilterExpertise] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { counselors, loading, error } = useSelector((state) => state.schedule);

  useEffect(() => {
    dispatch(getAllCounselors());
  }, [dispatch]);

  const filteredCounselors = counselors.filter((counselor) => {
    const matchesSearch = counselor.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesExpertise =
      filterExpertise === "all" ||
      (counselor.expertise && counselor.expertise.includes(filterExpertise));
    return matchesSearch && matchesExpertise;
  });

  const uniqueExpertise = [
    ...new Set(counselors.flatMap((c) => c.expertise || [])),
  ];

  const renderRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
          >
            ★
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Danh Sách Tư Vấn Viên
          </h1>
          <p className="text-gray-600">
            Chọn một tư vấn viên và đặt lịch hẹn với họ
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm tư vấn viên
              </label>
              <input
                type="text"
                placeholder="Nhập tên tư vấn viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chuyên môn
              </label>
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả chuyên môn</option>
                {uniqueExpertise.map((expertise) => (
                  <option key={expertise} value={expertise}>
                    {expertise}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {/* Counselors Grid */}
        {filteredCounselors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">
              Không tìm thấy tư vấn viên phù hợp
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCounselors.map((counselor) => (
              <div
                key={counselor._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>

                {/* Content */}
                <div className="p-6 -mt-12 relative">
                  {/* Avatar placeholder */}
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                    👨‍💼
                  </div>

                  {/* Name & Title */}
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-1">
                    {counselor.fullName}
                  </h3>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Tư vấn viên chuyên nghiệp
                  </p>

                  {/* Rating */}
                  <div className="flex justify-center mb-4">
                    {renderRating(counselor.rating || 0)}
                  </div>

                  {/* Expertise */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Chuyên môn:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {counselor.expertise && counselor.expertise.length > 0 ? (
                        counselor.expertise.map((exp, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                          >
                            {exp}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Không có thông tin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {counselor.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {counselor.bio}
                    </p>
                  )}

                  {/* Rate */}
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-sm text-gray-600">Giá:</p>
                    <p className="text-lg font-bold text-green-600">
                      ${counselor.hourlyRate || 0}/giờ
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-center text-sm">
                    <div className="bg-blue-50 rounded p-2">
                      <p className="font-bold text-blue-600">
                        {counselor.totalBookings || 0}
                      </p>
                      <p className="text-gray-600 text-xs">Đặt lịch</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <p className="font-bold text-green-600">
                        {counselor.isActive ? "✓" : "✗"}
                      </p>
                      <p className="text-gray-600 text-xs">Hoạt động</p>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => navigate(`/book-counselor/${counselor._id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Đặt Lịch Hẹn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-600">
            Đang hiển thị{" "}
            <span className="font-bold">{filteredCounselors.length}</span> tư
            vấn viên
            {filterExpertise !== "all" && ` (${filterExpertise})`}
          </p>
        </div>
      </div>
    </div>
  );
}
