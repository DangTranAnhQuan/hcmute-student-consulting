import React from "react";
import { useDispatch, useSelector } from "react-redux";
import QuestionCard from "../components/forum/QuestionCard";
import ForumThread from "../components/forum/ForumThread";
import CreateThreadModal from "../components/forum/CreateThreadModal";
import { fetchForumThreads, setActiveThread, setSearchQuery } from "../redux/forumSlice";

const ForumPage = () => {
  const dispatch = useDispatch();
  const { threads, activeThreadId, searchQuery, isLoading, error } = useSelector(
    (state) => state.forum,
  );
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchForumThreads(searchQuery));
    }, 250);

    return () => clearTimeout(timer);
  }, [dispatch, searchQuery]);

  const filtered = threads.filter(
    (thread) =>
      !searchQuery ||
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CỘT TRÁI: Tìm kiếm & Danh sách câu hỏi */}
      <div className="lg:col-span-1 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Diễn đàn</h1>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
            >
              Đặt câu hỏi
            </button>
          </div>
          <input
            value={searchQuery}
            onChange={(event) => dispatch(setSearchQuery(event.target.value))}
            placeholder="Tìm chủ đề..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div className="space-y-3">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-sm text-gray-500 text-center py-4">Đang tải chủ đề...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">Chưa có chủ đề phù hợp.</div>
          ) : (
            filtered.map((thread) => (
              <QuestionCard
                key={thread.id}
                thread={thread}
                onSelect={(id) => dispatch(setActiveThread(id))}
              />
            ))
          )}
        </div>
      </div>

      {/* CỘT PHẢI: Nội dung chi tiết bài viết đang được chọn */}
      <div className="lg:col-span-2">
        <ForumThread threadId={activeThreadId || threads[0]?.id} />
      </div>

      {/* Modal đặt câu hỏi ẩn/hiện dựa theo state */}
      <CreateThreadModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};

export default ForumPage;