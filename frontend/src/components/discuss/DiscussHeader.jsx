import React from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  TrendingUp, 
  Clock, 
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

const DiscussHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  sortBy, 
  setSortBy,
  selectedCommunity,
  onCreateClick 
}) => {
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle sort option change
  const handleSortChange = (value) => {
    setSortBy(value);
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {selectedCommunity === 'all' 
              ? 'All Discussions' 
              : `${selectedCommunity.charAt(0).toUpperCase() + selectedCommunity.slice(1)} Community`}
          </h1>
          <p className="text-gray-400">
            Join the conversation, ask questions, and share your knowledge
          </p>
        </div>
        
        <button
          onClick={onCreateClick}
          className="mt-4 md:mt-0 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Discussion
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search discussions..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        
        <div className="flex items-center bg-gray-700 border border-gray-600 rounded-md px-3 py-2">
          <Filter className="text-gray-400 w-5 h-5 mr-2" />
          <span className="text-gray-300 mr-2 hidden md:inline">Sort by:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSortChange('trending')}
              className={`px-2 py-1 rounded-md flex items-center text-sm ${sortBy === 'trending' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Trending</span>
            </button>
            <button
              onClick={() => handleSortChange('latest')}
              className={`px-2 py-1 rounded-md flex items-center text-sm ${sortBy === 'latest' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              <Clock className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Latest</span>
            </button>
            <button
              onClick={() => handleSortChange('most_commented')}
              className={`px-2 py-1 rounded-md flex items-center text-sm ${sortBy === 'most_commented' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Most Commented</span>
            </button>
            <button
              onClick={() => handleSortChange('most_upvoted')}
              className={`px-2 py-1 rounded-md flex items-center text-sm ${sortBy === 'most_upvoted' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Most Upvoted</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussHeader;