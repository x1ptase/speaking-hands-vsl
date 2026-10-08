import React from 'react';
import { Video, Cpu, Clock, ActivitySquare } from 'lucide-react';

export const StatusBar: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-3 bg-white border border-border-subtle rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Camera</span>
        <span className="flex items-center gap-1.5 ml-1">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span className="text-xs text-secondary-text">Connected</span>
        </span>
      </div>
      
      <div className="hidden sm:block w-px h-4 bg-border-subtle"></div>

      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Model</span>
        <span className="flex items-center gap-1.5 ml-1">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span className="text-xs text-secondary-text">Ready</span>
        </span>
      </div>

      <div className="hidden sm:block w-px h-4 bg-border-subtle"></div>

      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <ActivitySquare className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">FPS</span>
        <span className="text-xs font-mono text-secondary-text">30</span>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Latency</span>
        <span className="text-xs font-mono text-secondary-text">42ms</span>
      </div>
    </div>
  );
};
