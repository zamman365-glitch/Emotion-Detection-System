import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

from app.preprocessing import clean_text

EMOTIONS = ["sadness", "anger", "love", "surprise", "fear", "joy"]

def train_and_save_models(data_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path, sep=';', header=None, names=['text', 'emotion'])
    
    print("Preprocessing texts...")
    df['cleaned_text'] = df['text'].apply(lambda x: clean_text(str(x)))
    
    # Filter out empty cleaned text if any
    df = df[df['cleaned_text'].str.strip() != ''].reset_index(drop=True)
    
    X = df['cleaned_text']
    y = df['emotion']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    models = {
        "nb_bow": {
            "name": "Multinomial Naive Bayes (Bag-of-Words)",
            "pipeline": Pipeline([
                ('vec', CountVectorizer(ngram_range=(1, 2), min_df=2)),
                ('clf', MultinomialNB(alpha=0.5))
            ])
        },
        "nb_tfidf": {
            "name": "Multinomial Naive Bayes (TF-IDF)",
            "pipeline": Pipeline([
                ('vec', TfidfVectorizer(ngram_range=(1, 2), min_df=2)),
                ('clf', MultinomialNB(alpha=0.5))
            ])
        },
        "logreg": {
            "name": "Logistic Regression (TF-IDF)",
            "pipeline": Pipeline([
                ('vec', TfidfVectorizer(ngram_range=(1, 2), min_df=2)),
                ('clf', LogisticRegression(max_iter=1000, C=1.5, random_state=42))
            ])
        }
    }
    
    metrics_summary = {}
    
    for key, model_info in models.items():
        print(f"\nTraining model: {key} ({model_info['name']})...")
        pipeline = model_info['pipeline']
        pipeline.fit(X_train, y_train)
        
        y_pred = pipeline.predict(X_test)
        
        acc = float(accuracy_score(y_test, y_pred))
        precision, recall, f1, support = precision_recall_fscore_support(
            y_test, y_pred, labels=EMOTIONS, zero_division=0
        )
        cm = confusion_matrix(y_test, y_pred, labels=EMOTIONS)
        
        per_class_metrics = {}
        for idx, emotion in enumerate(EMOTIONS):
            per_class_metrics[emotion] = {
                "precision": round(float(precision[idx]), 4),
                "recall": round(float(recall[idx]), 4),
                "f1": round(float(f1[idx]), 4),
                "support": int(support[idx])
            }
            
        metrics_summary[key] = {
            "model_id": key,
            "name": model_info["name"],
            "accuracy": round(acc, 4),
            "per_class": per_class_metrics,
            "confusion_matrix": {
                "labels": EMOTIONS,
                "matrix": cm.tolist()
            }
        }
        
        # Save joblib artifact
        save_path = os.path.join(output_dir, f"{key}.joblib")
        joblib.dump(pipeline, save_path)
        print(f"Saved model artifact to {save_path} (Accuracy: {acc:.4f})")
        
    metrics_path = os.path.join(output_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"\nSaved metrics summary to {metrics_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_file = os.path.join(base_dir, "..", "train.txt")
    saved_dir = os.path.join(base_dir, "app", "saved_models")
    train_and_save_models(data_file, saved_dir)
