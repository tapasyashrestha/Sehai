import numpy as np
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def prepare_symptoms_array(symptoms: list[str]) -> np.ndarray:
    """
    Convert a list of symptoms to a (1, 133) numpy array that matches the
    dataframe used to train the machine learning model.
    """
    symptoms_array = np.zeros((1, 133))
    df = pd.read_csv(BASE_DIR / "data" / "clean_dataset.tsv", sep="\t")

    for symptom in symptoms:
        if symptom in df.columns:
            symptom_idx = df.columns.get_loc(symptom)
            symptoms_array[0, symptom_idx] = 1

    return symptoms_array
