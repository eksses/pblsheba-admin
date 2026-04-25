import React from 'react';

/**
 * Premium Skeleton Loader for Admin Dashboard
 */
const Skeleton = ({ width, height, borderRadius = 8, className = '' }) => {
  return (
    <div 
      className={`skeleton-loader ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px', 
        borderRadius: borderRadius 
      }}
    />
  );
};

export default Skeleton;
