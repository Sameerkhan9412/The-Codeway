import { useEffect, useState, useCallback } from "react";
import {
  fetchUserProfile,
  fetchProblemsSolved,
  fetchAllProblems,
  fetchUserStreaks,
  fetchUserBadges,
  fetchUserRank,
  fetchAllUserSubmissions,
  fetchHeatmapData,
} from "../../utils/apis/dashboardApi";
import SidebarProfileCard from "./SidebarProfileCard";
import StatsOverview from "./StatsOverview";
import HeatmapCalendar from "./HeatmapCalendar";
import SubmissionsTabs from "./SubmissionsTabs";
import ProblemCard from "../common/ProblemCard";
import Navbar from "../common/Navbar";
import LoadingSpinner from "../common/LoadingSpinner";
import { useSelector, useDispatch } from "react-redux"; // Import useSelector and useDispatch
import { getProfile } from "../../slice/authSlice"; // Import getProfile thunk

const DashboardPage = () => {
  const dispatch = useDispatch(); // Initialize useDispatch
  const { user: authUser } = useSelector((state) => state.auth); // Get user from Redux state

  const [dashboardData, setDashboardData] = useState({
    user: null,
    problemsSolved: null,
    allProblems: null,
    streaks: null,
    badges: [],
    rank: null,
    fullSubmissions: [],
    activity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        profileRes,
        solvedRes,
        allRes,
        streaksRes,
        badgesRes,
        rankRes,
        submissionsRes,
        activityRes,
      ] = await Promise.all([
        dispatch(getProfile()).unwrap(),
        fetchProblemsSolved(),
        fetchAllProblems(),
        fetchUserStreaks(),
        fetchUserBadges(),
        fetchUserRank(),
        fetchAllUserSubmissions(),
        fetchHeatmapData(),
      ]);

      setDashboardData({
        user: { ...profileRes.user, rank: rankRes.data.rank },
        problemsSolved: solvedRes.data,
        allProblems: {
          totalProblems: allRes.data.totalProblems,
          solvedCount: allRes.data.solvedCount,
          unsolvedCount: allRes.data.unsolvedCount,
          easy: allRes.data.easy,
          medium: allRes.data.medium,
          hard: allRes.data.hard,
          attempting: allRes.data.attempting,
          problems: allRes.data.problems || [],
        },
        streaks: {
          currentStreak: profileRes.user?.streak ?? 0,
          maxStreak: streaksRes.data?.maxStreak ?? 0,
        },
        badges: badgesRes.data.badges || [],
        rank: rankRes.data,
        fullSubmissions: submissionsRes.data.submissions || [],
        activity: activityRes.data.submissions || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!authUser) return; // Don't run if user is not authenticated
    if (socket) {
      const handleUserStatsUpdate = (data) => {
        console.log("Received userStatsUpdate event, refetching data:", data);
        fetchDashboardData();
      };

      socket.on("userStatsUpdate", handleUserStatsUpdate);
      console.log("Socket listener for 'userStatsUpdate' attached.");

      return () => {
        socket.off("userStatsUpdate", handleUserStatsUpdate);
        console.log("Socket listener for 'userStatsUpdate' removed.");
      };
    }
  }, [authUser, fetchDashboardData]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black font-poppins text-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 p-6 md:p-8">
        {/* Sidebar - Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <SidebarProfileCard
            user={authUser} // Pass user from Redux state
            stats={dashboardData.allProblems}
            rank={dashboardData.rank?.rank}
          />
        </div>

        {/* Main Content - Right Column */}
        <div className="lg:col-span-3 space-y-8">
          {/* Stats Overview */}
          <StatsOverview
            stats={dashboardData.allProblems}
            streaks={dashboardData.streaks}
            badges={dashboardData.badges}
            rank={dashboardData.rank}
            loading={loading}
            user={authUser} // Pass authUser to StatsOverview
          />

          {/* Heatmap Calendar */}
          <HeatmapCalendar activity={dashboardData.activity} />

          {/* Recent Problems Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-orange-400 flex items-center">
                  <span className="mr-2">🎯</span>
                  Recent Problems
                </h2>
                <button className="text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors duration-200 hover:underline">
                  View all →
                </button>
              </div>
              
              <div className="space-y-4">
                {dashboardData.allProblems?.problems?.length > 0 ? (
                  dashboardData.allProblems.problems.slice(0, 5).map((problem) => (
                    <div
                      key={problem._id}
                      className="group p-4 rounded-xl border border-gray-700 hover:border-orange-500/50 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                    >
                      <ProblemCard problem={problem} compact />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-6xl mb-4 opacity-50">🚀</div>
                    <div className="text-gray-400 text-lg mb-2">No problems solved yet</div>
                    <div className="text-gray-500 text-sm mb-4">Start your coding journey today!</div>
                    <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold">
                      Solve Your First Problem
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submissions Tabs */}
          <SubmissionsTabs 
            submissions={dashboardData.fullSubmissions} 
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

const ErrorDisplay = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black">
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center backdrop-blur-sm">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default DashboardPage;
