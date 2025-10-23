import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { useToast } from '../hooks/useToast';
import { useSelector } from 'react-redux';
import { initializeSocket, getSocket } from '../utils/socket';

import Chat from '../components/discuss/Chat';

// Components
import DiscussHeader from '../components/discuss/DiscussHeader';
import DiscussionCard from '../components/discuss/DiscussionCard';
import DiscussSidebar from '../components/discuss/DiscussSidebar';
import CreateDiscussionModal from '../components/discuss/CreateDiscussionModal';
import Loader from '../components/common/Loader';

const DiscussPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  
  // State for discussions
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters and pagination
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // State for create discussion modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New state for selected discussion
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);

  // Initialize socket connection
  const [socketConnected, setSocketConnected] = React.useState(false);

  useEffect(() => {
    console.log('Initializing socket with token:', token, 'isAuthenticated:', isAuthenticated);
    if (isAuthenticated && token) {
      const socket = initializeSocket(token);
      socket.on('connect', () => {
        console.log('Socket connected in DiscussPage');
        setSocketConnected(true);
      });
      socket.on('disconnect', () => {
        console.log('Socket disconnected in DiscussPage');
        setSocketConnected(false);
      });
      socket.on('connect_error', (error) => {
        console.error('Socket connection error in DiscussPage:', error);
        setSocketConnected(false);
      });
      socket.on('error', (error) => {
        console.error('Socket general error in DiscussPage:', error);
      });
    }
  }, [token, isAuthenticated]);

  // Socket event handlers
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewDiscussion = (discussion) => {
      setDiscussions(prev => [discussion, ...prev]);
    };

    const handleUpdateDiscussion = (updatedDiscussion) => {
      setDiscussions(prev => prev.map(d => d._id === updatedDiscussion._id ? updatedDiscussion : d));
    };

    const handleDeleteDiscussion = ({ discussionId }) => {
      setDiscussions(prev => prev.filter(d => d._id !== discussionId));
    };

    const handleNewComment = (comment) => {
      setDiscussions(prev => prev.map(d => {
        if (d._id === comment.discussion) {
          return { ...d, commentCount: (d.commentCount || 0) + 1 };
        }
        return d;
      }));
    };

    const handleUpdateComment = (comment) => {
      // For simplicity, no direct update to discussions list needed here
    };

    const handleDeleteComment = ({ commentId, discussionId }) => {
      setDiscussions(prev => prev.map(d => {
        if (d._id === discussionId) {
          return { ...d, commentCount: (d.commentCount || 1) - 1 };
        }
        return d;
      }));
    };

    const handleDiscussionVoted = ({ discussionId, upvotes, downvotes }) => {
      setDiscussions(prev => prev.map(d => {
        if (d._id === discussionId) {
          return { ...d, upvotes, downvotes };
        }
        return d;
      }));
    };

    socket.on('new-discussion', handleNewDiscussion);
    socket.on('discussion-updated', handleUpdateDiscussion);
    socket.on('discussion-deleted', handleDeleteDiscussion);
    socket.on('new-comment', handleNewComment);
    socket.on('comment-updated', handleUpdateComment);
    socket.on('comment-deleted', handleDeleteComment);
    socket.on('discussion-voted', handleDiscussionVoted);

    return () => {
      socket.off('new-discussion', handleNewDiscussion);
      socket.off('discussion-updated', handleUpdateDiscussion);
      socket.off('discussion-deleted', handleDeleteDiscussion);
      socket.off('new-comment', handleNewComment);
      socket.off('comment-updated', handleUpdateComment);
      socket.off('comment-deleted', handleDeleteComment);
      socket.off('discussion-voted', handleDiscussionVoted);
    };
  }, [token]);

  // Fetch discussions based on filters
  const isFetchingRef = React.useRef(false);

  useEffect(() => {
    console.log('useEffect triggered: selectedCommunity, sortBy, searchQuery', { selectedCommunity, sortBy, searchQuery });

    if (isFetchingRef.current) {
      console.log('Fetch in progress, skipping new fetch');
      return;
    }

    let isMounted = true;
    let controller = new AbortController();

    const fetchDiscussions = async () => {
      if (!isMounted) return;

      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('sortBy', sortBy);

        if (selectedCommunity && selectedCommunity !== 'all') {
          params.append('community', selectedCommunity);
        }

        if (searchQuery) {
          params.append('search', searchQuery);
        }

        const response = await axiosClient.get(`/discussions?${params.toString()}`, {
          signal: controller.signal
        });

        if (!isMounted) return;

        setDiscussions(response.data.discussions);

        setHasMore(false); // Disable pagination
      } catch (error) {
        if (!isMounted) return;

        // Don't show error for aborted requests (component unmounted)
        if (error.name === 'AbortError') {
          return;
        }

        console.error('Error fetching discussions:', error);
        setError('Failed to load discussions. Please try again.');
        // Removed showToast from dependency and call to avoid re-render loops
        // showToast('Failed to load discussions', 'error');
      } finally {
        if (isMounted) {
          setLoading(false);
          isFetchingRef.current = false;
        }
      }
    };

    fetchDiscussions();

    return () => {
      isMounted = false;
      controller.abort();
      isFetchingRef.current = false;
    };
  }, [selectedCommunity, sortBy, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    // Pagination removed, no page state reset needed
  }, [selectedCommunity, sortBy, searchQuery]);

  // Handle community change
  const handleCommunityChange = (community) => {
    setSelectedCommunity(community);
  };

  // Pagination removed, so remove handleLoadMore
  
  // Handle discussion creation
  const handleDiscussionCreated = (newDiscussion) => {
    setDiscussions(prev => {
      // Avoid duplicate discussions
      if (prev.some(d => d._id === newDiscussion._id)) {
        console.log('Duplicate discussion creation prevented:', newDiscussion._id);
        return prev;
      }
      console.log('Adding new discussion:', newDiscussion._id);
      return [newDiscussion, ...prev];
    });
    // Optionally trigger a re-fetch to sync with backend
    console.log('Triggering discussions re-fetch after creation');
    setTimeout(() => {
      setSelectedCommunity(selectedCommunity); // Trigger useEffect to re-fetch
    }, 1000);
  };
  
  // Socket event handlers
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewDiscussion = (discussion) => {
      setDiscussions(prev => {
        if (prev.some(d => d._id === discussion._id)) {
          console.log('Duplicate discussion from socket prevented:', discussion._id);
          return prev;
        }
        console.log('Adding new discussion from socket:', discussion._id);
        return [discussion, ...prev];
      });
    };

    const handleUpdateDiscussion = (updatedDiscussion) => {
      setDiscussions(prev => prev.map(d => d._id === updatedDiscussion._id ? updatedDiscussion : d));
    };

    const handleDeleteDiscussion = ({ discussionId }) => {
      setDiscussions(prev => prev.filter(d => d._id !== discussionId));
    };

    const handleNewComment = (comment) => {
      setDiscussions(prev => prev.map(d => {
        if (d._id === comment.discussion) {
          return { ...d, commentCount: (d.commentCount || 0) + 1 };
        }
        return d;
      }));
    };

    const handleUpdateComment = (comment) => {
      // For simplicity, no direct update to discussions list needed here
    };

    const handleDeleteComment = ({ commentId, discussionId }) => {
      setDiscussions(prev => prev.map(d => {
        if (d._id === discussionId) {
          return { ...d, commentCount: (d.commentCount || 1) - 1 };
        }
        return d;
      }));
    };

    const handleDiscussionVoted = ({ discussionId, upvotes, downvotes }) => {
      setDiscussions(prev => prev.map(d => {
        if (d._id === discussionId) {
          return { ...d, upvotes, downvotes };
        }
        return d;
      }));
    };

    socket.on('new-discussion', handleNewDiscussion);
    socket.on('discussion-updated', handleUpdateDiscussion);
    socket.on('discussion-deleted', handleDeleteDiscussion);
    socket.on('new-comment', handleNewComment);
    socket.on('comment-updated', handleUpdateComment);
    socket.on('comment-deleted', handleDeleteComment);
    socket.on('discussion-voted', handleDiscussionVoted);

    return () => {
      socket.off('new-discussion', handleNewDiscussion);
      socket.off('discussion-updated', handleUpdateDiscussion);
      socket.off('discussion-deleted', handleDeleteDiscussion);
      socket.off('new-comment', handleNewComment);
      socket.off('comment-updated', handleUpdateComment);
      socket.off('comment-deleted', handleDeleteComment);
      socket.off('discussion-voted', handleDiscussionVoted);
    };
  }, [token]);
  
  // Delete discussion handler
  const handleDeleteDiscussion = async (discussionId) => {
    try {
      await axiosClient.delete(`/discussions/${discussionId}`);
      setDiscussions(prev => prev.filter(d => d._id !== discussionId));
      showToast('Discussion deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting discussion:', error);
      showToast(error.response?.data?.message || 'Failed to delete discussion', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4 lg:w-1/5">
            <DiscussSidebar 
              selectedCommunity={selectedCommunity} 
              onCommunityChange={handleCommunityChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
          
          {/* Main content */}
          <div className="md:w-3/4 lg:w-4/5">
            <button
              onClick={() => navigate('/')}
              className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
            >
              Back to Home
            </button>
            <DiscussHeader 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedCommunity={selectedCommunity}
              onCreateClick={() => {
                if (!isAuthenticated) {
                  showToast('Please log in to create a discussion', 'warning');
                  navigate('/login');
                  return;
                }
                setIsCreateModalOpen(true);
              }}
            />
            
            {/* Discussions list */}
            {selectedCommunity !== 'Live Chat' && (
              <>
                {loading && page === 1 ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader />
                  </div>
                ) : error ? (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-md">
                    {error}
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center">
                    <h3 className="text-xl font-semibold mb-2">No discussions found</h3>
                    <p className="text-gray-400 mb-4">
                      {searchQuery 
                        ? 'No discussions match your search criteria.'
                        : selectedCommunity !== 'all'
                          ? `Be the first to start a discussion in the ${selectedCommunity} community!`
                          : 'Be the first to start a discussion!'}
                    </p>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          showToast('Please log in to create a discussion', 'warning');
                          navigate('/login');
                          return;
                        }
                        setIsCreateModalOpen(true);
                      }}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                    >
                      Start a Discussion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discussions.map(discussion => (
                  <DiscussionCard 
                    key={discussion._id} 
                    discussion={discussion} 
                    currentUserId={user?._id} 
                    onDelete={handleDeleteDiscussion} 
                    onSelect={() => navigate(`/discuss/${discussion._id}`)}
                    isSelected={selectedDiscussion?._id === discussion._id}
                  />
                    ))}
                    
                    {/* Load more button */}
                    {hasMore && (
                      <div className="flex justify-center mt-6">
                        <button
                          onClick={handleLoadMore}
                          disabled={loading}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {/* Real-time Chat Section */}
            {selectedCommunity === 'Live Chat' && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Real-time Chat</h2>
                <Chat discussionId={selectedCommunity} socketConnected={socketConnected} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create discussion modal */}
      <CreateDiscussionModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDiscussionCreated={handleDiscussionCreated}
      />
    </div>
  );
};

export default DiscussPage;
