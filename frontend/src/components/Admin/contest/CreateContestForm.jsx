import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Globe, 
  Lock, 
  Trophy, 
  Search, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { createContest, getAllProblems } from "../../../utils/apis/contestApi/contest";
import { useNavigate } from "react-router-dom";

const CreateContestForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
    isPublic: false,
    problems: [],
  });

  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getAllProblems()
      .then((res) => {
        // Defensive check: ensure res.data.problems is an array
        const problemsData = res.data?.problems;
        if (Array.isArray(problemsData)) {
          setProblems(problemsData);
        } else {
          setProblems([]);
          console.error("Error: problems data is not an array", res.data);
        }
      })
      .catch((err) => console.error("Error fetching problems", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProblemSelect = (id) => {
    setForm((prev) => {
      const selected = new Set(prev.problems);
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      return { ...prev, problems: Array.from(selected) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await createContest(form);
      setForm({ name: "", startTime: "", endTime: "", isPublic: false, problems: [] });
      onSuccess();
    } catch (err) {
      console.error("Error creating contest:", err);
      setError("Failed to create contest. Please check the form and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProblems = Array.isArray(problems) ? problems.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          
          <h1 className="text-3xl font-bold text-white">Create New Contest</h1>
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            Back to Admin
          </button>
        </div>
        <p className="text-slate-400 mb-8 -mt-4">Set up challenges for your community</p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <Trophy className="text-orange-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Contest Details</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="text-red-400" size={20} />
                  <p className="text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contest Title
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter an exciting contest title"
                    className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Calendar className="inline mr-2" size={16} />
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={form.startTime}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Clock className="inline mr-2" size={16} />
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={form.endTime}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="isPublic"
                          checked={form.isPublic}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${
                          form.isPublic ? 'bg-orange-500' : 'bg-slate-600'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                            form.isPublic ? 'translate-x-6 translate-y-0.5' : 'translate-x-0.5 translate-y-0.5'
                          }`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {form.isPublic ? <Globe size={20} className="text-orange-400" /> : <Lock size={20} className="text-slate-400" />}
                        <span className="text-white font-medium">
                          {form.isPublic ? 'Public Contest' : 'Private Contest'}
                        </span>
                      </div>
                    </label>
                    <p className="text-sm text-slate-400 mt-2 ml-15">
                      {form.isPublic 
                        ? 'Anyone can discover and join this contest'
                        : 'Only invited participants can join this contest'
                      }
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Problems */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Problems ({form.problems.length} selected)
                  </label>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search problems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                    />
                  </div>

                  <div className="max-h-80 overflow-y-auto bg-slate-700/30 rounded-lg border border-slate-600">
                    <div className="p-4 space-y-2">
                      <AnimatePresence>
                        {filteredProblems.map((p, index) => (
                          <motion.label
                            key={p._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-600/30 cursor-pointer transition-colors group"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={form.problems.includes(p._id)}
                                onChange={() => handleProblemSelect(p._id)}
                                className="sr-only"
                              />
                              {form.problems.includes(p._id) ? (
                                <CheckCircle2 className="text-orange-400" size={20} />
                              ) : (
                                <Circle className="text-slate-400 group-hover:text-slate-300" size={20} />
                              )}
                            </div>
                            <span className="text-slate-200 group-hover:text-white transition-colors">
                              {p.title}
                            </span>
                          </motion.label>
                        ))}
                      </AnimatePresence>
                      
                      {filteredProblems.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <Search size={32} className="mx-auto mb-2 opacity-50" />
                          <p>No problems found matching your search</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              variants={itemVariants}
              className="mt-8 flex justify-end gap-4"
            >
              <button
                type="button"
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-orange-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Contest...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                  
                    <Trophy size={20} />
                    Create Contest
                  </div>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateContestForm;
