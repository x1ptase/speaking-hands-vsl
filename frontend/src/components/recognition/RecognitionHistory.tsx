import React from 'react';
import { History } from 'lucide-react';
import { Card } from '../common/Card';
import type { HistoryEntry } from '../../hooks/useRecognition';
import { confidenceToPercent } from '../../utils/confidence';

interface RecognitionHistoryProps {
  history: HistoryEntry[];
}

export const RecognitionHistory: React.FC<RecognitionHistoryProps> = ({ history }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-main-text">Recent Recognition</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-xs uppercase text-secondary-text tracking-wider">
              <th className="pb-3 font-medium">Detected Sign</th>
              <th className="pb-3 font-medium">Confidence</th>
              <th className="pb-3 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {history.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-secondary-text">Chưa có kết quả nào.</td>
              </tr>
            )}
            {history.map((item) => {
              const percent = confidenceToPercent(item.result.confidence);
              return (
                <tr key={item.id} className="border-b border-border-subtle last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium text-main-text">
                    {item.result.label || <span className="text-secondary-text">Ký hiệu chưa được hỗ trợ</span>}
                    <span className="ml-2 text-xs font-normal text-secondary-text font-mono">
                      #{item.result.class_index} · {item.fileName}
                    </span>
                  </td>
                  <td className="py-3">
                    {percent !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-secondary-text text-xs">{percent}%</span>
                      </div>
                    ) : (
                      <span className="text-secondary-text text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 text-right text-secondary-text font-mono text-xs">{item.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
