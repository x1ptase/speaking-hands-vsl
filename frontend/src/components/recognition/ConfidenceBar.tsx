import React from 'react';

interface ConfidenceBarProps {
  confidence: number; // 0-100
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-secondary-text">Confidence</span>
        <span className="text-sm font-bold text-main-text">{confidence}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${confidence}%` }}
        ></div>
      </div>
    </div>
  );
};
