import React from "react";
import { useSelector } from "react-redux";
import { Spinner } from "../components/UI";
import { CategoryFilter, SearchAndSort } from "../components/news/FilterComponents";
import { NewsGrid, NewsList } from "../components/news/NewsCards";

const ArticlesPage = () => {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">✍️ Bài Viết</h1>
        <p className="text-gray-600">
          Khám phá các bài viết hướng dẫn, kỹ năng mềm, tâm lý học sinh viên và
          những kiến thức bổ ích khác
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

          {/* Articles Display */}
          {viewMode === "grid" ? (
            <NewsGrid news={filteredNews} />
          ) : (
            <NewsList news={filteredNews} />
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 bg-blue-50 border-2 border-primary rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Có câu hỏi?
        </h3>
        <p className="text-gray-600 mb-4">
          Không tìm thấy bài viết bạn cần? Hãy đăng câu hỏi lên diễn đàn Q&A
        </p>
        <a
          href="/forum"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          💬 Đi tới Diễn Đàn Q&A
        </a>
      </div>
    </div>
  );
};

export default ArticlesPage;

