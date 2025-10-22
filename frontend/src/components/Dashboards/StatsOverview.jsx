import React from "react";

const StatsOverview = ({ stats, loading, streaks, badges, rank, user }) => { // Added user prop
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-700 rounded mb-4" />
            <div className="h-12 bg-gray-700 rounded mb-4" />
            <div className="h-4 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const solved = stats?.solvedCount ?? 0;
  const total = stats?.totalProblems ?? 0;
  const easy = stats?.easy ?? 0;
  const medium = stats?.medium ?? 0;
  const hard = stats?.hard ?? 0;
  const attempting = stats?.attempting ?? 0;
  const badgeCount = badges?.length ?? 0;
  const progressPercentage = total > 0 ? (solved / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Main Progress Card - Spans 2 columns */}
      <div className="md:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-orange-400">Problem Solving Progress</h3>
          <div className="text-2xl">📊</div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeDasharray={339.292}
                strokeDashoffset={339.292 - (progressPercentage / 100) * 339.292}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#fdba74" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-orange-400">{solved}</span>
              <span className="text-sm text-gray-400">/ {total}</span>
              <span className="text-xs text-green-400 mt-1 font-medium">Solved</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl border border-green-700/30">
              <div className="text-xl font-bold text-green-400">{easy}</div>
              <div className="text-xs text-green-300 font-semibold">Easy</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl border border-yellow-700/30">
              <div className="text-xl font-bold text-yellow-400">{medium}</div>
              <div className="text-xs text-yellow-300 font-semibold">Medium</div>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl border border-red-700/30">
              <div className="text-xl font-bold text-red-400">{hard}</div>
              <div className="text-xs text-red-300 font-semibold">Hard</div>
            </div>
            {attempting > 0 && (
              <div className="p-3 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl border border-blue-700/30">
                <div className="text-xl font-bold text-blue-400">{attempting}</div>
                <div className="text-xs text-blue-300 font-semibold">In Progress</div>
              </div>
            )}
          </div>
        </div>

        {progressPercentage > 0 && (
          <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="text-sm text-orange-300 font-medium text-center">
              🎯 {progressPercentage.toFixed(1)}% Complete
            </div>
          </div>
        )}
      </div>

      {/* Rank Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 hover:shadow-yellow-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-400">Global Rank</h3>
          <div className="text-2xl">🏆</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {rank?.rank ? `#${rank.rank.toLocaleString()}` : "--"}
          </div>
          <div className="text-sm text-gray-400 mb-3">
            out of {rank?.totalUsers ? rank.totalUsers.toLocaleString() : "--"} users
          </div>
          
          {rank?.rank && rank?.totalUsers && (
            <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-xs text-yellow-300 font-semibold">
                Top {((rank.rank / rank.totalUsers) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Streaks Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 hover:shadow-red-500/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-400">Streaks</h3>
          <div className="text-2xl">🔥</div>
        </div>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-xl border border-orange-700/30">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {user?.streak ?? 0} {/* Use user.streak from AuthContext */}
            </div>
            <div className="text-xs text-orange-300 font-semibold uppercase tracking-wider">Current</div>
          </div>
          
          <div className="text-center p-3 bg-gray-700/50 rounded-xl border border-gray-600">
            <div className="text-lg font-bold text-gray-300">
              {streaks?.maxStreak ?? 0}
            </div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Best Ever</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
