import Chat from '../components/discuss/Chat';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  TrendingUp, 
  ArrowLeft,
  Edit,
  Trash,
  MoreVertical,
  Send,
  Hash,
  AlertCircle,
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { useToast } from '../hooks/useToast';
import { useSelector } from 'react-redux';
import Comment from "../components/discuss/Comment"
import Loader from '../components/common/LoadingSpinner.jsx';
import { getSocket, joinDiscussion, leaveDiscussion, emitTyping, emitStopTyping } from '../utils/socket';

const DiscussionDetail = () => {
  const { discussionId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // State for discussion data
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for real-time features
  const [typingUsers, setTypingUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const typingTimeoutRef = useRef(null);
  
  // State for comment form
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    tags: ''
  });

  // Socket event handlers moved outside useEffect and memoized
  const handleNewComment = React.useCallback((newComment) => {
    if (newComment.discussionId === discussionId) {
      setComments(prev => {
        if (prev.some(comment => comment._id === newComment._id)) {
          return prev;
        }
        return [...prev, newComment];
      });
    }
  }, [discussionId]);

  const handleUpdateComment = React.useCallback((updatedComment) => {
    if (updatedComment.discussionId === discussionId) {
      setComments(prev => 
        prev.map(comment => 
          comment._id === updatedComment._id ? updatedComment : comment
        )
      );
    }
  }, [discussionId]);

  const handleDeleteComment = React.useCallback(({ commentId, discussionId: deletedFromDiscussion }) => {
    if (deletedFromDiscussion === discussionId) {
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    }
  }, [discussionId]);

  const handleDiscussionUpdateFromSocket = React.useCallback((updatedDiscussion) => {
    if (updatedDiscussion._id === discussionId) {
      setDiscussion(updatedDiscussion);
    }
  }, [discussionId]);

  const handleDiscussionVoted = React.useCallback(({ discussionId: votedDiscussionId, upvotes, downvotes }) => {
    if (votedDiscussionId === discussionId) {
      setDiscussion(prev => prev ? { ...prev, upvotes, downvotes } : prev);
    }
  }, [discussionId]);

  const handleCommentVoted = React.useCallback(({ commentId, upvotes, downvotes }) => {
    setComments(prev => 
      prev.map(comment => 
        comment._id === commentId ? { ...comment, upvotes, downvotes } : comment
      )
    );
  }, []);

  // Fetch discussion and comments
  React.useEffect(() => {
    const fetchDiscussionDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch discussion details
        const discussionResponse = await axiosClient.get(`/discussions/${discussionId}`);
        const discussionData = discussionResponse.data.discussion || discussionResponse.data;
        setDiscussion(discussionData);
        
        // Initialize edit form with current values
        setEditForm({
          title: discussionData.title,
          content: discussionData.content,
          tags: discussionData.tags?.join(', ') || ''
        });
        
        // Fetch comments separately
        const commentsResponse = await axiosClient.get(`/discussions/${discussionId}/comments`);
        setComments(commentsResponse.data || []);
      } catch (error) {
        console.error('Error fetching discussion details:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load discussion';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiscussionDetails();
    
    // Join the discussion room via socket
    const socket = getSocket();
    if (socket) {
      joinDiscussion(discussionId);
      
      // Attach event listeners
      socket.on('new-comment', handleNewComment);
      socket.on('update-comment', handleUpdateComment);
      socket.on('delete-comment', handleDeleteComment);
      socket.on('update-discussion', handleDiscussionUpdateFromSocket);
      socket.on('discussion-voted', handleDiscussionVoted);
      socket.on('comment-voted', handleCommentVoted);
      
      // Listen for typing indicators
      socket.on('user-typing', ({ discussionId: typingDiscussionId, user: typingUser }) => {
        if (typingDiscussionId === discussionId && typingUser._id !== user?._id) {
          setTypingUsers(prev => {
            if (!prev.some(u => u._id === typingUser._id)) {
              return [...prev, typingUser];
            }
            return prev;
          });
        }
      });
      
      // Listen for stop typing indicators
      socket.on('user-stop-typing', ({ discussionId: typingDiscussionId, userId }) => {
        if (typingDiscussionId === discussionId) {
          setTypingUsers(prev => prev.filter(u => u._id !== userId));
        }
      });
      
      // Listen for connection status
      socket.on('connect', () => setIsOnline(true));
      socket.on('disconnect', () => setIsOnline(false));
    }
    
    // Clean up socket listeners when component unmounts
    return () => {
      const socket = getSocket();
      if (socket) {
        leaveDiscussion(discussionId);
        socket.off('new-comment', handleNewComment);
        socket.off('update-comment', handleUpdateComment);
        socket.off('delete-comment', handleDeleteComment);
        socket.off('update-discussion', handleDiscussionUpdateFromSocket);
        socket.off('discussion-voted', handleDiscussionVoted);
        socket.off('comment-voted', handleCommentVoted);
        socket.off('user-typing');
        socket.off('user-stop-typing');
        socket.off('connect');
        socket.off('disconnect');
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [discussionId, user, handleNewComment, handleUpdateComment, handleDeleteComment, handleDiscussionUpdateFromSocket, handleDiscussionVoted, handleCommentVoted]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Check if user has upvoted
  const hasUpvoted = () => {
    return user && discussion?.upvotes?.includes(user._id);
  };
  
  // Check if user has downvoted
  const hasDownvoted = () => {
    return user && discussion?.downvotes?.includes(user._id);
  };
  
  // Check if user is the author
  const isAuthor = () => {
    return user && user._id === discussion?.author?._id;
  };
  
  // Handle discussion vote
  const handleVote = async (type) => {
    if (!user) {
      showToast('Please log in to vote', 'warning');
      return;
    }

    try {
      const response = await axiosClient.post(`/discussions/${discussionId}/vote`, {
        voteType: type
      });

      // Update discussion with new vote arrays (not counts)
      if (response.data.success) {
        setDiscussion(prev => ({
          ...prev,
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes
        }));
      }
    } catch (error) {
      console.error('Error voting on discussion:', error);
      const errorMessage = error.response?.data?.message || 'Failed to register vote';
      showToast(errorMessage, 'error');
    }
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    if (!user) return;
    
    // Only emit typing event if not already typing
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(discussionId, { _id: user._id, name: user.name });
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(discussionId);
    }, 2000);
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      showToast('Please log in to comment', 'warning');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axiosClient.post(`/discussions/${discussionId}/comments`, {
        content: commentText
      });
      
      // The backend now returns the comment directly, not wrapped in a success object
      const newComment = response.data;
      
      // Add new comment to the list (avoid duplicates in case socket event also fires)
      setComments(prev => {
        if (prev.some(comment => comment._id === newComment._id)) {
          return prev;
        }
        return [...prev, newComment];
      });
      
      setCommentText('');
      showToast('Comment added successfully', 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add comment';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle comment update
  const handleCommentUpdate = (updatedComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment._id === updatedComment._id ? updatedComment : comment
      )
    );
  };
  
  // Handle comment delete
  const handleCommentDelete = (commentId) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  };
  
  // Handle discussion edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle discussion update
  const handleUpdateDiscussion = async (e) => {
    e.preventDefault();
    
    if (!editForm.title.trim() || !editForm.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }
    
    try {
      // Process tags from comma-separated string to array
      const tagsArray = editForm.tags
        ? editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      const response = await axiosClient.put(`/discussions/${discussionId}`, {
        title: editForm.title,
        content: editForm.content,
        tags: tagsArray
      });
      
      // Update discussion with edited values
      setDiscussion(response.data);
      setIsEditing(false);
      showToast('Discussion updated successfully', 'success');
    } catch (error) {
      console.error('Error updating discussion:', error);
      showToast('Failed to update discussion', 'error');
    }
  };

  if (!discussion) {
  return <div>Loading...</div>;
}
  
  // Handle discussion delete
  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axiosClient.delete(`/discussions/${discussionId}`);
      showToast('Discussion deleted successfully', 'success');
      navigate('/discuss');
    } catch (error) {
      console.error('Error deleting discussion:', error);
      showToast('Failed to delete discussion', 'error');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <Loader />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/discuss')} 
            className="flex items-center text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Discussions
          </button>
          
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/discuss')} 
          className="flex items-center text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Discussions
        </button>
        
        {isEditing ? (
          /* Edit Form */
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Discussion</h2>
            
            <form onSubmit={handleUpdateDiscussion}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={editForm.content}
                  onChange={handleEditChange}
                  rows="6"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={editForm.tags}
                  onChange={handleEditChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Discussion View */
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
            <div className="flex justify-between">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden mr-3">
                  {discussion.author?.profileImage ? (
                    <img 
                      src={discussion.author.profileImage} 
                      alt={discussion.author.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white text-sm font-bold">
                      {discussion.author?.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">
                    {discussion.author?.name || 'Anonymous'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(discussion.createdAt)}
                  </div>
                </div>
              </div>
              
              {isAuthor() && (
                <div className="relative group">
                  <button className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 mt-1 w-36 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button 
                      onClick={handleDeleteDiscussion}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">{discussion.title}</h1>
              <div className="px-3 py-1 bg-gray-700/50 rounded-md text-sm font-medium text-gray-300">
                {discussion.community.charAt(0).toUpperCase() + discussion.community.slice(1)}
              </div>
            </div>
            
            <div className="text-gray-200 mb-6 whitespace-pre-line">
              {discussion.content}
            </div>
            
            {discussion.tags && discussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {discussion.tags.map((tag, index) => (
                  <div key={index} className="px-2 py-1 bg-gray-700/50 rounded-md text-xs font-medium text-gray-300 flex items-center">
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center text-sm border-t border-gray-700/50 pt-4">
              <button 
                onClick={() => handleVote('upvote')}
                className={`flex items-center mr-4 ${hasUpvoted() ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}
              >
                <ThumbsUp className="w-5 h-5 mr-1" />
                <span>{discussion.upvotes?.length || 0}</span>
              </button>
              
              <button 
                onClick={() => handleVote('downvote')}
                className={`flex items-center mr-4 ${hasDownvoted() ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}
              >
                <ThumbsDown className="w-5 h-5 mr-1" />
                <span>{discussion.downvotes?.length || 0}</span>
              </button>
              
              <div className="flex items-center mr-4 text-gray-400">
                <MessageSquare className="w-5 h-5 mr-1" />
                <span>{comments.length} comments</span>
              </div>
              
              <div className="flex items-center text-gray-400">
                <TrendingUp className="w-5 h-5 mr-1" />
                <span>{discussion.views || 0} views</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Live Chat</h2>
          <Chat discussionId={discussionId} />
        </div>

        {/* Comments Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
          
          {/* Connection Status */}
          {!isOnline && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md flex items-center text-red-300">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>You are currently offline. Some features may be unavailable.</span>
            </div>
          )}
          
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-2">
            <div className="flex">
              <input
                type="text"
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  handleTyping();
                }}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button 
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-r-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="mb-4 text-sm text-gray-400 italic">
              {typingUsers.length === 1 ? (
                <span>{typingUsers[0].name} is typing...</span>
              ) : typingUsers.length === 2 ? (
                <span>{typingUsers[0].name} and {typingUsers[1].name} are typing...</span>
              ) : (
                <span>Multiple people are typing...</span>
              )}
            </div>
          )}
          
          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No comments yet</h3>
              <p className="text-gray-400">
                Be the first to share your thoughts on this discussion!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments
                .filter(comment => !comment.parentComment) // Only show top-level comments
                .map(comment => (
                  <Comment
                    key={comment._id}
                    comment={comment}
                    discussionId={discussionId}
                    onCommentUpdate={handleCommentUpdate}
                    onCommentDelete={handleCommentDelete}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;