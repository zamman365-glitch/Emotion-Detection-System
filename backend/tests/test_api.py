import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "logreg" in data["models_loaded"]

def test_predict_single_success():
    with TestClient(app) as client:
        payload = {
            "text": "I feel so happy and excited about this fantastic opportunity!",
            "model": "logreg"
        }
        response = client.post("/api/v1/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "emotion" in data
        assert "confidence" in data
        assert "probabilities" in data
        assert data["model"] == "logreg"
        assert data["emotion"] in ["joy", "love", "sadness", "anger", "surprise", "fear"]
        assert 0 <= data["confidence"] <= 1.0

def test_predict_single_validation_empty():
    with TestClient(app) as client:
        payload = {
            "text": "   ",
            "model": "nb_bow"
        }
        response = client.post("/api/v1/predict", json=payload)
        assert response.status_code == 422

def test_predict_single_validation_too_long():
    with TestClient(app) as client:
        payload = {
            "text": "a" * 501,
            "model": "nb_tfidf"
        }
        response = client.post("/api/v1/predict", json=payload)
        assert response.status_code == 422

def test_predict_batch_success():
    with TestClient(app) as client:
        payload = {
            "texts": [
                "I am feeling very happy today!",
                "I hate when traffic delays everything.",
                "I am feeling scared of the dark."
            ],
            "model": "logreg"
        }
        response = client.post("/api/v1/predict/batch", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        assert data[0]["emotion"] in ["joy", "love", "sadness", "anger", "surprise", "fear"]

def test_models_metadata_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/models")
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert "available_emotions" in data
        assert "logreg" in data["models"]
        assert "accuracy" in data["models"]["logreg"]
