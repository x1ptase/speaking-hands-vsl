import React from 'react';
import { Volume2, BrainCircuit, Loader2, AlertCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ConfidenceBar } from './ConfidenceBar';
import type { RecognitionResponse } from '../../services/recognitionService';
import { confidenceToPercent } from '../../utils/confidence';
import { CONFIRM_COUNT, MIN_CONFIDENCE, type PredictionNote } from '../../utils/predictionGate';

export type PanelStage = 'idle' | 'selected' | 'loading' | 'detecting' | 'collecting' | 'ready' | 'recognizing' | 'done' | 'error';

const STAGE_INFO: Record<PanelStage, { dot: string; hint: string; busy?: boolean }> = {
  idle: { dot: 'bg-gray-300', hint: 'Bật camera hoặc chọn file JSON để bắt đầu.' },
  selected: { dot: 'bg-success', hint: 'File đã sẵn sàng. Bấm “Nhận diện”.' },
  loading: { dot: 'bg-yellow-400', hint: 'Đang xử lý, vui lòng chờ...', busy: true },
  detecting: { dot: 'bg-yellow-400', hint: 'Đứng trong khung hình để thấy rõ phần thân trên.', busy: true },
  collecting: { dot: 'bg-yellow-400', hint: 'Giữ nguyên vị trí và thực hiện ký hiệu.', busy: true },
  ready: { dot: 'bg-success', hint: 'Mô hình nhận diện 30 khung mới nhất sau mỗi giây.' },
  recognizing: { dot: 'bg-yellow-400', hint: 'Đang gửi 30 khung landmark tới backend...', busy: true },
  done: { dot: 'bg-success', hint: 'Hoàn tất.' },
  error: { dot: 'bg-red-500', hint: 'Đã xảy ra lỗi.' },
};

interface RecognitionPanelProps {
  stage: PanelStage;
  statusText: string;
  /** Frames collected so far; shows a progress bar while collecting. */
  progress?: { current: number; total: number } | null;
  result: RecognitionResponse | null;
  error?: string | null;
  /** Live-mode gate feedback; the confirmed result above is never replaced by an uncertain prediction. */
  note?: PredictionNote;
  latest?: RecognitionResponse | null;
  pendingCount?: number;
  emptyHint: string;
  /** Resets the displayed result and error. The button is hidden when omitted or when there is nothing to clear. */
  onClear?: () => void;
}

export const RecognitionPanel: React.FC<RecognitionPanelProps> = ({
  stage,
  statusText,
  progress,
  result,
  error,
  note = null,
  latest = null,
  pendingCount = 0,
  emptyHint,
  onClear,
}) => {
  const info = STAGE_INFO[stage];
  const percent = result ? confidenceToPercent(result.confidence) : null;
  const hasLabel = Boolean(result?.label?.trim());
  const working = stage === 'loading' || stage === 'recognizing';
  // Only long waits (model load, manual upload) get the big spinner. Live "recognizing" is a short, repeating
  // state, so it is shown in the status line instead; otherwise the box would flash on every request.
  const showSpinner = stage === 'loading' && !result;
  const showProgress = stage === 'collecting' && progress;

  const renderResult = () => {
    if (showSpinner) return <Loader2 aria-hidden className="w-10 h-10 animate-spin text-primary mx-auto" />;
    if (!result) return <span className="text-base text-secondary-text">{emptyHint}</span>;
    if (!hasLabel) {
      return (
        <span className="inline-flex items-center justify-center gap-2 text-lg font-medium text-amber-700">
          <AlertTriangle aria-hidden className="w-5 h-5 shrink-0" />
          Ký hiệu chưa được hỗ trợ
        </span>
      );
    }
    return <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary break-words">{result.label}</span>;
  };

  return (
    <Card className="flex flex-col h-full p-4 sm:p-6">
      <div aria-busy={info.busy} className="contents">
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <BrainCircuit aria-hidden className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-main-text">AI Recognition</h3>
          </div>
          {onClear && (result || error) && (
            <Button variant="outline" onClick={onClear} className="gap-1.5 !px-3 !py-1.5 text-xs">
              <RotateCcw aria-hidden className="w-3.5 h-3.5" />
              Xóa kết quả
            </Button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center mb-6">
          <div className="flex items-center justify-between mb-2">
            <p id="detected-sign-label" className="text-sm font-medium text-secondary-text uppercase tracking-wider">Detected Sign</p>
            {working && result && (
              <span className="flex items-center gap-1 text-xs text-secondary-text">
                <Loader2 aria-hidden className="w-3 h-3 animate-spin" />
                Đang cập nhật...
              </span>
            )}
          </div>

          <div
            role="status"
            aria-live="polite"
            aria-labelledby="detected-sign-label"
            className={`rounded-xl border p-6 sm:p-8 text-center mb-6 min-h-[7rem] flex items-center justify-center ${
              result && !hasLabel && !showSpinner ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'
            }`}
          >
            {renderResult()}
          </div>

          {(note || pendingCount > 0) && (
            <p role="status" className={`mb-4 rounded-lg border px-3 py-2 text-sm ${note ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-border-subtle bg-gray-50 text-secondary-text'}`}>
              {note === 'uncertain' && (
                <>
                  <span className="font-semibold">Uncertain</span>
                  {latest && ` · ${confidenceToPercent(latest.confidence)}% < ${Math.round(MIN_CONFIDENCE * 100)}%`}
                  {result && ' · giữ kết quả đã xác nhận'}
                </>
              )}
              {note === 'unsupported' && 'Ký hiệu chưa được hỗ trợ'}
              {!note && `Đang xác nhận ký hiệu mới: ${pendingCount}/${CONFIRM_COUNT}`}
            </p>
          )}

          {result && !showSpinner && (
            <>
              {percent !== null ? (
                <ConfidenceBar confidence={percent} />
              ) : (
                <p className="text-sm text-secondary-text">Confidence: không hợp lệ</p>
              )}
              <p className="mt-3 text-xs text-secondary-text font-mono">class_index: {result.class_index}</p>
            </>
          )}

          {showProgress && (
            <div className={result ? 'mt-5' : ''}>
              <div className="flex justify-between mb-1 text-xs text-secondary-text">
                <span>Thu thập khung hình</span>
                <span className="font-mono">{progress.current}/{progress.total}</span>
              </div>
              <div
                role="progressbar"
                aria-label="Thu thập khung hình"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.current}
                className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden"
              >
                <div className="bg-yellow-400 h-1.5 rounded-full transition-all duration-150" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle aria-hidden className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {error}
                {result && <span className="block text-xs text-red-600/80 mt-1">Đang hiển thị kết quả thành công gần nhất.</span>}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-border-subtle pt-5 sm:pt-6">
          <div className="grid grid-cols-2 gap-4 mb-5 sm:mb-6">
            <div>
              <p className="text-xs text-secondary-text mb-1 uppercase tracking-wider">Model</p>
              <p className="text-sm font-medium text-main-text">DD-Net</p>
            </div>
            <div>
              <p className="text-xs text-secondary-text mb-1 uppercase tracking-wider">Status</p>
              <div className="flex items-start gap-1.5">
                <span aria-hidden className={`w-2 h-2 mt-1.5 shrink-0 rounded-full ${info.dot} ${info.busy ? 'animate-pulse' : ''}`}></span>
                <span className="text-sm font-medium text-main-text">{statusText}</span>
              </div>
              <p className="mt-1 text-xs text-secondary-text">{info.hint}</p>
            </div>
          </div>

          <Button variant="primary" className="w-full gap-2 py-3 text-base disabled:opacity-50" disabled title="Chưa hỗ trợ phát âm thanh">
            <Volume2 aria-hidden className="w-5 h-5" />
            Play Audio
          </Button>
        </div>
      </div>
    </Card>
  );
};
