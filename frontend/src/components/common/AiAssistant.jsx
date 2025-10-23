import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logutUser } from "../../slice/authSlice";
import "./AiAssistant.css";

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "👋 Hi! I'm CodeWay AI Assistant! I can help you navigate the platform and answer questions about coding. What would you like to do?",
      sender: "ai"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const quickActions = [
    { text: "🏠 Go to Dashboard", action: () => handleQuickAction("take me to dashboard") },
    { text: "🏆 View Contests", action: () => handleQuickAction("show me contests") },
    { text: "💎 Premium Features", action: () => handleQuickAction("what are premium features") },
    { text: "📊 Problems", action: () => handleQuickAction("show problems") }
  ];

  const handleQuickAction = (message) => {
    setInputValue(message);
    setTimeout(() => handleSendMessage(message), 100);
  };

  const handleSendMessage = async (customMessage = null) => {
    const messageText = customMessage || inputValue.trim();
    if (messageText === "" || isLoading) return;

    if (!isAuthenticated) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "You need to be logged in to use the assistant.",
          sender: "ai",
        },
      ]);
      return;
    }

    const userMessage = { text: messageText, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Authentication token missing. Please login.",
            sender: "ai",
          },
        ]);
        dispatch(logutUser());
        setTimeout(() => navigate("/login"), 2000);
        setIsLoading(false);
        setIsTyping(false);
        return;
      }

      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${baseURL}/ai/assistant?query=${encodeURIComponent(messageText)}`, {
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.body) {
        throw new Error("Streaming not supported or response body is empty.");
      }
      
      let fullResponse = "";
      let aiMessageIndex = -1;

      setMessages(prev => {
        const newMessages = [...prev, {text: "", sender: "ai", isTyping: true}];
        aiMessageIndex = newMessages.length - 1;
        return newMessages;
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsLoading(false);
            setIsTyping(false);
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages[aiMessageIndex]) {
                newMessages[aiMessageIndex].isTyping = false;
              }
              return newMessages;
            });

            let parsedRoute = null;
            try {
              const jsonMatch = fullResponse.match(/{.*}/s);
              if (jsonMatch) {
                const jsonResponse = JSON.parse(jsonMatch[0]);
                if (jsonResponse.route) {
                  parsedRoute = jsonResponse.route;
                }
              }
            } catch (e) {
              console.error("Could not parse route from AI response", e);
            }

            if (parsedRoute) {
              if (!isAuthenticated) {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    text: "🔐 You need to be logged in to access this feature. Redirecting to login...",
                    sender: "ai",
                  },
                ]);
                setTimeout(() => navigate("/login"), 2000);
              } else if (
                (parsedRoute === "/doubt" || parsedRoute === "/premium") &&
                user && !user.isPremium
              ) {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    text: "💎 This is a premium feature. Please upgrade your plan to access it!",
                    sender: "ai",
                  },
                ]);
              } else {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    text: `🚀 Taking you there now...`,
                    sender: "ai",
                  },
                ]);
                setTimeout(() => navigate(parsedRoute), 1000);
              }
            }
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); 

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonString = line.substring(6).trim();
              if (jsonString) {
                try {
                  const data = JSON.parse(jsonString);
                  if (data.text) {
                    fullResponse += data.text;
                    setMessages(prev => {
                      const newMessages = [...prev];
                      if (newMessages[aiMessageIndex]) {
                        newMessages[aiMessageIndex].text = fullResponse;
                        newMessages[aiMessageIndex].isTyping = true;
                      }
                      return newMessages;
                    });
                  }
                } catch (e) {
                  console.error("Error parsing JSON from stream:", e, jsonString);
                }
              }
            }
          }
        }
      };
      
      await processStream();

    } catch (error) {
      console.error("Error sending message:", error);
      if (error.response && error.response.status === 401) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Your session has expired. Please log in again.",
            sender: "ai",
          },
        ]);
        dispatch(logutUser());
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "🚫 Failed to send message. Please check your connection and try again.",
            sender: "ai",
          },
        ]);
      }
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`ai-assistant ${isOpen ? "open" : ""}`}>
      <button className="assistant-toggle" onClick={handleToggle}>
        {isOpen ? (
          <>
            <span className="toggle-icon">✖️</span>
            <span className="toggle-text">Close</span>
          </>
        ) : (
          <>
            <span className="toggle-icon">🤖</span>
            <span className="toggle-text">The CodeWay AI</span>
          </>
        )}
      </button>
      
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="ai-avatar">🤖</div>
            <div className="ai-info">
              <h3>The CodeWay Assistant</h3>
              <span className={`status ${isTyping ? 'typing' : 'online'}`}>
                {isTyping ? '✍️ Typing...' : '🟢 Online'}
              </span>
            </div>
          </div>

          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {msg.text}
                    {msg.isTyping && (
                      <span className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    )}
                  </div>
                  <div className="message-time">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="quick-actions">
              <div className="quick-actions-title">🚀 Quick Actions:</div>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-btn"
                    onClick={action.action}
                    disabled={isLoading}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="input-area">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="💬 Ask me anything about CodeWay..."
                disabled={isLoading}
                className="message-input"
              />
              <button 
                onClick={() => handleSendMessage()} 
                disabled={isLoading || !inputValue.trim()}
                className="send-button"
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
            <div className="input-hint">
              💡 Try: "Show me contests", "Take me to dashboard", "What's premium?"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
