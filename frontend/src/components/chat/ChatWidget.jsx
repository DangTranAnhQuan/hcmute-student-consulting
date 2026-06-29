import React from "react";
import { useSelector } from "react-redux";
import { createChatSocket } from "../../services/socket";
import { chatAPI } from "../../services/chatService";

const ChatMessageRow = ({ message, currentUserId }) => {
  const messageSenderId = String(
    message.senderId || message.senderId?._id || "",
  );
  const isFromCurrentUser = messageSenderId === String(currentUserId);
  return (
    <div
      className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
          isFromCurrentUser
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-900"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className="mt-2 text-right text-[11px] text-slate-300">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState("");
  const [socket, setSocket] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const messagesEndRef = React.useRef(null);
  const isOpenRef = React.useRef(isOpen);
  const addMessage = React.useCallback((message) => {
    if (!message) return;
    const messageId = message.id || message._id;
    if (!messageId) return;

    setMessages((prev) => {
      if (prev.some((item) => (item.id || item._id) === messageId)) return prev;
      return [...prev, { ...message, id: messageId }];
    });
  }, []);

  React.useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const userId = React.useMemo(() => {
    const id = user?.id || user?._id;
    return id ? String(id) : null;
  }, [user?.id, user?._id]);

  React.useEffect(() => {
    if (!token || !userId) return;

    const chatSocket = createChatSocket({ token });

    chatSocket.on("connect", () => {
      console.log("Chat socket connected", chatSocket.id);
    });

    chatSocket.on("chat:message", (payload) => {
      if (!payload) return;
      const payloadReceiverId = String(
        payload.receiverUserId || payload.receiverUserId?._id || "",
      );
      const payloadSenderId = String(
        payload.senderId || payload.senderId?._id || "",
      );
      const relevant =
        payloadReceiverId === userId || payloadSenderId === userId;
      if (!relevant) return;

      addMessage(payload);
      if (!isOpenRef.current) {
        setUnreadCount((count) => count + 1);
      }
    });

    setSocket(chatSocket);

    return () => {
      chatSocket.disconnect();
    };
  }, [token, userId]);

  React.useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      chatAPI
        .history()
        .then((res) => {
          setMessages(res.data.data || []);
          setUnreadCount(0);
        })
        .catch((error) => {
          console.error("Lấy lịch sử chat thất bại", error);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = () => {
    const content = newMessage.trim();
    if (!content || !socket) return;

    socket.emit("chat:send", { content }, (message) => {
      if (message?.error) {
        console.error("Chat send failed", message.error);
        return;
      }
      addMessage(message);
    });
    setNewMessage("");
  };

  const handleToggle = () => {
    setIsOpen((open) => !open);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  if (!user || user.role === "admin") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="w-[360px] rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-3xl bg-blue-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Chat với Admin</p>
              <p className="text-xs text-blue-100">Hỗ trợ trực tuyến</p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="rounded-full bg-blue-500 px-3 py-1 text-sm font-bold hover:bg-blue-400"
            >
              Đóng
            </button>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="text-center text-sm text-slate-500">
                Đang tải lịch sử...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-sm text-slate-500">
                Chào {user.fullName || user.username}, hãy gửi tin nhắn để bắt
                đầu.
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageRow
                  key={message.id || message._id}
                  message={message}
                  currentUserId={user.id || user._id}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="rounded-b-3xl border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
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
                placeholder="Nhập tin nhắn..."
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={handleSend}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:bg-blue-700"
        aria-label="Mở chat"
      >
        <span className="text-xl">💬</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
