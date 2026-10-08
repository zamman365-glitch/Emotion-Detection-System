import React, { useState } from 'react';
import type { ModelType, PredictionResponse, EmotionType } from '../../types/api';
import { apiService } from '../../services/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  BarChart2
} from 'lucide-react';

const EMOTIONS_LIST: EmotionType[] = ['sadness', 'anger', 'love', 'surprise', 'fear', 'joy'];

export const BatchAnalysisView: React.FC = () => {
  const [pasteText, setPasteText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('logreg');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [results, setResults] = useState<PredictionResponse[]>([]);
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'index' | 'confidence' | 'emotion'>('index');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const handleProcessTextList = async (textsArray: string[]) => {
    const validTexts = textsArray.map(t => t.trim()).filter(t => t.length > 0).slice(0, 100);

    if (validTexts.length === 0) {
      setErrorMsg('Please enter or upload at least one non-empty line of text.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const data = await apiService.predictBatch({ texts: validTexts, model: selectedModel });
      setResults(data);
      setCurrentPage(1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Batch evaluation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteSubmit = () => {
    const lines = pasteText.split('\n');
    handleProcessTextList(lines);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content
        .split(/\r?\n/)
        .map(l => {
          if (l.includes(',')) {
            const parts = l.split(',');
            return parts[0].replace(/^["']|["']$/g, '');
          }
          return l;
        })
        .filter(l => l.trim().length > 0 && l.toLowerCase() !== 'text');

      handleProcessTextList(lines);
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = ['Index', 'Original Text', 'Cleaned Text', 'Predicted Emotion', 'Confidence (%)', 'Latency (ms)'];
    const rows = results.map((r, i) => [
      i + 1,
      `"${(r.originalText || '').replace(/"/g, '""')}"`,
      `"${(r.cleaned_text || '').replace(/"/g, '""')}"`,
      r.emotion,
      (r.confidence * 100).toFixed(2),
      r.latency_ms
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentiment_batch_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter(r => {
    if (selectedEmotionFilter === 'all') return true;
    return r.emotion === selectedEmotionFilter;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    let comp = 0;
    if (sortField === 'confidence') comp = a.confidence - b.confidence;
    else if (sortField === 'emotion') comp = a.emotion.localeCompare(b.emotion);
    else comp = (results.indexOf(a) - results.indexOf(b));

    return sortDirection === 'asc' ? comp : -comp;
  });

  const totalPages = Math.ceil(sortedResults.length / itemsPerPage) || 1;
  const paginatedResults = sortedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const emotionCounts: Record<EmotionType, number> = {
    sadness: 0, anger: 0, love: 0, surprise: 0, fear: 0, joy: 0
  };
  results.forEach(r => {
    if (emotionCounts[r.emotion] !== undefined) {
      emotionCounts[r.emotion] += 1;
    }
  });

  const avgConfidence = results.length > 0
    ? (results.reduce((acc, r) => acc + r.confidence, 0) / results.length * 100).toFixed(1)
    : '0.0';

  const topBatchEmotion = results.length > 0
    ? (Object.keys(emotionCounts) as EmotionType[]).sort((a, b) => emotionCounts[b] - emotionCounts[a])[0]
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Batch Input Source
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Up to 100 texts</span>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Upload CSV File (One text per row)
                </p>
                <input
                  type="file"
                  accept=".csv, .txt"
                  onChange={handleFileUpload}
                  id="csv-file-input"
                  className="hidden"
                />
                <label htmlFor="csv-file-input">
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> Select File
                  </span>
                </label>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-slate-400">or paste text</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste multiple texts here (one sentence per line)...&#10;Line 1: I am thrilled with the new platform updates!&#10;Line 2: I feel terribly frustrated by the unexpected downtime."
                  rows={6}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
                >
                  <option value="logreg">Logistic Regression (TF-IDF)</option>
                  <option value="nb_bow">Naive Bayes (Bag-of-Words)</option>
                  <option value="nb_tfidf">Naive Bayes (TF-IDF)</option>
                </select>

                <Button
                  onClick={handlePasteSubmit}
                  isLoading={isLoading}
                  disabled={!pasteText.trim()}
                  size="sm"
                >
                  <Layers className="w-3.5 h-3.5 mr-1.5" /> Evaluate Batch
                </Button>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center">
                  <BarChart2 className="w-4 h-4 mr-1.5 text-indigo-500" /> Batch Emotion Distribution
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Total: {results.length} items
                </span>
              </div>
            }
          >
            {results.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Evaluated</span>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{results.length}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Avg Confidence</span>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{avgConfidence}%</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Dominant Class</span>
                    <span className="text-sm font-bold capitalize text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      {topBatchEmotion || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {EMOTIONS_LIST.map((emo) => {
                    const count = emotionCounts[emo];
                    const pct = results.length > 0 ? ((count / results.length) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={emo} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{emo}</span>
                          <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Run or upload a batch of texts to view emotion frequency distribution summary.
              </div>
            )}
          </Card>
        </div>
      </div>

      {results.length > 0 && (
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Batch Evaluation Results ({filteredResults.length} matching)
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedEmotionFilter}
                    onChange={(e) => {
                      setSelectedEmotionFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <option value="all">All Emotions</option>
                    {EMOTIONS_LIST.map(e => (
                      <option key={e} value={e} className="capitalize">{e}</option>
                    ))}
                  </select>
                </div>

                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Export CSV
                </Button>
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-2.5 font-medium">#</th>
                  <th className="px-4 py-2.5 font-medium">Original Text</th>
                  <th className="px-4 py-2.5 font-medium">Cleaned Tokens</th>
                  <th
                    className="px-4 py-2.5 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => {
                      setSortField('emotion');
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Predicted Emotion <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                  </th>
                  <th
                    className="px-4 py-2.5 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => {
                      setSortField('confidence');
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Confidence <ArrowUpDown className="w-3 h-3 inline ml-0.5" />
                  </th>
                  <th className="px-4 py-2.5 font-medium">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedResults.map((item, idx) => {
                  const globalIdx = results.indexOf(item) + 1;
                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 font-mono text-slate-400">{globalIdx}</td>
                      <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {item.originalText}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] max-w-xs truncate">
                        {item.cleaned_text || '(Empty)'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="emotion" emotion={item.emotion} className="capitalize">
                          {item.emotion}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 font-mono tabular-nums text-slate-800 dark:text-slate-200 font-medium">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-400 tabular-nums">
                        {item.latency_ms} ms
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedResults.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, sortedResults.length)} of {sortedResults.length} entries
            </span>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
