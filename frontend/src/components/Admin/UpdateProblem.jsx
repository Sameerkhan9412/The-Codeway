import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Edit,
  Plus,
  Code,
  TestTube,
  Settings,
  FileText,
  X,
  Save,
  Loader2,
} from "lucide-react";
import axiosClient from "../../utils/axiosClient";
import { NavLink } from "react-router-dom";

const UpdateProblem = () => {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    tags: [],
    visibleTestCases: [{ input: "", output: "" }],
    hiddenTestCases: [{ input: "", output: "" }],
    startCode: [{ language: "javascript", code: "" }],
    referenceSolution: [{ language: "javascript", completeCode: "" }],
  });

  // Fetch all problems
  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/problem/getAllProblems");
      setProblems(response.data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);

    // Pre-populate form with existing data - Fixed to properly load previous data
    setFormData({
      title: problem.title || "",
      description: problem.description || "",
      difficulty: problem.difficulty || "Easy",
      tags: problem.tags || [],
      visibleTestCases:
        problem.visibleTestCases && problem.visibleTestCases.length > 0
          ? problem.visibleTestCases
          : [{ input: "", output: "" }],
      hiddenTestCases:
        problem.hiddenTestCases && problem.hiddenTestCases.length > 0
          ? problem.hiddenTestCases
          : [{ input: "", output: "" }],
      startCode:
        problem.startCode && problem.startCode.length > 0
          ? problem.startCode
          : [{ language: "javascript", code: "" }],
      referenceSolution:
        problem.referenceSolution && problem.referenceSolution.length > 0
          ? problem.referenceSolution
          : [{ language: "javascript", completeCode: "" }],
    });

    setStep(1); // Reset to first step
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTestCase = (type) => {
    const newTestCase = { input: "", output: "" };
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], newTestCase],
    }));
  };

  const removeTestCase = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateTestCase = (type, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((testCase, i) =>
        i === index ? { ...testCase, [field]: value } : testCase
      ),
    }));
  };

  const updateCodeTemplate = (type, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((code, i) =>
        i === index ? { ...code, [field]: value } : code
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!selectedProblem) return;

    setUpdating(true);
    try {
      const response = await axiosClient.put(
        `/problem/update/${selectedProblem._id}`,
        formData
      );

      if (response.status === 200) {
        alert("Problem updated successfully!");
        await fetchProblems(); // Refresh the problems list
        setSelectedProblem(null);
        setFormData({
          title: "",
          description: "",
          difficulty: "Easy",
          tags: [],
          visibleTestCases: [{ input: "", output: "" }],
          hiddenTestCases: [{ input: "", output: "" }],
          startCode: [{ language: "javascript", code: "" }],
          referenceSolution: [{ language: "javascript", completeCode: "" }],
        });
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      alert(
        "Error updating problem: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUpdating(false);
    }
  };

  const filteredProblems = problems.filter(
    (problem) =>
      problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.difficulty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get difficulty color class - Fixed colors
  const getDifficultyColorClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500/20 text-green-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "hard":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Problem Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter a descriptive problem title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Problem Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows="8"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Provide a detailed description of the problem, including constraints and examples..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    handleInputChange("difficulty", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(formData.tags)
                      ? formData.tags.join(", ")
                      : formData.tags
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0)
                    )
                  }
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="array, string, dynamic programming"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Visible Test Cases
                </h3>
                <button
                  onClick={() => addTestCase("visibleTestCases")}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm transition-colors"
                >
                  <Plus size={16} /> Add Test Case
                </button>
              </div>

              {formData.visibleTestCases.map((testCase, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-300">
                      Test Case {index + 1}
                    </span>
                    {formData.visibleTestCases.length > 1 && (
                      <button
                        onClick={() =>
                          removeTestCase("visibleTestCases", index)
                        }
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Input
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) =>
                          updateTestCase(
                            "visibleTestCases",
                            index,
                            "input",
                            e.target.value
                          )
                        }
                        rows="3"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                        placeholder="Test input..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Expected Output
                      </label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) =>
                          updateTestCase(
                            "visibleTestCases",
                            index,
                            "output",
                            e.target.value
                          )
                        }
                        rows="3"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                        placeholder="Expected output..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Hidden Test Cases
                </h3>
                <button
                  onClick={() => addTestCase("hiddenTestCases")}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm transition-colors"
                >
                  <Plus size={16} /> Add Test Case
                </button>
              </div>

              {formData.hiddenTestCases.map((testCase, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-300">
                      Hidden Test Case {index + 1}
                    </span>
                    {formData.hiddenTestCases.length > 1 && (
                      <button
                        onClick={() => removeTestCase("hiddenTestCases", index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Input
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) =>
                          updateTestCase(
                            "hiddenTestCases",
                            index,
                            "input",
                            e.target.value
                          )
                        }
                        rows="3"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                        placeholder="Test input..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Expected Output
                      </label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) =>
                          updateTestCase(
                            "hiddenTestCases",
                            index,
                            "output",
                            e.target.value
                          )
                        }
                        rows="3"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                        placeholder="Expected output..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Starter Code Templates
              </h3>
              {formData.startCode.map((code, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-300">
                      Template {index + 1}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Language
                      </label>
                      <select
                        value={code.language}
                        onChange={(e) =>
                          updateCodeTemplate(
                            "startCode",
                            index,
                            "language",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Initial Code
                      </label>
                      <textarea
                        value={code.code}
                        onChange={(e) =>
                          updateCodeTemplate(
                            "startCode",
                            index,
                            "code",
                            e.target.value
                          )
                        }
                        rows="6"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none font-mono"
                        placeholder="function solution() {&#10;  // Your code here&#10;}"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Reference Solutions
              </h3>
              {formData.referenceSolution.map((solution, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-300">
                      Solution {index + 1}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Language
                      </label>
                      <select
                        value={solution.language}
                        onChange={(e) =>
                          updateCodeTemplate(
                            "referenceSolution",
                            index,
                            "language",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Complete Solution
                      </label>
                      <textarea
                        value={solution.completeCode}
                        onChange={(e) =>
                          updateCodeTemplate(
                            "referenceSolution",
                            index,
                            "completeCode",
                            e.target.value
                          )
                        }
                        rows="8"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none font-mono"
                        placeholder="Complete working solution..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Review & Submit
              </h3>
              <p className="text-gray-300 mb-6">
                Please review your problem details before submitting
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Problem Overview
                </h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>
                    <strong>Title:</strong> {formData.title}
                  </p>
                  <p>
                    <strong>Difficulty:</strong> {formData.difficulty}
                  </p>
                  <p>
                    <strong>Tags:</strong>{" "}
                    {Array.isArray(formData.tags)
                      ? formData.tags.join(", ")
                      : formData.tags}
                  </p>
                  <p>
                    <strong>Visible Test Cases:</strong>{" "}
                    {formData.visibleTestCases.length}
                  </p>
                  <p>
                    <strong>Hidden Test Cases:</strong>{" "}
                    {formData.hiddenTestCases.length}
                  </p>
                  <p>
                    <strong>Code Templates:</strong> {formData.startCode.length}
                  </p>
                  <p>
                    <strong>Reference Solutions:</strong>{" "}
                    {formData.referenceSolution.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={updating}
                className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
              >
                {updating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Updating Problem...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Update Problem
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <NavLink to="/admin">
              <button className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors">
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </NavLink>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-orange-500 mb-2">
              Problem Management
            </h1>
            <p className="text-gray-300">Update and manage coding problems</p>
          </div>
          <div className="w-32"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-[calc(100vh-200px)]">
          {/* Problems List */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-orange-500" size={24} />
              <h2 className="text-xl font-semibold text-white">
                Problems List
              </h2>
            </div>

            <div className="relative mb-6">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-350px)]">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2
                    className="animate-spin mx-auto mb-4 text-orange-500"
                    size={32}
                  />
                  <p className="text-gray-400">Loading problems...</p>
                </div>
              ) : (
                filteredProblems.map((problem) => (
                  <div
                    key={problem._id}
                    onClick={() => handleProblemSelect(problem)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-orange-500 ${
                      selectedProblem?._id === problem._id
                        ? "bg-orange-500/10 border-orange-500"
                        : "bg-slate-700 border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {problem.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColorClass(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">
                            {Array.isArray(problem.tags)
                              ? problem.tags.join(", ")
                              : problem.tags}
                          </span>
                        </div>
                      </div>
                      <Edit size={16} className="text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Update Problem Form */}
          <div className="lg:col-span-3 bg-slate-800 rounded-xl p-6 border border-slate-700">
            {selectedProblem ? (
              <>
                {/* Step Progress */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    {[
                      { num: 1, icon: FileText, label: "Problem Details" },
                      { num: 2, icon: TestTube, label: "Test Cases" },
                      { num: 3, icon: Code, label: "Code Templates" },
                      { num: 4, icon: Settings, label: "Review & Submit" },
                    ].map((stepItem) => (
                      <div
                        key={stepItem.num}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                          step === stepItem.num
                            ? "bg-orange-500 text-white"
                            : step > stepItem.num
                            ? "bg-green-500 text-white"
                            : "bg-slate-700 text-gray-400"
                        }`}
                        onClick={() => setStep(stepItem.num)}
                      >
                        <stepItem.icon size={20} />
                        <span className="font-medium hidden sm:block">
                          {stepItem.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Content */}
                <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                  {renderStepContent()}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t border-slate-700 mt-6">
                  <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-gray-500 rounded-lg text-white transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setStep(Math.min(4, step + 1))}
                    disabled={step === 4}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 disabled:text-gray-400 rounded-lg text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Edit className="mx-auto mb-4 text-gray-400" size={64} />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Select a Problem to Update
                  </h3>
                  <p className="text-gray-400">
                    Choose a problem from the list to start updating
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProblem;
