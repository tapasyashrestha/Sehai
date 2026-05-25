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
