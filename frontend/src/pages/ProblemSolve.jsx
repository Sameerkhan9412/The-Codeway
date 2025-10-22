import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { useParams, NavLink } from "react-router-dom";
import codeway from "../utils/logo/codeway.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchSolvedProblems } from "../slice/problemSlice";
import { toast } from "react-toastify";

import {
  Play,
  Send,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  Clock,
  MemoryStick,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Code2,
  FileText,
  BookOpen,
  History,
  Trophy,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import Editorial from "../components/common/Editorial";
import axiosClient from "../utils/axiosClient";
import DobutAi from "../components/common/DoubtAi";
import SubmissionHistory from "../components/common/SubmissionHistory";

const ProblemPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState("vs-dark");
  const [showConsole, setShowConsole] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [doubtMessages, setDoubtMessages] = useState([]);
  const [doubtInput, setDoubtInput] = useState("");
  const [isDoubtLoading, setIsDoubtLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const messagesEndRef = useRef(null);
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  const languages = [
    { id: "javascript", name: "JavaScript", icon: "🟨" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "cpp", name: "C++", icon: "⚡" },
  ];

  // Handle panel resizing
  const startResizing = (e) => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResizing);
  };

  const handleResize = (e) => {
    if (isResizing && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      setLeftPanelWidth(Math.min(Math.max(newLeftWidth, 30), 70));
    }
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResizing);
  };

  // Fetch problem data
  const fetchProblem = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(
        `/problem/getProblemById/${problemId}`
      );
      setProblem(response.data);
    } catch (error) {
      console.error("Error fetching problem:", error);
    } finally {
      setLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    fetchProblem();

    window.addEventListener("focus", fetchProblem);

    return () => {
      window.removeEventListener("focus", fetchProblem);
    };
  }, [fetchProblem]);

  // Update code when language changes
  useEffect(() => {
    if (problem && problem?.startCode && problem?.startCode.length > 0) {
      const initialCode =
        problem.startCode.find((sc) => {
          const backendLang = sc.language.toLowerCase().trim();
          if (selectedLanguage === "cpp") {
            return backendLang === "cpp" || backendLang === "c++";
          }
          return backendLang === selectedLanguage;
        })?.initialCode || "";
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setShowConsole(true);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab("testcase");
    } catch (error) {
      console.error("Error running code:", error);
      setRunResult({
        success: false,
        error: error.response?.data?.message || "Internal server error",
      });
      setLoading(false);
      setActiveRightTab("testcase");
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(
        `/submission/submit/${problemId}`,
        {
          code: code,
          language: selectedLanguage,
        }
      );

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab("result");

      // Update problem solved status if submission accepted
      if (response.data && response.data.accepted) {
        console.log("Submission accepted, updating problem solved status");
        setProblem(prevProblem => ({
          ...prevProblem,
          solved: true
        }));
        
        // Dispatch action to update solved problems in Redux store
        try {
          console.log("Dispatching fetchSolvedProblems after successful submission");
          await dispatch(fetchSolvedProblems()).unwrap();
          console.log("Successfully updated solved problems in Redux store");
          
          // Show success toast
          toast.success("Problem marked as solved!", {
            position: "top-right",
            autoClose: 3000
          });
        } catch (error) {
          console.error("Error updating solved problems:", error);
          toast.error("Problem solved, but failed to update your solved problems list");
        }
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmitResult({
        success: false,
        error: error.response?.data?.message || "Submission failed",
      });
      setLoading(false);
      setActiveRightTab("result");
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case "javascript":
        return "javascript";
      case "java":
        return "java";
      case "cpp":
        return "cpp";
      default:
        return "javascript";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-emerald-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getDifficultyBgColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-emerald-400/10";
      case "medium":
        return "bg-yellow-400/10";
      case "hard":
        return "bg-red-400/10";
      default:
        return "bg-gray-400/10";
    }
  };

  const resetCode = () => {
    if (problem) {
      const initialCode =
        problem.startCode.find((sc) => {
          const backendLang = sc.language.toLowerCase();
          if (selectedLanguage === "cpp") {
            return backendLang === "cpp" || backendLang === "c++";
          }
          return backendLang === selectedLanguage;
        })?.initialCode || "";
      setCode(initialCode);
    }
  };

  if (loading && !problem) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-screen bg-gray-950 text-gray-100 flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
      ref={containerRef}
    >
      {/* Enhanced Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <NavLink to="/" className="hover:opacity-80 transition-opacity">
            <div className="flex items-center space-x-2">
              <img src={codeway} alt="Codeway" className="h-8" />
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                The CodeWay
              </h1>
            </div>
          </NavLink>

          {problem && (
            <div className="flex items-center space-x-3">
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-semibold text-gray-200">
                {problem.title}
              </span>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyBgColor(
                  problem.difficulty
                )} ${getDifficultyColor(problem.difficulty)}`}
              >
                {problem.difficulty?.charAt(0).toUpperCase() +
                  problem.difficulty?.slice(1)}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200 hover:shadow-md"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              showSettings
                ? "bg-orange-500/20 text-orange-400"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Enhanced Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900 border-b border-gray-800 p-4 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-400 font-medium">
                Editor
              </label>
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
                {[
                  { value: 12, label: "S" },
                  { value: 14, label: "M" },
                  { value: 16, label: "L" },
                  { value: 18, label: "XL" },
                ].map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setFontSize(size.value)}
                    className={`px-2.5 py-1 text-xs rounded-md ${
                      fontSize === size.value
                        ? "bg-orange-500 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-400 font-medium">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel */}
        <div
          className="flex flex-col border-r border-gray-800 transition-all duration-200"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Enhanced Left Tabs */}
          <div className="flex bg-gray-900 border-b border-gray-800">
            {[
              { id: "description", label: "Description", icon: FileText },
              { id: "editorial", label: "Editorial", icon: BookOpen },
              { id: "solutions", label: "Solutions", icon: Target },
              { id: "submissions", label: "Submissions", icon: History },
              { id: "DoubtAi", label: "AI Help", icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 relative group ${
                  activeLeftTab === id
                    ? "text-orange-400 border-orange-400 bg-gray-950"
                    : "text-gray-400 border-transparent hover:text-gray-300 hover:bg-gray-900"
                }`}
                onClick={() => setActiveLeftTab(id)}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    activeLeftTab === id ? "scale-110" : ""
                  }`}
                />
                <span>{label}</span>
                {activeLeftTab === id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-orange-400 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto bg-gray-950 custom-scrollbar">
            {problem && (
              <>
                {activeLeftTab === "description" && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-white">
                          {problem.title}
                        </h1>
                      </div>
                      <div className="flex items-center space-x-2 bg-yellow-400/10 px-2 py-1 rounded-full">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-medium">
                          PREMIUM
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-8">
                      <div
                        className="text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: problem.description.replace(/\n/g, "<br />"),
                        }}
                      />
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <div className="p-1 bg-orange-500/10 rounded-lg">
                          <Zap className="w-5 h-5 text-orange-400" />
                        </div>
                        <span>Examples</span>
                      </h3>

                      {problem.visibleTestCases?.map((example, index) => (
                        <div
                          key={index}
                          className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <h4 className="font-semibold text-orange-400 mb-3 flex items-center">
                            <span className="bg-orange-500/10 px-2 py-1 rounded-full text-xs mr-2">
                              {index + 1}
                            </span>
                            Example {index + 1}
                          </h4>
                          <div className="space-y-3">
                            <div className="bg-gray-800 p-3 rounded font-mono text-sm border-l-4 border-blue-500">
                              <div className="text-gray-400 mb-1">Input:</div>
                              <div className="text-green-300">
                                {example.input}
                              </div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded font-mono text-sm border-l-4 border-emerald-500">
                              <div className="text-gray-400 mb-1">Output:</div>
                              <div className="text-blue-300">
                                {example.output}
                              </div>
                            </div>
                            {example.explanation && (
                              <div className="bg-gray-800 p-3 rounded text-sm border-l-4 border-purple-500">
                                <div className="text-gray-400 mb-1">
                                  Explanation:
                                </div>
                                <div className="text-gray-300">
                                  {example.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <div className="p-1 bg-red-500/10 rounded-lg mr-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-red-400"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        </div>
                        Constraints
                      </h3>
                      <ul className="list-disc list-inside text-gray-400 space-y-2 pl-4">
                        {problem.constraints?.map((constraint, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-start before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-gray-500 before:mt-2 before:mr-2 before:flex-shrink-0"
                          >
                            {constraint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeLeftTab === "editorial" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <BookOpen className="w-6 h-6 text-orange-400" />
                      <h2 className="text-xl font-bold text-white">
                        Editorial
                      </h2>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                      <Editorial
                        secureUrl={problem.secureUrl}
                        thumbnailUrl={problem.thumbnailUrl}
                        duration={problem.duration}
                      />
                    </div>
                  </div>
                )}

                {activeLeftTab === "solutions" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Target className="w-6 h-6 text-orange-400" />
                      <h2 className="text-xl font-bold text-white">
                        Solutions
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div
                          key={index}
                          className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
                        >
                          <div className="bg-gray-800 px-4 py-3 border-b border-gray-800">
                            <h3 className="font-semibold text-white">
                              {problem.title} - {solution.language}
                            </h3>
                          </div>
                          <div className="p-4">
                            <pre className="bg-gray-950 p-4 rounded text-sm overflow-x-auto text-gray-300 border border-gray-800">
                              <code>{solution.completeCode}</code>
                            </pre>
                          </div>
                        </div>
                      )) || (
                        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
                          <div className="text-gray-400">
                            Solutions will be available after you solve the
                            problem.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeLeftTab === "submissions" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <History className="w-6 h-6 text-orange-400" />
                      <h2 className="text-xl font-bold text-white">
                        My Submissions
                      </h2>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
                      <div className="text-gray-400">
                        <SubmissionHistory problemId={problemId} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeLeftTab === "DoubtAi" && (
              <div className="h-full">
                <DobutAi problem={problem} user={user} />
              </div>
            )}
          </div>
        </div>

        {/* Resize handle */}
        <div
          className="w-1.5 bg-gray-800 hover:bg-orange-500 cursor-col-resize active:bg-orange-500 transition-colors duration-200"
          onMouseDown={startResizing}
        />

        {/* Right Panel - Enhanced Version */}
        <div
          className="flex flex-col bg-gray-950 transition-all duration-200"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Enhanced Right Tabs */}
          <div className="flex bg-gray-900 border-b border-gray-800">
            {[
              { id: "code", label: "Code", icon: Code2 },
              { id: "testcase", label: "Test Cases", icon: CheckCircle },
              { id: "result", label: "Result", icon: Trophy },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`relative flex items-center space-x-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 ${
                  activeRightTab === id
                    ? "text-orange-400 bg-gray-950"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-900"
                }`}
                onClick={() => setActiveRightTab(id)}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    activeRightTab === id ? "scale-110" : ""
                  }`}
                />
                <span>{label}</span>
                {activeRightTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col">
            {activeRightTab === "code" && (
              <div className="flex-1 flex flex-col">
                {/* Enhanced Language Selector and Tools */}
                <div className="flex justify-between items-center p-3 bg-gray-900 border-b border-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="relative group">
                      <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors duration-200 border border-gray-700">
                        <span>
                          {
                            languages.find((l) => l.id === selectedLanguage)
                              ?.icon
                          }
                        </span>
                        <span>
                          {
                            languages.find((l) => l.id === selectedLanguage)
                              ?.name
                          }
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-70" />
                      </button>
                      <div className="absolute z-10 mt-1 w-40 bg-gray-800 rounded-lg shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top">
                        {languages.map((lang) => (
                          <button
                            key={lang.id}
                            className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-left ${
                              selectedLanguage === lang.id
                                ? "bg-orange-500/10 text-orange-400"
                                : "text-gray-300 hover:bg-gray-700"
                            }`}
                            onClick={() => handleLanguageChange(lang.id)}
                          >
                            <span>{lang.icon}</span>
                            <span>{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={resetCode}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200 hover:shadow-md border border-gray-800"
                      title="Reset Code"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowConsole(!showConsole)}
                      className={`p-2 rounded-lg transition-colors duration-200 border ${
                        showConsole
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          : "text-gray-400 hover:text-white hover:bg-gray-800 border-gray-800"
                      }`}
                      title={showConsole ? "Hide Console" : "Show Console"}
                    >
                      {showConsole ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Monaco Editor Container */}
                <div className="flex-1 relative bg-gray-950 p-1.5">
                  <div className="absolute inset-0 rounded-lg overflow-hidden border border-gray-800 shadow-lg">
                    <Editor
                      height="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      theme={theme}
                      options={{
                        fontSize: fontSize,
                        fontFamily:
                          "JetBrains Mono, Consolas, Monaco, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: "on",
                        lineNumbers: "on",
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: "line",
                        selectOnLineNumbers: true,
                        roundedSelection: false,
                        readOnly: false,
                        cursorStyle: "line",
                        mouseWheelZoom: true,
                        smoothScrolling: true,
                        cursorSmoothCaretAnimation: true,
                        contextmenu: true,
                        quickSuggestions: true,
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: "on",
                        tabCompletion: "on",
                        wordBasedSuggestions: true,
                        parameterHints: { enabled: true },
                        autoClosingBrackets: "always",
                        autoClosingQuotes: "always",
                        autoSurround: "languageDefined",
                        bracketPairColorization: { enabled: true },
                      }}
                    />
                  </div>
                </div>

                {/* Enhanced Console Section */}
                {showConsole && (
                  <div
                    className="border-t border-gray-800 bg-gray-900 transition-all duration-200 overflow-hidden"
                    style={{ height: `${consoleHeight}px` }}
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></div>
                        <h3 className="text-sm font-medium text-gray-300">
                          Console
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setConsoleHeight(Math.max(100, consoleHeight - 50))
                          }
                          className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-800 transition-colors"
                          disabled={consoleHeight <= 100}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConsoleHeight(Math.min(400, consoleHeight + 50))
                          }
                          className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-800 transition-colors"
                          disabled={consoleHeight >= 400}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowConsole(false)}
                          className="text-gray-400 hover:text-white p-1.5 rounded hover:bg-gray-800 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="h-full overflow-auto bg-gray-950/50">
                      {runResult ? (
                        <div className="p-4 space-y-4">
                          <div className="flex items-start justify-between">
                            <div
                              className={`flex items-center ${
                                runResult.testCases?.every(
                                  (tc) =>
                                    tc.stdout?.trim() ===
                                    tc.expected_output?.trim()
                                )
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {runResult.testCases?.every(
                                (tc) =>
                                  tc.stdout?.trim() ===
                                  tc.expected_output?.trim()
                              ) ? (
                                <>
                                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                  <span>Execution Successful</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                  <span>Execution Failed</span>
                                </>
                              )}
                            </div>
                            <div className="text-gray-400 text-xs flex items-center space-x-4">
                              <span className="flex items-center">
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                Runtime: {runResult.runtime || "N/A"}
                              </span>
                              <span className="flex items-center">
                                <MemoryStick className="w-3.5 h-3.5 mr-1.5" />
                                Memory: {runResult.memory || "N/A"}
                              </span>
                            </div>
                          </div>

                          {runResult.error && (
                            <div className="mt-2 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                              <div className="font-mono text-sm text-red-300">
                                <div className="font-semibold mb-1">Error:</div>
                                <div className="whitespace-pre-wrap">
                                  {runResult.error}
                                </div>
                              </div>
                            </div>
                          )}

                          {runResult.testCases &&
                            runResult.testCases.length > 0 && (
                              <div className="space-y-3">
                                <div className="text-xs text-gray-400 uppercase tracking-wider">
                                  Test Cases
                                </div>
                                {runResult.testCases.map((tc, i) => {
                                  const isPassed =
                                    tc.stdout?.trim() ===
                                    tc.expected_output?.trim();
                                  return (
                                    <div
                                      key={i}
                                      className={`p-3 rounded-lg border ${
                                        isPassed
                                          ? "bg-emerald-900/10 border-emerald-500/20"
                                          : "bg-red-900/10 border-red-500/20"
                                      }`}
                                    >
                                      <div className="font-mono text-sm space-y-2">
                                        <div>
                                          <span className="text-gray-400">
                                            Input:
                                          </span>{" "}
                                          <span className="text-blue-300">
                                            {tc.stdin}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-400">
                                            Expected:
                                          </span>{" "}
                                          <span className="text-emerald-300">
                                            {tc.expected_output}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-400">
                                            Output:
                                          </span>{" "}
                                          <span className="text-yellow-300">
                                            {tc.stdout}
                                          </span>
                                        </div>
                                        <div
                                          className={`flex items-center space-x-2 ${
                                            isPassed
                                              ? "text-emerald-400"
                                              : "text-red-400"
                                          }`}
                                        >
                                          {isPassed ? (
                                            <CheckCircle className="w-4 h-4" />
                                          ) : (
                                            <XCircle className="w-4 h-4" />
                                          )}
                                          <span>
                                            {isPassed ? "Passed" : "Failed"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 italic">
                          Console output will appear here after running your
                          code...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-between items-center">
                  <button
                    onClick={() => setShowConsole(!showConsole)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      showConsole
                        ? "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                        : "text-gray-400 hover:text-gray-300 hover:bg-gray-800 border border-gray-800"
                    }`}
                  >
                    {showConsole ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span>Console</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      className={`flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm border border-gray-700 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleRun}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>Run</span>
                    </button>

                    <button
                      className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md border border-orange-600 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleSubmitCode}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Submit</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Test Case Tab */}
            {activeRightTab === "testcase" && (
              <div className="flex-1 p-6 overflow-y-auto bg-gray-950 custom-scrollbar">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-white text-lg">
                    Test Results
                  </h3>
                </div>

                {runResult ? (
                  <div className="space-y-4">
                    <div
                      className={`p-5 rounded-xl border ${
                        runResult.testCases?.every(
                          (tc) =>
                            tc.stdout?.trim() === tc.expected_output?.trim()
                        )
                          ? "bg-emerald-900/10 border-emerald-500/30"
                          : "bg-red-900/10 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {runResult.testCases?.every(
                            (tc) =>
                              tc.stdout?.trim() === tc.expected_output?.trim()
                          ) ? (
                            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                          )}
                          <div>
                            <h4 className="font-bold text-lg">
                              {runResult.testCases?.every(
                                (tc) =>
                                  tc.stdout?.trim() ===
                                  tc.expected_output?.trim()
                              )
                                ? "All Test Cases Passed!"
                                : "Test Failed"}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {runResult.testCases?.every(
                                (tc) =>
                                  tc.stdout?.trim() ===
                                  tc.expected_output?.trim()
                              )
                                ? "Your code passed all test cases"
                                : "Some test cases didn't pass"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-gray-300">
                            <Clock className="w-4 h-4 mr-1.5 text-blue-400" />
                            Runtime: {runResult.runtime || "N/A"}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <MemoryStick className="w-4 h-4 mr-1.5 text-purple-400" />
                            Memory: {runResult.memory || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {runResult.error && (
                      <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                        <div className="font-mono text-sm text-red-300">
                          <div className="font-semibold mb-1">Error:</div>
                          <div className="whitespace-pre-wrap">
                            {runResult.error}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        Test Case Details
                      </div>
                      {runResult.testCases?.map((tc, i) => {
                        const isPassed =
                          tc.stdout?.trim() === tc.expected_output?.trim();
                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-lg border ${
                              isPassed
                                ? "bg-emerald-900/10 border-emerald-500/20"
                                : "bg-red-900/10 border-red-500/20"
                            }`}
                          >
                            <div className="font-mono text-sm space-y-2">
                              <div>
                                <span className="text-gray-400">Input:</span>{" "}
                                <span className="text-blue-300">
                                  {tc.stdin}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Expected:</span>{" "}
                                <span className="text-emerald-300">
                                  {tc.expected_output}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Output:</span>{" "}
                                <span className="text-yellow-300">
                                  {tc.stdout}
                                </span>
                              </div>
                              <div
                                className={`flex items-center space-x-2 ${
                                  isPassed ? "text-emerald-400" : "text-red-400"
                                }`}
                              >
                                {isPassed ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                <span className="text-sm">
                                  {isPassed ? "Passed" : "Failed"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Run your code to see test results</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Result Tab */}
            {activeRightTab === "result" && (
              <div className="flex-1 p-6 overflow-y-auto bg-gray-950 custom-scrollbar">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg">
                    <Trophy className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-white text-lg">
                    Submission Result
                  </h3>
                </div>

                {submitResult ? (
                  <div className="space-y-4">
                    <div
                      className={`p-5 rounded-xl border ${
                        submitResult.passedTestCases ===
                        submitResult.totalTestCases
                          ? "bg-emerald-900/10 border-emerald-500/30"
                          : "bg-red-900/10 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {submitResult.passedTestCases ===
                          submitResult.totalTestCases ? (
                            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                          )}
                          <div>
                            <h4 className="font-bold text-lg">
                              {submitResult.passedTestCases ===
                              submitResult.totalTestCases
                                ? "Accepted!"
                                : "Submission Failed"}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {submitResult.passedTestCases ===
                              submitResult.totalTestCases
                                ? "Your solution passed all test cases"
                                : "Some test cases didn't pass"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-gray-300">
                            <Clock className="w-4 h-4 mr-1.5 text-blue-400" />
                            Runtime: {submitResult.runtime || "N/A"}
                          </div>
                          <div className="flex items-center text-gray-300">
                            <MemoryStick className="w-4 h-4 mr-1.5 text-purple-400" />
                            Memory: {submitResult.memory || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {submitResult.error && (
                      <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                        <div className="font-mono text-sm text-red-300">
                          <div className="font-semibold mb-1">Error:</div>
                          <div className="whitespace-pre-wrap">
                            {submitResult.error}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400 text-sm">Runtime</span>
                        </div>
                        <div className="text-xl font-bold text-white">
                          {submitResult.runtime || "N/A"}
                        </div>
                        {submitResult.runtimePercentile && (
                          <div className="text-xs text-gray-400 mt-1">
                            Beats {submitResult.runtimePercentile}% of users
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <MemoryStick className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400 text-sm">Memory</span>
                        </div>
                          <div className="text-xl font-bold text-white">
                            {submitResult.memory !== undefined && submitResult.memory !== null ? submitResult.memory : "N/A"}
                          </div>
                        {submitResult.memoryPercentile && (
                          <div className="text-xs text-gray-400 mt-1">
                            Beats {submitResult.memoryPercentile}% of users
                          </div>
                        )}
                      </div>
                    </div>

                    {submitResult.passedTestCases !== undefined && (
                      <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-white">
                            Test Cases
                          </h5>
                          <span
                            className={`text-sm ${
                              submitResult.passedTestCases ===
                              submitResult.totalTestCases
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {submitResult.passedTestCases} /{" "}
                            {submitResult.totalTestCases} passed
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              submitResult.passedTestCases ===
                              submitResult.totalTestCases
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${
                                (submitResult.passedTestCases /
                                  submitResult.totalTestCases) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Submit your code to see results</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ProblemPage;
