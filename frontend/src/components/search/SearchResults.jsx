import React from "react";
import { useSelector } from "react-redux";

const SearchResults = () => {
  const { filteredItems } = useSelector((state) => state.search);

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
        Khong tim thay ket qua phu hop voi bo loc hien tai.
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
            <span>🏷️ {item.topic}</span>
            <span>🏫 {item.faculty}</span>
            <span>📈 {item.popularity}</span>
            <span>👁️ {item.views}</span>
            <span>📍 {item.counselingFormat}</span>
            <span>📌 {item.appointmentStatus}</span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default SearchResults;

