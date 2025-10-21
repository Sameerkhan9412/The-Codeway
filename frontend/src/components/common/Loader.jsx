import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Loader = ({ size = 'lg', color = 'orange-primary' }) => {
  return (
    <LoadingSpinner size={size} color={color} />
  );
};

export default Loader