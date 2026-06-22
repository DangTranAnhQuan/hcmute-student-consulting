import React from "react";
import { useSelector } from "react-redux";
import { createChatSocket } from "../services/socket";
import { chatAPI } from "../services/chatService";

const UserItem = ({ user, active, onClick, lastMessage }) => (
  <button
    type="button"
    onClick={() => onClick(user)}
    className={`w-full rounded-2xl px-4 py-3 text-left transition ${
      active
        ? "bg-blue-50 text-slate-900"
        : "bg-white text-slate-700 hover:bg-slate-50"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-blue-700">
        {user.fullName?.slice(0, 1).toUpperCase() ||
          user.username?.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {user.fullName || user.username || user.email}
        </p>
        <p className="truncate text-xs text-slate-500">
          {lastMessage ? lastMessage.content : "Không có tin nhắn"}
        </p>
      </div>
    </div>
  </button>
);

const AdminChatPage = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [chatUsers, setChatUsers] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [socket, setSocket] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    if (!token || !user || user.role !== "admin") return;
    const chatSocket = createChatSocket({ token });

    chatSocket.on("connect", () => {
      console.log("Admin chat socket connected", chatSocket.id);
    });

    chatSocket.on("chat:message", (payload) => {
      if (!payload) return;
      if (!selectedUser) return;
      if (payload.receiverUserId === selectedUser.id) {
        setMessages((prev) => [...prev, payload]);
      }
    });

    setSocket(chatSocket);
    return () => {
      chatSocket.disconnect();
    };
  }, [token, user, selectedUser]);

  React.useEffect(() => {
    if (user?.role !== "admin") return;
    chatAPI
      .chatUsers()
      .then((res) => {
        setChatUsers(res.data.data || []);
        if (!selectedUser && res.data.data?.length) {
          setSelectedUser(res.data.data[0].user);
        }
      })
      .catch((error) => {
        console.error("Lấy danh sách chat người dùng thất bại", error);
      });
  }, [user, selectedUser]);

  React.useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    chatAPI
      .history(selectedUser.id)
      .then((res) => {
        setMessages(res.data.data || []);
      })
      .catch((error) => {
        console.error("Lấy lịch sử chat user thất bại", error);
      })
      .finally(() => setLoading(false));
  }, [selectedUser]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const content = newMessage.trim();
    if (!content || !socket || !selectedUser) return;

    socket.emit("chat:send", {
      content,
      receiverUserId: selectedUser.id,
    });
    setNewMessage("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">
        Quản lý chat Admin
      </h1>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-3">
          {chatUsers.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Chưa có cuộc trò chuyện nào.
            </div>
          ) : (
            <div className="space-y-2">
              {chatUsers.map((chatItem) => (
                <UserItem
                  key={chatItem.user.id}
                  user={chatItem.user}
                  active={selectedUser?.id === chatItem.user.id}
                  onClick={setSelectedUser}
                  lastMessage={chatItem.lastMessage}
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Chat với người dùng
              </p>
              <p className="text-xs text-slate-500">
                {selectedUser
                  ? selectedUser.fullName || selectedUser.email
                  : "Chọn người dùng để bắt đầu."}
              </p>
            </div>
          </div>

          <div className="min-h-[400px] max-h-[520px] space-y-3 overflow-y-auto px-2 py-2">
            {loading ? (
              <div className="text-sm text-slate-500">Đang tải lịch sử...</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-slate-500">
                Không có tin nhắn trong cuộc trò chuyện này.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderRole === "admin"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                      message.senderRole === "admin"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className="mt-2 text-right text-[11px] text-slate-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
              disabled={!selectedUser}
              placeholder={
                selectedUser
                  ? "Gõ tin nhắn..."
                  : "Chọn người dùng để bắt đầu chat"
              }
              className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!selectedUser || !newMessage.trim()}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
