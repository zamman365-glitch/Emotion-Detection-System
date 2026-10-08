import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Copy,
  Check,
  BookOpen,
  Server,
  ShieldCheck
} from 'lucide-react';

type LanguageType = 'curl' | 'javascript' | 'python';

export const DocumentationView: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageType>('curl');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getPredictSnippet = (lang: LanguageType) => {
    if (lang === 'curl') {
      return `curl -X POST "${apiBaseUrl}/api/v1/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "I feel so grateful and energized about this launch!",
    "model": "logreg"
  }'`;
    }
    if (lang === 'javascript') {
      return `const response = await fetch("${apiBaseUrl}/api/v1/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "I feel so grateful and energized about this launch!",
    model: "logreg"
  })
});

const data = await response.json();
console.log(data.emotion, data.confidence, data.probabilities);`;
    }
    return `import requests

url = "${apiBaseUrl}/api/v1/predict"
payload = {
    "text": "I feel so grateful and energized about this launch!",
    "model": "logreg"
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Emotion: {data['emotion']}, Confidence: {data['confidence']}")`;
  };

  const getBatchSnippet = (lang: LanguageType) => {
    if (lang === 'curl') {
      return `curl -X POST "${apiBaseUrl}/api/v1/predict/batch" \\
  -H "Content-Type: application/json" \\
  -d '{
    "texts": [
      "I feel happy and inspired today!",
      "I am so irritated with this delay."
    ],
    "model": "logreg"
  }'`;
    }
    if (lang === 'javascript') {
      return `const response = await fetch("${apiBaseUrl}/api/v1/predict/batch", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    texts: [
      "I feel happy and inspired today!",
      "I am so irritated with this delay."
    ],
    model: "logreg"
  })
});

const predictions = await response.json();
console.log(predictions);`;
    }
    return `import requests

url = "${apiBaseUrl}/api/v1/predict/batch"
payload = {
    "texts": [
        "I feel happy and inspired today!",
        "I am so irritated with this delay."
    ],
    "model": "logreg"
}

response = requests.post(url, json=payload)
predictions = response.json()
print(f"Evaluated {len(predictions)} items")`;
  };

  return (
    <div className="space-y-6">
      <Card
        header={
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-indigo-500" /> Sentiment Intelligence API v1.0 Reference
            </span>
            <Badge variant="secondary" className="font-mono">OpenAPI 3.0 Compatible</Badge>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
          <p>
            The Sentiment Intelligence API provides enterprise-grade multi-class emotion classification endpoints. Send raw English text (1-500 chars) and receive calibrated confidence scores, probability distributions across 6 emotion classes (sadness, anger, love, surprise, fear, joy), and server-side preprocessing disclosures.
          </p>
          <div className="flex items-center space-x-4 pt-2 font-mono text-slate-700 dark:text-slate-300">
            <span className="flex items-center"><Server className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Base URL: <code className="ml-1 text-indigo-600 dark:text-indigo-400">{apiBaseUrl}</code></span>
            <span className="flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Format: JSON</span>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono uppercase">
          Interactive Request Generator
        </h3>

        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          {(['curl', 'javascript', 'python'] as LanguageType[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1 rounded text-xs font-mono capitalize transition-colors ${
                selectedLang === lang
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                POST
              </span>
              <code className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                /api/v1/predict
              </code>
            </div>
            <span className="text-xs text-slate-400 font-mono">Single Text Inference</span>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Accepts raw text (1 to 500 characters) and evaluates sentiment emotions using the specified model (<code className="text-indigo-600 dark:text-indigo-400 font-mono">logreg</code>, <code className="text-indigo-600 dark:text-indigo-400 font-mono">nb_bow</code>, or <code className="text-indigo-600 dark:text-indigo-400 font-mono">nb_tfidf</code>).
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>REQUEST EXAMPLE ({selectedLang.toUpperCase()})</span>
                <button
                  onClick={() => copyToClipboard(getPredictSnippet(selectedLang), 'predict_req')}
                  className="text-slate-400 hover:text-indigo-500 transition-colors flex items-center space-x-1"
                >
                  {copiedSection === 'predict_req' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'predict_req' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                {getPredictSnippet(selectedLang)}
              </pre>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>RESPONSE EXAMPLE (200 OK)</span>
                <button
                  onClick={() => copyToClipboard(`{
  "emotion": "joy",
  "confidence": 0.9412,
  "probabilities": {
    "sadness": 0.0102,
    "anger": 0.0084,
    "love": 0.0215,
    "surprise": 0.0091,
    "fear": 0.0096,
    "joy": 0.9412
  },
  "cleaned_text": "feel grateful energized launch",
  "model": "logreg",
  "latency_ms": 4.12
}`, 'predict_res')}
                  className="text-slate-400 hover:text-indigo-500 transition-colors flex items-center space-x-1"
                >
                  {copiedSection === 'predict_res' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'predict_res' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
{`{
  "emotion": "joy",
  "confidence": 0.9412,
  "probabilities": {
    "sadness": 0.0102,
    "anger": 0.0084,
    "love": 0.0215,
    "surprise": 0.0091,
    "fear": 0.0096,
    "joy": 0.9412
  },
  "cleaned_text": "feel grateful energized launch",
  "model": "logreg",
  "latency_ms": 4.12
}`}
              </pre>
            </div>
          </div>
        </div>
      </Card>

      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                POST
              </span>
              <code className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                /api/v1/predict/batch
              </code>
            </div>
            <span className="text-xs text-slate-400 font-mono">Bulk Batch Inference</span>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Accepts an array of up to 100 raw texts and returns an array of prediction objects.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>REQUEST EXAMPLE ({selectedLang.toUpperCase()})</span>
                <button
                  onClick={() => copyToClipboard(getBatchSnippet(selectedLang), 'batch_req')}
                  className="text-slate-400 hover:text-indigo-500 transition-colors flex items-center space-x-1"
                >
                  {copiedSection === 'batch_req' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'batch_req' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                {getBatchSnippet(selectedLang)}
              </pre>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>RESPONSE EXAMPLE (200 OK)</span>
                <button
                  onClick={() => copyToClipboard(`[
  {
    "emotion": "joy",
    "confidence": 0.912,
    "probabilities": { ... },
    "cleaned_text": "feel happy inspired today",
    "model": "logreg",
    "latency_ms": 3.8
  },
  {
    "emotion": "anger",
    "confidence": 0.884,
    "probabilities": { ... },
    "cleaned_text": "irritated delay",
    "model": "logreg",
    "latency_ms": 3.6
  }
]`, 'batch_res')}
                  className="text-slate-400 hover:text-indigo-500 transition-colors flex items-center space-x-1"
                >
                  {copiedSection === 'batch_res' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'batch_res' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
{`[
  {
    "emotion": "joy",
    "confidence": 0.912,
    "probabilities": { "joy": 0.912, ... },
    "cleaned_text": "feel happy inspired today",
    "model": "logreg",
    "latency_ms": 3.8
  },
  {
    "emotion": "anger",
    "confidence": 0.884,
    "probabilities": { "anger": 0.884, ... },
    "cleaned_text": "irritated delay",
    "model": "logreg",
    "latency_ms": 3.6
  }
]`}
              </pre>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          header={
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                GET
              </span>
              <code className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                /api/v1/models
              </code>
            </div>
          }
        >
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            Returns model evaluation benchmark metadata, per-class precision, recall, F1 scores, and confusion matrix JSON for all trained models.
          </p>
          <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800">
{`curl -X GET "${apiBaseUrl}/api/v1/models"`}
          </pre>
        </Card>

        <Card
          header={
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                GET
              </span>
              <code className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                /api/v1/health
              </code>
            </div>
          }
        >
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            Returns system operational status, API version string, loaded model artifacts list, and UTC timestamp.
          </p>
          <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800">
{`curl -X GET "${apiBaseUrl}/api/v1/health"`}
          </pre>
        </Card>
      </div>
    </div>
  );
};
