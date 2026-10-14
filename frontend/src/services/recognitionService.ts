import { postJson } from './apiClient';

export type Landmark = [x: number, y: number];
export type Frame = Landmark[];

export interface RecognitionRequest {
  sequence: Frame[];
}

export interface RecognitionResponse {
  label: string | null;
  confidence: number;
  class_index: number;
}

export function predictSequence(sequence: Frame[], signal?: AbortSignal): Promise<RecognitionResponse> {
  const request: RecognitionRequest = { sequence };
  return postJson<RecognitionResponse>('/api/recognition/predict', request, signal);
}

export function isRecognitionResponse(value: unknown): value is RecognitionResponse {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.label === null || typeof v.label === 'string') &&
    typeof v.confidence === 'number' &&
    Number.isFinite(v.confidence) &&
    typeof v.class_index === 'number' &&
    Number.isInteger(v.class_index)
  );
}
