// Lightweight service wrapper for future API integration
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const fetchThreads = async () => {
  const res = await api.get('/forum/threads');
  return res.data;
};

export const postThread = async (payload) => {
  const res = await api.post('/forum/threads', payload);
  return res.data;
};

export const postReply = async (threadId, payload) => {
  const res = await api.post(`/forum/threads/${threadId}/replies`, payload);
  return res.data;
};

export default { fetchThreads, postThread, postReply };

