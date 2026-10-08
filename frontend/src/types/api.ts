export type ModelType = 'nb_bow' | 'nb_tfidf' | 'logreg';

export type EmotionType = 'sadness' | 'anger' | 'love' | 'surprise' | 'fear' | 'joy';

export interface PredictRequest {
  text: string;
  model?: ModelType;
}

export interface PredictionResponse {
  emotion: EmotionType;
  confidence: number;
  probabilities: Record<EmotionType, number>;
  cleaned_text: string;
  model: ModelType;
  latency_ms: number;
  originalText?: string;
  id?: string;
}

export interface BatchPredictRequest {
  texts: string[];
  model?: ModelType;
}

export interface ModelClassMetrics {
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface ConfusionMatrixData {
  labels: EmotionType[];
  matrix: number[][];
}

export interface ModelMetadata {
  model_id: ModelType;
  name: string;
  accuracy: number;
  per_class: Record<EmotionType, ModelClassMetrics>;
  confusion_matrix: ConfusionMatrixData;
}

export interface ModelsResponse {
  models: Record<ModelType, ModelMetadata>;
  available_emotions: EmotionType[];
}

export interface HealthResponse {
  status: string;
  version: string;
  models_loaded: string[];
  timestamp: string;
}

export interface ModelComparisonResult {
  model: ModelType;
  modelName: string;
  prediction: PredictionResponse;
}

export type ActiveTab = 'analyze' | 'batch' | 'performance' | 'docs';
