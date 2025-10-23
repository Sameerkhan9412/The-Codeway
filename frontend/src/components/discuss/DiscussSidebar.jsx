import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Globe, 
  Code, 
  MapPin, 
  MessageSquare,
  TrendingUp,
  Clock,
  ThumbsUp,
  Users,
  MessageCircleMore 
} from 'lucide-react';

const DiscussSidebar = ({ selectedCommunity, onCommunityChange, selectedSort, onSortChange }) => {
  const location = useLocation();
  
  const communities = [
    { id: 'all', name: 'All Communities', icon: Globe },
    { id: 'dsa', name: 'DSA Community', icon: Code },
    { id: 'india', name: 'India', icon: MapPin },
    { id: 'global', name: 'Global', icon: Globe },
    { id: 'other', name: 'Other', icon: MessageSquare },
    { id: 'Live Chat', name: 'Real Time Chat', icon: MessageCircleMore }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest', icon: Clock },
    { id: 'popular', name: 'Most Viewed', icon: TrendingUp },
    { id: 'mostUpvoted', name: 'Most Upvoted', icon: ThumbsUp }
  ];

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Communities</h3>
        <div className="space-y-2">
          {communities.map((community) => (
            <button
              key={community.id}
              onClick={() => onCommunityChange(community.id)}
              className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${selectedCommunity === community.id ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              <community.icon className="w-5 h-5 mr-3" />
              <span>{community.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">Sort By</h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${selectedSort === option.id ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              <option.icon className="w-5 h-5 mr-3" />
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscussSidebar;