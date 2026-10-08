import React, { useState } from 'react';
import type { ModelType, PredictionResponse, ModelComparisonResult } from '../../types/api';
import { apiService } from '../../services/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProbabilityChart } from './ProbabilityChart';
import { ModelComparisonTable } from './ModelComparisonTable';
import { 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Info, 
  RotateCcw, 
  FileCode2,
  CheckCircle2
} from 'lucide-react';

const MODEL_OPTIONS: { id: ModelType; name: string; desc: string }[] = [
  {
    id: 'logreg',
    name: 'Logistic Regression (TF-IDF)',
    desc: 'Highest accuracy model (88.38%). Optimal for calibrated probabilities & nuanced text.'
  },
  {
    id: 'nb_bow',
    name: 'Multinomial Naive Bayes (Bag-of-Words)',
    desc: 'Word frequency count model (85.06% accuracy). Extremely fast inference speed.'
  },
  {
    id: 'nb_tfidf',
    name: 'Multinomial Naive Bayes (TF-IDF)',
    desc: 'Inverse document frequency model (77.03% accuracy). Baseline comparison.'
  }
];

const SAMPLE_TEXTS = [
  "I am extremely grateful and excited to announce that our project successfully launched today!",
  "I can go from feeling so hopeless to so damned hopeful just from being around someone who cares.",
  "I am feeling completely furious and annoyed by this constant unannounced delay!",
  "I started feeling sentimental about old photos from childhood and began crying.",
  "I feel confused about life and frightened by what the future holds for us."
];

export const AnalyzeView: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('logreg');
  const [compareAllModels, setCompareAllModels] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ModelComparisonResult[]>([]);

  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const isTooShort = wordCount > 0 && wordCount < 3;
  const isOverLimit = charCount > 500;

  const handleRunAnalysis = async () => {
    if (!inputText.trim()) {
      setErrorMsg('Please enter text to analyze (1-500 characters).');
      return;
    }

    if (isOverLimit) {
      setErrorMsg('Text exceeds the maximum length of 500 characters.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (compareAllModels) {
        const [singleRes, compRes] = await Promise.all([
          apiService.predict({ text: inputText, model: selectedModel }),
          apiService.compareAllModels(inputText)
        ]);
        setResult(singleRes);
        setComparisonResults(compRes);
      } else {
        const res = await apiService.predict({ text: inputText, model: selectedModel });
        setResult(res);
        setComparisonResults([]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete sentiment analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    const randomSample = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    setInputText(randomSample);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setComparisonResults([]);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span className="text-xs font-medium">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs font-mono text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Input Stream
                </span>
                <button
                  onClick={handleLoadSample}
                  className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Load Sample</span>
                </button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="text-input" className="font-medium text-slate-700 dark:text-slate-300">
                    English Text Input
                  </label>
                  <span
                    className={`font-mono text-xs ${
                      isOverLimit
                        ? 'text-rose-600 font-semibold'
                        : charCount > 450
                        ? 'text-amber-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {charCount} / 500
                  </span>
                </div>

                <textarea
                  id="text-input"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleRunAnalysis();
                    }
                  }}
                  placeholder="Paste or type English text for emotion classification (e.g. 'I feel so inspired and thankful for this team')..."
                  rows={5}
                  className={`w-full p-3 rounded-lg border bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all ${
                    isOverLimit
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500'
                  }`}
                />

                {isTooShort && (
                  <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 text-amber-600 flex-shrink-0" />
                    <span>
                      Short input detected (&lt;3 words). Short phrases may provide lower contextual precision.
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="model-select" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Model Algorithm
                </label>
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="compare-toggle"
                    checked={compareAllModels}
                    onChange={(e) => setCompareAllModels(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <label htmlFor="compare-toggle" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Run cross-model comparison (all 3 models)
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <Button
                  onClick={handleRunAnalysis}
                  isLoading={isLoading}
                  disabled={!inputText.trim() || isOverLimit}
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Run Analysis</span>
                  <span className="ml-2 text-[10px] opacity-75 font-mono">Ctrl+Enter</span>
                </Button>

                {inputText && (
                  <Button variant="outline" onClick={handleClear} size="md">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Inference Results
                </span>
                {result && (
                  <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {result.latency_ms} ms
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className="uppercase">{result.model}</span>
                  </div>
                )}
              </div>
            }
          >
            {result ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                      Primary Predicted Emotion
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="emotion" emotion={result.emotion} className="text-base py-1 px-3 capitalize">
                        {result.emotion}
                      </Badge>
                      {result.confidence < 0.4 && (
                        <Badge variant="warning" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1 inline" /> Low Confidence (&lt;40%)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                      Calibrated Confidence
                    </div>
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <ProbabilityChart probabilities={result.probabilities} topEmotion={result.emotion} />

                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center">
                      <FileCode2 className="w-3.5 h-3.5 mr-1 text-slate-400" /> Server Preprocessing Audit
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Lowercase + Stopwords + Punctuation Removed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">ORIGINAL RAW TEXT</span>
                      <p className="p-2 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 italic font-mono text-[11px] break-words">
                        "{inputText}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">CLEANED TOKENS</span>
                      <p className="p-2 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] break-words">
                        "{result.cleaned_text || '(Empty after stopword removal)'}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ready for Emotion Classification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Type text on the left and click "Run Analysis" to receive predicted emotions, calibrated confidence scores, and preprocessed disclosure.
                </p>
              </div>
            )}
          </Card>

          {compareAllModels && (
            <ModelComparisonTable
              comparisonData={comparisonResults}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};
