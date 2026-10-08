import React from 'react';
import type { EmotionType } from '../../types/api';

interface ProbabilityChartProps {
  probabilities: Record<EmotionType, number>;
  topEmotion: EmotionType;
}

const EMOTION_COLORS: Record<EmotionType, { bg: string; text: string }> = {
  joy: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  sadness: { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  anger: { bg: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
  fear: { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  love: { bg: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-400' },
  surprise: { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' }
};

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  probabilities,
  topEmotion
}) => {
  const sortedEmotions = (Object.keys(probabilities) as EmotionType[]).sort(
    (a, b) => probabilities[b] - probabilities[a]
  );

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
        <span>Probability Breakdown</span>
        <span>Score</span>
      </div>

      <div className="space-y-2.5">
        {sortedEmotions.map((emotion) => {
          const prob = probabilities[emotion] || 0;
          const percentage = (prob * 100).toFixed(1);
          const isTop = emotion === topEmotion;
          const style = EMOTION_COLORS[emotion];

          return (
            <div key={emotion} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`capitalize font-semibold ${isTop ? style.text + ' font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                  {emotion} {isTop && <span className="text-[10px] ml-1 font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-bold">(Top Rank)</span>}
                </span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200 font-bold">
                  {percentage}%
                </span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${style.bg}`}
                  style={{
                    width: `${Math.max(prob * 100, 2)}%`,
                    opacity: isTop ? 1 : 0.65
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
