import xgboost as xgb
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


class DiseaseModel:

    def __init__(self):
        self.all_symptoms = None
        self.symptoms = None
        self.pred_disease = None
        self.model = xgb.XGBClassifier()
        self.diseases = self._load_disease_list()

    def load_xgboost(self, model_path: str):
        full_path = BASE_DIR / model_path
        self.model.load_model(str(full_path))

    def predict(self, X):
        self.symptoms = X
        disease_pred_idx = self.model.predict(self.symptoms)
        self.pred_disease = self.diseases[disease_pred_idx].values[0]
        disease_probability_array = self.model.predict_proba(self.symptoms)
        disease_probability = float(disease_probability_array[0, disease_pred_idx[0]])
        return self.pred_disease, disease_probability

    def describe_disease(self, disease_name: str) -> str:
        if disease_name not in self.diseases:
            return "That disease is not contemplated in this model"

        desc_df = pd.read_csv(BASE_DIR / "data" / "symptom_Description.csv")
        desc_df = desc_df.apply(lambda col: col.str.strip())
        return desc_df[desc_df["Disease"] == disease_name]["Description"].values[0]

    def disease_precautions(self, disease_name: str) -> list[str]:
        if disease_name not in self.diseases:
            return []

        prec_df = pd.read_csv(BASE_DIR / "data" / "symptom_precaution.csv")
        prec_df = prec_df.apply(
            lambda col: col.str.strip() if col.dtype == "object" else col
        )
        row = (
            prec_df[prec_df["Disease"] == disease_name]
            .filter(regex="Precaution")
            .values.tolist()[0]
        )
        return [p for p in row if pd.notna(p) and str(p).strip()]

    def _load_disease_list(self):
        df = pd.read_csv(BASE_DIR / "data" / "clean_dataset.tsv", sep="\t")
        y_data = df.iloc[:, -1]
        X_data = df.iloc[:, :-1]
        self.all_symptoms = list(X_data.columns)
        y_data = y_data.astype("category")
        return y_data.cat.categories
