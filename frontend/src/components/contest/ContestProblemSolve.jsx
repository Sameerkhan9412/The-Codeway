import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Play,
  Send,
  Terminal,
  Maximize2,
  Minimize2,
  Settings,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  Zap,
} from "lucide-react";
import axiosClient from "../../utils/axiosClient";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext.jsx";
import { useContest } from "../../context/ContestContext";
import { useDispatch } from "react-redux";
import { getProfile } from "../../slice/authSlice";

const ContestProblemSolve = () => {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const consoleRef = useRef(null);

  const { contest, setContest, setHasEntered, setHasCompleted } = useContest();

  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submitResults, setSubmitResults] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    theme: "vs-dark",
  });
  const [showConsole, setShowConsole] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [problemSolved, setProblemSolved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setProblemSolved(false);

    if (!contestId || !problemId || problemId === "problems") {
      showToast("Invalid contest or problem ID", "error");
      navigate(`/contest/${contestId}`);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const contestResponse = await axiosClient.get(`/contest/${contestId}`);
        if (!isMounted) return;

        const { contest, userStatus } = contestResponse.data;
        setContest(contest);
        setHasEntered(userStatus?.isRegistered || false);
        setHasCompleted(userStatus?.isCompleted || false);

        if (!contest) {
          showToast("Contest not found", "error");
          navigate(`/contest`);
          return;
        }

        const problemResponse = await axiosClient.get(
          `/contest/${contestId}/problem/${problemId}`
        );
        if (!isMounted) return;

        if (problemResponse.data && problemResponse.data.problem) {
          const problemData = problemResponse.data.problem;
          setProblem(problemData);
        } else {
          showToast("Problem not found", "error");
          navigate(`/contest/${contestId}`);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching data:", error);
        showToast("Failed to load problem data", "error");
        navigate(`/contest/${contestId}`);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [contestId, problemId]);

  useEffect(() => {
    if (!problem) return;

    const localStorageKey = `contest_${contestId}_problem_${problemId}_${selectedLanguage}_code`;
    const savedCode = localStorage.getItem(localStorageKey);

    if (savedCode) {
      setCode(savedCode);
    } else if (problem.startCode && Array.isArray(problem.startCode)) {
      const starter = problem.startCode.find(
        (sc) => sc.language.toLowerCase() === selectedLanguage
      );
      setCode(starter ? starter.initialCode : "");
    } else {
      setCode("");
    }
  }, [selectedLanguage, problem, contestId, problemId]);

  useEffect(() => {
    if (!contest) return;

    const calculateRemainingTime = () => {
      const now = new Date();
      const endTime = new Date(contest.endTime);
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        setRemainingTime("Contest Ended");
        if (!isSubmitting) {
          handleSubmitCode(true);
        }
        return null;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const timerInterval = setInterval(() => {
      const timeLeft = calculateRemainingTime();
      setRemainingTime(timeLeft);
      if (timeLeft === null) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [contest, isSubmitting]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleCodeChange = (value) => {
    setCode(value);
    const localStorageKey = `contest_${contestId}_problem_${problemId}_${selectedLanguage}_code`;
    localStorage.setItem(localStorageKey, value);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      showToast("Please write some code first", "warning");
      return;
    }
    try {
      setIsRunning(true);
      setShowConsole(true);
      setRunResults(null);
      setSubmitResults(null);
      const response = await axiosClient.post(
        `/contest/${contestId}/problem/${problemId}/run`,
        {
          code,
          language: selectedLanguage,
        }
      );
      setRunResults(response.data);
    } catch (error) {
      console.error("Error running code:", error);
      showToast(
        error.response?.data?.message ||
          "An error occurred while running the code.",
        "error"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async (isAutoSubmit = false) => {
    if (!code.trim() && !isAutoSubmit) {
      showToast("Please write some code first", "warning");
      return;
    }
    try {
      setIsSubmitting(true);
      setShowConsole(true);
      setRunResults(null);
      setSubmitResults(null);
      const response = await axiosClient.post(
        `/contest/${contestId}/problem/${problemId}/submit`,
        {
          code,
          language: selectedLanguage,
        }
      );
      const data = response.data;
      if (data.success) {
        setSubmitResults(data.submission);
        if (data.submission.status === "Accepted") {
          showToast("Solution accepted! 🎉", "success");
          dispatch(getProfile());
          setProblemSolved(true);
        } else {
          showToast(`Submission status: ${data.submission.status}`, "warning");
        }
      } else {
        setSubmitResults(null);
        showToast(data.message || "Submission failed.", "error");
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmitResults({
        status: "Error",
        errorMessage: error.response?.data?.message || "An error occurred.",
      });
      showToast(
        error.response?.data?.message || "Failed to submit code.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCode = () => {
    if (problem && problem.startCode && Array.isArray(problem.startCode)) {
      const starter = problem.startCode.find(
        (sc) => sc.language.toLowerCase() === selectedLanguage
      );
      const localStorageKey = `contest_${contestId}_problem_${problemId}_${selectedLanguage}_code`;
      localStorage.removeItem(localStorageKey);
      setCode(starter ? starter.initialCode : "");
    } else {
      setCode("");
    }
  };

  const getLanguageForMonaco = (language) =>
    ({
      javascript: "javascript",
      python: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
    }[language] || language);

  const getDifficultyColor = (difficulty) =>
    ({
      easy: "text-green-400",
      medium: "text-yellow-400",
      hard: "text-red-400",
    }[difficulty.toLowerCase()] || "text-gray-400");

  const getDifficultyBgColor = (difficulty) =>
    ({
      easy: "bg-green-400/10 border-green-400/30",
      medium: "bg-yellow-400/10 border-yellow-400/30",
      hard: "bg-red-400/10 border-red-400/30",
    }[difficulty.toLowerCase()] || "bg-gray-400/10 border-gray-400/30");

  const currentProblemIndex = useMemo(
    () => contest?.problems?.findIndex((p) => p._id === problemId),
    [contest, problemId]
  );

  const nextProblem = useMemo(
    () =>
      contest &&
      currentProblemIndex !== -1 &&
      currentProblemIndex < contest.problems.length - 1
        ? contest.problems[currentProblemIndex + 1]
        : null,
    [contest, currentProblemIndex]
  );

  const isLastProblem = useMemo(
    () => contest && currentProblemIndex === contest.problems.length - 1,
    [contest, currentProblemIndex]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!problem || !contest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Content Not Found</h2>
        <p className="text-gray-400 mb-6 text-center">
          The content you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate(`/contest/${contestId}`)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md text-white font-medium"
        >
          Back to Contest
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-900 ${
        isFullScreen ? "fixed inset-0 z-50" : "min-h-screen"
      }`}
    >
      <div className="bg-gray-800/50 border-b border-gray-700/50 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/contest/${contestId}`)}
            className="mr-4 text-gray-400 hover:text-white"
          >
            &larr; Back
          </button>
          <h1 className="text-xl font-bold text-white mr-3">{problem.title}</h1>
          <div
            className={`px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyBgColor(
              problem.difficulty
            )}`}
          >
            <span className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-800 rounded-md px-3 py-1.5 border border-gray-700">
            <Timer className="w-4 h-4 text-orange-400 mr-2" />
            <span className="text-white font-mono">{remainingTime}</span>
          </div>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 text-gray-400 hover:text-white"
            title={isFullScreen ? "Exit" : "Fullscreen"}
          >
            {isFullScreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                <div className="p-3 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-white">
                    Editor Settings
                  </h3>
                </div>
                <div className="p-3">
                  <div className="mb-3">
                    <label className="block text-sm text-gray-400 mb-1">
                      Font Size
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={editorSettings.fontSize}
                        onChange={(e) =>
                          setEditorSettings({
                            ...editorSettings,
                            fontSize: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-white">
                        {editorSettings.fontSize}px
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Theme
                    </label>
                    <select
                      value={editorSettings.theme}
                      onChange={(e) =>
                        setEditorSettings({
                          ...editorSettings,
                          theme: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border-gray-600 rounded-md px-3 py-1.5 text-sm text-white"
                    >
                      <option value="vs-dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-2/5 lg:w-1/3 border-r border-gray-700/50 overflow-y-auto">
          <div className="border-b border-gray-700/50">
            <div className="flex">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-4 py-3 text-sm font-medium flex-1 ${
                  activeTab === "description"
                    ? "text-orange-400 border-b-2 border-orange-400"
                    : "text-gray-400"
                }`}
              >
                Description
              </button>
            </div>
          </div>
          <div className="p-4">
            {activeTab === "description" && (
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl font-bold text-white mb-4">
                  {problem.title}
                </h2>
                <div className="mb-6">
                  <div
                    dangerouslySetInnerHTML={{ __html: problem.description }}
                    className="text-gray-300"
                  />
                </div>
                {problem.visibleTestCases?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Examples
                    </h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((tc, i) => (
                        <div
                          key={i}
                          className="bg-gray-800/50 border border-gray-700/50 rounded-md"
                        >
                          <div className="px-4 py-2 bg-gray-800 text-sm font-medium text-white">
                            Example {i + 1}
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <div className="text-xs text-gray-400 mb-1">
                                Input:
                              </div>
                              <pre className="bg-gray-800/30 p-2 rounded text-sm">
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">
                                Output:
                              </div>
                              <pre className="bg-gray-800/30 p-2 rounded text-sm">
                                {tc.output}
                              </pre>
                            </div>
                            {tc.explanation && (
                              <div>
                                <div className="text-xs text-gray-400 mb-1">
                                  Explanation:
                                </div>
                                <div className="text-sm">{tc.explanation}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {problem.constraints && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Constraints
                    </h3>
                    <div
                      dangerouslySetInnerHTML={{ __html: problem.constraints }}
                      className="text-gray-300"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col">
          <div className="border-b border-gray-700/50 p-3 flex items-center justify-between">
            <div className="flex items-center">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white mr-3"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
              <button
                onClick={resetCode}
                className="flex items-center px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-sm text-gray-300"
                title="Reset Code"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className={`flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-sm text-white ${
                  isRunning ? "opacity-70" : ""
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Run
                  </>
                )}
              </button>
              {problemSolved ? (
                <>
                  {nextProblem && (
                    <button
                      onClick={() =>
                        navigate(
                          `/contest/${contestId}/problem/${nextProblem._id}`
                        )
                      }
                      className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-md text-sm text-white"
                    >
                      Next Problem &rarr;
                    </button>
                  )}
                  {isLastProblem && (
                    <button
                      onClick={() =>
                        navigate(`/contest/${contestId}/leaderboard`)
                      }
                      className="flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm text-white"
                    >
                      View Leaderboard
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleSubmitCode(false)}
                  disabled={isSubmitting || remainingTime === "Contest Ended"}
                  className={`flex items-center px-3 py-1.5 bg-orange-500 hover:bg-orange-600 rounded-md text-sm text-white ${
                    isSubmitting || remainingTime === "Contest Ended"
                      ? "opacity-70"
                      : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Submit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex-grow relative">
            <Editor
              height="100%"
              language={getLanguageForMonaco(selectedLanguage)}
              value={code}
              theme={editorSettings.theme}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                ...editorSettings,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>
          <div
            className={`border-t border-gray-700/50 transition-all duration-300 ${
              showConsole ? "h-64" : "h-10"
            }`}
          >
            <div
              className="flex items-center justify-between px-4 py-2 bg-gray-800 cursor-pointer"
              onClick={() => setShowConsole(!showConsole)}
            >
              <div className="flex items-center">
                <Terminal className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-white">Console</span>
              </div>
              <button className="text-gray-400 hover:text-white">
                {showConsole ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
            {showConsole && (
              <div
                className="h-[calc(100%-36px)] overflow-y-auto p-4 bg-gray-800/50"
                ref={consoleRef}
              >
                {!runResults && !submitResults && (
                  <div className="text-gray-400 text-sm italic">
                    Run or submit code to see results.
                  </div>
                )}
                {runResults && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                      <Play className="w-4 h-4 text-blue-400 mr-1" />
                      Run Results
                    </h3>
                    {runResults.testCases?.map((tc, i) => (
                      <div
                        key={i}
                        className="mb-3 border border-gray-700/50 rounded-md"
                      >
                        <div
                          className={`px-3 py-2 text-xs font-medium flex items-center justify-between ${
                            tc.passed
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          <div className="flex items-center">
                            {tc.passed ? (
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                            )}
                            Test Case {i + 1}
                          </div>
                          {tc.runtime && (
                            <div className="text-xs opacity-80">
                              {tc.runtime}ms
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-800/30 text-sm space-y-2">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Input:
                            </div>
                            <pre className="bg-gray-800/30 p-2 rounded text-xs">
                              {tc.input}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Expected:
                            </div>
                            <pre className="bg-gray-800/30 p-2 rounded text-xs">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Your Output:
                            </div>
                            <pre className="bg-gray-800/30 p-2 rounded text-xs">
                              {tc.actualOutput}
                            </pre>
                          </div>
                          {tc.error && (
                            <div>
                              <div className="text-xs text-red-400 mb-1">
                                Error:
                              </div>
                              <pre className="bg-red-900/20 p-2 rounded text-xs">
                                {tc.error}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {submitResults && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                      <Send className="w-4 h-4 text-orange-400 mr-1" />
                      Submission Results
                    </h3>
                    <div
                      className={`p-4 rounded-md mb-3 flex items-center ${
                        submitResults.status === "Accepted"
                          ? "bg-green-900/30"
                          : "bg-red-900/30"
                      }`}
                    >
                      {submitResults.status === "Accepted" ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mr-2" />
                      )}
                      <div>
                        <div
                          className={`font-medium ${
                            submitResults.status === "Accepted"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {submitResults.status}
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          {submitResults.testCasesPassed} /{" "}
                          {submitResults.totalTestCases} passed
                        </div>
                        {submitResults.runtime && (
                          <div className="text-xs text-gray-400 mt-1">
                            Runtime: {submitResults.runtime}ms | Memory:{" "}
                            {submitResults.memory}KB
                          </div>
                        )}
                        {submitResults.score !== undefined && (
                          <div className="text-sm text-orange-300 mt-1 flex items-center">
                            <Zap className="w-4 h-4 mr-1" />
                            Score: {submitResults.score}
                          </div>
                        )}
                      </div>
                    </div>
                    {submitResults.errorMessage && (
                      <div className="mb-3">
                        <div className="text-xs text-red-400 mb-1">Error:</div>
                        <pre className="bg-red-900/20 p-3 rounded text-xs">
                          {submitResults.errorMessage}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestProblemSolve;
