from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import io
import csv
from pathlib import Path
try:
    import torch
    from torchvision import transforms, models
    from PIL import Image
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from app.schemas import (
    PredictRequest, PredictResponse, SymptomsResponse, HealthResponse, ImagePredictResponse,
    UserRegister, UserLogin, UserProfile, AuthResponse, PatientCreate, PredictionCreate,
    ReferralCreate, ReferralUpdate
)
from app.model import DiseaseModel
from app.helper import prepare_symptoms_array
from app.database import (
    init_db, create_user, get_user_by_email, get_user_by_id, verify_password,
    create_token, verify_token, create_patient, get_patient_by_id,
    get_dashboard_stats_today, create_prediction, get_predictions_by_patient_id,
    create_referral, list_referrals, update_referral_status
)

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


def reload_disease_model():
    global disease_model
    disease_model = DiseaseModel()
    disease_model.load_xgboost("model/xgboost_model.json")


async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized: Missing token")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or expired token")
    user = get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: User not found")
    return user


@asynccontextmanager
async def lifespan(app: FastAPI):
    global disease_model, eye_model, skin_model
    # Initialize SQLite database
    init_db()
    
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


# ── AUTHENTICATION ENDPOINTS ──

@app.post("/auth/register", response_model=AuthResponse)
async def register(req: UserRegister):
    try:
        user = create_user(
            email=req.email,
            password_raw=req.password,
            full_name=req.full_name,
            role=req.role,
            facility_name=req.facility_name,
            facility_location=req.facility_location,
            phone=req.phone
        )
        token = create_token(user["id"], user["email"])
        return {"user": user, "token": token}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/login", response_model=AuthResponse)
async def login(req: UserLogin):
    user = get_user_by_email(req.email)
    if not user or not verify_password(user["hashed_password"], req.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    profile = {k: v for k, v in user.items() if k != "hashed_password"}
    return {"user": profile, "token": token}


@app.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    profile = {k: v for k, v in current_user.items() if k != "hashed_password"}
    return {"user": profile}


@app.post("/auth/logout")
async def logout():
    return {"success": True}


# ── PATIENTS ENDPOINTS ──

@app.post("/patients")
async def add_patient(req: PatientCreate, current_user: dict = Depends(get_current_user)):
    patient = create_patient(
        patient_name=req.patient_name,
        age=req.age,
        gender=req.gender,
        symptoms=req.symptoms,
        symptom_tags=req.symptom_tags,
        contact=req.contact,
        address=req.address,
        medical_history=req.medical_history,
        vitals=req.vitals,
        notes=req.notes,
        created_by=current_user["id"],
        facility_name=current_user["facility_name"] or req.notes or ""
    )
    return patient


@app.get("/patients/stats/today")
async def stats_today(current_user: dict = Depends(get_current_user)):
    return get_dashboard_stats_today(current_user["id"])


@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


# ── PREDICTIONS ENDPOINTS ──

@app.post("/predictions")
async def add_prediction(req: PredictionCreate, current_user: dict = Depends(get_current_user)):
    pred_id = create_prediction(
        patient_id=req.patient_id,
        symptoms_used=req.symptoms_used,
        predicted_disease=req.predicted_disease,
        confidence=req.confidence,
        disease_description=req.disease_description,
        precautions=req.precautions,
        predicted_by=current_user["id"]
    )
    return {"id": pred_id}


@app.get("/predictions/patient/{patient_id}")
async def get_predictions(patient_id: str, current_user: dict = Depends(get_current_user)):
    return get_predictions_by_patient_id(patient_id)


# ── REFERRALS ENDPOINTS ──

@app.post("/referrals")
async def add_referral(req: ReferralCreate, current_user: dict = Depends(get_current_user)):
    ref_id = create_referral(
        patient_id=req.patient_id,
        referred_by=current_user["id"],
        referred_to=req.referred_to,
        priority=req.priority,
        reason=req.reason,
        prediction_id=req.prediction_id
    )
    return {"id": ref_id}


@app.get("/referrals")
async def get_referrals(referred_to: str = None, patient_id: str = None, current_user: dict = Depends(get_current_user)):
    return list_referrals(referred_to=referred_to, patient_id=patient_id)


@app.put("/referrals/{referral_id}")
async def update_referral(referral_id: str, req: ReferralUpdate, current_user: dict = Depends(get_current_user)):
    success = update_referral_status(
        referral_id=referral_id,
        status=req.status,
        reviewed_by=current_user["id"]
    )
    return {"success": success}


# ── ML DATASET & TRAINING ENDPOINTS ──

def retrain_model_task() -> float:
    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score
    from sklearn import preprocessing
    import xgboost as xgb
    
    csv_path = Path("../prediction/disease_prediction/data/dataset.csv")
    if not csv_path.exists():
        raise FileNotFoundError("dataset.csv not found")
        
    dataset_df = pd.read_csv(csv_path)
    dataset_df = dataset_df.apply(lambda col: col.str.strip() if col.dtype == "object" else col)
    
    test = pd.get_dummies(dataset_df.filter(regex='Symptom'), prefix='', prefix_sep='')
    test = test.T.groupby(level=0).max().T
    clean_df = pd.merge(test, dataset_df['Disease'], left_index=True, right_index=True)
    
    # Save TSV in both places to keep backend and prediction synced
    clean_df.to_csv('data/clean_dataset.tsv', sep='\t', index=False)
    
    pred_data_dir = Path("../prediction/disease_prediction/data")
    if pred_data_dir.exists():
        clean_df.to_csv(pred_data_dir / 'clean_dataset.tsv', sep='\t', index=False)
        
    X_data = clean_df.iloc[:,:-1]
    y_data = clean_df.iloc[:,-1]
    
    y_data = y_data.astype('category')
    le = preprocessing.LabelEncoder()
    le.fit(y_data)
    
    X_train, X_test, y_train, y_test = train_test_split(X_data, y_data, test_size=0.2)
    y_train = le.transform(y_train)
    y_test = le.transform(y_test)
    
    model = xgb.XGBClassifier()
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    
    # Save XGBoost model in both places
    model.save_model("model/xgboost_model.json")
    
    pred_model_dir = Path("../prediction/disease_prediction/model")
    if pred_model_dir.exists():
        model.save_model(pred_model_dir / "xgboost_model.json")
        
    # Hot-reload model in FastAPI memory
    reload_disease_model()
    
    return float(acc)


@app.get("/dataset")
async def get_dataset_info(current_user: dict = Depends(get_current_user)):
    csv_path = Path("../prediction/disease_prediction/data/dataset.csv")
    if not csv_path.exists():
        csv_path = Path("data/clean_dataset.tsv") # Fallback to TSV
        
    total_rows = 0
    diseases = set()
    symptoms = set()
    
    if csv_path.suffix == ".csv" and csv_path.exists():
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader, None)
            for row in reader:
                if not row: continue
                total_rows += 1
                diseases.add(row[0].strip())
                for s in row[1:]:
                    s_clean = s.strip()
                    if s_clean:
                        symptoms.add(s_clean)
    elif csv_path.suffix == ".tsv" and csv_path.exists():
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f, delimiter="\t")
            header = next(reader, None)
            if header:
                symptoms = set(header[:-1])
                for row in reader:
                    if row:
                        total_rows += 1
                        diseases.add(row[-1].strip())
                        
    return {
        "total_samples": total_rows,
        "unique_diseases": len(diseases),
        "unique_symptoms": len(symptoms),
        "diseases": sorted(list(diseases)),
        "symptoms": sorted(list(symptoms))
    }


@app.post("/dataset/add")
async def add_dataset_row(req: dict, current_user: dict = Depends(get_current_user)):
    disease = req.get("disease")
    symptoms = req.get("symptoms", [])
    if not disease or not symptoms:
        raise HTTPException(status_code=400, detail="Missing disease or symptoms")
        
    csv_path = Path("../prediction/disease_prediction/data/dataset.csv")
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="dataset.csv file not found")
        
    # Check if dataset.csv ends with a newline to avoid concatenating to the last line
    import os
    file_ends_with_newline = True
    if csv_path.stat().st_size > 0:
        with open(csv_path, "rb") as f_bin:
            try:
                f_bin.seek(-1, os.SEEK_END)
                file_ends_with_newline = (f_bin.read(1) == b"\n")
            except Exception:
                file_ends_with_newline = True

    # Append to dataset.csv
    row_to_append = [disease] + symptoms
    with open(csv_path, mode="a", newline="", encoding="utf-8") as f:
        if not file_ends_with_newline:
            f.write("\n")
        writer = csv.writer(f)
        writer.writerow(row_to_append)
        
    return {"success": True, "message": "Row successfully appended to dataset.csv"}


@app.post("/dataset/train")
async def train_dataset(current_user: dict = Depends(get_current_user)):
    try:
        acc = retrain_model_task()
        return {"success": True, "accuracy": acc, "message": f"Model successfully retrained with accuracy {acc*100:.2f}%"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrain model: {str(e)}")

