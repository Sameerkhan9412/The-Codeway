import React from 'react';
import { useSelector } from 'react-redux';

const ProfileCard = () => {
  const { user, profile, profileLoading, profileError } = useSelector((state) => state.auth);

  if (profileLoading) {
    return (
      <div className="bg-dark-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 w-3/4 bg-dark-700 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-dark-700 rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="bg-dark-800 rounded-lg p-6 text-red-500">
        Error loading profile: {profileError}
      </div>
    );
  }

  // Use profile data if available, fallback to basic user data
  const displayData = profile || user;

  return (
    <div className="bg-dark-800 rounded-lg p-6 shadow-lg border-l-4 border-orange-primary">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center text-2xl font-bold text-orange-primary">
          {displayData?.firstName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {displayData?.firstName} {displayData?.lastName}
          </h2>
          <p className="text-gray-400">{displayData?.emailId || displayData?.email}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-dark-700 p-3 rounded-lg">
          <p className="text-gray-400 text-sm">Role</p>
          <p className="font-medium capitalize">{displayData?.role || 'user'}</p>
        </div>
        <div className="bg-dark-700 p-3 rounded-lg">
          <p className="text-gray-400 text-sm">Member Since</p>
          <p className="font-medium">
            {displayData?.createdAt ? new Date(displayData.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      
      {profile?.problemStats && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-orange-primary">Problem Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-700 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Total Solved</p>
              <p className="font-medium">{profile.problemStats.total || 0}</p>
            </div>
            <div className="bg-dark-700 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Easy</p>
              <p className="font-medium">{profile.problemStats.easy || 0}</p>
            </div>
            <div className="bg-dark-700 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Medium</p>
              <p className="font-medium">{profile.problemStats.medium || 0}</p>
            </div>
            <div className="bg-dark-700 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Hard</p>
              <p className="font-medium">{profile.problemStats.hard || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;