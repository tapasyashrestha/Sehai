from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.schemas import PredictRequest, PredictResponse, SymptomsResponse, HealthResponse
from app.model import DiseaseModel
from app.helper import prepare_symptoms_array

disease_model: DiseaseModel | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global disease_model
    disease_model = DiseaseModel()
    disease_model.load_xgboost("model/xgboost_model.json")
    yield
    disease_model = None


app = FastAPI(
    title="SEHAI Disease Prediction API",
    description="XGBoost-based disease prediction from symptoms",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        model_loaded=disease_model is not None,
    )


@app.get("/symptoms", response_model=SymptomsResponse)
async def get_symptoms():
    if disease_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return SymptomsResponse(
        symptoms=disease_model.all_symptoms,
        count=len(disease_model.all_symptoms),
    )


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    if disease_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    invalid = [s for s in request.symptoms if s not in disease_model.all_symptoms]
    if invalid:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown symptoms: {invalid}. Use GET /symptoms for valid list.",
        )

    X = prepare_symptoms_array(request.symptoms)
    predicted_disease, confidence = disease_model.predict(X)
    description = disease_model.describe_disease(predicted_disease)
    precautions = disease_model.disease_precautions(predicted_disease)

    return PredictResponse(
        predicted_disease=predicted_disease,
        confidence=confidence,
        description=description,
        precautions=precautions,
    )
