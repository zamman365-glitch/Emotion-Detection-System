import React from 'react';
import type { EmotionType } from '../../types/api';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'warning' | 'emotion';
  emotion?: EmotionType;
  className?: string;
}

export const emotionColorMap: Record<EmotionType, { bg: string; text: string; border: string; dot: string }> = {
  joy: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300 font-semibold',
    border: 'border-emerald-300 dark:border-emerald-700/80',
    dot: 'bg-emerald-500'
  },
  sadness: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300 font-semibold',
    border: 'border-blue-300 dark:border-blue-700/80',
    dot: 'bg-blue-500'
  },
  anger: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300 font-semibold',
    border: 'border-rose-300 dark:border-rose-700/80',
    dot: 'bg-rose-500'
  },
  fear: {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300 font-semibold',
    border: 'border-purple-300 dark:border-purple-700/80',
    dot: 'bg-purple-500'
  },
  love: {
    bg: 'bg-pink-50 dark:bg-pink-950/60',
    text: 'text-pink-700 dark:text-pink-300 font-semibold',
    border: 'border-pink-300 dark:border-pink-700/80',
    dot: 'bg-pink-500'
  },
  surprise: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300 font-semibold',
    border: 'border-amber-300 dark:border-amber-700/80',
    dot: 'bg-amber-500'
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  emotion,
  className = ''
}) => {
  if (variant === 'emotion' && emotion && emotionColorMap[emotion]) {
    const style = emotionColorMap[emotion];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border shadow-sm ${style.bg} ${style.text} ${style.border} ${className}`}>
        <span className={`w-2 h-2 rounded-full mr-1.5 ${style.dot}`} />
        {children}
      </span>
    );
  }

  const variantStyles: Record<'default' | 'outline' | 'secondary' | 'warning' | 'emotion', string> = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    outline: 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    secondary: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold',
    warning: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold',
    emotion: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
