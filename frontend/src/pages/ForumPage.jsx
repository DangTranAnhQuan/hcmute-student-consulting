import React from "react";
import { useSelector, useDispatch } from "react-redux";
import QuestionCard from "../components/forum/QuestionCard";
import ForumThread from "../components/forum/ForumThread";
import { setActiveThread, createThread, setSearchQuery } from "../redux/forumSlice";

const ForumPage = () => {
  const dispatch = useDispatch();
  const { threads, activeThreadId, searchQuery } = useSelector((s) => s.forum);

  const filtered = threads.filter((t) =>
    !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onCreate = () => {
    const title = prompt("Thread title:");
    if (!title) return;
    const content = prompt("Content:");
    dispatch(createThread({ title, content, author: "Admin" }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Q&A Forum</h1>
          <div className="flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search threads..."
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={onCreate} className="px-3 py-2 bg-primary text-white rounded">Ask</button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-sm text-gray-500">No threads found.</div>
          ) : (
            filtered.map((t) => (
              <QuestionCard key={t.id} thread={t} onSelect={(id) => dispatch(setActiveThread(id))} />
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <ForumThread threadId={activeThreadId || (threads[0] && threads[0].id)} />
      </div>
    </div>
  );
};

export default ForumPage;

