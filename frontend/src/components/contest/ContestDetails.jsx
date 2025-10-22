import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Users,
  Award,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Timer,
  Code,
  Trophy,
  ArrowRight,
  Zap,
  Home, // Added Home icon
} from "lucide-react";
import axiosClient from "../../utils/axiosClient";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext.jsx";
import ContestLeaderboard from "./ContestLeaderboard";
import { registerForContest } from "../../utils/apis/contestApi/contest";
import { useContest } from "../../context/ContestContext";

const ContestDetails = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const {
    contest,
    setContest,
    participants,
    setParticipants,
    hasEntered,
    setHasEntered,
    hasCompleted,
    setHasCompleted,
  } = useContest();

  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contestStatus, setContestStatus] = useState("upcoming"); // 'upcoming', 'active', 'ended'
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [activeTab, setActiveTab] = useState("problems");

  // Fetch contest details
  const fetchContestDetails = async () => {
    try {
      setIsLoading(true);
      const contestResponse = await axiosClient.get(`/contest/${contestId}`);
      const { contest: fetchedContest } = contestResponse.data;

      if (fetchedContest) {
        setContest(fetchedContest);
        setParticipants(fetchedContest.participants || []);

        // Fetch user status
        if (user) {
          const statusResponse = await axiosClient.get(`/contest/${contestId}/status`);
          const { status } = statusResponse.data;
          setHasEntered(status.isRegistered);
          setHasCompleted(status.isCompleted);
        }

        // Fetch problems for this contest
        const problemsResponse = await axiosClient.get(
          `/contest/${contestId}/problems`
        );
        setProblems(problemsResponse.data.problems || []);
      }
    } catch (error) {
      console.error("Error fetching contest details:", error);
      showToast("Failed to load contest details", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContestDetails();
  }, [contestId, user]);

  useEffect(() => {
    if (hasCompleted) {
      setActiveTab("leaderboard");
    }
  }, [hasCompleted]);

  // Update contest status and time remaining
  useEffect(() => {
    if (!contest) return;

    const updateContestStatus = () => {
      const now = new Date();
      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);

      if (now < startTime) {
        setContestStatus("upcoming");
        const timeLeft = startTime - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        }
      } else if (now >= startTime && now <= endTime) {
        setContestStatus("active");
        const timeLeft = endTime - now;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setContestStatus("ended");
        setTimeRemaining("Contest Ended");
      }
    };

    updateContestStatus();
    const interval = setInterval(updateContestStatus, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  // Get status badge
  const getStatusBadge = () => {
    switch (contestStatus) {
      case "upcoming":
        return (
          <div className="flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Upcoming
          </div>
        );
      case "active":
        return (
          <div className="flex items-center px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 mr-1" />
            Active
          </div>
        );
      case "ended":
        return (
          <div className="flex items-center px-3 py-1 bg-gray-500/10 border border-gray-500/30 rounded-full text-gray-400 text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Ended
          </div>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: "bg-green-500/10 border-green-500/30 text-green-400",
      medium: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      hard: "bg-red-500/10 border-red-500/30 text-red-400",
    };

    return (
      <div
        className={`px-2 py-0.5 rounded-md border text-xs font-medium ${
          colors[difficulty.toLowerCase()] ||
          "bg-gray-500/10 border-gray-500/30 text-gray-400"
        }`}
      >
        {difficulty}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Contest Not Found</h2>
        <p className="text-gray-400 mb-6 text-center">
          The contest you're looking for doesn't exist or you don't have access
          to it.
        </p>
        <button
          onClick={() => navigate("/contests")}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md text-white font-medium transition-colors"
        >
          Back to Contests
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium transition-colors flex items-center"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Contest Header */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-0">
                {contest.name}
              </h1>
              {getStatusBadge()}
            </div>

            <p className="text-gray-300 mb-6">{contest.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-orange-400 mr-3" />
                <div>
                  <div className="text-xs text-gray-400 mb-1">Start Time</div>
                  <div className="text-sm text-white">
                    {formatDate(contest.startTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-orange-400 mr-3" />
                <div>
                  <div className="text-xs text-gray-400 mb-1">End Time</div>
                  <div className="text-sm text-white">
                    {formatDate(contest.endTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-orange-400 mr-3" />
                <div>
                  <div className="text-xs text-gray-400 mb-1">Participants</div>
                  <div className="text-sm text-white">
                    {contest.participants?.length || 0}
                  </div>
                </div>
              </div>
              <div className="flex items-center ml-6">
                {hasEntered ? (
                  hasCompleted ? (
                    <div className="flex items-center px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Contest Completed
                    </div>
                  ) : (
                    <div className="flex items-center px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-xs font-medium">
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Registered
                    </div>
                  )
                ) : (
                  <div className="flex items-center px-3 py-1 bg-gray-500/20 border border-gray-500/50 rounded-full text-gray-400 text-xs font-medium">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Not Registered
                  </div>
                )}
              </div>
            </div>

            {/* Contest Timer */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Timer className="w-6 h-6 text-orange-400 mr-3" />
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    {contestStatus === "upcoming"
                      ? "Starts In"
                      : contestStatus === "active"
                      ? "Ends In"
                      : "Status"}
                  </div>
                  <div className="text-lg font-mono font-semibold text-white">
                    {timeRemaining}
                  </div>
                </div>
              </div>

              {contestStatus === "active" && !hasCompleted && !hasEntered && (
                <button
                  onClick={async () => {
                    try {
                      // Call registration API
                      await registerForContest(contestId);
                      // Update local state to reflect registration
                      setHasEntered(true);
                      showToast(
                        "Registered for contest successfully",
                        "success"
                      );

                      // Refetch contest details to update UI fully
                      try {
                        const response = await axiosClient.get(
                          `/contest/${contestId}`
                        );
                        const { contest, userStatus } = response.data;
                        setContest(contest);
                        setParticipants(contest.participants || []);
                        setHasCompleted(userStatus?.isCompleted || false);

                        // Navigate to the first problem in the contest
                        if (contest.problems && contest.problems.length > 0) {
                          // Make sure we're using the problem ID, not the entire problem object
                          const firstProblemId =
                            typeof contest.problems[0] === "object"
                              ? contest.problems[0]._id
                              : contest.problems[0];
                          navigate(
                            `/contest/${contestId}/problem/${firstProblemId}`
                          );
                        }
                      } catch (fetchError) {
                        console.error(
                          "Error fetching updated contest details:",
                          fetchError
                        );
                        // Still navigate to contest even if refresh fails
                        navigate(`/contest/${contestId}`);
                      }
                    } catch (error) {
                      console.error("Error registering for contest:", error);
                      // Try to continue anyway - this is a workaround for the system date issue
                      setHasEntered(true); // Force UI update
                      showToast("Proceeding to contest", "info");
                      navigate(`/contest/${contestId}`);
                    }
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md text-white font-medium transition-colors flex items-center"
                >
                  Register
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
              {contestStatus === "active" && hasEntered && !hasCompleted && (
                <button
                  onClick={() => {
                    if (contest.problems && contest.problems.length > 0) {
                      const firstProblemId =
                        typeof contest.problems[0] === "object"
                          ? contest.problems[0]._id
                          : contest.problems[0];
                      navigate(
                        `/contest/${contestId}/problem/${firstProblemId}`
                      );
                    }
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white font-medium transition-colors flex items-center"
                >
                  Enter Contest
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
              {hasCompleted && (
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium transition-colors flex items-center"
                >
                  View Results
                  <Trophy className="w-4 h-4 ml-2" />
                </button>
              )}

              {contestStatus === "upcoming" && (
                <div className="px-4 py-2 bg-gray-800 rounded-md text-gray-300 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Not Started Yet
                </div>
              )}

              {contestStatus === "ended" && (
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-medium transition-colors flex items-center"
                >
                  View Results
                  <Trophy className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab("problems")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "problems"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Problems
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "leaderboard"
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "problems" && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Code className="w-5 h-5 text-orange-400 mr-2" />
                Contest Problems
              </h3>
              <div className="text-sm text-gray-400">
                {problems.length} Problems
              </div>
            </div>

            {problems.length === 0 ? (
              <div className="p-8 text-center">
                <Code className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No Problems Available
                </h3>
                <p className="text-gray-400">
                  {contestStatus === "upcoming"
                    ? "Problems will be revealed when the contest starts."
                    : "No problems have been added to this contest yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-400 bg-gray-800/30">
                      <th className="px-4 py-3 text-left">Problem</th>
                      <th className="px-4 py-3 text-center">Difficulty</th>
                      <th className="px-4 py-3 text-center">Solved By</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((problem, index) => (
                      <motion.tr
                        key={problem._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-800/30 hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">
                            {problem.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {problem.description
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 80)}
                            ...
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getDifficultyBadge(problem.difficulty)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm text-gray-300">
                            {problem.solvedBy || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              navigate(
                                `/contest/${contestId}/problem/${problem._id}`
                              )
                            }
                            disabled={
                              contestStatus !== "active" ||
                              !hasEntered ||
                              hasCompleted
                            }
                            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center mx-auto ${
                              contestStatus === "active" &&
                              hasEntered &&
                              !hasCompleted
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {hasCompleted ? (
                              "Completed"
                            ) : contestStatus === "active" && hasEntered ? (
                              <>
                                Solve
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </>
                            ) : (
                              "Unavailable"
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <ContestLeaderboard
            contestId={contestId}
            isContestActive={contestStatus === "active"}
          />
        )}
      </div>
    </div>
  );
};

export default ContestDetails;
