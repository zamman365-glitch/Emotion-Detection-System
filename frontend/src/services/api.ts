import type {
  PredictRequest,
  PredictionResponse,
  BatchPredictRequest,
  ModelsResponse,
  HealthResponse,
  ModelType,
  ModelComparisonResult
} from '../types/api';
import { mockPredictSingle, MOCK_MODELS_RESPONSE } from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private useMock: boolean = false;
  private isConnected: boolean = false;

  public setMockMode(value: boolean) {
    this.useMock = value;
  }

  public getIsMockMode(): boolean {
    return this.useMock;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  async checkHealth(): Promise<HealthResponse> {
    if (this.useMock) {
      this.isConnected = false;
      return {
        status: 'mock_active',
        version: '1.0.0-mock',
        models_loaded: ['nb_bow', 'nb_tfidf', 'logreg'],
        timestamp: new Date().toISOString()
      };
    }

    try {
      const res = await fetch(`${BASE_URL}/api/v1/health`, { method: 'GET' });
      if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
      const data: HealthResponse = await res.json();
      this.isConnected = true;
      return data;
    } catch (err) {
      console.warn('Backend unavailable, falling back to client-side mock service:', err);
      this.isConnected = false;
      return {
        status: 'fallback_mock',
        version: '1.0.0-mock',
        models_loaded: ['nb_bow', 'nb_tfidf', 'logreg'],
        timestamp: new Date().toISOString()
      };
    }
  }

  async predict(request: PredictRequest): Promise<PredictionResponse> {
    if (this.useMock || !this.isConnected) {
      await new Promise(r => setTimeout(r, 200));
      return mockPredictSingle(request.text, request.model || 'logreg');
    }

    try {
      const res = await fetch(`${BASE_URL}/api/v1/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Prediction request failed' }));
        throw new Error(errData.detail || `Prediction failed (${res.status})`);
      }

      return await res.json();
    } catch (err) {
      console.warn('Live predict failed, falling back to mock:', err);
      return mockPredictSingle(request.text, request.model || 'logreg');
    }
  }

  async predictBatch(request: BatchPredictRequest): Promise<PredictionResponse[]> {
    if (this.useMock || !this.isConnected) {
      await new Promise(r => setTimeout(r, 400));
      return request.texts.map((text, idx) => ({
        ...mockPredictSingle(text, request.model || 'logreg'),
        originalText: text,
        id: `batch-${idx}-${Date.now()}`
      }));
    }

    try {
      const res = await fetch(`${BASE_URL}/api/v1/predict/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Batch prediction failed' }));
        throw new Error(errData.detail || `Batch prediction failed (${res.status})`);
      }

      const data: PredictionResponse[] = await res.json();
      return data.map((item, idx) => ({
        ...item,
        originalText: request.texts[idx],
        id: `batch-${idx}-${Date.now()}`
      }));
    } catch (err) {
      console.warn('Live predictBatch failed, falling back to mock:', err);
      return request.texts.map((text, idx) => ({
        ...mockPredictSingle(text, request.model || 'logreg'),
        originalText: text,
        id: `batch-${idx}-${Date.now()}`
      }));
    }
  }

  async compareAllModels(text: string): Promise<ModelComparisonResult[]> {
    const models: { id: ModelType; name: string }[] = [
      { id: 'logreg', name: 'Logistic Regression (TF-IDF)' },
      { id: 'nb_bow', name: 'Multinomial Naive Bayes (BoW)' },
      { id: 'nb_tfidf', name: 'Multinomial Naive Bayes (TF-IDF)' }
    ];

    const results = await Promise.all(
      models.map(async m => {
        const pred = await this.predict({ text, model: m.id });
        return {
          model: m.id,
          modelName: m.name,
          prediction: pred
        };
      })
    );

    return results;
  }

  async getModelsMetadata(): Promise<ModelsResponse> {
    if (this.useMock || !this.isConnected) {
      return MOCK_MODELS_RESPONSE;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/v1/models`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to fetch models metadata');
      return await res.json();
    } catch (err) {
      console.warn('Live getModelsMetadata failed, returning mock metadata:', err);
      return MOCK_MODELS_RESPONSE;
    }
  }
}

export const apiService = new ApiService();
