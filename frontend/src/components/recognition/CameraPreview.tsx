import React, { useEffect } from 'react';
import { Camera, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useCamera, type CameraStatus } from '../../hooks/useCamera';

const CAPTURE_FPS = 5;
const MAX_BUFFER_SIZE = 5;

interface CameraPreviewProps {
  onStatusChange?: (status: CameraStatus) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ onStatusChange }) => {
  const { videoRef, status, error, devices, selectedDeviceId, capturedCount, captureFps, start, stop, switchDevice } =
    useCamera({ captureFps: CAPTURE_FPS, maxBufferSize: MAX_BUFFER_SIZE });

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const isRunning = status === 'running';
  const isStarting = status === 'starting';

  return (
    <Card className="flex flex-col shrink-0 bg-gray-50 border-dashed border-2 border-border-subtle">
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-secondary-text">
        {/* The video element stays mounted so the stream can be attached before it is shown. */}
        <video
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-contain bg-black -scale-x-100 ${isRunning ? '' : 'hidden'}`}
        />

        {!isRunning && (
          <div className="flex flex-col items-center px-4">
            {isStarting ? (
              <Loader2 className="w-16 h-16 mb-4 animate-spin text-primary" />
            ) : (
              <Camera className="w-16 h-16 mb-4 opacity-50" />
            )}
            <h3 className="text-xl font-medium text-main-text">
              {isStarting ? 'Starting camera...' : 'Camera Preview'}
            </h3>
            <p className="mt-2 text-sm max-w-sm text-center">
              {isStarting
                ? 'Allow camera access if your browser asks.'
                : (error ? 'Camera is not available.' : 'Camera is currently off. Click “Start Camera” to begin; your browser will ask for permission.')}
            </p>
            {error && (
              <div role="alert" className="mt-4 flex items-start gap-2 max-w-md rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle bg-white px-4 py-3 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {isRunning ? (
            <Button variant="outline" onClick={stop}>Stop Camera</Button>
          ) : (
            <Button variant="primary" onClick={start} disabled={isStarting}>
              {status === 'error' ? 'Try Again' : 'Start Camera'}
            </Button>
          )}

          {devices.length > 1 && (
            <select
              aria-label="Select camera"
              value={selectedDeviceId}
              disabled={isStarting}
              onChange={(e) => switchDevice(e.target.value)}
              className="max-w-[16rem] truncate rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-main-text"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
              ))}
            </select>
          )}

          <div className="ml-auto flex items-center gap-4 text-xs text-secondary-text font-mono">
            <span>Status: {status}</span>
            <span>Rate: {captureFps} fps</span>
            <span>Captured: {capturedCount}</span>
          </div>
        </div>

        <p className="text-xs text-secondary-text">
          AI landmark extraction and real-time prediction will be implemented in Phase 6. For now, frames are only captured
          temporarily in memory (up to {MAX_BUFFER_SIZE}); they are not sent, saved or recorded, and audio is never used.
        </p>
        <p className="flex items-start gap-1.5 text-xs text-secondary-text">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Camera permission is controlled by your browser; you can revoke it at any time in site settings.
        </p>
      </div>
    </Card>
  );
};
