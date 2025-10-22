import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaBookOpen, FaComments, FaList } from 'react-icons/fa';

const RecentSubmissions = ({ submissions }) => {
  const [activeTab, setActiveTab] = useState('recent');

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const tabs = [
    { id: 'recent', label: 'Recent AC', icon: FaCheckCircle },
    { id: 'all', label: 'All Submissions', icon: FaList },
    { id: 'solutions', label: 'Solutions', icon: FaBookOpen },
    { id: 'discuss', label: 'Discuss', icon: FaComments },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <Link to="/problems" className="text-sm text-orange-400 hover:underline">
          View all →
        </Link>
      </div>

      <div className="mt-4">
        {activeTab === 'recent' && (
          <div className="space-y-3">
            {submissions.slice(0, 5).map((submission) => (
              <div key={submission._id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-transparent hover:border-gray-700 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <FaCheckCircle className="text-green-500 text-xl" />
                  <div>
                    <p className="font-semibold text-white">{submission.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                      <span className={getDifficultyClass(submission.difficulty)}>
                        {submission.difficulty}
                      </span>
                      <span>•</span>
                      <span>{submission.language}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(submission.solvedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400">No recent accepted submissions.</p>
                <p className="text-sm text-gray-500">Keep coding!</p>
              </div>
            )}
          </div>
        )}
        {activeTab !== 'recent' && (
          <div className="text-center py-10">
            <p className="text-gray-400">This section is under construction.</p>
            <p className="text-sm text-gray-500">Check back later for more features!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSubmissions;
