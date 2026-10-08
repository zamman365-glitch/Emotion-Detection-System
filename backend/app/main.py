import time
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder

from app.config import settings
from app.schemas import (
    PredictRequest, PredictionResponse,
    BatchPredictRequest, ModelsResponse, HealthResponse
)
from app.models import registry

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sentiment_intelligence")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Sentiment Intelligence API service...")
    registry.load_models()
    logger.info("Service startup complete. All ML models ready.")
    yield
    logger.info("Shutting down Sentiment Intelligence API service...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    # Format error messages cleanly to avoid non-serializable objects
    formatted_errors = []
    for err in errors:
        loc = [str(l) for l in err.get("loc", [])]
        msg = str(err.get("msg", "Invalid input"))
        formatted_errors.append({"loc": loc, "msg": msg, "type": err.get("type")})
    
    first_msg = formatted_errors[0]["msg"] if formatted_errors else "Validation error"
    logger.warning(f"Validation failure on {request.url.path}: {formatted_errors}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": first_msg, "errors": jsonable_encoder(formatted_errors)}
    )

@app.get("/api/v1/health", response_model=HealthResponse, tags=["System"])
def health_check():
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        models_loaded=list(registry.models.keys()),
        timestamp=datetime.now(timezone.utc).isoformat()
    )

@app.post("/api/v1/predict", response_model=PredictionResponse, tags=["Inference"])
def predict(payload: PredictRequest):
    try:
        model_id = payload.model or "logreg"
        result = registry.predict_single(payload.text, model_id=model_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Inference error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during sentiment analysis")

@app.post("/api/v1/predict/batch", response_model=List[PredictionResponse], tags=["Inference"])
def predict_batch(payload: BatchPredictRequest):
    try:
        model_id = payload.model or "logreg"
        results = registry.predict_batch(payload.texts, model_id=model_id)
        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Batch inference error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during batch sentiment analysis")

@app.get("/api/v1/models", response_model=ModelsResponse, tags=["Metadata"])
def get_models_metadata():
    metrics = registry.get_metrics()
    return metrics
