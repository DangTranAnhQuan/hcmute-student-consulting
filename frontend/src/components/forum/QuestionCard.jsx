import React from "react";

const QuestionCard = ({ thread, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(thread.id)}
      className="w-full text-left bg-white p-4 rounded-lg shadow-sm hover:shadow-md border border-gray-100 transition"
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            {thread.title}
          </h3>
          
          {thread.pinned && (
            <span className="inline-block mt-1 mb-2 text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded font-medium">
              📌 Đã ghim
            </span>
          )}
          {thread.solved && (
            <span className="inline-block mt-1 mb-2 ml-2 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">
              Đã giải quyết
            </span>
          )}

          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{thread.content}</p>
          
          <div className="mt-2 flex gap-2 flex-wrap">
            {thread.tags?.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm font-semibold text-gray-700">
            {thread.votes || 0} hữu ích
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {thread.replies?.length || 0} trả lời
          </div>
        </div>
      </div>
    </button>
  );
};

export default QuestionCard;
