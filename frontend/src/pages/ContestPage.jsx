import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Clock, 
  Users, 
  Zap, 
  Calendar,
  ArrowRight,
  Timer,
  Star,
  Target,
  PlayCircle,
  TrendingUp,
  Award,
  Flame
} from "lucide-react";
import axiosClient from "../utils/axiosClient";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ContestPage = () => {
  const [contests, setContests] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchTodayContest = async () => {
      try {
        const res = await axiosClient.get("/contest/today", {
          signal: controller.signal
        });
        
        if (res.data && !res.data.error) {
          setContests(res.data);
        } else {
          console.log("No contest found for today or error:", res.data?.error);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log("Error fetching today's contest:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTodayContest();
    
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    // Check if contests is an object with endTime property
    if (!contests || typeof contests !== 'object' || !contests.endTime) {
      return;
    }

    const timer = setInterval(() => {
      try {
        const now = new Date().getTime();
        const end = new Date(contests.endTime).getTime();
        
        // Validate that end is a valid number
        if (isNaN(end)) {
          console.error('Invalid endTime format:', contests.endTime);
          clearInterval(timer);
          return;
        }
        
        const distance = end - now;

        if (distance > 0) {
          setTimeLeft({
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        } else {
          setTimeLeft({ expired: true });
        }
      } catch (error) {
        console.error('Error in timer calculation:', error);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contests]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const FloatingCard = ({ children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="relative"
    >
      {children}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" color="orange-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-6 max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full border border-orange-500/30 mb-6">
            <Flame className="text-orange-400" size={20} />
            <span className="text-orange-300 font-medium">Live Now</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent mb-4">
            Today's Epic Battle
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Join the coding arena where legends are born and skills are tested
          </p>
        </motion.div>

     
        {/* Main Contest Card */}
        <AnimatePresence>
          {!contests ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-12 max-w-2xl mx-auto">
                <Trophy className="text-slate-400 mx-auto mb-6" size={64} />
                <h3 className="text-2xl font-bold text-white mb-4">No Active Contest</h3>
                <p className="text-slate-400 text-lg">
                  No contests are running today. Check back tomorrow for new challenges!
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              {/* Main Contest Card */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
                {/* Contest Header */}
                <div className="bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-orange-500/20 p-8 border-b border-slate-700/50">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 font-semibold">LIVE</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {contests.name}
                      </h2>
                      <div className="flex items-center gap-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} />
                          <span>{new Date(contests.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={18} />
                          <span>{new Date(contests.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timer */}
                    {timeLeft.expired ? (
                      <div className="text-center">
                        <div className="text-red-400 font-bold text-lg">CONTEST ENDED</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-slate-300 mb-2">Time Remaining</div>
                        <div className="flex gap-2 justify-center">
                          {[
                            { label: 'H', value: timeLeft.hours || 0 },
                            { label: 'M', value: timeLeft.minutes || 0 },
                            { label: 'S', value: timeLeft.seconds || 0 }
                          ].map((item, index) => (
                            <motion.div
                              key={item.label}
                              animate={{ scale: item.label === 'S' ? [1, 1.1, 1] : 1 }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="bg-slate-700/50 rounded-lg p-3 min-w-[60px]"
                            >
                              <div className="text-2xl font-bold text-orange-400">
                                {String(item.value).padStart(2, '0')}
                              </div>
                              <div className="text-xs text-slate-400">{item.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contest Body */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contest Info */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Contest Highlights</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-300">
                          <Zap className="text-yellow-400" size={20} />
                          <span>Real-time ranking system</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                          <Star className="text-blue-400" size={20} />
                          <span>Skill-based matching</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                          <Trophy className="text-orange-400" size={20} />
                          <span>Instant feedback & results</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                          <Timer className="text-green-400" size={20} />
                          <span>Optimized for speed coding</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="flex flex-col justify-center">
                      <div className="text-center mb-6">
                        <div className="text-slate-300 mb-2">Ready to compete?</div>
                        <div className="text-3xl font-bold text-white">Join the Battle!</div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <Link
                          to={`/contest/${contests._id}`}
                          className="block w-full"
                        >
                          <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-3 group">
                            <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-lg">Enter Contest Arena</span>
                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl blur opacity-30 -z-10 animate-pulse" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Section */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">🚀 Level Up Your Skills</h3>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Join thousands of developers pushing their limits, solving complex problems, and climbing the leaderboard. 
              Every contest is a new opportunity to showcase your skills and learn from the best.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContestPage;