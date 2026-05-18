import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCategory,
  clearAllFilters,
  setSearchQuery,
  setSortBy,
  setViewMode,
} from "../../redux/newsSlice";
import { mockCategories } from "../../utils/mockData";

export const CategoryFilter = () => {
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state) => state.news);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Danh Mục</h3>
        {selectedCategory !== "all" && (
          <button
            onClick={() => dispatch(clearAllFilters())}
            className="text-sm text-primary hover:text-primary-dark"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => dispatch(setCategory("all"))}
          className={`w-full text-left px-4 py-3 rounded-lg transition font-medium ${
            selectedCategory === "all"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          📰 Tất Cả Bài Viết
        </button>

        {mockCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => dispatch(setCategory(category.id))}
            className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-center gap-2 ${
              selectedCategory === category.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            <span>{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export const SearchAndSort = () => {
  const dispatch = useDispatch();
  const { searchQuery, sortBy, viewMode } = useSelector(
    (state) => state.news
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🔍 Tìm Kiếm</h3>
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Sort */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Sắp Xếp</h3>
        <div className="space-y-2">
          <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="latest"
              checked={sortBy === "latest"}
              onChange={(e) =>
                dispatch(setSortBy(e.target.value))
              }
              className="mr-2"
            />
            <span className="text-gray-700">Mới Nhất</span>
          </label>
          <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="popular"
              checked={sortBy === "popular"}
              onChange={(e) =>
                dispatch(setSortBy(e.target.value))
              }
              className="mr-2"
            />
            <span className="text-gray-700">Phổ Biến Nhất</span>
          </label>
          <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
            <input
              type="radio"
              name="sort"
              value="trending"
              checked={sortBy === "trending"}
              onChange={(e) =>
                dispatch(setSortBy(e.target.value))
              }
              className="mr-2"
            />
            <span className="text-gray-700">Xu Hướng</span>
          </label>
        </div>
      </div>

      {/* View Mode */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">👁️ Hiển Thị</h3>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(setViewMode("grid"))}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
              viewMode === "grid"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ⊞ Lưới
          </button>
          <button
            onClick={() => dispatch(setViewMode("list"))}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition ${
              viewMode === "list"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ⋮ Danh Sách
          </button>
        </div>
      </div>
    </div>
  );
};

export default { CategoryFilter, SearchAndSort };