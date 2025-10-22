import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Play, 
  FileText, 
  ArrowRight,
  Users,
  Timer,
  CheckCircle,
  Target,
  Code,
  Award
} from 'lucide-react';
import axiosClient from '../../../utils/axiosClient';

const ContestDetail = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get(`/contest/${id}`)
      .then(res => {
        setContest(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15
      }
    }
  };

  const getContestStatus = () => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) {
      return { status: 'upcoming', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    } else if (now >= start && now <= end) {
      return { status: 'active', color: 'text-green-400', bg: 'bg-green-500/20' };
    } else {
      return { status: 'ended', color: 'text-red-400', bg: 'bg-red-500/20' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400 text-lg">Loading contest details...</p>
        </motion.div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Contest not found</h2>
          <p className="text-gray-400">The contest you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const contestStatus = getContestStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      
      <motion.div 
        className="relative z-10 p-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 mb-8 overflow-hidden relative"
          variants={itemVariants}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                    {contest.name}
                  </h1>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 ${contestStatus.bg} ${contestStatus.color} rounded-full font-semibold capitalize`}>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    {contestStatus.status}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              {contest.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Start Time</span>
                </div>
                <p className="text-white font-mono">
                  {new Date(contest.startTime).toLocaleString()}
                </p>
              </motion.div>

              <motion.div 
                className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Timer className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">End Time</span>
                </div>
                <p className="text-white font-mono">
                  {new Date(contest.endTime).toLocaleString()}
                </p>
              </motion.div>

              <motion.div 
                className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">Problems</span>
                </div>
                <p className="text-white text-2xl font-bold">
                  {contest.problems.length}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Problems Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Contest Problems</h2>
              <p className="text-gray-400">Solve all problems to complete the contest</p>
            </div>
          </div>

          <div className="grid gap-6">
            <AnimatePresence>
              {contest.problems.map((problem, idx) => (
                <motion.div
                  key={problem._id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 group"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-white text-lg">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                          {problem.title}
                        </h3>
                        <div className="flex items-center gap-4 text-gray-400">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">Problem {idx + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            <span className="text-sm">Points: 100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/contest/${id}/${problem._id}`}
                      className="ml-6"
                    >
                      <motion.button
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>Solve Problem</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Start Contest Button */}
        <motion.div 
          className="mt-12 text-center"
          variants={itemVariants}
        >
          <motion.button
            className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6" />
            Start Contest
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
          
          <p className="text-gray-400 mt-4 text-lg">
            Ready to test your coding skills? Click to begin!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContestDetail;