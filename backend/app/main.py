from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import io
try:
    import torch
    from torchvision import transforms, models
    from PIL import Image
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from app.schemas import PredictRequest, PredictResponse, SymptomsResponse, HealthResponse, ImagePredictResponse
from app.model import DiseaseModel
from app.helper import prepare_symptoms_array

disease_model: DiseaseModel | None = None
eye_model = None
skin_model = None

EYE_CLASSES = ["Cataract", "Retinopathy", "Glaucoma", "Normal"]
SKIN_CLASSES = [
    "Acne", "Actinic Keratosis", "Bullous Disease", "Drug Eruption", "Eczema",
    "Infestations & Bites", "Lichen", "Lupus", "Moles", "Seborrheic Keratoses",
    "Sun Damage", "Vasculitis", "Vitiligo", "Warts"
]

if TORCH_AVAILABLE:
    _IMG_TRANSFORM = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])


def _load_resnet(model_path: str, num_classes: int):
    if not TORCH_AVAILABLE:
        raise RuntimeError("torch is not installed")
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    state_dict = torch.load(model_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model


def _predict_image(model, image_bytes: bytes, classes: list[str]) -> dict:
    if not TORCH_AVAILABLE:
        raise RuntimeError("torch is not installed")
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _IMG_TRANSFORM(img).unsqueeze(0)
    with torch.no_grad():
        output = model(tensor)
        probs = torch.softmax(output, dim=1)[0].tolist()
    idx = probs.index(max(probs))
    return {"predicted_disease": classes[idx], "confidence": probs[idx], "probabilities": dict(zip(classes, probs))}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global disease_model, eye_model, skin_model
    disease_model = DiseaseModel()
    disease_model.load_xgboost("model/xgboost_model.json")
    try:
        eye_model = _load_resnet("../prediction/eye_disease_predicition/models/eye_disease.pth", len(EYE_CLASSES))
    except Exception as e:
        print(f"Warning: Could not load eye model: {e}")
    try:
        skin_model = _load_resnet("../prediction/skin_disease_prediciton/models/skin_disease.pth", len(SKIN_CLASSES))
    except Exception as e:
        print(f"Warning: Could not load skin model: {e}")
    yield
    disease_model = None
    eye_model = None
    skin_model = None


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


@app.post("/predict/eye", response_model=ImagePredictResponse)
async def predict_eye(file: UploadFile = File(...)):
    if eye_model is None:
        raise HTTPException(status_code=503, detail="Eye disease model not loaded")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="File must be an image")
    image_bytes = await file.read()
    result = _predict_image(eye_model, image_bytes, EYE_CLASSES)
    return ImagePredictResponse(**result)


@app.post("/predict/skin", response_model=ImagePredictResponse)
async def predict_skin(file: UploadFile = File(...)):
    if skin_model is None:
        raise HTTPException(status_code=503, detail="Skin disease model not loaded")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="File must be an image")
    image_bytes = await file.read()
    result = _predict_image(skin_model, image_bytes, SKIN_CLASSES)
    return ImagePredictResponse(**result)
