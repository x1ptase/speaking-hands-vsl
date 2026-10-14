import React from 'react';
import { Camera, CameraOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { useCamera } from '../../hooks/useCamera';
import { PoseOverlay, type PoseOverlayHandle } from './PoseOverlay';

interface CameraPreviewProps {
  camera: ReturnType<typeof useCamera>;
  /** Live recognition progress shown under the preview, e.g. "Collecting frames: 12/30". */
  liveStatus: string;
  /** Tailwind background class for the status dot on the video overlay. */
  liveDot: string;
  overlayRef: React.Ref<PoseOverlayHandle>;
  showLandmarks: boolean;
  onShowLandmarksChange: (show: boolean) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ camera, liveStatus, liveDot, overlayRef, showLandmarks, onShowLandmarksChange }) => {
  const { videoRef, status, error, devices, selectedDeviceId, start, stop, switchDevice } = camera;

  const isRunning = status === 'running';
  const isStarting = status === 'starting';

  return (
    <Card className="flex flex-col shrink-0 bg-gray-50 border-dashed border-2 border-border-subtle">
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-[240px] aspect-[4/3] sm:aspect-auto sm:min-h-[400px] text-secondary-text">
        {/* The video element stays mounted so the stream can be attached before it is shown. */}
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Live camera preview"
          className={`absolute inset-0 w-full h-full object-contain bg-black -scale-x-100 ${isRunning ? '' : 'hidden'}`}
        />

        <PoseOverlay ref={overlayRef} videoRef={videoRef} visible={isRunning && showLandmarks} />

        {isRunning && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <span aria-hidden className={`w-2 h-2 rounded-full ${liveDot} animate-pulse motion-reduce:animate-none`}></span>
            <span>{liveStatus}</span>
          </div>
        )}

        {!isRunning && (
          <div className="flex flex-col items-center px-4">
            {isStarting ? (
              <Loader2 aria-hidden className="w-16 h-16 mb-4 animate-spin text-primary" />
            ) : (
              error ? <CameraOff aria-hidden className="w-16 h-16 mb-4 opacity-50" /> : <Camera aria-hidden className="w-16 h-16 mb-4 opacity-50" />
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
                <AlertCircle aria-hidden className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle bg-white px-4 py-3 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {isRunning ? (
            <Button variant="outline" onClick={stop} className="gap-2 w-full sm:w-auto">
              <CameraOff aria-hidden className="w-4 h-4" />
              Stop Camera
            </Button>
          ) : (
            <Button variant="primary" onClick={start} disabled={isStarting} className="gap-2 w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed">
              {isStarting ? <Loader2 aria-hidden className="w-4 h-4 animate-spin" /> : <Camera aria-hidden className="w-4 h-4" />}
              {isStarting ? 'Starting...' : status === 'error' ? 'Try Again' : 'Start Camera'}
            </Button>
          )}

          {devices.length > 1 && (
            <select
              aria-label="Select camera"
              value={selectedDeviceId}
              disabled={isStarting}
              onChange={(e) => switchDevice(e.target.value)}
              className="w-full sm:w-auto max-w-full sm:max-w-[16rem] truncate rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-main-text"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-2 text-sm text-main-text cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLandmarks}
              onChange={(e) => onShowLandmarksChange(e.target.checked)}
              className="h-4 w-4 rounded border-border-subtle accent-primary focus-visible:ring-2 focus-visible:ring-primary"
            />
            Show landmarks
          </label>

          <div className="sm:ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary-text font-mono">
            <span>Camera: {status}</span>
            <span>{liveStatus}</span>
          </div>
        </div>

        <p className="text-xs text-secondary-text">
          Pose landmarks are extracted locally in your browser. Only the 33 (x, y) landmark coordinates of the last 30 frames
          are sent to the backend; video, images and audio are never sent, saved or recorded.
        </p>
        <p className="flex items-start gap-1.5 text-xs text-secondary-text">
          <ShieldCheck aria-hidden className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Camera permission is controlled by your browser; you can revoke it at any time in site settings.
        </p>
      </div>
    </Card>
  );
};
