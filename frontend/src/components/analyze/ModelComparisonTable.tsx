import React from 'react';
import type { ModelComparisonResult } from '../../types/api';
import { Badge } from '../ui/Badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ModelComparisonTableProps {
  comparisonData: ModelComparisonResult[];
  isLoading: boolean;
}

export const ModelComparisonTable: React.FC<ModelComparisonTableProps> = ({
  comparisonData,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (!comparisonData || comparisonData.length === 0) return null;

  const emotions = comparisonData.map(c => c.prediction.emotion);
  const uniqueEmotions = new Set(emotions);
  const fullAgreement = uniqueEmotions.size === 1;
  const majorityAgreement = uniqueEmotions.size === 2;

  return (
    <div className="mt-6 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            Cross-Model Comparison Matrix
          </h4>
        </div>
        <div>
          {fullAgreement ? (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 mr-1 inline" /> 100% Model Consensus
            </Badge>
          ) : majorityAgreement ? (
            <Badge variant="warning">
              <AlertCircle className="w-3 h-3 mr-1 inline" /> Majority Consensus
            </Badge>
          ) : (
            <Badge variant="outline">
              Divergent Models
            </Badge>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono">
            <tr>
              <th className="px-4 py-2.5 font-medium">Model Algorithm</th>
              <th className="px-4 py-2.5 font-medium">Predicted Emotion</th>
              <th className="px-4 py-2.5 font-medium">Confidence</th>
              <th className="px-4 py-2.5 font-medium">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {comparisonData.map((item) => (
              <tr key={item.model} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {item.modelName}
                  <span className="block text-[10px] text-slate-400 font-mono">{item.model}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="emotion" emotion={item.prediction.emotion} className="capitalize">
                    {item.prediction.emotion}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {(item.prediction.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {item.prediction.latency_ms} ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
