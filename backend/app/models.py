import os
import time
import json
import logging
from typing import Dict, Any, Tuple, List
import joblib
import numpy as np

from app.preprocessing import clean_text

logger = logging.getLogger(__name__)

EMOTIONS = ["sadness", "anger", "love", "surprise", "fear", "joy"]

class ModelRegistry:
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.metrics: Dict[str, Any] = {}
        self.models_dir = os.path.join(os.path.dirname(__file__), "saved_models")

    def load_models(self):
        """Loads model pipelines and metrics JSON from saved_models directory."""
        model_keys = ["nb_bow", "nb_tfidf", "logreg"]
        
        # If models don't exist yet, run training script automatically
        if not all(os.path.exists(os.path.join(self.models_dir, f"{key}.joblib")) for key in model_keys):
            logger.info("Saved models not found. Triggering automated model training...")
            from app.train_models import train_and_save_models
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_file = os.path.join(base_dir, "..", "train.txt")
            if not os.path.exists(data_file):
                data_file = os.path.join(base_dir, "train.txt")
            train_and_save_models(data_file, self.models_dir)

        for key in model_keys:
            path = os.path.join(self.models_dir, f"{key}.joblib")
            if os.path.exists(path):
                self.models[key] = joblib.load(path)
                logger.info(f"Loaded model artifact: {key}")

        metrics_path = os.path.join(self.models_dir, "metrics.json")
        if os.path.exists(metrics_path):
            with open(metrics_path, "r") as f:
                self.metrics = json.load(f)
            logger.info("Loaded model metrics metadata.")

    def predict_single(self, text: str, model_id: str = "logreg") -> Dict[str, Any]:
        """Runs single text inference and returns calibrated probabilities & latency."""
        start_time = time.perf_counter()
        
        if model_id not in self.models:
            raise ValueError(f"Invalid model identifier: '{model_id}'. Available: {list(self.models.keys())}")
        
        cleaned = clean_text(text)
        pipeline = self.models[model_id]
        
        # If cleaned text is empty (e.g. text was only stop words or numbers), handle gracefully
        eval_text = cleaned if cleaned else text.lower()
        
        # Get probability distribution
        if hasattr(pipeline, "predict_proba"):
            probs_arr = pipeline.predict_proba([eval_text])[0]
            classes = list(pipeline.classes_)
            
            # Map probabilities to all standard emotions
            prob_dict = {emotion: 0.0 for emotion in EMOTIONS}
            for cls_name, prob in zip(classes, probs_arr):
                prob_dict[cls_name] = float(prob)
                
            top_class = max(prob_dict, key=prob_dict.get)
            top_confidence = prob_dict[top_class]
        else:
            top_class = pipeline.predict([eval_text])[0]
            prob_dict = {e: (1.0 if e == top_class else 0.0) for e in EMOTIONS}
            top_confidence = 1.0

        latency_ms = round((time.perf_counter() - start_time) * 1000, 3)

        return {
            "emotion": top_class,
            "confidence": round(top_confidence, 4),
            "probabilities": {k: round(v, 4) for k, v in prob_dict.items()},
            "cleaned_text": cleaned,
            "model": model_id,
            "latency_ms": latency_ms
        }

    def predict_batch(self, texts: List[str], model_id: str = "logreg") -> List[Dict[str, Any]]:
        """Runs batch inference for up to 100 texts."""
        if model_id not in self.models:
            raise ValueError(f"Invalid model identifier: '{model_id}'")
            
        results = []
        for text in texts:
            results.append(self.predict_single(text, model_id))
        return results

    def get_metrics(self) -> Dict[str, Any]:
        """Returns metrics JSON metadata for model performance dashboard."""
        return {
            "models": self.metrics,
            "available_emotions": EMOTIONS
        }

registry = ModelRegistry()
