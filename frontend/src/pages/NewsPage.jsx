import React from "react";
import { useSelector } from "react-redux";
import { Spinner } from "../components/UI";
import { CategoryFilter, SearchAndSort } from "../components/news/FilterComponents";
import { NewsGrid, NewsList } from "../components/news/NewsCards";
import { Header } from "../components/UI";

const NewsPage = () => {
  const { filteredNews, viewMode, isLoading, selectedCategory } = useSelector(
    (state) => state.news
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📰 Tin Tức</h1>
        <p className="text-gray-600">
          Cập nhật thông tin về các vị trí thực tập, công việc, và những điều thú vị
          trong ngành công nghệ
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar with Filters */}
        <div className="lg:col-span-1">
          <div className="space-y-6 sticky top-24">
            <CategoryFilter />
            <SearchAndSort />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Results Info */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-gray-900">
                {filteredNews.length}
              </span>{" "}
              bài viết
              {selectedCategory && selectedCategory !== "all" && (
                <span> trong danh mục này</span>
              )}
            </p>
          </div>

          {/* News Display */}
          {viewMode === "grid" ? (
            <NewsGrid news={filteredNews} />
          ) : (
            <NewsList news={filteredNews} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;

