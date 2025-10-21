import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'orange-primary' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-[5px]'
  };

  // Color classes
  const colorClasses = {
    'orange-primary': 'border-t-orange-500 border-b-orange-500',
    'white': 'border-t-white border-b-white',
    'gray': 'border-t-gray-400 border-b-gray-400',
    'dark': 'border-t-dark-700 border-b-dark-700'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
        style={{ animationDuration: '0.8s' }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;