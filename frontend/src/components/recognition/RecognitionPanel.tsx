import React from 'react';
import { Volume2, BrainCircuit } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ConfidenceBar } from './ConfidenceBar';

export const RecognitionPanel: React.FC = () => {
  // Static mock data for UI design
  const detectedSign = "Xin chào";
  const confidence = 96;

  return (
    <Card className="flex flex-col h-full p-6">
      <div className="flex items-center gap-2 mb-6">
        <BrainCircuit className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-main-text">AI Recognition</h3>
      </div>

      <div className="flex-1 flex flex-col justify-center mb-8">
        <p className="text-sm font-medium text-secondary-text uppercase tracking-wider mb-2">Detected Sign</p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center mb-8">
          <span className="text-4xl sm:text-5xl font-bold text-primary">{detectedSign}</span>
        </div>
        
        <ConfidenceBar confidence={confidence} />
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
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span className="text-sm font-medium text-main-text">Ready</span>
            </div>
          </div>
        </div>
        
        <Button variant="primary" className="w-full gap-2 py-3 text-base">
          <Volume2 className="w-5 h-5" />
          Play Audio
        </Button>
      </div>
    </Card>
  );
};
