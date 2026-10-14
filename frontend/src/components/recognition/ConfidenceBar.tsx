import React from 'react';

interface ConfidenceBarProps {
  confidence: number; // 0-100
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ confidence }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span id="confidence-label" className="text-sm font-medium text-secondary-text">Confidence</span>
        <span className="text-sm font-bold text-main-text">{confidence}%</span>
      </div>
      <div
        role="progressbar"
        aria-labelledby="confidence-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={confidence}
        aria-valuetext={`${confidence}%`}
        className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden"
      >
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${confidence}%` }}
        ></div>
      </div>
    </div>
  );
};
