
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  ThumbsUp, 
  TrendingUp, 
  Hash,
  Clock,
  Edit,
  Trash
} from 'lucide-react';

const DiscussionCard = ({ discussion, currentUserId, onDelete, onSelect, isSelected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [community, setCommunity] = useState(discussion.community);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Determine if current user is author
  const isAuthor = currentUserId && discussion.author && (currentUserId === discussion.author._id || currentUserId === discussion.author);

  // Handle community update (stub, implement as needed)
  const handleCommunityUpdate = (e) => {
    e.preventDefault();
    // Implement update logic here if needed
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 transition-all cursor-pointer ${isSelected ? 'border-orange-500' : 'hover:border-gray-600'}`}
      onClick={() => onSelect && onSelect(discussion)}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-white">
            {discussion.title}
          </h3>
          <div className="px-2 py-1 bg-gray-700/50 rounded-md text-xs font-medium text-gray-300">
            {discussion.community.charAt(0).toUpperCase() + discussion.community.slice(1)}
          </div>
        </div>
        
        <p className="text-gray-300 mb-4 line-clamp-2">
          {discussion.content}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {discussion.tags && discussion.tags.map((tag, index) => (
            <div key={index} className="px-2 py-1 bg-gray-700/50 rounded-md text-xs font-medium text-gray-300 flex items-center">
              <Hash className="w-3 h-3 mr-1" />
              {tag}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span>{discussion.upvotes?.length || 0}</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>{discussion.commentCount || 0}</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{discussion.views || 0} views</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden mr-2">
              {discussion.author?.profileImage ? (
                <img 
                  src={discussion.author.profileImage} 
                  alt={discussion.author.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white text-xs font-bold">
                  {discussion.author?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <span>{discussion.author?.name || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(discussion.createdAt)}</span>
          </div>
        </div>
      </div>
      {isAuthor && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(discussion._id);
            }}
            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm mr-2"
          >
            Delete
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Edit
          </button>
        </>
      )}

      {isEditing && (
        <form
          onSubmit={handleCommunityUpdate}
          className="mt-2 flex items-center space-x-2"
        >
          <select
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white"
          >
            <option value="global">Global</option>
            <option value="dsa">DSA</option>
            <option value="india">India</option>
            <option value="other">Other</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
          >
            Cancel
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default DiscussionCard;