import React from "react";
import { useDispatch } from "react-redux";
import { createReply } from "../../redux/forumSlice";

const ReplyForm = ({ threadId }) => {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    dispatch(createReply({ threadId, reply: { user: "You", content: value } }));
    setValue("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Write your reply (be polite and concise)"
        className="w-full border border-gray-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">
          Post Reply
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;

