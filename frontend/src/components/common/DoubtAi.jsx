import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../../slice/authSlice";
import {
  Send,
  Copy,
  Check,
  User,
  Bot,
  Code,
  Sparkles,
  Terminal,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { initializeSocket } from "../../utils/socket";
import axiosClient from "../../utils/axiosClient";
function DoubtAI({ problem }) {
  const dispatch = useDispatch();
  const { user, profileLoading, token } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [
        {
          text: "Hi there! 👋 I'm DobutAI, your expert coding assistant.\n\nHere's what I can help you with:\n\n🔹 **Code explanations** - Understand complex code\n🔹 **Debugging help** - Find and fix bugs\n🔹 **Algorithm design** - Optimize your solutions\n🔹 **Solution optimization** - Improve performance\n\n💡 Tip: You can ask me to explain concepts, write code, or help debug your solutions.\n\nWhat would you like to work on today?",
        },
      ],
      timestamp: new Date(),
    },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const messagesEndRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    dispatch(getProfile());
    const token = localStorage.getItem("authToken");
    if (token) {
      initializeSocket(token);
    }
  }, [dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const detectLanguage = (code) => {
    // Simple language detection based on code patterns
    if (code.includes("function"))
      return "javascript";
    if (code.includes("def ") || code.includes("import ")) return "python";
    if (code.includes("public class") || code.includes("System.out.println"))
      return "java";
    if (code.includes("#include") || code.includes("std::")) return "cpp";
    if (code.includes("<?php") || code.includes("echo ")) return "php";
    if (code.includes("package ") || code.includes('import "')) return "go";
    if (code.includes("fn ") || code.includes("println!")) return "rust";
    return "text";
  };

  const formatMessage = (text) => {
    if (!text) return null;

    // Split by code blocks, lists, and other markdown
    const parts = text.split(
      /(```[\s\S]*?```|`[^`]+`|\n\s*[-*•] |\n\s*\d+\. |\n\s*🔹 |\n\s*💡 |\n\s*⚠️ |\n\s*📝 )/
    );

    let isList = false;
    let listType = null;

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        // Multi-line code block
        const code = part.slice(3, -3);
        const [language, ...codeLines] = code.split("\n");
        const detectedLang = language.trim() || detectLanguage(code);
        const codeContent = codeLines.join("\n");

        return (
          <div key={index} className="my-4 relative group">
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-700/50 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-300 font-mono font-medium">
                    {detectedLang}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(codeContent, `code-${index}`)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300 hover:text-white"
                >
                  {copiedIndex === `code-${index}` ? (
                    <>
                      <Check size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className={`font-mono ${getCodeColor(detectedLang)}`}>
                  {highlightSyntax(codeContent, detectedLang)}
                </code>
              </pre>
            </div>
          </div>
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        // Inline code
        const code = part.slice(1, -1);
        return (
          <span
            key={index}
            className="bg-gray-800 text-orange-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700"
          >
            {code}
          </span>
        );
      } else if (
        part.match(/^\n\s*[-*•] /) ||
        part.match(/^\n\s*\d+\. /) ||
        part.match(/^\n\s*🔹 /)
      ) {
        // List item
        const bullet = part.match(/^\n\s*([-*•]|\d+\.|🔹)\s+/)[0].trim();
        const content = part.replace(/^\n\s*([-*•]|\d+\.|🔹)\s+/, "");

        if (
          !isList ||
          (bullet !== listType &&
            !(bullet.match(/\d+\./) && listType.match(/\d+\./)))
        ) {
          isList = true;
          listType = bullet;
          return (
            <ul
              key={index}
              className={`mt-2 mb-3 pl-5 ${
                bullet.match(/\d+\./) ? "list-decimal" : "list-disc"
              }`}
            >
              <li className="text-gray-200">{content}</li>
            </ul>
          );
        } else {
          return (
            <li key={index} className="text-gray-200">
              {content}
            </li>
          );
        }
      } else if (part.match(/^\n\s*💡 /)) {
        // Tip box
        const content = part.replace(/^\n\s*💡\s+/, "");
        return (
          <div
            key={index}
            className="my-3 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <span className="text-blue-400">💡</span>
              <span className="text-blue-200">{content}</span>
            </div>
          </div>
        );
      } else if (part.match(/^\n\s*⚠️ /)) {
        // Warning box
        const content = part.replace(/^\n\s*⚠️\s+/, "");
        return (
          <div
            key={index}
            className="my-3 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="text-orange-400 mt-0.5 flex-shrink-0"
              />
              <span className="text-orange-200">{content}</span>
            </div>
          </div>
        );
      } else {
        // Regular text with markdown formatting
        return (
          <span key={index} className="whitespace-pre-wrap text-gray-200">
            {part
              .split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|~~.*?~~|`[^`]+`)/g)
              .map((segment, i) => {
                if (segment.startsWith("**") && segment.endsWith("**")) {
                  return (
                    <strong key={i} className="font-semibold text-blue-300">
                      {segment.slice(2, -2)}
                    </strong>
                  );
                } else if (segment.startsWith("__") && segment.endsWith("__")) {
                  return (
                    <strong key={i} className="font-semibold text-blue-300">
                      {segment.slice(2, -2)}
                    </strong>
                  );
                } else if (segment.startsWith("*") && segment.endsWith("*")) {
                  return (
                    <em key={i} className="italic text-purple-300">
                      {segment.slice(1, -1)}
                    </em>
                  );
                } else if (segment.startsWith("_") && segment.endsWith("_")) {
                  return (
                    <em key={i} className="italic text-purple-300">
                      {segment.slice(1, -1)}
                    </em>
                  );
                } else if (segment.startsWith("~~") && segment.endsWith("~~")) {
                  return (
                    <del key={i} className="text-gray-400">
                      {segment.slice(2, -2)}
                    </del>
                  );
                } else if (segment.startsWith("`") && segment.endsWith("`")) {
                  const code = segment.slice(1, -1);
                  return (
                    <span
                      key={i}
                      className="bg-gray-800 text-orange-300 px-1 py-0.5 rounded text-sm font-mono border border-gray-700"
                    >
                      {code}
                    </span>
                  );
                }
                return segment;
              })}
          </span>
        );
      }
    });
  };

  // Simple syntax highlighting
  const highlightSyntax = (code, language) => {
    if (!code) return code;

    // Very basic highlighting for demo purposes
    const keywords = {
      javascript: [
        "function",
        "const",
        "let",
        "var",
        "return",
        "if",
        "else",
        "for",
        "while",
        "class",
        "new",
        "this",
      ],
      python: [
        "def",
        "class",
        "if",
        "else",
        "elif",
        "for",
        "while",
        "return",
        "import",
        "from",
        "as",
        "try",
        "except",
      ],
      java: [
        "public",
        "class",
        "static",
        "void",
        "return",
        "if",
        "else",
        "for",
        "while",
        "new",
        "this",
      ],
      cpp: [
        "#include",
        "using",
        "namespace",
        "int",
        "float",
        "double",
        "char",
        "void",
        "return",
        "if",
        "else",
        "for",
        "while",
        "class",
        "new",
        "this",
      ],
    };

    const langKeywords = keywords[language] || [];
    const keywordRegex = new RegExp(`\\b(${langKeywords.join("|")})\\b`, "g");

    return code.split("\n").map((line, i) => (
      <span
        key={i}
        className="block"
        dangerouslySetInnerHTML={{
          __html: line
            .replace(keywordRegex, '<span class="text-blue-400">$&</span>')
            .replace(/(["'].*?["'])/g, '<span class="text-green-400">$&</span>')
            .replace(
              /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
              '<span class="text-gray-500">$&</span>'
            )
            .replace(/\b(\d+)\b/g, '<span class="text-purple-400">$&</span>'),
        }}
      />
    ));
  };

  const getCodeColor = (language) => {
    const colors = {
      javascript: "text-yellow-400",
      python: "text-blue-400",
      java: "text-red-400",
      cpp: "text-purple-400",
      php: "text-indigo-400",
      go: "text-cyan-400",
      rust: "text-orange-400",
      default: "text-green-400",
    };
    return colors[language] || colors.default;
  };

  const onSubmit = async (data) => {
    const userMessage = {
      role: "user",
      parts: [{ text: data.message }],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    reset();
    setIsStreaming(true);
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts: [
              {
                text: `⚠️ **Error**\n\nPlease login to use Doubt AI.`,
              },
            ],
            timestamp: new Date(),
          },
        ]);
        setIsStreaming(false);
        return;
      }

      const response = await fetch(`/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          title: problem?.title,
          description: problem?.description,
          testCases: problem?.visibleTestCases,
          startCode: problem?.startCode,
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "An unknown error occurred");
      }

      dispatch(getProfile());

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      let streamingMessage = {
        role: "model",
        parts: [{ text: "" }],
        streaming: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, streamingMessage]);

      let isFirstChunk = true;

      const processStream = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n\n");
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const content = line.replace("data: ", "").trim();
              if (content === "[DONE]") return;

              if (isFirstChunk) {
                setIsTyping(false);
                isFirstChunk = false;
              }

              setMessages((prev) =>
                prev.map((msg, i) =>
                  i === prev.length - 1
                    ? {
                        ...msg,
                        parts: [{ text: msg.parts[0].text + content }],
                        timestamp: new Date(),
                      }
                    : msg
                )
              );
            }
          }
        }
      };

      await processStream();

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.streaming) {
          delete last.streaming;
          setTimeout(scrollToBottom, 50);
        }
        return updated;
      });
    } catch (err) {
      console.error("Streaming error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [
            {
              text: `⚠️ **Error**\n\n${err.message}`,
            },
          ],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsStreaming(false);
      setIsTyping(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-900 text-gray-100 items-center justify-center">
        <Loader className="animate-spin" size={48} />
        <p className="text-lg mt-4">Loading AI Assistant...</p>
      </div>
    );
  }

  if (!user?.isPremium) {
    return (
      <div className="flex flex-col h-full bg-gray-900 text-gray-100 items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg mb-8">
          You need to be a premium user to access the Doubt AI.
        </p>
        <NavLink to="/premium">
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
            Buy Premium
          </button>
        </NavLink>
      </div>
    );
  }

  if (user?.isPremium && user?.tokensLeft <= 0) {
    return (
      <div className="flex flex-col h-full bg-gray-900 text-gray-100 items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold mb-4">You've run out of tokens</h1>
        <p className="text-lg mb-8">
          Please purchase more tokens to continue using Doubt AI.
        </p>
        <NavLink to="/premium">
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
            Buy More Tokens
          </button>
        </NavLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg flex items-center gap-2">
                DobutAI
                <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={12} /> Pro
                </span>
              </h1>
              <p className="text-sm text-gray-400">Advanced coding assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.isPremium && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">
                  Tokens: {user.tokensLeft}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isStreaming ? "bg-orange-500 animate-pulse" : "bg-green-500"
                }`}
              ></div>
              <span className="text-sm text-gray-400">
                {isStreaming ? "Generating response..." : "Ready to assist"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-900/80 via-gray-900 to-gray-900">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            } animate-in slide-in-from-bottom-4 duration-300`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                  : "bg-gradient-to-r from-orange-500 to-orange-600"
              }`}
            >
              {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[85%] ${
                msg.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`rounded-xl px-4 py-3 relative group transition-all ${
                  msg.role === "user"
                    ? "bg-blue-600/90 text-white ml-auto shadow-lg"
                    : "bg-gray-800/90 text-gray-100 border border-gray-700/50 shadow-lg"
                }`}
              >
                <div className="break-words">
                  {msg.role === "user" ? (
                    <span className="whitespace-pre-wrap">
                      {msg.parts[0].text}
                    </span>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      {msg.streaming && msg.parts[0].text.length === 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      ) : (
                        formatMessage(msg.parts[0].text)
                      )}
                      {msg.streaming && msg.parts[0].text.length > 0 && (
                        <span className="inline-block w-2.5 h-4 bg-white animate-pulse ml-1" />
                      )}
                    </div>
                  )}
                </div>

                {/* Copy button for AI messages */}
                {msg.role === "model" && !msg.streaming && (
                  <button
                    onClick={() => copyToClipboard(msg.parts[0].text, index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 p-1.5 rounded-md shadow"
                    title="Copy to clipboard"
                  >
                    {copiedIndex === index ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy
                        size={14}
                        className="text-gray-300 hover:text-white"
                      />
                    )}
                  </button>
                )}
              </div>

              {/* Timestamp */}
              <div
                className={`text-xs mt-1.5 ${
                  msg.role === "user"
                    ? "text-blue-400/80"
                    : "text-orange-400/80"
                }`}
              >
                {msg.timestamp?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-800 bg-gray-900/90 backdrop-blur-sm p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex items-end gap-3"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                placeholder="Ask me anything about coding..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none min-h-[50px] max-h-32 transition-all duration-200 shadow-lg"
                disabled={isStreaming}
                rows="1"
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 128) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isStreaming && e.target.value.trim()) {
                      handleSubmit(onSubmit)();
                    }
                  }
                }}
                {...register("message", { required: true, minLength: 1 })}
              />
              {errors.message && (
                <p className="text-red-400 text-xs mt-1">
                  Please enter a message
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={errors.message || isStreaming}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[50px] shadow-lg hover:shadow-orange-500/30 disabled:hover:shadow-none"
            >
              {isStreaming ? (
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>

          {/* Typing indicator */}
          {isStreaming && (
            <div className="flex items-center gap-2 mt-3 text-gray-400 text-sm animate-pulse">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
              <span>DobutAI is generating your response...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoubtAI;
