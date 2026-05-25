# COMPLETE SPECIFICATION
## SEHAI: A MULTI-MODAL AI-POWERED DISEASE PREDICTION AND THREE-TIER REFERRAL MANAGEMENT SYSTEM FOR RURAL HEALTHCARE

*(Filed under Section 10 of the Indian Patents Act, 1970)*

---

## 1. TITLE OF THE INVENTION

**SEHAI: A MULTI-MODAL AI-POWERED DISEASE PREDICTION AND THREE-TIER REFERRAL MANAGEMENT SYSTEM FOR RURAL HEALTHCARE**

---

## 2. FIELD OF THE INVENTION

The present invention relates to the field of **artificial intelligence (AI) applied to medical diagnosis and healthcare management**. More particularly, it relates to a computer-implemented system and method for:

(a) Symptom-based disease prediction using gradient boosting machine learning;
(b) Ocular disease classification using deep convolutional neural networks applied to fundus images;
(c) Dermatological condition classification using deep convolutional neural networks applied to skin lesion images;
(d) Voice-enabled multilingual patient data capture for use by low-literacy healthcare workers;
(e) A three-tier digital referral management system modelled after India's Sub-Centre — Primary Health Centre (PHC) — Community Health Centre (CHC) public healthcare hierarchy.

---

## 3. BACKGROUND OF THE INVENTION

### 3.1 State of Rural Healthcare in India

India's public healthcare delivery system operates through a three-tier model:

- **Sub-Centre (SC):** The most peripheral contact point, staffed by Auxiliary Nurse Midwives (ANMs) who conduct home visits in rural villages.
- **Primary Health Centre (PHC):** Serves a population of approximately 30,000 people; staffed by medical officers and paramedics.
- **Community Health Centre (CHC):** Serves approximately 120,000 people; provides specialist-level care and surgical facilities.

Despite this structure, significant challenges persist:

1. **Paper-based records:** ANMs record patient data manually, leading to information loss during referral.
2. **Language barriers:** Many ANMs operate in linguistic contexts with multiple regional languages and dialects.
3. **Diagnostic access:** Remote areas lack specialist-level diagnostic tools for eye, skin, and communicable disease screening.
4. **Referral gaps:** Without digitised records, referred patients frequently arrive at PHCs and CHCs without complete case history, delaying treatment.
5. **Connectivity constraints:** Unreliable internet connectivity in rural areas demands lightweight, optimised software solutions.

### 3.2 Existing Solutions and Their Limitations

Prior art in this domain includes:

- **General telemedicine platforms** (e.g., eSanjeevani): Government platforms for video-based teleconsultation but lack AI-driven triage.
- **Symptom checkers** (e.g., Ada Health, WebMD): Consumer-facing web applications not designed for ANM workflows, lack referral chain integration, and are not adapted to Indian disease prevalence patterns.
- **Hospital Management Systems** (e.g., HMIS): Administrative systems without AI-powered clinical decision support.
- **Isolated AI diagnostic tools:** Various deep learning models for skin or eye disease detection exist in research literature but are not integrated into a unified healthcare worker tool.

None of the known prior art provides an **integrated, multi-modal, voice-enabled, multilingual AI system** with native support for India's 3-tier referral architecture.

### 3.3 Need for the Invention

There exists a clear need for:

1. A unified platform that integrates symptom-based, eye-image-based, and skin-image-based AI prediction.
2. A system accessible to low-literacy healthcare workers via voice input in regional languages.
3. A digital referral chain that preserves patient case history across the Sub-Centre → PHC → CHC pathway.
4. Role-differentiated dashboards for ANMs, PHC doctors, and CHC specialists.

The present invention, SEHAI (Smart Electronic Health AI), addresses all of the above needs.

---

## 4. OBJECTS OF THE INVENTION

The principal objects of the present invention are to:

1. Provide a unified, multi-modal AI diagnostic system capable of processing symptom descriptions, fundus photographs, and skin lesion images within a single platform.
2. Enable voice-driven symptom input in multiple Indian languages, eliminating the dependency on text-based entry for field healthcare workers.
3. Implement a trained XGBoost gradient boosting classifier capable of predicting 42 diseases from a 133-symptom binary feature space with associated confidence scores.
4. Implement a fine-tuned ResNet18 convolutional neural network for automated eye disease classification into four clinically relevant categories.
5. Implement a fine-tuned ResNet18 convolutional neural network for automated dermatological condition classification into fourteen categories.
6. Provide role-based access control ensuring that ANMs, PHC doctors, and CHC specialists each have appropriate views and permissions.
7. Digitise the three-tier referral chain (Sub-Centre → PHC → CHC) with persistent patient records stored in a cloud-based relational database.
8. Enable offline-first capability for low-connectivity environments.

---

## 5. SUMMARY OF THE INVENTION

The present invention provides a system and method for multi-modal AI-powered disease prediction and healthcare referral management, comprising:

**(A) A multi-layer software architecture** including:
- A React 18 (TypeScript) web frontend with TailwindCSS styling, deployable on mobile and desktop browsers.
- A FastAPI (Python 3.11) backend REST API server exposing prediction endpoints.
- A cloud-based PostgreSQL database (Supabase) for patient records, user profiles, and referral logs.

**(B) Three distinct AI inference models:**
1. An XGBoost classifier operating on a 133-dimensional binary symptom feature vector, predicting from 42 disease classes.
2. A ResNet18 CNN fine-tuned for 4-class fundus eye image classification.
3. A ResNet18 CNN fine-tuned for 14-class skin lesion image classification.

**(C) A voice-enabled multilingual input subsystem** using the Web Speech API to transcribe spoken symptoms in English, Hindi, and regional Indian languages.

**(D) A three-tier digital referral chain** with timestamped case escalation, status tracking, and full patient history preservation across Sub-Centre, PHC, and CHC levels.

---

## 6. BRIEF DESCRIPTION OF THE DRAWINGS

The invention is illustrated by the following figures (see accompanying Excalidraw diagrams):

- **FIG. 1** — Complete system architecture showing all software layers, AI inference services, database integrations, and the three-tier referral chain.
- **FIG. 2** — XGBoost Symptom-Based Disease Prediction Model: data flow from voice/text input through NLP symptom mapping, binary feature vector construction, XGBoost inference, and structured output generation.
- **FIG. 3** — Eye Disease Classification Pipeline: ResNet18 CNN architecture for fundus image analysis, showing preprocessing, backbone layers, global average pooling, fully connected output layer, and 4-class softmax output.
- **FIG. 4** — Skin Disease Classification Pipeline: ResNet18 CNN architecture for dermatological image analysis, showing preprocessing, backbone layers, global average pooling, fully connected output layer, and 14-class softmax output.

---

## 7. DETAILED DESCRIPTION OF THE INVENTION

### 7.1 System Architecture (Refer FIG. 1)

The SEHAI system is implemented as a three-tier web application:

#### 7.1.1 Presentation Layer (Frontend)

The frontend is a Single-Page Application (SPA) built with **React 18 and TypeScript**, bundled using **Vite**, and styled with **TailwindCSS**. It comprises:

- **Landing Page:** Public-facing information page with multilingual navigation supporting English, Hindi, and regional languages via a custom `LanguageContext` React context.
- **Authentication Module:** Registration and login backed by Supabase Auth, supporting role-based signup (ANM / PHC Doctor / CHC Specialist).
- **ANM Dashboard:** Provides three diagnostic modality tabs:
  - Symptom-based disease prediction (text + voice input)
  - Eye disease prediction (image upload)
  - Skin disease prediction (image upload)
  - Patient record submission and referral initiation
- **PHC Dashboard:** Displays incoming referrals from Sub-Centres, allows status updates (accept / reject / escalate to CHC).
- **CHC Dashboard:** Displays referrals escalated from PHC, with full patient history visible.

#### 7.1.2 API Layer (Backend)

The backend is implemented in **Python 3.11** using the **FastAPI** framework. It exposes the following REST endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Model readiness health check |
| `/symptoms` | GET | Returns the full list of 133 supported symptoms |
| `/predict` | POST | Symptom-based XGBoost disease prediction |
| `/predict/eye` | POST | Eye disease image classification (ResNet18) |
| `/predict/skin` | POST | Skin disease image classification (ResNet18) |

The server is containerised using **Docker** and deployed on a GPU-enabled cloud inference platform (e.g., Hugging Face Spaces). Cross-Origin Resource Sharing (CORS) is configured to allow requests from the deployed frontend origin and localhost.

#### 7.1.3 Database Layer

Patient data, referral records, and user profiles are stored in a **Supabase-hosted PostgreSQL** database. Key tables include:

- `profiles` — User role, facility name, and professional details linked to Supabase Auth UUIDs.
- `patients` — Patient demographics, recorded symptoms (raw text), AI prediction results, and timestamp.
- `referrals` — Referral source (ANM ID), destination (PHC/CHC), priority level, current status, and escalation notes.

Row-Level Security (RLS) policies ensure each user can only access records appropriate to their role.

---

### 7.2 Model 1: XGBoost Symptom-Based Disease Prediction (Refer FIG. 2)

#### 7.2.1 Training Data

The model is trained on a cleaned dataset (`clean_dataset.tsv`) comprising records of disease presentations across 42 disease categories. The feature space consists of **133 binary features**, each corresponding to the presence (1) or absence (0) of a specific clinical symptom.

#### 7.2.2 Feature Engineering

The `prepare_symptoms_array()` function in `helper.py` converts a list of symptom strings into a NumPy array of shape `(1, 133)` matching the column order of the training dataset:

```
symptoms_array = np.zeros((1, 133))
for symptom in selected_symptoms:
    if symptom in df.columns:
        idx = df.columns.get_loc(symptom)
        symptoms_array[0, idx] = 1
```

#### 7.2.3 XGBoost Classifier

The model is an **XGBoost multi-class classifier** (`xgb.XGBClassifier`) trained with gradient boosting. The trained model weights are serialised to JSON format (`xgboost_model.json`). At inference time, the model is loaded once at server startup and retained in memory for low-latency prediction.

**Output:** The model returns:
- `predicted_disease` — string label from the 42-disease vocabulary
- `confidence` — float representing the softmax probability of the predicted class
- `description` — textual description retrieved from `symptom_Description.csv`
- `precautions` — list of up to 4 precautionary measures retrieved from `symptom_precaution.csv`

#### 7.2.4 Voice Input Subsystem

On the ANM Dashboard, the **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`) is used to transcribe spoken input. The transcribed text is appended to a symptom text field. A separate autocomplete component (`SymptomSelect`) allows the ANM to select structured symptom tokens from the 133-item vocabulary, which are sent to the `/predict` endpoint.

---

### 7.3 Model 2: Eye Disease Classification — ResNet18 CNN (Refer FIG. 3)

#### 7.3.1 Model Architecture

The eye disease model uses a **ResNet18** backbone (18 convolutional layers with residual skip connections) sourced from `torchvision.models`. The final fully connected (FC) layer is replaced with a linear layer mapping from 512 features to **4 output neurons** corresponding to:

| Class Index | Disease |
|------------|---------|
| 0 | Cataract |
| 1 | Diabetic Retinopathy |
| 2 | Glaucoma |
| 3 | Normal |

#### 7.3.2 Preprocessing Pipeline

All input images are subjected to the following preprocessing transforms (implemented via `torchvision.transforms.Compose`):

```
Resize((224, 224))
→ ToTensor()
→ Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
```

The normalisation parameters correspond to the **ImageNet dataset statistics**, appropriate for models pre-trained on ImageNet.

#### 7.3.3 Inference

The model is loaded in evaluation mode (`model.eval()`). A single forward pass through the network produces a 4-element logit vector. **Softmax** is applied to convert logits to class probabilities. The argmax of the probability vector identifies the predicted class.

**Output:** `predicted_disease`, `confidence`, and a `probabilities` dictionary mapping each class name to its probability.

---

### 7.4 Model 3: Skin Disease Classification — ResNet18 CNN (Refer FIG. 4)

#### 7.4.1 Model Architecture

The skin disease model follows an identical architecture to the eye disease model (Section 7.3), with the exception that the output FC layer maps from 512 features to **14 output neurons** corresponding to:

| Class | Disease |
|-------|---------|
| 0 | Acne |
| 1 | Actinic Keratosis |
| 2 | Bullous Disease |
| 3 | Drug Eruption |
| 4 | Eczema |
| 5 | Infestations & Bites |
| 6 | Lichen |
| 7 | Lupus |
| 8 | Moles |
| 9 | Seborrheic Keratoses |
| 10 | Sun Damage |
| 11 | Vasculitis |
| 12 | Vitiligo |
| 13 | Warts |

#### 7.4.2 Preprocessing and Inference

The preprocessing pipeline is identical to Section 7.3.2. Inference produces a 14-element probability vector via softmax, from which the predicted class and confidence are extracted.

---

### 7.5 Three-Tier Referral Chain (Refer FIG. 1 — Referral Chain Section)

The SEHAI referral system digitises India's healthcare escalation pathway:

**Step 1 — ANM Records and Triages (Sub-Centre Level):**
The ANM creates a patient record with name, age, gender, symptoms (voice/text), and attaches AI prediction results. She can either log the case as resolved or initiate a referral to the PHC with a priority level (low / medium / high) and a reason.

**Step 2 — PHC Doctor Reviews (PHC Level):**
The PHC Dashboard displays all incoming referrals from registered ANMs. For each referral, the doctor sees: patient demographics, original symptoms, and the AI-generated disease prediction with confidence score. The doctor can accept, reject, or further escalate the case to the CHC with notes.

**Step 3 — CHC Specialist Reviews (CHC Level):**
The CHC Dashboard displays all cases escalated from PHC. The complete patient journey is visible: original ANM visit record → PHC review → current referral status. The CHC specialist can mark cases as completed, requiring further investigation, or admitted.

All referral actions are timestamped and stored in the `referrals` table with immutable audit entries.

---

## 8. ADVANTAGES OF THE INVENTION

1. **Integrated Multi-Modal AI:** Combines symptom, eye image, and skin image analysis in a single unified platform, eliminating the need for multiple disparate tools.
2. **Voice-Enabled Field Use:** The Web Speech API integration allows ANMs to record patient data hands-free during home visits.
3. **Multilingual Support:** Built-in i18n architecture supports English, Hindi, and any regional language through an extensible translation registry.
4. **Structured Referral Chain:** Digital referral records eliminate paper-based information loss that is endemic to India's current healthcare workflow.
5. **Role-Based Access Control:** Database-level Row-Level Security ensures data confidentiality appropriate to each role.
6. **Lightweight and Deployable:** The frontend is a lightweight SPA deployable via Vercel CDN; the backend model server is containerised for cloud GPU deployment.
7. **Interpretable AI Outputs:** Every prediction includes a confidence score and human-readable disease description and precautions, enabling informed decision-making by healthcare workers.
8. **Scalability:** The modular API architecture allows additional AI models (e.g., malaria slide analysis, X-ray TB detection) to be integrated as new `/predict/<modality>` endpoints without architectural changes.

---

## 9. INDUSTRIAL APPLICABILITY

The invention is industrially applicable in the following sectors:

- **Public healthcare system management** — specifically India's National Health Mission (NHM) and its Sub-Centre network.
- **Telemedicine and e-health platforms** for developing nations with similar three-tier primary care structures.
- **Medical education and training** — as a simulation tool for training ANMs and paramedics in AI-assisted triage.
- **Non-Governmental Organisations (NGOs)** operating community health programmes.
- **Private healthcare chains** operating in rural or semi-urban geographies.

The invention does not require the patient to interact with any software; all interaction is performed by the trained healthcare worker, making it suitable for deployment even where patient digital literacy is zero.

---

*End of Complete Specification*
