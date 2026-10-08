import React from 'react';
import { Sun, Moon, Server, ToggleLeft, ToggleRight } from 'lucide-react';
import type { ActiveTab } from '../../types/api';

interface TopbarProps {
  activeTab: ActiveTab;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isLiveApi: boolean;
  setIsLiveApi: (val: boolean) => void;
  sidebarCollapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  isDarkMode,
  setIsDarkMode,
  isLiveApi,
  setIsLiveApi,
  sidebarCollapsed
}) => {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    analyze: { title: 'Sentiment Analysis Engine', subtitle: 'Single-text multi-class emotion prediction with model transparency' },
    batch: { title: 'Batch Processing & Analytics', subtitle: 'High-throughput bulk text evaluation and CSV export' },
    performance: { title: 'Model Benchmark & Evaluation', subtitle: 'Cross-model benchmark metrics, precision-recall & confusion matrices' },
    docs: { title: 'Developer Documentation', subtitle: 'REST API specifications, payload schemas and code integration' }
  };

  const currentInfo = titles[activeTab];

  return (
    <header
      className={`h-16 fixed top-0 right-0 z-20 flex items-center justify-between px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-200 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
          {currentInfo.title}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
            v1.0
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
          {currentInfo.subtitle}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
          isLiveApi 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' 
            : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
        }`}>
          <Server className="w-3.5 h-3.5" />
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{isLiveApi ? 'Live Backend API' : 'Standalone Mock Mode'}</span>
          </div>

          <button
            onClick={() => setIsLiveApi(!isLiveApi)}
            title={isLiveApi ? 'Switch to Mock Mode' : 'Switch to Live API Mode'}
            className="ml-1 focus:outline-none"
          >
            {isLiveApi ? (
              <ToggleRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
          </button>
        </div>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
};
