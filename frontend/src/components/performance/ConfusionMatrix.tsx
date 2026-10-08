import React from 'react';
import type { ConfusionMatrixData } from '../../types/api';

interface ConfusionMatrixProps {
  data: ConfusionMatrixData;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ data }) => {
  const { labels, matrix } = data;

  let maxVal = 1;
  matrix.forEach(row => {
    row.forEach(val => {
      if (val > maxVal) maxVal = val;
    });
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
        <span>Confusion Matrix Heatmap (Actual vs Predicted)</span>
        <span className="text-[10px] text-slate-400">Rows: Actual | Columns: Predicted</span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 border border-transparent"></th>
                {labels.map((label) => (
                  <th
                    key={label}
                    className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-mono capitalize text-slate-700 dark:text-slate-300 text-center min-w-[70px]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((rowLabel, rIdx) => (
                <tr key={rowLabel}>
                  <td className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-mono capitalize text-slate-700 dark:text-slate-300 font-semibold text-right pr-3">
                    {rowLabel}
                  </td>
                  {labels.map((colLabel, cIdx) => {
                    const value = matrix[rIdx]?.[cIdx] || 0;
                    const isDiagonal = rIdx === cIdx;
                    const intensity = value / maxVal;

                    let bgStyle = '';
                    if (isDiagonal) {
                      bgStyle = `rgba(79, 70, 229, ${Math.max(0.15, intensity)})`;
                    } else if (value > 0) {
                      bgStyle = `rgba(244, 63, 94, ${Math.max(0.08, intensity * 0.7)})`;
                    }

                    return (
                      <td
                        key={colLabel}
                        style={{ backgroundColor: bgStyle }}
                        className={`p-2.5 border border-slate-200 dark:border-slate-800 text-center font-mono tabular-nums text-xs transition-colors hover:outline hover:outline-1 hover:outline-indigo-500 ${
                          isDiagonal
                            ? 'font-bold text-indigo-900 dark:text-indigo-100'
                            : value > 0
                            ? 'text-slate-600 dark:text-slate-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                        title={`Actual: ${rowLabel}, Predicted: ${colLabel} -> ${value} samples`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 text-[11px] font-mono text-slate-500 pt-1">
        <span className="flex items-center">
          <span className="w-3 h-3 rounded mr-1.5 bg-indigo-600 inline-block opacity-75" />
          Correct Classification (Diagonal)
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded mr-1.5 bg-rose-500 inline-block opacity-50" />
          Misclassifications (Off-diagonal)
        </span>
      </div>
    </div>
  );
};
