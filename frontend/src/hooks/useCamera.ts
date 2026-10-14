import { useCallback, useEffect, useRef, useState } from 'react';
import { captureFrame } from '../utils/frameCapture';

export type CameraStatus = 'idle' | 'starting' | 'running' | 'error';

export interface UseCameraOptions {
  /** Frames captured per second while the camera is running. */
  captureFps?: number;
  /** Maximum number of captured frames kept in memory (oldest are dropped). */
  maxBufferSize?: number;
  width?: number;
  height?: number;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}

function describeCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera access was denied. Please allow camera access in your browser settings.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No camera was found on this device.';
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'Could not start the camera. It may be in use by another application.';
    case 'OverconstrainedError':
      return 'The selected camera is unavailable or does not support the requested resolution.';
    default:
      return 'Camera initialization failed. Please try again.';
  }
}

export function useCamera({ captureFps = 5, maxBufferSize = 5, width = 640, height = 480 }: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufferRef = useRef<ImageData[]>([]);
  // Incremented by every start/stop so that a slow getUserMedia() result can detect it is stale.
  const sessionRef = useRef(0);

  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [capturedCount, setCapturedCount] = useState(0);

  // Keep the latest capture settings readable from the long-lived rAF loop without restarting it.
  const settingsRef = useRef({ captureFps, maxBufferSize });
  useEffect(() => {
    settingsRef.current = { captureFps, maxBufferSize };
  }, [captureFps, maxBufferSize]);

  const releaseResources = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    bufferRef.current = [];
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    releaseResources();
    setCapturedCount(0);
    setError(null);
    setStatus('idle');
  }, [releaseResources]);

  const startCaptureLoop = useCallback((session: number) => {
    let lastCapture = 0;
    const tick = (now: number) => {
      if (session !== sessionRef.current) return;
      const video = videoRef.current;
      const { captureFps: fps, maxBufferSize: maxSize } = settingsRef.current;
      if (video && now - lastCapture >= 1000 / fps) {
        canvasRef.current ??= document.createElement('canvas');
        const frame = captureFrame(video, canvasRef.current);
        if (frame) {
          lastCapture = now;
          const buffer = bufferRef.current;
          buffer.push(frame);
          if (buffer.length > maxSize) buffer.splice(0, buffer.length - maxSize);
          setCapturedCount((count) => count + 1);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(
    async (deviceId?: string) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        setError('This browser does not support camera access, or the page is not served over HTTPS or localhost.');
        return;
      }

      sessionRef.current += 1;
      const session = sessionRef.current;
      releaseResources();
      setCapturedCount(0);
      setError(null);
      setStatus('starting');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          },
          audio: false,
        });

        if (session !== sessionRef.current) {
          // Stopped, switched or unmounted while the permission prompt / device was pending.
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        track.onended = () => {
          if (session !== sessionRef.current) return;
          sessionRef.current += 1;
          releaseResources();
          setStatus('error');
          setError('The camera was disconnected.');
        };

        const video = videoRef.current;
        if (!video) throw new Error('Video element is not mounted');
        video.muted = true;
        video.playsInline = true;
        video.srcObject = stream;
        if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
          await new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => resolve();
            video.onerror = () => reject(new DOMException('Video failed to load', 'AbortError'));
          });
          video.onloadedmetadata = null;
          video.onerror = null;
        }
        await video.play();
        if (session !== sessionRef.current) return;

        const deviceList = (await navigator.mediaDevices.enumerateDevices())
          .filter((device) => device.kind === 'videoinput')
          .map((device, index) => ({ deviceId: device.deviceId, label: device.label || `Camera ${index + 1}` }));
        if (session !== sessionRef.current) return;
        setDevices(deviceList);
        setSelectedDeviceId(track.getSettings().deviceId ?? deviceId ?? '');

        setStatus('running');
        startCaptureLoop(session);
      } catch (e) {
        if (session !== sessionRef.current) return;
        sessionRef.current += 1;
        releaseResources();
        setStatus('error');
        setError(describeCameraError(e));
      }
    },
    [width, height, releaseResources, startCaptureLoop],
  );

  const switchDevice = useCallback(
    (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      void start(deviceId);
    },
    [start],
  );

  const getBufferedFrames = useCallback((): readonly ImageData[] => bufferRef.current, []);

  // Never leave the camera running after the component unmounts.
  useEffect(
    () => () => {
      sessionRef.current += 1;
      releaseResources();
    },
    [releaseResources],
  );

  return {
    videoRef,
    status,
    error,
    devices,
    selectedDeviceId,
    capturedCount,
    captureFps,
    start: () => start(selectedDeviceId || undefined),
    stop,
    switchDevice,
    getBufferedFrames,
  };
}
