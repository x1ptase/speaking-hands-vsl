import React from 'react';
import { Camera } from 'lucide-react';
import { Card } from '../common/Card';

export const CameraPreview: React.FC = () => {
  return (
    <Card className="flex flex-col h-full bg-gray-50 border-dashed border-2 border-border-subtle">
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px] text-secondary-text">
        <Camera className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-main-text">Camera Preview</h3>
        <p className="mt-2 text-sm max-w-sm text-center">
          Camera feed will appear here. The system is ready to extract landmarks and process gestures.
        </p>
      </div>
    </Card>
  );
};
