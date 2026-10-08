import React, { useState, useEffect } from 'react';
import type { ActiveTab } from './types/api';
import { apiService } from './services/api';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { AnalyzeView } from './components/analyze/AnalyzeView';
import { BatchAnalysisView } from './components/batch/BatchAnalysisView';
import { ModelPerformanceView } from './components/performance/ModelPerformanceView';
import { DocumentationView } from './components/docs/DocumentationView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyze');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    apiService.setMockMode(!isLiveApi);
    apiService.checkHealth().then((health) => {
      if (health.status === 'ok') {
        setIsLiveApi(true);
      }
    });
  }, [isLiveApi]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Topbar
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isLiveApi={isLiveApi}
          setIsLiveApi={setIsLiveApi}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 mt-16 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'analyze' && <AnalyzeView />}
          {activeTab === 'batch' && <BatchAnalysisView />}
          {activeTab === 'performance' && <ModelPerformanceView />}
          {activeTab === 'docs' && <DocumentationView />}
        </main>
      </div>
    </div>
  );
};

export default App;
