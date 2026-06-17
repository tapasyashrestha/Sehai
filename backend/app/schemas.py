from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    symptoms: list[str] = Field(
        ...,
        min_length=1,
        description="List of symptom names matching the model's 133 symptom vocabulary",
        examples=[["itching", "skin_rash", "nodal_skin_eruptions"]],
    )


class PredictResponse(BaseModel):
    predicted_disease: str
    confidence: float
    description: str
    precautions: list[str]


class SymptomsResponse(BaseModel):
    symptoms: list[str]
    count: int


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class ImagePredictResponse(BaseModel):
    predicted_disease: str
    confidence: float
    probabilities: dict[str, float]


class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: str
    facility_name: str = ""
    facility_location: str = ""
    phone: str = ""


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    facility_name: str
    facility_location: str | None = ""
    phone: str | None = ""


class AuthResponse(BaseModel):
    user: UserProfile
    token: str


class PatientCreate(BaseModel):
    patient_name: str
    age: int
    gender: str
    symptoms: str
    symptom_tags: list[str]
    contact: str | None = ""
    address: str | None = ""
    medical_history: str | None = ""
    vitals: dict | None = {}
    notes: str | None = ""


class PredictionCreate(BaseModel):
    patient_id: str
    symptoms_used: list[str]
    predicted_disease: str
    confidence: float
    disease_description: str | None = ""
    precautions: list[str]


class ReferralCreate(BaseModel):
    patient_id: str
    referred_to: str
    priority: str = "medium"
    reason: str | None = ""
    prediction_id: str | None = None


class ReferralUpdate(BaseModel):
    status: str

