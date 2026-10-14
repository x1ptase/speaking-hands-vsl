import { useCallback, useEffect, useState, type RefObject } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { ApiError } from '../services/apiClient';
import { isRecognitionResponse, predictSequence, type RecognitionResponse } from '../services/recognitionService';
import { FrameBuffer, SEQUENCE_LENGTH, toFrame } from '../utils/poseLandmarks';

/**
 * Landmark sampling rate. The legacy desktop flow predicted on ~100 webcam frames (~3 s at 30 fps) that the
 * backend resamples to 30; sampling at 10 fps makes a 30-frame window span the same ~3 s.
 */
const SAMPLE_INTERVAL_MS = 100;
/** Minimum time between prediction requests once the buffer is full (and after a failure). */
const PREDICT_INTERVAL_MS = 1000;
const ERROR_RETRY_INTERVAL_MS = 3000;
/** First request can be slow while the backend lazily loads TensorFlow and the model. */
const REQUEST_TIMEOUT_MS = 30000;
/** Drop the window when the pose has been missing this long, so it never mixes two unrelated moments. */
const POSE_GAP_RESET_MS = 1500;

const BASE = import.meta.env.BASE_URL;
const WASM_PATH = `${BASE}mediapipe/wasm`;
const MODEL_PATH = `${BASE}models/pose_landmarker_full.task`;

export type LivePhase = 'off' | 'loading' | 'detecting' | 'collecting' | 'ready' | 'recognizing' | 'error';

export interface LiveRecognitionState {
  phase: LivePhase;
  frameCount: number;
  result: RecognitionResponse | null;
  /** Last failure; cleared by the next successful prediction. */
  error: string | null;
  latencyMs: number | null;
}

const INITIAL_STATE: LiveRecognitionState = { phase: 'off', frameCount: 0, result: null, error: null, latencyMs: null };

function describeRequestError(e: unknown): string {
  if (e instanceof DOMException && e.name === 'TimeoutError') return 'Backend phản hồi quá lâu. Đang thử lại...';
  if (e instanceof ApiError) return e.message;
  return 'Đã xảy ra lỗi không xác định khi gọi backend.';
}

/**
 * While `enabled`, extracts MediaPipe pose landmarks from the playing <video> in the browser, keeps the latest
 * 30 valid frames and periodically posts them to the existing prediction endpoint (one request in flight at most).
 * Everything is torn down when `enabled` becomes false or the component unmounts; nothing is persisted.
 */
export function useLiveRecognition(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
): LiveRecognitionState & { clearResult: () => void } {
  const [state, setState] = useState<LiveRecognitionState>(INITIAL_STATE);
  const [prevEnabled, setPrevEnabled] = useState(enabled);

  // Reset derived state during render when the camera turns on/off (no stale result from a previous session).
  if (prevEnabled !== enabled) {
    setPrevEnabled(enabled);
    setState(enabled ? { ...INITIAL_STATE, phase: 'loading' } : INITIAL_STATE);
  }

  /** Hides the last prediction/error; the buffer and loops keep running and the next response shows normally. */
  const clearResult = useCallback(() => {
    setState((prev) => ({ ...prev, result: null, error: null, latencyMs: null }));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let rafId: number | null = null;
    let landmarker: PoseLandmarker | null = null;
    let requestController: AbortController | null = null;
    const buffer = new FrameBuffer(SEQUENCE_LENGTH);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    const patch = (partial: Partial<LiveRecognitionState>) => {
      if (cancelled) return;
      setState((prev) => {
        const next = { ...prev, ...partial };
        // Keep the same object (no re-render) when nothing changed.
        return (Object.keys(partial) as Array<keyof LiveRecognitionState>).every((k) => prev[k] === next[k]) ? prev : next;
      });
    };

    let lastSampleAt = 0;
    let lastVideoTime = -1;
    let lastPoseAt = 0;
    let lastRequestAt = -Infinity;
    let nextPredictDelay = PREDICT_INTERVAL_MS;
    let inFlight = false;

    const predict = async () => {
      inFlight = true;
      lastRequestAt = performance.now();
      const controller = new AbortController();
      requestController = controller;
      const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);
      patch({ phase: 'recognizing' });
      const startedAt = performance.now();
      try {
        const response = await predictSequence(buffer.snapshot(), signal);
        if (cancelled) return;
        if (!isRecognitionResponse(response)) throw new ApiError('Backend trả về dữ liệu không hợp lệ.');
        nextPredictDelay = PREDICT_INTERVAL_MS;
        patch({ result: response, error: null, latencyMs: Math.round(performance.now() - startedAt) });
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === 'AbortError')) return;
        nextPredictDelay = ERROR_RETRY_INTERVAL_MS;
        // Keep the previous result visible; only surface the error.
        patch({ error: describeRequestError(e) });
      } finally {
        inFlight = false;
        if (requestController === controller) requestController = null;
        patch({ phase: buffer.isFull ? 'ready' : buffer.length > 0 ? 'collecting' : 'detecting' });
      }
    };

    const tick = (now: number) => {
      if (cancelled || !landmarker || !context) return;
      rafId = requestAnimationFrame(tick);

      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0) return;
      if (now - lastSampleAt < SAMPLE_INTERVAL_MS) return;
      // The same decoded frame must not enter the buffer twice.
      if (video.currentTime === lastVideoTime) return;
      lastSampleAt = now;
      lastVideoTime = video.currentTime;

      // The backend's training/legacy pipeline extracted landmarks from a horizontally flipped (selfie) frame.
      const { videoWidth: w, videoHeight: h } = video;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      context.setTransform(-1, 0, 0, 1, w, 0);
      context.drawImage(video, 0, 0, w, h);

      let frame = null;
      try {
        frame = toFrame(landmarker.detectForVideo(canvas, now).landmarks[0]);
      } catch {
        frame = null; // A single failed detection is treated like a missing pose.
      }

      if (frame) {
        lastPoseAt = now;
        buffer.push(frame);
      } else if (buffer.length > 0 && now - lastPoseAt > POSE_GAP_RESET_MS) {
        buffer.clear();
      }

      if (!inFlight) {
        patch({
          frameCount: buffer.length,
          phase: buffer.isFull ? 'ready' : buffer.length > 0 ? 'collecting' : 'detecting',
        });
        if (buffer.isFull && now - lastRequestAt >= nextPredictDelay) void predict();
      } else {
        patch({ frameCount: buffer.length });
      }
    };

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        const created = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        if (cancelled) {
          created.close();
          return;
        }
        landmarker = created;
        patch({ phase: 'detecting' });
        rafId = requestAnimationFrame(tick);
      } catch {
        patch({ phase: 'error', error: 'Không tải được MediaPipe Pose. Hãy kiểm tra các file trong public/mediapipe và public/models.' });
      }
    })();

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      requestController?.abort();
      buffer.clear();
      landmarker?.close();
      landmarker = null;
    };
  }, [enabled, videoRef]);

  return { ...state, clearResult };
}
