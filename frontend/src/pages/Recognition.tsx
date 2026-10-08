import React from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { CameraPreview } from '../components/recognition/CameraPreview';
import { RecognitionPanel } from '../components/recognition/RecognitionPanel';
import { StatusBar } from '../components/recognition/StatusBar';
import { RecognitionHistory } from '../components/recognition/RecognitionHistory';

export const Recognition: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle 
        title="Vietnamese Sign Language Recognition" 
        subtitle="Real-time AI-powered sign language recognition" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CameraPreview />
        </div>
        <div className="lg:col-span-1">
          <RecognitionPanel />
        </div>
      </div>

      <div className="mb-8">
        <StatusBar />
      </div>

      <div className="grid grid-cols-1">
        <RecognitionHistory />
      </div>
    </div>
  );
};
