import React from 'react';
import { History } from 'lucide-react';
import { Card } from '../common/Card';

export const RecognitionHistory: React.FC = () => {
  const mockHistory = [
    { id: 1, sign: "Xin chào", confidence: 96, time: "10:31:22" },
    { id: 2, sign: "Cảm ơn", confidence: 91, time: "10:31:25" },
    { id: 3, sign: "Xin lỗi", confidence: 94, time: "10:31:29" },
  ];

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
            {mockHistory.map((item) => (
              <tr key={item.id} className="border-b border-border-subtle last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 font-medium text-main-text">{item.sign}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${item.confidence}%` }}></div>
                    </div>
                    <span className="text-secondary-text text-xs">{item.confidence}%</span>
                  </div>
                </td>
                <td className="py-3 text-right text-secondary-text font-mono text-xs">{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
