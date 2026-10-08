# Sentiment Intelligence Platform

> Enterprise-Grade Text Emotion Classification & Analytics Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

**Sentiment Intelligence** is a production-grade B2B analytics platform for multi-class English text emotion classification. Users submit raw text and receive predicted emotions (`sadness`, `anger`, `love`, `surprise`, `fear`, `joy`) with calibrated confidence scores, multi-model consensus comparison, server-side preprocessed token disclosure, and interactive batch processing.

---

## 🌟 Key Features

### 1. Analyze (Single Text Classification)
- **Multi-Model Support**: Select between **Logistic Regression (TF-IDF)** (88.38% accuracy), **Multinomial Naive Bayes (Bag-of-Words)** (85.06% accuracy), and **Multinomial Naive Bayes (TF-IDF)** (77.03% accuracy).
- **Calibrated Confidence**: Displays predicted emotion badge with percentage confidence and a sorted probability distribution bar chart across all 6 emotion categories.
- **Server Preprocessing Audit**: Real-time side-by-side disclosure comparing raw original text vs. server-side cleaned text (lowercasing, punctuation removal, number removal, non-ASCII removal, and stopword removal).
- **Cross-Model Comparison**: Toggle option to run all 3 algorithms simultaneously and view an agreement matrix (100% Consensus vs Majority Consensus).
- **Edge-Case Reliability Warnings**: Alerts for low-confidence results (<40%) and short inputs (<3 words).

### 2. Batch Analysis
- **Bulk Input Options**: Drag-and-drop CSV upload or multi-line paste (up to 100 items per batch).
- **Results Management**: Paginated table with column sorting (by confidence or emotion) and emotion filtering.
- **CSV Export**: Instant export of batch predictions to CSV.
- **Summary Metrics**: Emotion distribution breakdown, average batch confidence, and dominant emotion class.

### 3. Model Performance Dashboard
- **Benchmark Metrics**: Accuracy comparison across trained scikit-learn models.
- **Per-Class Metrics**: Precision, Recall, F1-Score, and Support counts for each emotion class.
- **Confusion Matrix Heatmap**: Interactive heatmap grid showing actual vs. predicted class counts and misclassification patterns.
- **Pipeline Architecture**: Visual representation of the 3-step pipeline (Clean -> Vectorize -> Classify).

### 4. Developer Documentation
- **REST API Specifications**: Full details for `POST /api/v1/predict`, `POST /api/v1/predict/batch`, `GET /api/v1/models`, and `GET /api/v1/health`.
- **Interactive Snippets**: Copyable request and response code samples in **cURL**, **JavaScript (Fetch)**, and **Python (Requests)**.

---

## 🏗 Project Architecture

```
NLP_Project1/
├── backend/
│   ├── app/
│   │   ├── config.py         # App configuration & environment variables
│   │   ├── main.py           # FastAPI application, CORS, lifespan & error handlers
│   │   ├── models.py         # Scikit-learn model loader & inference engine
│   │   ├── preprocessing.py  # Server-side text cleaning pipeline
│   │   ├── schemas.py        # Pydantic request & response models
│   │   ├── train_models.py   # Machine Learning training pipeline script
│   │   └── saved_models/     # Serialized .joblib artifacts & metrics.json
│   ├── tests/
│   │   └── test_api.py       # Pytest API integration test suite
│   ├── Dockerfile            # Containerized backend deployment specification
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── analyze/      # AnalyzeView, ProbabilityChart, ModelComparisonTable
│   │   │   ├── batch/        # BatchAnalysisView, BatchResultsTable
│   │   │   ├── docs/         # DocumentationView, CodeSnippets
│   │   │   ├── layout/       # Sidebar, Topbar
│   │   │   ├── performance/ # ModelPerformanceView, ConfusionMatrix
│   │   │   └── ui/           # Badge, Button, Card
│   │   ├── services/
│   │   │   ├── api.ts        # API client with live backend + automatic mock fallback
│   │   │   └── mockData.ts   # Standalone client-side mock classification engine
│   │   ├── types/
│   │   │   └── api.ts        # Shared TypeScript interfaces
│   │   ├── App.tsx           # Main application routing & dark mode state
│   │   └── index.css         # Tailwind CSS & typography styles
│   ├── App.test.tsx          # Vitest UI test suite
│   ├── package.json          # Node dependencies & scripts
│   └── vite.config.ts        # Vite & Vitest configuration
└── train.txt                 # Multi-class emotions dataset (16,000 samples)
```

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ & `npm`

---

### 1. Backend Setup & Model Training

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train scikit-learn models on train.txt (generates joblib models & metrics.json)
python -m app.train_models

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
> The backend API will be available at `http://localhost:8000`.  
> Interactive Swagger docs available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
> The frontend application will be live at `http://localhost:5173`.  
> Note: If the backend server is offline, the frontend automatically activates **Standalone Mock Mode** so all UI features remain 100% interactive!

---

## 🧪 Testing

### Backend Unit & Integration Tests (Pytest)

```bash
cd backend
python -m pytest
```

### Frontend UI & Component Tests (Vitest)

```bash
cd frontend
npx vitest run
```

---

## 🛠 Environment Variables

### Backend Configuration (`backend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8000` | Port for Uvicorn server |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated list of CORS allowed origins |

### Frontend Configuration (`frontend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## 🚀 Deployment Guide

### Deploy Backend to Render / Railway (Docker)

1. **Render**:
   - Create a new **Web Service** connected to your repository.
   - Set Root Directory to `backend`.
   - Select Environment **Docker**.
   - Add Environment Variable: `ALLOWED_ORIGINS=https://your-frontend.vercel.app`.

2. **Railway**:
   - Deploy from repository and select the `backend` folder.
   - Railway automatically detects the `backend/Dockerfile` and exposes port `8000`.

---

### Deploy Frontend to Vercel

1. Import repository on [Vercel](https://vercel.com).
2. Set Framework Preset to **Vite**.
3. Set Root Directory to `frontend`.
4. Add Environment Variable: `VITE_API_URL=https://your-backend-url.onrender.com`.
5. Click **Deploy**.

---

## 📝 API Contract Reference

### `POST /api/v1/predict`
Request:
```json
{
  "text": "I feel so grateful and happy today!",
  "model": "logreg"
}
```
Response:
```json
{
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
  "cleaned_text": "feel grateful happy today",
  "model": "logreg",
  "latency_ms": 4.12
}
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
