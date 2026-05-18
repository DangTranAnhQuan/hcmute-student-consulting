import React from "react";
import { useSelector } from "react-redux";

const SearchResults = () => {
  const { filteredItems, isLoading, error } = useSelector((state) => state.search);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
        Đang tải kết quả...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
        Không tìm thấy kết quả phù hợp.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredItems.map((item) => (
        <a
          key={item.id}
          href={`/detail/${item.type}/${item.refId}`}
          className="block bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {item.contentType}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">{item.excerpt}</p>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>🏷️ Chủ đề: {item.topic}</span>
            <span>🏫 Nguồn: {item.faculty}</span>
            <span>📈 Mức độ: {item.popularity}</span>
            <span>👁️ Lượt xem: {item.views}</span>
            {item.counselingFormat && <span>📍 Hình thức: {item.counselingFormat}</span>}
            {item.appointmentStatus && <span>📌 Trạng thái: {item.appointmentStatus}</span>}
          </div>
        </a>
      ))}
    </div>
  );
};

export default SearchResults;