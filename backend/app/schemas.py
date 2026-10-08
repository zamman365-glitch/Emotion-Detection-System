from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator

ModelType = Literal["nb_bow", "nb_tfidf", "logreg"]

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500, description="Raw text input for sentiment emotion analysis")
    model: Optional[ModelType] = Field("logreg", description="Selected ML model algorithm")

    @field_validator('text')
    def validate_text(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Text cannot be empty or only whitespace.")
        if len(stripped) > 500:
            raise ValueError("Text must not exceed 500 characters.")
        return stripped

class PredictionResponse(BaseModel):
    emotion: str
    confidence: float
    probabilities: Dict[str, float]
    cleaned_text: str
    model: str
    latency_ms: float

class BatchPredictRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=100, description="List of raw texts (1 to 100 items)")
    model: Optional[ModelType] = Field("logreg", description="Selected ML model algorithm")

    @field_validator('texts')
    def validate_texts(cls, v: List[str]) -> List[str]:
        if len(v) == 0:
            raise ValueError("At least one text is required for batch prediction.")
        if len(v) > 100:
            raise ValueError("Batch size cannot exceed 100 texts.")
        valid_texts = []
        for idx, t in enumerate(v):
            stripped = t.strip()
            if not stripped:
                raise ValueError(f"Text at index {idx} cannot be empty.")
            if len(stripped) > 500:
                raise ValueError(f"Text at index {idx} exceeds maximum length of 500 characters.")
            valid_texts.append(stripped)
        return valid_texts

class ModelClassMetrics(BaseModel):
    precision: float
    recall: float
    f1: float
    support: int

class ConfusionMatrixData(BaseModel):
    labels: List[str]
    matrix: List[List[int]]

class ModelMetadata(BaseModel):
    model_id: str
    name: str
    accuracy: float
    per_class: Dict[str, ModelClassMetrics]
    confusion_matrix: ConfusionMatrixData

class ModelsResponse(BaseModel):
    models: Dict[str, ModelMetadata]
    available_emotions: List[str]

class HealthResponse(BaseModel):
    status: str
    version: str
    models_loaded: List[str]
    timestamp: str
