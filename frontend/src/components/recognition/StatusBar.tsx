import React from 'react';
import { Video, Cpu, Clock, Layers } from 'lucide-react';
import type { RecognitionStatus } from '../../hooks/useRecognition';
import type { CameraStatus } from '../../hooks/useCamera';

interface StatusBarProps {
  cameraStatus: CameraStatus;
  status: RecognitionStatus;
  /** Live recognition status text while the camera is on; overrides the manual-upload model status. */
  liveStatus: string | null;
  liveDot: string;
  frameCount: number | null;
  latencyMs: number | null;
}

const CAMERA_STATUS: Record<CameraStatus, { text: string; dot: string }> = {
  idle: { text: 'Off', dot: 'bg-gray-300' },
  starting: { text: 'Starting', dot: 'bg-yellow-400' },
  running: { text: 'Live', dot: 'bg-success' },
  error: { text: 'Error', dot: 'bg-red-500' },
};

const MODEL_STATUS: Record<RecognitionStatus, { text: string; dot: string }> = {
  idle: { text: 'Idle', dot: 'bg-gray-300' },
  selected: { text: 'Ready', dot: 'bg-success' },
  loading: { text: 'Processing', dot: 'bg-yellow-400' },
  success: { text: 'Ready', dot: 'bg-success' },
  error: { text: 'Error', dot: 'bg-red-500' },
};

export const StatusBar: React.FC<StatusBarProps> = ({ cameraStatus, status, liveStatus, liveDot, frameCount, latencyMs }) => {
  const camera = CAMERA_STATUS[cameraStatus];
  const model = MODEL_STATUS[status];

  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-3 bg-white border border-border-subtle rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Camera</span>
        <span className="flex items-center gap-1.5 ml-1">
          <span className={`w-2 h-2 rounded-full ${camera.dot}`}></span>
          <span className="text-xs text-secondary-text">{camera.text}</span>
        </span>
      </div>

      <div className="hidden sm:block w-px h-4 bg-border-subtle"></div>

      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-secondary-text" />
        <span className="text-sm font-medium text-main-text">Model</span>
        <span className="flex items-center gap-1.5 ml-1">
          <span className={`w-2 h-2 rounded-full ${liveStatus ? liveDot : model.dot}`}></span>
          <span className="text-xs text-secondary-text">{liveStatus ?? model.text}</span>
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
