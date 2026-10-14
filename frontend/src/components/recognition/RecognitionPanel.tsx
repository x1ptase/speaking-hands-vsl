import React from 'react';
import { Volume2, BrainCircuit, Loader2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ConfidenceBar } from './ConfidenceBar';
import type { RecognitionStatus } from '../../hooks/useRecognition';
import type { RecognitionResponse } from '../../services/recognitionService';
import { confidenceToPercent } from '../../utils/confidence';

interface RecognitionPanelProps {
  status: RecognitionStatus;
  result: RecognitionResponse | null;
}

const STATUS_LABEL: Record<RecognitionStatus, { text: string; dot: string }> = {
  idle: { text: 'Waiting for file', dot: 'bg-gray-300' },
  selected: { text: 'Ready to submit', dot: 'bg-success' },
  loading: { text: 'Processing', dot: 'bg-yellow-400' },
  success: { text: 'Done', dot: 'bg-success' },
  error: { text: 'Error', dot: 'bg-red-500' },
};

export const RecognitionPanel: React.FC<RecognitionPanelProps> = ({ status, result }) => {
  const percent = result ? confidenceToPercent(result.confidence) : null;
  const hasLabel = Boolean(result?.label);
  const statusInfo = STATUS_LABEL[status];

  const renderResult = () => {
    if (status === 'loading') {
      return <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />;
    }
    if (!result) {
      return <span className="text-base text-secondary-text">Chưa có kết quả. Chọn file JSON và bấm “Nhận diện”.</span>;
    }
    if (!hasLabel) {
      return <span className="text-lg font-medium text-secondary-text">Ký hiệu chưa được hỗ trợ</span>;
    }
    return <span className="text-4xl sm:text-5xl font-bold text-primary">{result.label}</span>;
  };

  return (
    <Card className="flex flex-col h-full p-6">
      <div className="flex items-center gap-2 mb-6">
        <BrainCircuit className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-main-text">AI Recognition</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center mb-8">
        <p className="text-sm font-medium text-secondary-text uppercase tracking-wider mb-2">Detected Sign</p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center mb-8">{renderResult()}</div>

        {result && status !== 'loading' && (
          <>
            {percent !== null && <ConfidenceBar confidence={percent} />}
            <p className="mt-3 text-xs text-secondary-text font-mono">
              class_index: {result.class_index}
              {percent === null && ' · confidence: không hợp lệ'}
            </p>
          </>
        )}
      </div>

      <div className="border-t border-border-subtle pt-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-secondary-text mb-1 uppercase tracking-wider">Model</p>
            <p className="text-sm font-medium text-main-text">DD-Net</p>
          </div>
          <div>
            <p className="text-xs text-secondary-text mb-1 uppercase tracking-wider">Status</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
              <span className="text-sm font-medium text-main-text">{statusInfo.text}</span>
            </div>
          </div>
        </div>

        <Button variant="primary" className="w-full gap-2 py-3 text-base disabled:opacity-50" disabled title="Chưa hỗ trợ phát âm thanh">
          <Volume2 className="w-5 h-5" />
          Play Audio
        </Button>
      </div>
    </Card>
  );
};
