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

export function predictSequence(sequence: Frame[]): Promise<RecognitionResponse> {
  const request: RecognitionRequest = { sequence };
  return postJson<RecognitionResponse>('/api/recognition/predict', request);
}
