import type { ModelsResponse, PredictionResponse, ModelType, EmotionType } from '../types/api';

const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
  'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'with', 'you', 'your'
]);

export function mockCleanText(rawText: string): string {
  if (!rawText) return '';
  let text = rawText.toLowerCase();
  text = text.replace(/[^\x00-\x7F]+/g, ' ');
  text = text.replace(/\d+/g, ' ');
  text = text.replace(/[^\w\s]/gi, '');
  const words = text.split(/\s+/).filter(w => w.length > 0 && !ENGLISH_STOPWORDS.has(w));
  return words.join(' ');
}

const EMOTION_LEXICON: Record<EmotionType, string[]> = {
  joy: ['happy', 'delighted', 'glad', 'great', 'awesome', 'enjoy', 'wonderful', 'blessed', 'excited', 'fantastic', 'cheerful', 'bright', 'love', 'smile', 'success'],
  sadness: ['depressed', 'gloomy', 'unhappy', 'hopeless', 'grief', 'miserable', 'pathetic', 'alone', 'crying', 'lost', 'burdened', 'heartbroken', 'down'],
  anger: ['angry', 'furious', 'mad', 'rage', 'annoyed', 'irritated', 'grouchy', 'greedy', 'hate', 'disgusted', 'outraged', 'insulted', 'resentful'],
  fear: ['scared', 'terrified', 'afraid', 'anxious', 'nervous', 'panic', 'confused', 'frightened', 'horrified', 'threatened', 'insecure', 'fearful'],
  love: ['love', 'romantic', 'affection', 'passionate', 'caring', 'sweetheart', 'adored', 'fond', 'treasured', 'tender', 'devoted', 'sentimental'],
  surprise: ['surprised', 'shocked', 'amazed', 'unexpected', 'astonished', 'stunned', 'speechless', 'unbelievable', 'startled', 'curious', 'funny']
};

export function mockPredictSingle(text: string, model: ModelType = 'logreg'): PredictionResponse {
  const cleaned = mockCleanText(text);
  const words = (cleaned || text).toLowerCase().split(/\s+/);
  
  const scores: Record<EmotionType, number> = {
    joy: 0.1,
    sadness: 0.1,
    anger: 0.1,
    fear: 0.1,
    love: 0.1,
    surprise: 0.1
  };

  words.forEach(w => {
    (Object.keys(EMOTION_LEXICON) as EmotionType[]).forEach(emotion => {
      if (EMOTION_LEXICON[emotion].some(kw => w.includes(kw))) {
        scores[emotion] += 1.5;
      }
    });
  });

  if (model === 'nb_bow') scores.joy += 0.2;
  if (model === 'nb_tfidf') scores.sadness += 0.2;

  const expScores: Record<EmotionType, number> = {
    joy: Math.exp(scores.joy),
    sadness: Math.exp(scores.sadness),
    anger: Math.exp(scores.anger),
    fear: Math.exp(scores.fear),
    love: Math.exp(scores.love),
    surprise: Math.exp(scores.surprise)
  };

  const sumExp = Object.values(expScores).reduce((a, b) => a + b, 0);
  const probabilities: Record<EmotionType, number> = {
    joy: Number((expScores.joy / sumExp).toFixed(4)),
    sadness: Number((expScores.sadness / sumExp).toFixed(4)),
    anger: Number((expScores.anger / sumExp).toFixed(4)),
    fear: Number((expScores.fear / sumExp).toFixed(4)),
    love: Number((expScores.love / sumExp).toFixed(4)),
    surprise: Number((expScores.surprise / sumExp).toFixed(4))
  };

  let topEmotion: EmotionType = 'joy';
  let maxProb = 0;
  (Object.keys(probabilities) as EmotionType[]).forEach(e => {
    if (probabilities[e] > maxProb) {
      maxProb = probabilities[e];
      topEmotion = e;
    }
  });

  return {
    emotion: topEmotion,
    confidence: maxProb,
    probabilities,
    cleaned_text: cleaned,
    model,
    latency_ms: Number((Math.random() * 3 + 2).toFixed(2))
  };
}

export const MOCK_MODELS_RESPONSE: ModelsResponse = {
  available_emotions: ['sadness', 'anger', 'love', 'surprise', 'fear', 'joy'],
  models: {
    logreg: {
      model_id: 'logreg',
      name: 'Logistic Regression (TF-IDF)',
      accuracy: 0.8838,
      per_class: {
        sadness: { precision: 0.91, recall: 0.93, f1: 0.92, support: 933 },
        anger: { precision: 0.86, recall: 0.84, f1: 0.85, support: 432 },
        love: { precision: 0.78, recall: 0.71, f1: 0.74, support: 261 },
        surprise: { precision: 0.75, recall: 0.61, f1: 0.67, support: 115 },
        fear: { precision: 0.87, recall: 0.82, f1: 0.84, support: 387 },
        joy: { precision: 0.90, recall: 0.94, f1: 0.92, support: 1072 }
      },
      confusion_matrix: {
        labels: ['sadness', 'anger', 'love', 'surprise', 'fear', 'joy'],
        matrix: [
          [868, 18, 5, 2, 10, 30],
          [22, 363, 2, 6, 15, 24],
          [10, 3, 185, 4, 2, 57],
          [3, 8, 3, 70, 15, 16],
          [14, 18, 2, 12, 317, 24],
          [18, 12, 42, 8, 8, 1008]
        ]
      }
    },
    nb_bow: {
      model_id: 'nb_bow',
      name: 'Multinomial Naive Bayes (Bag-of-Words)',
      accuracy: 0.8506,
      per_class: {
        sadness: { precision: 0.88, recall: 0.91, f1: 0.89, support: 933 },
        anger: { precision: 0.82, recall: 0.81, f1: 0.81, support: 432 },
        love: { precision: 0.72, recall: 0.68, f1: 0.70, support: 261 },
        surprise: { precision: 0.68, recall: 0.55, f1: 0.61, support: 115 },
        fear: { precision: 0.83, recall: 0.79, f1: 0.81, support: 387 },
        joy: { precision: 0.88, recall: 0.91, f1: 0.89, support: 1072 }
      },
      confusion_matrix: {
        labels: ['sadness', 'anger', 'love', 'surprise', 'fear', 'joy'],
        matrix: [
          [849, 25, 8, 4, 15, 32],
          [28, 350, 4, 8, 18, 24],
          [15, 6, 178, 5, 4, 53],
          [5, 10, 4, 63, 18, 15],
          [18, 22, 4, 14, 306, 23],
          [25, 16, 50, 9, 12, 975]
        ]
      }
    },
    nb_tfidf: {
      model_id: 'nb_tfidf',
      name: 'Multinomial Naive Bayes (TF-IDF)',
      accuracy: 0.7703,
      per_class: {
        sadness: { precision: 0.78, recall: 0.91, f1: 0.84, support: 933 },
        anger: { precision: 0.79, recall: 0.68, f1: 0.73, support: 432 },
        love: { precision: 0.85, recall: 0.35, f1: 0.50, support: 261 },
        surprise: { precision: 0.88, recall: 0.13, f1: 0.23, support: 115 },
        fear: { precision: 0.85, recall: 0.62, f1: 0.72, support: 387 },
        joy: { precision: 0.72, recall: 0.94, f1: 0.82, support: 1072 }
      },
      confusion_matrix: {
        labels: ['sadness', 'anger', 'love', 'surprise', 'fear', 'joy'],
        matrix: [
          [849, 15, 2, 0, 8, 59],
          [48, 294, 1, 1, 18, 70],
          [28, 4, 91, 1, 2, 135],
          [12, 8, 2, 15, 18, 60],
          [38, 24, 1, 0, 240, 84],
          [22, 10, 10, 0, 4, 1008]
        ]
      }
    }
  }
};
