import React from "react";

const AnswerThread = ({ replies = [] }) => {
  return (
    <div className="space-y-4">
      {replies.length === 0 ? (
        <div className="text-sm text-gray-500">No replies yet. Be the first to answer.</div>
      ) : (
        replies.map((r) => (
          <div key={r.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-800 font-semibold">{r.user}</div>
            <div className="text-sm text-gray-700 mt-1">{r.content}</div>
            <div className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnswerThread;

