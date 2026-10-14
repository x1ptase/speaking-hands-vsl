import { useCallback, useState } from 'react';
import { ApiError } from '../services/apiClient';
import { predictSequence, type Frame, type RecognitionResponse } from '../services/recognitionService';
import { parseSequenceJson, SequenceValidationError } from '../utils/sequenceFile';

export interface SelectedFile {
  name: string;
  sequence: Frame[];
}

export interface HistoryEntry {
  id: number;
  fileName: string;
  result: RecognitionResponse;
  time: string;
}

export type RecognitionStatus = 'idle' | 'selected' | 'loading' | 'success' | 'error';

export function useRecognition() {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [result, setResult] = useState<RecognitionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const selectFile = useCallback(async (selected: File) => {
    setResult(null);
    setLatencyMs(null);
    try {
      const sequence = parseSequenceJson(await selected.text());
      setFile({ name: selected.name, sequence });
      setError(null);
      setStatus('selected');
    } catch (e) {
      setFile(null);
      setError(e instanceof SequenceValidationError ? e.message : 'Không đọc được file đã chọn.');
      setStatus('error');
    }
  }, []);

  const submit = useCallback(async () => {
    if (!file || status === 'loading') return;
    setStatus('loading');
    setError(null);
    setResult(null);
    const startedAt = performance.now();
    try {
      const response = await predictSequence(file.sequence);
      setLatencyMs(Math.round(performance.now() - startedAt));
      setResult(response);
      setHistory((prev) => [
        { id: Date.now(), fileName: file.name, result: response, time: new Date().toLocaleTimeString('vi-VN') },
        ...prev,
      ]);
      setStatus('success');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Đã xảy ra lỗi không xác định khi gọi backend.');
      setStatus('error');
    }
  }, [file, status]);

  /** Clears the shown result/error but keeps the selected file so it can be submitted again. */
  const reset = useCallback(() => {
    if (status === 'loading') return;
    setResult(null);
    setError(null);
    setLatencyMs(null);
    setStatus(file ? 'selected' : 'idle');
  }, [file, status]);

  return { file, status, result, error, latencyMs, history, selectFile, submit, reset };
}
