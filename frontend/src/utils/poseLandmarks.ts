import type { Frame } from '../services/recognitionService';

/** DD-Net input contract (backend `Config`): 30 frames x 33 landmarks x [x, y]. */
export const SEQUENCE_LENGTH = 30;
export const LANDMARK_COUNT = 33;

/**
 * Converts MediaPipe landmarks into a backend frame ([x, y] per landmark, same order as PoseService).
 * Returns null unless there are exactly 33 landmarks with finite coordinates.
 */
export function toFrame(landmarks: ReadonlyArray<{ x: number; y: number }> | undefined): Frame | null {
  if (!landmarks || landmarks.length !== LANDMARK_COUNT) return null;
  const frame: Frame = [];
  for (const { x, y } of landmarks) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    frame.push([x, y]);
  }
  return frame;
}

/** Bounded rolling window holding the most recent `capacity` valid frames. */
export class FrameBuffer {
  private frames: Frame[] = [];
  private readonly capacity: number;

  constructor(capacity: number = SEQUENCE_LENGTH) {
    this.capacity = capacity;
  }

  get length(): number {
    return this.frames.length;
  }

  get isFull(): boolean {
    return this.frames.length >= this.capacity;
  }

  push(frame: Frame): void {
    this.frames.push(frame);
    if (this.frames.length > this.capacity) this.frames.shift();
  }

  clear(): void {
    this.frames = [];
  }

  /** Copy of the current window, safe to send while new frames keep arriving. */
  snapshot(): Frame[] {
    return this.frames.slice();
  }
}
