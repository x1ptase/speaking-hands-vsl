import React, { useRef } from 'react';
import { FileJson, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import type { RecognitionStatus, SelectedFile } from '../../hooks/useRecognition';

interface SequenceUploadProps {
  file: SelectedFile | null;
  status: RecognitionStatus;
  error: string | null;
  onSelectFile: (file: File) => void;
  onSubmit: () => void;
}

export const SequenceUpload: React.FC<SequenceUploadProps> = ({ file, status, error, onSelectFile, onSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = status === 'loading';

  return (
    <Card className="flex flex-col shrink-0 bg-gray-50 border-dashed border-2 border-border-subtle">
      <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[240px] px-4 py-6 text-secondary-text">
        <FileJson aria-hidden className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-main-text">Landmark Sequence</h3>

        {file ? (
          <p className="mt-2 text-sm text-center">
            <span className="font-medium text-main-text">{file.name}</span> · {file.sequence.length} frames
          </p>
        ) : (
          <p className="mt-2 text-sm max-w-sm text-center">
            Chọn file JSON mẫu (ví dụ sample_sequence.json) chứa chuỗi landmark để gửi tới backend.
          </p>
        )}

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 max-w-md rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle aria-hidden className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Chọn file JSON landmark"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) onSelectFile(selected);
            e.target.value = ''; // allow re-selecting the same file
          }}
        />

        <div className="mt-6 flex flex-col sm:flex-row w-full sm:w-auto justify-center gap-3">
          <Button variant="outline" disabled={isLoading} className="w-full sm:w-auto" onClick={() => inputRef.current?.click()}>
            {file ? 'Chọn file khác' : 'Chọn file JSON'}
          </Button>
          <Button variant="primary" disabled={!file || isLoading} onClick={onSubmit} className="gap-2 w-full sm:w-auto">
            {isLoading && <Loader2 aria-hidden className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Đang nhận diện...' : 'Nhận diện'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
