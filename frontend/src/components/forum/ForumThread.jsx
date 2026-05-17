import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveThread, upvoteThread, toggleSolved, deleteThread } from "../../redux/forumSlice";
import AnswerThread from "./AnswerThread";
import ReplyForm from "./ReplyForm";

const ForumThread = ({ threadId }) => {
  const dispatch = useDispatch();
  const thread = useSelector((s) => s.forum.threads.find((t) => t.id === threadId));

  if (!thread) return <div className="text-sm text-gray-500">Select a thread to view details.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{thread.title}</h2>
          <div className="text-sm text-gray-500">By {thread.author} • {new Date(thread.createdAt).toLocaleString()}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm font-semibold">{thread.votes || 0} ▲</div>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(upvoteThread(thread.id))}
              className="px-3 py-1 rounded bg-blue-50 text-blue-700"
            >
              Upvote
            </button>
            <button
              onClick={() => dispatch(toggleSolved(thread.id))}
              className={`px-3 py-1 rounded ${thread.solved ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}
            >
              {thread.solved ? 'Solved' : 'Mark Solved'}
            </button>
            <button
              onClick={() => dispatch(deleteThread(thread.id))}
              className="px-3 py-1 rounded bg-red-50 text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="prose max-w-none text-gray-800">{thread.content}</div>

      <div>
        <h3 className="text-lg font-semibold">Replies</h3>
        <div className="mt-3 space-y-3">
          <AnswerThread replies={thread.replies || []} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Write a reply</h3>
        <ReplyForm threadId={thread.id} />
      </div>
    </div>
  );
};

export default ForumThread;

