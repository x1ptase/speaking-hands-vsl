import React from 'react';
import { Video, Cpu, Clock, Layers } from 'lucide-react';
import type { RecognitionStatus } from '../../hooks/useRecognition';

interface StatusBarProps {
  status: RecognitionStatus;
  frameCount: number | null;
  latencyMs: number | null;
}

const MODEL_STATUS: Record<RecognitionStatus, { text: string; dot: string }> = {
  idle: { text: 'Idle', dot: 'bg-gray-300' },
  selected: { text: 'Ready', dot: 'bg-success' },
  loading: { text: 'Processing', dot: 'bg-yellow-400' },
  success: { text: 'Ready', dot: 'bg-success' },
  error: { text: 'Error', dot: 'bg-red-500' },
};

export const StatusBar: React.FC<StatusBarProps> = ({ status, frameCount, latencyMs }) => {
  const model = MODEL_STATUS[status];

  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-3 bg-white border border-border-subtle rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Camera</span>
        <span className="flex items-center gap-1.5 ml-1">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="text-xs text-secondary-text">Not enabled</span>
        </span>
      </div>

      <div className="hidden sm:block w-px h-4 bg-border-subtle"></div>

      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Model</span>
        <span className="flex items-center gap-1.5 ml-1">
          <span className={`w-2 h-2 rounded-full ${model.dot}`}></span>
          <span className="text-xs text-secondary-text">{model.text}</span>
        </span>
      </div>

      <div className="hidden sm:block w-px h-4 bg-border-subtle"></div>

      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <Layers className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Frames</span>
        <span className="text-xs font-mono text-secondary-text">{frameCount ?? '—'}</span>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Latency</span>
        <span className="text-xs font-mono text-secondary-text">{latencyMs !== null ? `${latencyMs}ms` : '—'}</span>
      </div>
    </div>
  );
};
