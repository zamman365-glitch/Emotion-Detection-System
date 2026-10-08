import React, { useState, useEffect } from 'react';
import type { ModelsResponse, ModelType, EmotionType } from '../../types/api';
import { apiService } from '../../services/api';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ConfusionMatrix } from './ConfusionMatrix';
import { Award, Target } from 'lucide-react';

export const ModelPerformanceView: React.FC = () => {
  const [metadata, setMetadata] = useState<ModelsResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('logreg');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await apiService.getModelsMetadata();
        setMetadata(data);
      } catch (err) {
        console.error('Failed to load model evaluation metrics metadata:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  if (isLoading || !metadata) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Loading model metrics & evaluation matrix...</p>
      </div>
    );
  }

  const currentModelData = metadata.models[selectedModel];
  const modelKeys: ModelType[] = ['logreg', 'nb_bow', 'nb_tfidf'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelKeys.map((key) => {
          const modelInfo = metadata.models[key];
          const isSelected = selectedModel === key;
          const isTopAcc = key === 'logreg';

          return (
            <div
              key={key}
              onClick={() => setSelectedModel(key)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                  : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-slate-500">{key}</span>
                {isTopAcc && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Award className="w-3 h-3 mr-1 inline" /> Top Accuracy
                  </Badge>
                )}
              </div>

              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {modelInfo.name}
              </h4>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500">Benchmark Accuracy</span>
                <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {(modelInfo.accuracy * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center">
                  <Target className="w-4 h-4 mr-1.5 text-indigo-500" /> Per-Class Evaluation Breakdown
                </span>
                <span className="text-xs font-mono text-slate-400">{currentModelData.name}</span>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Emotion Category</th>
                    <th className="px-4 py-2.5 font-medium">Precision</th>
                    <th className="px-4 py-2.5 font-medium">Recall</th>
                    <th className="px-4 py-2.5 font-medium">F1-Score</th>
                    <th className="px-4 py-2.5 font-medium">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {(Object.keys(currentModelData.per_class) as EmotionType[]).map((emotion) => {
                    const metrics = currentModelData.per_class[emotion];
                    return (
                      <tr key={emotion} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 capitalize font-medium text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                          <Badge variant="emotion" emotion={emotion}>
                            {emotion}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {(metrics.precision * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {(metrics.recall * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">
                          {(metrics.f1 * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-400">
                          {metrics.support} samples
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Confusion Matrix
                </span>
                <span className="text-xs font-mono text-slate-400">Validation Split</span>
              </div>
            }
          >
            <ConfusionMatrix data={currentModelData.confusion_matrix} />
          </Card>
        </div>
      </div>

      <Card
        header={
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
            Model Pipeline Architecture
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">1</span>
              <span>Clean (Preprocess)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Raw text undergoes server-side lowercasing, non-ASCII symbol stripping, digit removal, punctuation removal, and stopword filtering.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">2</span>
              <span>Vectorize (N-Gram Features)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Tokenized text is mapped using Bag-of-Words word counts or TF-IDF (Term Frequency-Inverse Document Frequency) unigrams and bigrams.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">3</span>
              <span>Classify & Calibrate</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              High-dimensional vector features are evaluated against Multinomial Naive Bayes or Logistic Regression classifiers producing calibrated probability distributions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
