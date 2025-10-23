import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Send } from "lucide-react";
import {
  getSocket,
  joinDiscussion,
  leaveDiscussion,
  emitTyping,
  emitStopTyping,
  initializeSocket,
} from "../../utils/socket";
import { useToast } from "../../hooks/useToast";

const Chat = ({ discussionId }) => {
  const { user, token: reduxToken } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const connectToChat = () => {
    if (!user) {
      showToast("Please log in to connect to chat", "warning");
      return;
    }
    // Improved token retrieval: Redux token, then localStorage, then AuthContext token fallback
    let token = reduxToken || localStorage.getItem("token");
    if (!token) {
      // Try to get token from AuthContext if available
      // Since AuthContext is not used here, this is a placeholder for future enhancement
      token = null;
    }
    if (!token) {
      showToast("Authentication token missing. Please log in again.", "error");
      return;
    }
    token = token.trim();
    if (!token) {
      showToast("Authentication token is empty. Please log in again.", "error");
      return;
    }
    const socket = initializeSocket(token);
    socket.on("connect", () => {
      setSocketConnected(true);
    });
    socket.on("disconnect", () => {
      setSocketConnected(false);
    });
    socket.on("connect_error", (error) => {
      console.error("Socket connection error in Chat component:", error);
      setSocketConnected(false);
    });
  };

  useEffect(() => {
    // Delay socket connection until token is available
    if (!reduxToken && !localStorage.getItem("token")) {
      return;
    }
    if (!socketConnected) {
      return;
    }
    const socket = getSocket();
    if (!socket) {
      return;
    }

    joinDiscussion(discussionId);

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleUserTyping = ({ user }) => {
      setTypingUsers((prev) => {
        if (prev.find((u) => u._id === user._id)) return prev;
        return [...prev, user];
      });
    };

    const handleUserStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u._id !== userId));
    };

    socket.on("chat-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("chat-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
      leaveDiscussion(discussionId);
    };
  }, [discussionId, socketConnected]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!user) {
      showToast("Please log in to send messages", "warning");
      return;
    }
    const socket = getSocket();
    if (!socket) {
      showToast("Socket not connected. Please wait for connection.", "error");
      return;
    }
    const message = {
      discussionId,
      userId: user._id,
      userName: user.name,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    socket.emit("chat-message", message);
    setInput("");
    // Removed local setMessages to avoid duplicate message on sender side
    // setMessages(prev => [...prev, message]);
    emitStopTyping(discussionId);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      emitTyping(discussionId, user);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(discussionId);
      }, 2000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col h-96 max-h-96">
      {!socketConnected ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <button
            onClick={connectToChat}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
          >
            Connect to Real-time Chat
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto mb-2">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-center mt-10">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 ${
                    msg.userId === user?._id ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block px-3 py-1 rounded-lg ${
                      msg.userId === user?._id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">{msg.userName}</div>
                    <div>{msg.content}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          {typingUsers.length > 0 && (
            <div className="text-gray-400 text-sm mb-2">
              {typingUsers.map((u) => u.name).join(", ")}{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing...
            </div>
          )}
          <div className="flex">
            <textarea
              className="flex-1 resize-none rounded-l-md bg-gray-700 border border-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-r-md transition-colors"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
