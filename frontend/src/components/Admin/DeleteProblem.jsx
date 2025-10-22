import React, { useState, useEffect } from "react";
import {
  Trash2,
  AlertTriangle,
  X,
  Search,
  Code,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";
import axiosClient from "../../utils/axiosClient";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";

const DeleteProblem = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/problem/getAllProblems");
      setProblems(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch problems"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProblem) return;

    try {
      setDeleting(true);
      await axiosClient.delete(`/problem/delete/${selectedProblem._id}`);

      setProblems(problems.filter((p) => p._id !== selectedProblem._id));
      setShowDeleteModal(false);
      setSelectedProblem(null);
      toast.success("Problem Deleted Successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete problem"
      );
      toast.error("Error Occurred While Deleting the Problem.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProblems = problems.filter(
    (problem) =>
      problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchProblems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <NavLink to="/admin">
            <button className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4">
              <ArrowLeft size={20} />
              Back to Admin Page
            </button>
          </NavLink>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Delete Problems</h1>
              <p className="text-slate-400 mt-1">
                Manage and delete coding problems
              </p>
            </div>
            <div className="text-sm text-slate-400">
              Total Problems: {problems.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Problems List */}
        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <Code className="mx-auto h-12 w-12 text-slate-500 mb-4" />
              <p className="text-slate-400 text-lg">No problems found</p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-slate-400 mb-4 line-clamp-2">
                      {problem.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </div>
                      {problem.difficulty && (
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              problem.difficulty === "easy"
                                ? "bg-green-500/20 text-green-500"
                                : problem.difficulty === "medium"
                                ? "bg-orange-500/20 text-orange-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProblem(problem);
                      setShowDeleteModal(true);
                    }}
                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h3 className="text-xl font-semibold text-white">
                  Delete Problem
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-300 mb-2">
                Are you sure you want to delete this problem?
              </p>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                <p className="font-medium text-white">
                  {selectedProblem?.title}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedProblem?.description?.substring(0, 100)}...
                </p>
              </div>
              <p className="text-red-400 text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteProblem;
