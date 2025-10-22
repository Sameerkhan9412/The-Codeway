import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  X,
  Save,
  Users,
  ArrowLeft,
} from "lucide-react";
import {
  getAllContests,
  deleteContest,
  updateContest,
} from "../../../utils/apis/contestApi/contest";
import CreateContestForm from "./CreateContestForm";
import { useNavigate } from "react-router-dom";

const AdminContest = () => {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    getAllContests().then((res) => {
      setContests(res?.data || []);
    });
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contest?"))
      return;
    await deleteContest(id);
    setRefresh(!refresh);
  };

  const handleEdit = (contest) => {
    setEditData(contest);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    await updateContest(editData._id, editData);
    setEditData(null);
    setRefresh(!refresh);
  };

  const formatDateTimeLocal = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:20px_20px]"></div>

      <motion.div
        className="relative z-10 p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Contest Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Manage and organize coding contests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-700 transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Admin
            </motion.button>
            <motion.button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Create Contest
            </motion.button>
          </div>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                <CreateContestForm
                  onSuccess={() => {
                    setRefresh(!refresh);
                    setShowCreateForm(false);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Update Form Modal */}
        <AnimatePresence>
          {editData && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditData(null)}
            >
              <motion.form
                onSubmit={handleUpdateSubmit}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-2xl shadow-2xl"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Edit3 className="w-6 h-6 text-orange-500" />
                    Edit Contest
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditData(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contest Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Public Contest
                    </label>
                    <select
                      value={editData.isPublic}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          isPublic: e.target.value === "true",
                        })
                      }
                      className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeLocal(editData.startTime)}
                      onChange={(e) =>
                        setEditData({ ...editData, startTime: e.target.value })
                      }
                      className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeLocal(editData.endTime)}
                      onChange={(e) =>
                        setEditData({ ...editData, endTime: e.target.value })
                      }
                      className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all h-24 resize-none"
                    placeholder="Enter contest description..."
                  />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setEditData(null)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Update Contest
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contests Grid */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">All Contests</h2>
            <div className="px-3 py-1 bg-slate-700 text-orange-400 rounded-full text-sm font-medium">
              {contests.length} contests
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {contests.map((contest, index) => (
              <motion.div
                key={contest._id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.1 },
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                      {contest.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {contest.isPublic ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          contest.isPublic ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {contest.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">
                      {new Date(contest.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">
                      {new Date(contest.startTime).toLocaleTimeString()} -{" "}
                      {new Date(contest.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleEdit(contest)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition-all font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(contest._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminContest;
