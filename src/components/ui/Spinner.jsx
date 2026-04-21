import React from 'react';
import { CircleNotch } from '@phosphor-icons/react';

const Spinner = ({ size = 20, color = 'currentColor', className = '', style = {} }) => {
  return (
    <CircleNotch 
      size={size} 
      color={color} 
      className={`spin ${className}`} 
      style={{ animation: 'spin 1s linear infinite', ...style }} 
    />
  );
};

export default Spinner;
