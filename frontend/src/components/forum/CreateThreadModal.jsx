import React from "react";
import { useDispatch } from "react-redux";
import { createThread } from "../../redux/forumSlice";
import { mockCategories } from "../../utils/mockData";

const CreateThreadModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState([]);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setContent("");
      setTags([]);
    }
  }, [open]);

  const toggleTag = (t) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    dispatch(createThread({ title: title.trim(), content: content.trim(), tags, author: "Student" }));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <form onSubmit={onSubmit} className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Ask a Question</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your question in one sentence"
            className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Details</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Provide details, steps you've tried, and any context"
            className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Tags (Category)</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {mockCategories.slice(0,6).map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleTag(c.name)}
                className={`px-3 py-1 rounded text-sm border ${tags.includes(c.name) ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-700 border-transparent'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white">Post Question</button>
        </div>
      </form>
    </div>
  );
};

export default CreateThreadModal;

