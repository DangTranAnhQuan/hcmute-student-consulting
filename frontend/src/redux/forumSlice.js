import { createSlice } from "@reduxjs/toolkit";
import { mockForumThreads } from "../utils/mockData";

const initialState = {
  threads: mockForumThreads || [],
  activeThreadId: null,
  searchQuery: "",
};

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    setActiveThread: (state, action) => {
      state.activeThreadId = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    createThread: (state, action) => {
      const newThread = {
        id: `thread-${Date.now()}`,
        title: action.payload.title,
        content: action.payload.content,
        author: action.payload.author || "Anonymous",
        tags: action.payload.tags || [],
        createdAt: new Date().toISOString(),
        solved: false,
        votes: 0,
        replies: [],
      };
      state.threads.unshift(newThread);
      state.activeThreadId = newThread.id;
    },
    createReply: (state, action) => {
      const { threadId, reply } = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.replies.push({
          id: `r-${Date.now()}`,
          user: reply.user || "Anonymous",
          content: reply.content,
          createdAt: new Date().toISOString(),
        });
      }
    },
    upvoteThread: (state, action) => {
      const thread = state.threads.find((t) => t.id === action.payload);
      if (thread) thread.votes = (thread.votes || 0) + 1;
    },
    toggleSolved: (state, action) => {
      const thread = state.threads.find((t) => t.id === action.payload);
      if (thread) thread.solved = !thread.solved;
    },
    deleteThread: (state, action) => {
      state.threads = state.threads.filter((t) => t.id !== action.payload);
      if (state.activeThreadId === action.payload) state.activeThreadId = null;
    },
  },
});

export const {
  setActiveThread,
  setSearchQuery,
  createThread,
  createReply,
  upvoteThread,
  toggleSolved,
  deleteThread,
} = forumSlice.actions;

export default forumSlice.reducer;

