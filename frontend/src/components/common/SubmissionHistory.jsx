import { useState, useEffect } from 'react';
import { FiCode, FiClock, FiCpu, FiHardDrive, FiCheckCircle, FiXCircle, FiAlertCircle, FiLoader, FiChevronDown, FiExternalLink } from 'react-icons/fi';
import { FaJava, FaPython, FaJs } from 'react-icons/fa';
import { SiCplusplus, SiRuby, SiSwift } from 'react-icons/si';
import axiosClient from '../../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getLanguageIcon = (language) => {
    const lang = language.toLowerCase();
    switch (lang) {
      case 'java': return <FaJava className="text-orange-400" />;
      case 'python': return <FaPython className="text-blue-400" />;
      case 'javascript': return <FaJs className="text-yellow-400" />;
      case 'c++': return <SiCplusplus className="text-blue-500" />;
      case 'ruby': return <SiRuby className="text-red-400" />;
      case 'swift': return <SiSwift className="text-orange-300" />;
      default: return <FiCode className="text-gray-400" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <FiCheckCircle className="text-green-400" />;
      case 'Wrong': return <FiXCircle className="text-red-400" />;
      case 'Error': return <FiAlertCircle className="text-yellow-400" />;
      case 'Pending': return <FiLoader className="text-blue-400 animate-spin" />;
      default: return <FiAlertCircle className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-900/20 text-green-400';
      case 'Wrong': return 'bg-red-900/20 text-red-400';
      case 'Error': return 'bg-yellow-900/20 text-yellow-400';
      case 'Pending': return 'bg-blue-900/20 text-blue-400';
      default: return 'bg-gray-900/20 text-gray-400';
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'Accepted': return 'border-green-400/30';
      case 'Wrong': return 'border-red-400/30';
      case 'Error': return 'border-yellow-400/30';
      case 'Pending': return 'border-blue-400/30';
      default: return 'border-gray-400/30';
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatRuntime = (runtime) => {
    if (!runtime) return 'N/A';
    return `${runtime} ms`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getTestCasesProgress = (passed, total) => {
    const percentage = total > 0 ? (passed / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 w-full">
        <span className="text-xs font-medium min-w-[40px] text-right text-gray-300">
          {passed}/{total}
        </span>
        <div className="flex-1 bg-gray-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              percentage === 100 ? 'bg-green-500' : 
              percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border-l-4 border-red-500 p-4 my-4 rounded">
        <div className="flex items-center">
          <FiXCircle className="h-5 w-5 text-red-400 mr-3" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shadow-lg">
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-orange-400">Submission History</h2>
            <p className="mt-1 text-sm text-gray-400">
              All your submissions for this problem
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-gray-700 text-orange-400 text-xs font-medium rounded-full">
              {submissions.length} submissions
            </span>
          </div>
        </div>
      </div>
      
      {submissions.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
            <FiCode className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-300">No submissions yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Submit your solution to see it appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiClock className="mr-1" />
                      Runtime
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiHardDrive className="mr-1" />
                      Memory
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Test Cases
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {submissions.map((sub, index) => (
                  <>
                    <tr 
                      key={sub._id} 
                      className={`hover:bg-gray-800/50 transition-colors ${expandedRows[sub._id] ? 'bg-gray-800/50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-5 w-5">
                            {getLanguageIcon(sub.language)}
                          </div>
                          <div className="ml-2 text-sm font-medium text-gray-200">
                            {sub.language}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status)} ${getStatusBorderColor(sub.status)} border`}>
                            {getStatusIcon(sub.status)}
                            <span className="ml-1.5">
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center">
                          <span className="font-mono">{formatRuntime(sub.runtime)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center">
                          <span className="font-mono">{formatMemory(sub.memory)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTestCasesProgress(sub.testCasesPassed, sub.testCasesTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                
                          <button
                            onClick={() => toggleRowExpand(sub._id)}
                            className="text-gray-400 hover:text-gray-300 p-1.5 rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <FiChevronDown className={`transition-transform duration-200 ${expandedRows[sub._id] ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows[sub._id] && (
                      <tr className="bg-gray-800/30">
                        <td colSpan="8" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-300 flex items-center">
                                <FiCode className="mr-2 text-orange-400" />
                                Code Preview
                              </h4>
                              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-64 overflow-auto">
                                <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                                  <code>{sub.code.substring(0, 500)}{sub.code.length > 500 ? '...' : ''}</code>
                                </pre>
                                {sub.code.length > 500 && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    Showing first 500 characters. Click "View" to see full code.
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-300 flex items-center">
                                <FiAlertCircle className="mr-2 text-orange-400" />
                                Submission Details
                              </h4>
                              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-64 overflow-auto">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                                    <span className="text-gray-400">Language:</span>
                                    <span className="font-medium text-gray-200 flex items-center">
                                      {getLanguageIcon(sub.language)}
                                      <span className="ml-2">{sub.language}</span>
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`${getStatusColor(sub.status)} px-2.5 py-0.5 rounded-full text-xs`}>
                                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                                    <span className="text-gray-400">Runtime:</span>
                                    <span className="font-medium text-gray-200">
                                      {formatRuntime(sub.runtime)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pb-2 border-b border-gray-700">
                                    <span className="text-gray-400">Memory:</span>
                                    <span className="font-medium text-gray-200">
                                      {formatMemory(sub.memory)}
                                    </span>
                                  </div>
                                  {sub.errorMessage && (
                                    <div className="mt-2 bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r">
                                      <div className="flex">
                                        <FiAlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
                                        <span className="text-xs text-red-200">{sub.errorMessage}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Code Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm" onClick={() => setSelectedSubmission(null)}></div>
            </div>

            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full border border-gray-700">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-orange-400 mb-1">
                      Submission Details
                    </h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`${getStatusColor(selectedSubmission.status)} px-3 py-1 rounded-full text-sm flex items-center`}>
                        {getStatusIcon(selectedSubmission.status)}
                        <span className="ml-2">
                          {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                        </span>
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(selectedSubmission.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <FiCode className="text-orange-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-400">Language</p>
                        <p className="text-gray-200 font-medium">{selectedSubmission.language}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <FiClock className="text-orange-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-400">Runtime</p>
                        <p className="text-gray-200 font-medium">{formatRuntime(selectedSubmission.runtime)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <FiHardDrive className="text-orange-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-400">Memory</p>
                        <p className="text-gray-200 font-medium">{formatMemory(selectedSubmission.memory)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <FiCheckCircle className="text-orange-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-400">Test Cases</p>
                        <p className="text-gray-200 font-medium">
                          {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center">
                      <FiCpu className="text-orange-400 mr-3" />
                      <div className="w-full">
                        <p className="text-xs text-gray-400 mb-2">Test Case Progress</p>
                        {getTestCasesProgress(selectedSubmission.testCasesPassed, selectedSubmission.testCasesTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedSubmission.errorMessage && (
                  <div className="mb-6 bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r">
                    <div className="flex">
                      <FiAlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-red-200">Error Details</h4>
                        <p className="mt-1 text-sm text-red-300">
                          {selectedSubmission.errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-300 flex items-center">
                      <FiCode className="mr-2 text-orange-400" />
                      Submitted Code
                    </h4>
                    <span className="text-xs text-gray-500">
                      {selectedSubmission.language}
                    </span>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto border border-gray-700 max-h-[500px]">
                    <pre className="text-gray-200 text-sm font-mono">
                      <code>{selectedSubmission.code}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700 flex justify-end">
                <button
                  type="button"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;