import React from "react";
import { Badge } from "../common/CommonUI";

export const NewsCard = ({ news, variant = "grid" }) => {
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const getIcon = (categoryId) => {
    const icons = {
      academic: "📚",
      scholarship: "🎓",
      internship: "💼",
      jobs: "🚀",
      softskills: "🎯",
      psychology: "🧠",
      regulations: "📋",
    };
    return icons[categoryId] || "📰";
  };

  if (variant === "list") {
    return (
      <a
        href={`/detail/news/${news.id}`}
        className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-lg transition group bg-white"
      >
        <img
          src={news.image}
          alt={news.title}
          className="w-32 h-32 rounded object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
              {news.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {news.excerpt}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Bởi {news.author}</span>
            <span>👁️ {news.views}</span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={`/detail/news/${news.id}`}
      className="flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition group h-full"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="primary" size="sm">
            {getIcon(news.categoryId)}
          </Badge>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary line-clamp-2 mb-2">
          {news.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
          {news.excerpt}
        </p>
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs text-gray-500 mb-2">Bởi {news.author}</p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>👁️ {news.views}</span>
            <span>{formatDate(news.date)}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export const NewsGrid = ({ news }) => {
  if (news.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500 text-lg">Không tìm thấy bài viết</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} variant="grid" />
      ))}
    </div>
  );
};

export const NewsList = ({ news }) => {
  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không tìm thấy bài viết</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} variant="list" />
      ))}
    </div>
  );
};
