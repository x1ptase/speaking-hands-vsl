import type { Frame } from '../services/recognitionService';

const LANDMARKS_PER_FRAME = 33;

export class SequenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SequenceValidationError';
  }
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Parses the text of a sample JSON file ({"sequence": [...]}) and validates the landmark layout. */
export function parseSequenceJson(text: string): Frame[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new SequenceValidationError('File không phải JSON hợp lệ.');
  }

  const sequence = (data as { sequence?: unknown } | null)?.sequence;
  if (!Array.isArray(sequence)) {
    throw new SequenceValidationError('JSON phải có dạng {"sequence": [...]}.');
  }
  if (sequence.length === 0) {
    throw new SequenceValidationError('"sequence" đang rỗng.');
  }

  sequence.forEach((frame: unknown, i) => {
    if (!Array.isArray(frame) || frame.length !== LANDMARKS_PER_FRAME) {
      const got = Array.isArray(frame) ? frame.length : typeof frame;
      throw new SequenceValidationError(
        `Frame ${i} phải có ${LANDMARKS_PER_FRAME} landmark (hiện có: ${got}).`,
      );
    }
    frame.forEach((point: unknown, j) => {
      if (!Array.isArray(point) || point.length !== 2 || !point.every(isFiniteNumber)) {
        throw new SequenceValidationError(`Frame ${i}, landmark ${j} phải là [x, y] với hai số hợp lệ.`);
      }
    });
  });

  return sequence as Frame[];
}
