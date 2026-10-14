import React from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { SequenceUpload } from '../components/recognition/SequenceUpload';
import { RecognitionPanel } from '../components/recognition/RecognitionPanel';
import { StatusBar } from '../components/recognition/StatusBar';
import { RecognitionHistory } from '../components/recognition/RecognitionHistory';
import { useRecognition } from '../hooks/useRecognition';

export const Recognition: React.FC = () => {
  const { file, status, result, error, latencyMs, history, selectFile, submit } = useRecognition();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle 
        title="Vietnamese Sign Language Recognition" 
        subtitle="AI-powered sign language recognition" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SequenceUpload
            file={file}
            status={status}
            error={error}
            onSelectFile={selectFile}
            onSubmit={submit}
          />
        </div>
        <div className="lg:col-span-1">
          <RecognitionPanel status={status} result={result} />
        </div>
      </div>

      <div className="mb-8">
        <StatusBar status={status} frameCount={file?.sequence.length ?? null} latencyMs={latencyMs} />
      </div>

      <div className="grid grid-cols-1">
        <RecognitionHistory history={history} />
      </div>
    </div>
  );
};
