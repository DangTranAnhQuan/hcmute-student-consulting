import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteForumThread,
  toggleForumPin,
  toggleForumSolved,
  upvoteForumThread,
} from "../../redux/forumSlice";
import AnswerThread from "./AnswerThread";
import ReplyForm from "./ReplyForm";
import ConfirmModal from "../common/ConfirmModal";

const ForumThread = ({ threadId }) => {
  const dispatch = useDispatch();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const thread = useSelector((state) =>
    state.forum.threads.find((item) => item.id === threadId),
  );
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";
  const userId = user?.id || user?._id;
  const canMarkSolved = isAdmin || thread?.authorId === userId;

  if (!thread) {
    return <div className="text-sm text-gray-500">Chọn một chủ đề để xem chi tiết.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{thread.title}</h2>
          <div className="text-sm text-gray-500">
            Bởi {thread.author} • {new Date(thread.createdAt).toLocaleString("vi-VN")}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm font-semibold">{thread.votes || 0} hữu ích</div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => dispatch(upvoteForumThread(thread.id))}
              className={`px-3 py-1 rounded ${
                thread.hasVoted
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700"
              }`}
              title="Mỗi tài khoản chỉ được đánh dấu hữu ích một lần. Bấm lại để bỏ đánh dấu."
            >
              {thread.hasVoted ? "Đã thấy hữu ích" : "Hữu ích"}
            </button>
            {canMarkSolved ? (
              <button
                type="button"
                onClick={() => dispatch(toggleForumSolved(thread.id))}
                className={`px-3 py-1 rounded ${
                  thread.solved
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700"
                }`}
                title="Chủ câu hỏi hoặc admin dùng nút này khi câu hỏi đã có câu trả lời đủ dùng. Chủ đề đã giải quyết sẽ được hiển thị để người khác tham khảo."
              >
                {thread.solved ? "Mở lại câu hỏi" : "Đánh dấu đã giải quyết"}
              </button>
            ) : (
              <span
                className={`px-3 py-1 rounded text-sm ${
                  thread.solved
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-600"
                }`}
                title="Chỉ chủ câu hỏi hoặc admin được đánh dấu câu hỏi đã giải quyết."
              >
                {thread.solved ? "Đã giải quyết" : "Đang chờ trả lời đủ"}
              </span>
            )}
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => dispatch(toggleForumPin(thread.id))}
                  className="px-3 py-1 rounded bg-yellow-50 text-yellow-700"
                >
                  {thread.pinned ? "Bỏ ghim" : "Ghim"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1 rounded bg-red-50 text-red-700"
                >
                  Xóa
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="prose max-w-none text-gray-800">{thread.content}</div>
      {thread.solved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Chủ đề này đã được đánh dấu là đã giải quyết. Người đọc vẫn có thể tham khảo
          hoặc bổ sung trả lời nếu có thông tin mới.
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold">Trả lời</h3>
        <div className="mt-3 space-y-3">
          <AnswerThread threadId={thread.id} replies={thread.replies || []} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Viết trả lời</h3>
        <ReplyForm threadId={thread.id} />
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa chủ đề"
        message={`Bạn có chắc chắn muốn xóa chủ đề "${thread.title}"? Thao tác này không thể hoàn tác.`}
        onConfirm={() => {
          dispatch(deleteForumThread(thread.id));
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Xóa ngay"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default ForumThread;
