import React, { useEffect, useImperativeHandle, useRef, type RefObject } from 'react';
import { PoseLandmarker } from '@mediapipe/tasks-vision';
import type { Frame } from '../../services/recognitionService';

export interface PoseOverlayHandle {
  /** Draws one validated 33-landmark frame, or clears the overlay when null (no pose detected / camera stopped). */
  draw: (frame: Frame | null) => void;
}

interface PoseOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  visible: boolean;
  ref?: React.Ref<PoseOverlayHandle>;
}

const LINE_COLOR = 'rgba(255, 255, 255, 0.85)';
const POINT_COLOR = '#4F46E5';

/**
 * Transparent canvas stacked on the <video>. Landmarks come from a horizontally flipped frame, so they are
 * already in the mirrored on-screen space and are drawn as-is (the canvas itself is not flipped).
 * Drawing is imperative: it never goes through React state, so it causes no re-renders.
 */
export const PoseOverlay: React.FC<PoseOverlayProps> = ({ videoRef, visible, ref }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFrameRef = useRef<Frame | null>(null);
  const visibleRef = useRef(visible);

  const render = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const frame = lastFrameRef.current;
    if (!frame || !visibleRef.current || !video || video.videoWidth === 0 || video.videoHeight === 0) return;

    // The video uses object-contain: find the rectangle it really occupies inside the canvas (letterboxing).
    const scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
    const w = video.videoWidth * scale;
    const h = video.videoHeight * scale;
    const offsetX = (canvas.width - w) / 2;
    const offsetY = (canvas.height - h) / 2;
    const dpr = canvas.width / (canvas.clientWidth || canvas.width);
    const px = (i: number) => offsetX + frame[i][0] * w;
    const py = (i: number) => offsetY + frame[i][1] * h;

    ctx.lineWidth = 2 * dpr;
    ctx.lineCap = 'round';
    ctx.strokeStyle = LINE_COLOR;
    ctx.beginPath();
    for (const { start, end } of PoseLandmarker.POSE_CONNECTIONS) {
      ctx.moveTo(px(start), py(start));
      ctx.lineTo(px(end), py(end));
    }
    ctx.stroke();

    ctx.fillStyle = POINT_COLOR;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5 * dpr;
    for (let i = 0; i < frame.length; i++) {
      ctx.beginPath();
      ctx.arc(px(i), py(i), 3.5 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  };
  // Always call the latest closure from the long-lived handlers below.
  const renderRef = useRef(render);
  useEffect(() => {
    renderRef.current = render;
  });

  useImperativeHandle(ref, () => ({
    draw: (frame) => {
      lastFrameRef.current = frame;
      renderRef.current();
    },
  }), []);

  useEffect(() => {
    visibleRef.current = visible;
    renderRef.current();
  }, [visible]);

  // Keep the canvas pixel size equal to its CSS size (x devicePixelRatio) and redraw after every resize.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      renderRef.current();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />;
};
