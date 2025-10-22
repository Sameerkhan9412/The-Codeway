import React, { useState } from "react";

const tabList = [
  { key: "recent", label: "Recent AC", icon: "✅", description: "Recently accepted submissions" },
  { key: "list", label: "All Submissions", icon: "📋", description: "Complete submission history" },
  { key: "solutions", label: "Solutions", icon: "💡", description: "View solution code" },
  { key: "discuss", label: "Discuss", icon: "💬", description: "Community discussions" },
];

const SubmissionsTabs = ({ submissions, loading }) => {
  const [activeTab, setActiveTab] = useState("recent");

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 animate-pulse">
        <div className="flex gap-3 mb-6">
          {tabList.map((tab) => (
            <div
              key={tab.key}
              className="h-10 w-32 bg-gray-700 rounded-xl"
            />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}   
            className="h-16 w-full bg-gray-700 rounded-lg mb-3"
          />
        ))}
      </div>
    );
  }

  const data = submissions || [];
  const recentSubmissions = data.slice(0, 10);
  const solutionSubmissions = data.filter((item) => item.solution);
  const listSubmissions = data;

  const getSubmissionLanguage = (submission) => {
    return submission.language || submission.programmingLanguage || "Unknown";
  };

  const getSubmissionStatus = (submission) => {
    return submission.status || "Accepted";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "--";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-6">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 bg-gray-700/50 rounded-xl">
            {tabList.map((tab) => (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 transform scale-[1.02]"
                    : "text-gray-300 hover:bg-gray-600/50 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.key)}
                title={tab.description}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <button className="text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors duration-200 hover:underline">
            View all →
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4 opacity-50">📝</div>
              <div className="text-gray-400 text-lg mb-2">No submissions yet</div>
              <div className="text-gray-500 text-sm">Start solving problems to see your progress here!</div>
            </div>
          ) : (
            <>
              {/* Recent Submissions Tab */}
              {activeTab === "recent" && (
                <div className="space-y-3">
                  {recentSubmissions.map((item, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between p-4 rounded-xl border border-gray-700 hover:border-orange-500/50 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                          <span className="text-green-400 text-lg">✓</span>
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-orange-400 transition-colors duration-200">
                            {item.title || item.problemTitle || "Unknown Problem"}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                              {getSubmissionLanguage(item)}
                            </span>
                            <span>{formatDate(item.solvedAt || item.time)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        View →
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All Submissions Tab */}
              {activeTab === "list" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4 p-3 text-sm text-gray-400 font-semibold border-b border-gray-700">
                    <div>Problem</div>
                    <div>Language</div>
                    <div>Status</div>
                    <div>Date</div>
                  </div>
                  {listSubmissions.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-4 gap-4 p-4 rounded-xl border border-gray-700 hover:border-orange-500/50 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="font-medium text-white group-hover:text-orange-400 transition-colors truncate">
                        {item.title || item.problemTitle || "Unknown Problem"}
                      </div>
                      <div className="text-sm">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                          {getSubmissionLanguage(item)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                          {getSubmissionStatus(item)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatDate(item.solvedAt || item.time)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Solutions Tab */}
              {activeTab === "solutions" && (
                <div className="space-y-4">
                  {solutionSubmissions.length > 0 ? (
                    solutionSubmissions.map((item, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800/50"
                      >
                        <div className="p-4 border-b border-gray-700 bg-gray-700/30">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-orange-400">
                              {item.title || item.problemTitle || "Unknown Problem"}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                                {getSubmissionLanguage(item)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(item.solvedAt || item.time)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto border border-gray-600 text-gray-300 leading-relaxed">
                            <code>{item.solution || "// Solution code not available"}</code>
                          </pre>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-6xl mb-4 opacity-50">💡</div>
                      <div className="text-gray-400 text-lg mb-2">No solutions available</div>
                      <div className="text-gray-500 text-sm">Solutions will appear here when you submit code</div>
                    </div>
                  )}
                </div>
              )}

              {/* Discuss Tab */}
              {activeTab === "discuss" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-6xl mb-4 opacity-50">💬</div>
                  <div className="text-gray-400 text-lg mb-2">Discussion feature coming soon</div>
                  <div className="text-gray-500 text-sm">Connect with other developers and share insights</div>
                  <button className="mt-4 px-6 py-2 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-all duration-200">
                    Stay tuned!
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionsTabs;