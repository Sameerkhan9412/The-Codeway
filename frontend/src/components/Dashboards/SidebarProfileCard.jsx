import React from "react";

const SidebarProfileCard = ({ user, stats, rank }) => {
  const solvedPercentage = stats?.totalProblems 
    ? Math.round((stats.solvedCount / stats.totalProblems) * 100) 
    : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      <div className="p-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-orange-400">
                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            {rank && (
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-gray-800 shadow-lg">
                #{rank.toLocaleString()}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-1">
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous'}
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            @{user?.username || 'user'}
          </p>
          {/* Add social links display */}
          <div className="flex space-x-3 mt-3 justify-center">
            {user?.socialLinks?.linkedin && (
              <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                LinkedIn
              </a>
            )}
            {user?.socialLinks?.github && (
              <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                GitHub
              </a>
            )}
            {user?.socialLinks?.twitter && (
              <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                Twitter
              </a>
            )}
            {user?.socialLinks?.website && (
              <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                Website
              </a>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-300">Progress</span>
            <span className="text-orange-400 font-bold text-sm">{solvedPercentage}%</span>
          </div>
          
          <div className="relative w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 rounded-full transition-all duration-1000 ease-out shadow-lg" 
              style={{ width: `${solvedPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
            <span>Solved: <span className="text-green-400">{stats?.solvedCount || 0}</span></span>
            <span>Total: <span className="text-gray-300">{stats?.totalProblems || 0}</span></span>
          </div>
        </div>

        {/* Difficulty Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="group text-center p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl border border-green-700/30 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
            <div className="text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
              {stats?.easy || 0}
            </div>
            <div className="text-xs text-green-300 font-semibold uppercase tracking-wider">Easy</div>
          </div>
          
          <div className="group text-center p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl border border-yellow-700/30 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
              {stats?.medium || 0}
            </div>
            <div className="text-xs text-yellow-300 font-semibold uppercase tracking-wider">Medium</div>
          </div>
          
          <div className="group text-center p-4 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl border border-red-700/30 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
            <div className="text-2xl font-bold text-red-400 group-hover:text-red-300 transition-colors">
              {stats?.hard || 0}
            </div>
            <div className="text-xs text-red-300 font-semibold uppercase tracking-wider">Hard</div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="border-t border-gray-700 pt-5">
          <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wide flex items-center">
            <span className="mr-2">🏆</span>
            Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {user?.badges && user.badges.length > 0 ? (
              user.badges.slice(0, 6).map((badge, i) => (
                <span 
                  key={i}
                  className="group px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 text-xs rounded-full border border-orange-500/30 font-medium hover:border-orange-400/50 hover:bg-orange-500/30 transition-all duration-200 cursor-default"
                >
                  {badge}
                </span>
              ))
            ) : (
              <div className="w-full text-center py-4">
                <div className="text-4xl mb-2 opacity-50">🎯</div>
                <span className="text-gray-500 text-sm italic">No achievements yet</span>
                <div className="text-xs text-gray-600 mt-1">Start solving problems!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfileCard;