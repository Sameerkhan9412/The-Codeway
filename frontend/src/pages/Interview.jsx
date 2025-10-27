import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/common/Navbar";
import {
  Upload,
  Mic,
  MicOff,
  Clock,
  User,
  Bot,
  FileText,
  Target,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Send,
  Loader2,
  Star,
  MessageCircle,
  Timer,
  Zap,
  Brain,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import your API functions
import {
  useInterviewAPI,
  handleAPIError,
  createInterviewSession,
} from "../utils/Ai/interviewAPI";

const Interview = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState("upload");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [keySkills, setKeySkills] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [sessionStats, setSessionStats] = useState(null);
  const [error, setError] = useState(null);
  const [responseStartTime, setResponseStartTime] = useState(null);
  const [isEnding, setIsEnding] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize API hooks
  const {
    createSession,
    continueInterview,
    endInterview,
    getSessionStatus,
    getFeedback,
    generateFeedback,
  } = useInterviewAPI();

  // Timer management
  useEffect(() => {
    if (isInterviewActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isInterviewActive) {
      handleEndInterview();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, isInterviewActive]);

  // Progress calculation
  useEffect(() => {
    setInterviewProgress((questionCount / 5) * 100);
  }, [questionCount]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Enable continuous listening
      recognitionRef.current.interimResults = true; // Enable interim results for real-time feedback
      recognitionRef.current.lang = "en-US";

      // Store the complete transcript from all final results
      let finalTranscript = "";

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";

        // Process all results, both final and interim
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Update the text input with both final and interim transcripts
        // Final transcript contains all completed sentences
        // Interim transcript contains the current in-progress speech
        setTextInput(finalTranscript + interimTranscript);

        // For debugging
        console.log("Final transcript:", finalTranscript);
        console.log("Interim transcript:", interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      // Only set isRecording to false when recognition actually ends
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Track response time
  useEffect(() => {
    if (currentQuestion && !responseStartTime) {
      setResponseStartTime(Date.now());
    }
  }, [currentQuestion]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    // Validate file type
    const validTypes = ["application/pdf", "text/plain"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or TEXT file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get candidate info (you should have these from form inputs)
      const candidateInfo = {
        name: "Candidate Name", // Replace with actual input
        email: "candidate@example.com", // Replace with actual input
      };

      // Use the corrected createInterviewSession function
      const sessionData = await createInterviewSession(file, candidateInfo);

      // DEBUG: Log session data
      console.log("Session created:", sessionData);

      setSessionId(sessionData.sessionId);
      setCurrentQuestion(sessionData.question);
      setKeySkills(sessionData.keySkills || []);

      const firstMessage = {
        role: "ai",
        content: sessionData.question,
        timestamp: Date.now(),
      };
      setMessages([firstMessage]);

      setStage("interview");
      setIsInterviewActive(true);
      setQuestionCount(1);
      setTimeLeft(sessionData.timeLimit || 120);

      speakText(sessionData.question);
    } catch (error) {
      console.error("Error creating session:", error);

      // More user-friendly error messages
      let errorMessage = error.message || "Failed to create interview session";

      if (error.message.includes("Resume text")) {
        errorMessage =
          "Failed to extract text from your resume. Please try a different file format.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAnswer = async (answer) => {
    if (!answer.trim() || answer.trim().length < 5) {
      setError("Please provide a more detailed answer (at least 5 characters)");
      return;
    }

    const responseTime = responseStartTime
      ? Math.round((Date.now() - responseStartTime) / 1000)
      : 0;

    const userMessage = {
      role: "user",
      content: answer.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setTextInput("");
    setIsTyping(true);
    setError(null);

    try {
      setLoading(true);
      const response = await continueInterview(sessionId, answer, responseTime);

      setIsTyping(false);

      if (response.question) {
        const aiMessage = {
          role: "ai",
          content: response.question,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setCurrentQuestion(response.question);
        setQuestionCount((prev) => prev + 1);

        // Reset response time tracking
        setResponseStartTime(Date.now());

        // Update time if provided
        if (response.timeRemaining !== undefined) {
          setTimeLeft(response.timeRemaining);
        }

        // Check if interview should end
        if (response.isComplete || response.isLastQuestion) {
          setTimeout(() => handleEndInterview(), 1000);
        } else {
          speakText(response.question);
        }
      } else if (response.isComplete) {
        handleEndInterview();
      }
    } catch (error) {
      console.error("Error continuing interview:", error);
      const errorDetails = handleAPIError(error);
      setError(errorDetails.message);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    setIsInterviewActive(false);
    setLoading(true);
    setIsEnding(true);
    setError(null);

    try {
      // End the interview session
      const endResponse = await endInterview(sessionId);

      // Get detailed feedback
      const feedbackResponse = await getFeedback(sessionId);

      // Check if feedback response was successful and contains data
      if (feedbackResponse.success && feedbackResponse.data) {
        // Extract feedback and sessionStats from the response
        const feedbackData = feedbackResponse.data;

        // Check if feedback is nested inside a feedback property or directly in the data
        if (feedbackData.feedback) {
          // New structure: { feedback: {...}, sessionStats: {...} }
          setResult(feedbackData.feedback);
          setSessionStats(feedbackData.sessionStats);
        } else {
          // Old structure or direct data object
          setResult(feedbackData);
          setSessionStats(feedbackData.sessionStats);
        }
      } else {
        // Use feedback from endResponse if available
        if (endResponse && endResponse.data) {
          const endData = endResponse.data;
          if (endData.feedback) {
            setResult(endData.feedback);
            setSessionStats(endData.sessionStats);
          } else {
            setResult(endData);
            setSessionStats(endData.sessionStats);
          }
        } else {
          // Fallback to default feedback if nothing is available
          setResult({
            overallScore: 65,
            technicalScore: 60,
            communicationScore: 70,
            strengths: ["Completed the interview", "Showed engagement"],
            weaknesses: [
              "Could provide more detailed responses",
              "Technical depth needs improvement",
            ],
            improvements: [
              "Practice explaining technical concepts with examples",
              "Prepare STAR method responses",
              "Study fundamental concepts more deeply",
            ],
            detailedAnalysis:
              "Good participation in the interview. Focus on providing more specific examples and deeper technical explanations.",
          });

          // Set default session stats
          setSessionStats({
            duration: 0,
            questionsAnswered: 0,
            averageResponseTime: 0,
            completionRate: 0,
            keySkillsEvaluated: keySkills,
          });
        }
      }
      setStage("result");
    } catch (error) {
      console.error("Error ending interview:", error);
      const errorDetails = handleAPIError(error);
      setError(errorDetails.message);

      // Show basic results even if API fails
      setResult({
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        strengths: ["Interview completed"],
        weaknesses: [
          "Unable to generate detailed feedback due to technical issues",
        ],
        improvements: ["Please try again later for detailed analysis"],
        detailedAnalysis:
          "Technical issues prevented detailed analysis. Your responses were recorded.",
      });
      setStage("result");
    } finally {
      setLoading(false);
      setIsEnding(false);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      // Reset the text input when starting a new recording
      setTextInput("");

      // Reset the finalTranscript in the recognition handler
      if (typeof recognitionRef.current.onresult === "function") {
        const originalOnResult = recognitionRef.current.onresult;
        recognitionRef.current.onresult = function (event) {
          // Create a new closure with a fresh finalTranscript
          let finalTranscript = "";

          // Process all results, both final and interim
          let interimTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + " ";
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          // Update the text input with both final and interim transcripts
          setTextInput(finalTranscript + interimTranscript);

          // For debugging
          console.log("Final transcript:", finalTranscript);
          console.log("Interim transcript:", interimTranscript);
        };
      }

      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetInterview = () => {
    setStage("upload");
    setSessionId(null);
    setMessages([]);
    setTimeLeft(120);
    setIsInterviewActive(false);
    setResult(null);
    setCurrentQuestion("");
    setQuestionCount(0);
    setKeySkills([]);
    setTextInput("");
    setInterviewProgress(0);
    setSessionStats(null);
    setError(null);
    setResponseStartTime(null);
  };

  const handleSubmit = () => {
    if (textInput.trim()) {
      // Stop recording if it's active before submitting
      if (isRecording) {
        stopRecording();
      }
      handleUserAnswer(textInput);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const dismissError = () => {
    setError(null);
  };

  // Error Display Component
  const ErrorDisplay = ({ message, onDismiss }) => (
    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5" />
        <span>{message}</span>
      </div>
      <button onClick={onDismiss} className="text-red-200 hover:text-white">
        ×
      </button>
    </div>
  );

  // Upload Stage
  if (stage === "upload") {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <Navbar />
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full">
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/50">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    AI Interview Assistant
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Upload your resume to begin your personalized interview
                  </p>
                </div>

                <div className="space-y-6">
                  {error && (
                    <ErrorDisplay message={error} onDismiss={dismissError} />
                  )}

                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-orange-500 transition-all duration-300 hover:bg-gray-700/20">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2 font-medium">
                      Upload Resume
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      PDF format, max 5MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="resume-upload"
                      className={`bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-orange-600 hover:to-red-600 transition-all duration-300 inline-flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Choose File</span>
                    </label>
                  </div>

                  {loading && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-3" />
                      <span className="text-gray-300">
                        Analyzing your resume...
                      </span>
                    </div>
                  )}

                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                    <div className="flex items-center space-x-3 mb-3">
                      <Zap className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-200">
                        What to Expect
                      </h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <span>Personalized technical questions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <span>Timed interview session</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <span>Detailed feedback and scoring</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Interview Stage
  if (stage === "interview") {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
        {isEnding && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="text-xl text-white">
              Ending interview and generating your results...
            </p>
          </div>
        )}
        {/* Enhanced Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 p-4">
          <div className="max-w-6xl mx-auto">
            {error && <ErrorDisplay message={error} onDismiss={dismissError} />}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">AI Technical Interview</h1>
                  <p className="text-gray-400 text-sm">
                    Question {questionCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span
                    className={`font-mono text-lg font-bold ${
                      timeLeft < 30
                        ? "text-red-400 animate-pulse"
                        : "text-orange-400"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                  disabled={loading}
                  title="Back to Home"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 19h6"
                    />
                  </svg>
                  <span>Home</span>
                </button>
                <button
                  onClick={handleEndInterview}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                  disabled={loading || isEnding}
                >
                  {isEnding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Ending...</span>
                    </>
                  ) : (
                    "End Interview"
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${interviewProgress}%` }}
              ></div>
            </div>

            {/* Skills Tags */}
            {keySkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {keySkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-700/50 text-orange-400 px-3 py-1 rounded-full text-sm font-medium border border-orange-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 max-w-5xl mx-auto w-full p-6 overflow-y-auto">
          <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl h-full flex flex-col border border-gray-700/50 shadow-2xl">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-5 py-4 rounded-2xl shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : "bg-gray-700/50 text-white backdrop-blur-lg border border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-75 font-medium">
                        {message.role === "user" ? "You" : "AI Interviewer"}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 px-5 py-4 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <span className="text-xs opacity-75 font-medium">
                        AI Interviewer
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-700/50">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your answer here... (or use voice recording)"
                    className="w-full bg-gray-700/50 backdrop-blur-lg border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none min-h-[60px] max-h-32"
                    rows="2"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-3 flex items-center space-x-2">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                      disabled={loading}
                    >
                      {isRecording ? (
                        <MicOff className="w-4 h-4 text-white" />
                      ) : (
                        <Mic className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!textInput.trim() || loading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="flex items-center justify-center mt-3 text-red-400 text-sm font-medium">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  Recording... Speak clearly into your microphone. Click the
                  microphone button again or the send button when finished.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Stage
  if (stage === "result") {
    return (
      <div
        id="results-section"
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
      >
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Interview Complete!
            </h1>
            <p className="text-gray-300 text-lg">
              Here's your detailed performance analysis
            </p>
          </div>

          {error && <ErrorDisplay message={error} onDismiss={dismissError} />}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mr-3" />
              <span className="text-gray-300 text-lg">
                Analyzing your performance...
              </span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Target className="w-6 h-6 text-orange-500" />
                      <h3 className="font-semibold text-lg">Overall Score</h3>
                    </div>
                    <div className="text-3xl font-bold text-orange-400">
                      {result?.overallScore || 0}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${result?.overallScore || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Brain className="w-6 h-6 text-blue-500" />
                      <h3 className="font-semibold text-lg">Technical</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-400">
                      {result?.technicalScore || 0}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${result?.technicalScore || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-6 h-6 text-green-500" />
                      <h3 className="font-semibold text-lg">Communication</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-400">
                      {result?.communicationScore || 0}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${result?.communicationScore || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-purple-500" />
                      <h3 className="font-semibold text-lg">ATS Score</h3>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">
                      {result?.atsScore || 0}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${result?.atsScore || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Hiring Recommendation */}
              {result?.hiringRecommendation && (
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <Award className="w-6 h-6 text-amber-500" />
                    <h3 className="font-semibold text-lg">
                      Hiring Recommendation
                    </h3>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.hiringRecommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Career Advice */}
              {result?.careerAdvice && (
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                    <h3 className="font-semibold text-lg">
                      Career Development Advice
                    </h3>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.careerAdvice}
                    </p>
                  </div>
                </div>
              )}

              {/* Session Statistics */}
              {sessionStats && (
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                    <h3 className="font-semibold text-xl">
                      Session Statistics
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {sessionStats.duration
                          ? formatTime(sessionStats.duration)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-gray-400">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {sessionStats.questionsAnswered || 0}
                      </div>
                      <div className="text-sm text-gray-400">
                        Questions Answered
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {sessionStats.averageResponseTime || 0}s
                      </div>
                      <div className="text-sm text-gray-400">
                        Avg Response Time
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {sessionStats.completionRate || 0}%
                      </div>
                      <div className="text-sm text-gray-400">
                        Completion Rate
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Feedback */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="font-semibold text-lg">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {result?.strengths?.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Star className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">
                          {strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-yellow-500" />
                    <h3 className="font-semibold text-lg">
                      Areas for Improvement
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {result?.weaknesses?.map((weakness, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">
                          {weakness}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-6 h-6 text-purple-500" />
                  <h3 className="font-semibold text-lg">Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {result?.improvements?.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-400 text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-gray-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Analysis */}
              {result?.detailedAnalysis && (
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-6 h-6 text-indigo-500" />
                    <h3 className="font-semibold text-lg">Detailed Analysis</h3>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.detailedAnalysis}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Skills Assessment */}
              {keySkills.length > 0 && result?.skillsAssessment && (
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <Users className="w-6 h-6 text-cyan-500" />
                    <h3 className="font-semibold text-lg">Skills Assessment</h3>
                  </div>
                  <div className="space-y-4">
                    {keySkills.map((skill, index) => {
                      const skillScore = result.skillsAssessment[skill] || 0;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-300 font-medium">
                            {skill}
                          </span>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${skillScore}%` }}
                              ></div>
                            </div>
                            <span className="text-cyan-400 font-bold text-sm w-10">
                              {skillScore}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback Status Message */}
              {error && (
                <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-400">{error}</span>
                  </div>
                  <button
                    onClick={dismissError}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 flex-wrap gap-4">
                <button
                  onClick={resetInterview}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Start New Interview</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  <span>Save Results</span>
                </button>

                {/* Regenerate Feedback Button */}
                {!result || Object.keys(result).length === 0 ? (
                  <button
                    onClick={async () => {
                      setLoading(true);
                      setError(""); // Clear any previous errors
                      try {
                        const feedbackResponse = await generateFeedback(
                          sessionId
                        );
                        if (feedbackResponse.success && feedbackResponse.data) {
                          const feedbackData = feedbackResponse.data;

                          if (feedbackData.feedback) {
                            setResult(feedbackData.feedback);
                            setSessionStats(feedbackData.sessionStats);
                          } else {
                            setResult(feedbackData);
                            setSessionStats(feedbackData.sessionStats);
                          }

                          // Scroll to top of results section
                          document
                            .getElementById("results-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        } else {
                          setError(
                            feedbackResponse.error ||
                              "Failed to generate feedback. Please try again."
                          );
                        }
                      } catch (error) {
                        console.error("Error generating feedback:", error);
                        setError(
                          "Failed to generate feedback. Please try again."
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Generate Feedback</span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Interview;
