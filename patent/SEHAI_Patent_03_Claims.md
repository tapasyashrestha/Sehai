# PATENT CLAIMS
## SEHAI: A MULTI-MODAL AI-POWERED DISEASE PREDICTION AND THREE-TIER REFERRAL MANAGEMENT SYSTEM FOR RURAL HEALTHCARE

*(Filed under Section 10(4) of the Indian Patents Act, 1970)*
*(Claims define the scope of protection sought)*

---

> **DRAFTING NOTES (for counsel):**
> - Claims 1–6 are **independent system claims** covering the apparatus.
> - Claims 7–10 are **independent method claims** covering the process.
> - Claims 11–20 are **dependent claims** narrowing specific embodiments.
> - Each claim is a single sentence. No claim references any prior claim except dependent claims.
> - Claims are ordered from broadest to most specific.

---

## INDEPENDENT CLAIMS

### Claim 1 — System (Broadest)

A **computer-implemented system** for multi-modal disease prediction and referral management in a rural healthcare setting, the system comprising:

**(a)** a **presentation layer** implemented as a web-based single-page application providing role-differentiated user interfaces for a first user class comprising field-level healthcare workers, a second user class comprising primary care physicians, and a third user class comprising specialist physicians at a referral hospital;

**(b)** an **application programming interface (API) layer** implemented as a REST API server, wherein said server exposes at least:
- a first prediction endpoint receiving a list of clinical symptom identifiers and returning a disease prediction response,
- a second prediction endpoint receiving a digital image of an eye fundus and returning an ocular disease classification response, and
- a third prediction endpoint receiving a digital image of a skin lesion and returning a dermatological disease classification response;

**(c)** a **first machine learning model** coupled to said first prediction endpoint, comprising a gradient boosting classifier trained on a binary feature vector of length 133, wherein each dimension represents presence or absence of a distinct clinical symptom, and wherein the classifier is configured to predict a disease label from a vocabulary of 42 diseases along with an associated confidence probability;

**(d)** a **second machine learning model** coupled to said second prediction endpoint, comprising a deep convolutional neural network with a residual architecture, fine-tuned to classify fundus images into four ocular disease categories;

**(e)** a **third machine learning model** coupled to said third prediction endpoint, comprising a deep convolutional neural network with a residual architecture, fine-tuned to classify skin lesion images into fourteen dermatological condition categories; and

**(f)** a **referral management module** implemented over a cloud-hosted relational database, wherein said module records patient case data, AI-generated prediction results, and maintains a digital audit trail of case escalation from the first user class through the second user class to the third user class.

---

### Claim 2 — Symptom Prediction System

A computer-implemented **symptom-based disease prediction system** comprising:

**(a)** a voice input module configured to receive spoken symptom descriptions through a browser-based speech recognition API in at least two languages;

**(b)** a symptom normalisation module configured to map transcribed spoken text to a predefined vocabulary of 133 clinical symptom identifiers;

**(c)** a feature construction module configured to construct a binary vector of length 133 by setting each element corresponding to a recognised symptom to the value of 1 and all other elements to the value of 0;

**(d)** an XGBoost classifier loaded from a serialised model file, configured to accept said binary vector as input and produce as output a disease class index, a disease label string, and a softmax class probability; and

**(e)** a knowledge retrieval module configured to return, for the predicted disease, a textual clinical description and a list of recommended precautionary measures, retrieved from structured tabular data sources.

---

### Claim 3 — Eye Disease Classification System

A computer-implemented **ocular disease classification system** comprising:

**(a)** an image reception module configured to receive a digital fundus photograph uploaded via a web interface;

**(b)** an image preprocessing pipeline comprising:
- resizing the received image to a fixed resolution of 224 × 224 pixels,
- converting the resized image to a floating-point tensor with values in [0, 1], and
- applying per-channel normalisation using mean values [0.485, 0.456, 0.406] and standard deviation values [0.229, 0.224, 0.225] corresponding to ImageNet statistics;

**(c)** a ResNet18 convolutional neural network backbone comprising 18 convolutional layers with residual skip connections, wherein the original 1000-unit output layer is replaced with a linear layer mapping 512 features to 4 output units; and

**(d)** a softmax inference module that converts the 4-unit output logit vector to class probabilities and identifies the class with maximum probability as the predicted ocular condition from the set: {Cataract, Diabetic Retinopathy, Glaucoma, Normal}.

---

### Claim 4 — Skin Disease Classification System

A computer-implemented **dermatological disease classification system** comprising:

**(a)** an image reception module configured to receive a digital skin lesion photograph uploaded via a web interface;

**(b)** an image preprocessing pipeline as described in Claim 3(b);

**(c)** a ResNet18 convolutional neural network backbone as described in Claim 3(c), wherein the linear output layer maps 512 features to 14 output units; and

**(d)** a softmax inference module that converts the 14-unit output logit vector to class probabilities and identifies the class with maximum probability as the predicted dermatological condition from the set: {Acne, Actinic Keratosis, Bullous Disease, Drug Eruption, Eczema, Infestations & Bites, Lichen, Lupus, Moles, Seborrheic Keratoses, Sun Damage, Vasculitis, Vitiligo, Warts}.

---

### Claim 5 — Three-Tier Referral Chain System

A **digital healthcare referral management system** for a three-tier public healthcare hierarchy, the system comprising:

**(a)** a first-tier data entry interface for field-level healthcare workers to record patient demographics, clinical symptoms, and AI-generated diagnostic predictions, and to initiate case referrals to a second tier with a selectable priority classification;

**(b)** a second-tier case review interface for primary care physicians to view referred cases with complete patient records including AI predictions, and to either accept, reject, or further escalate cases to a third tier;

**(c)** a third-tier specialist interface for hospital specialists to review cases escalated from the second tier with full patient journey history from first-tier recording to current status;

**(d)** a cloud-hosted relational database storing patient records, user profiles, and referral log entries, wherein each referral entry comprises an immutable timestamp, referral origin identifier, referral destination identifier, case priority, and case status; and

**(e)** database-enforced access control policies ensuring each user class can access only the records appropriate to their tier.

---

### Claim 6 — Multilingual Voice-Enabled Healthcare Input Method

A computer-implemented **method for multilingual voice-enabled clinical data capture** by a field healthcare worker, the method comprising:

**(a)** activating a browser-based speech recognition interface in a user-selected language from a set comprising at least English, Hindi, and one regional Indian language;

**(b)** transcribing spoken symptom descriptions into text using said speech recognition interface;

**(c)** presenting the transcribed text alongside an autocomplete symptom selection interface displaying the predefined 133-symptom vocabulary;

**(d)** mapping selected symptom identifiers to a binary feature vector; and

**(e)** transmitting the binary feature vector via HTTPS to a remote prediction server and receiving a structured disease prediction response.

---

## METHOD CLAIMS

### Claim 7 — Method of XGBoost Disease Prediction

A computer-implemented **method of symptom-based disease prediction**, comprising:

**(a)** receiving, at a REST API endpoint, a JSON payload comprising a non-empty list of symptom identifier strings;

**(b)** validating each symptom identifier against a predefined vocabulary of 133 symptoms and rejecting with an error response any identifier not in said vocabulary;

**(c)** constructing a NumPy array of shape (1, 133) with zeros in all positions except those corresponding to the received symptom identifiers, which are set to 1;

**(d)** passing said array to an XGBoost classifier to obtain a predicted class index and an array of class probabilities;

**(e)** mapping the predicted class index to a disease name string;

**(f)** retrieving the clinical description and precautionary measures corresponding to the predicted disease from tabular reference data; and

**(g)** returning a JSON response comprising the predicted disease name, confidence probability, description, and list of precautions.

---

### Claim 8 — Method of Convolutional Neural Network Image Classification for Medical Images

A computer-implemented **method of medical image classification using a convolutional neural network**, comprising:

**(a)** receiving, at a REST API endpoint, a multipart/form-data HTTP request containing a digital image file;

**(b)** validating the received file's content-type to confirm it is an image format;

**(c)** decoding the image bytes into an RGB PIL Image object;

**(d)** applying a preprocessing pipeline comprising: resizing to 224 × 224 pixels, conversion to a floating-point tensor, and normalisation using ImageNet statistics (mean=[0.485, 0.456, 0.406]; std=[0.229, 0.224, 0.225]);

**(e)** performing a forward pass of the preprocessed tensor through a ResNet18 neural network in evaluation mode with gradient computation disabled;

**(f)** applying softmax activation to the output logit vector to obtain class probabilities;

**(g)** selecting the class corresponding to the maximum probability as the predicted condition; and

**(h)** returning a JSON response comprising the predicted condition name, maximum class probability, and a complete probability distribution over all output classes.

---

### Claim 9 — Method of Operating the Three-Tier Digital Referral Chain

A computer-implemented **method of operating a three-tier healthcare referral chain**, comprising:

**(a)** a first phase executed by a field healthcare worker, comprising: recording patient data, receiving an AI-generated disease prediction, assigning a priority level, and submitting a referral record to a second-tier queue;

**(b)** a second phase executed by a primary care physician, comprising: reviewing the patient record and AI prediction from the first phase, and either accepting the case for treatment, rejecting the referral with a reason, or escalating the case to a third-tier queue with supplementary clinical notes;

**(c)** a third phase executed by a specialist physician, comprising: reviewing the complete patient case history including all records from the first and second phases, and recording a final case disposition; and

**(d)** storing each phase's data entry as a database record with an immutable creation timestamp, a creator identifier, a phase-completion status, and a foreign-key reference linking the record to the originating patient record.

---

### Claim 10 — Method of Loading and Serving Multiple AI Models from a Single API Server

A computer-implemented **method of multi-model AI inference serving**, comprising:

**(a)** at server startup, loading into memory: an XGBoost classifier from a JSON model file, a first ResNet18 neural network from a PyTorch state dictionary file, and a second ResNet18 neural network from a separate PyTorch state dictionary file;

**(b)** setting each loaded neural network to evaluation mode and storing all three models as server-scope singleton objects;

**(c)** for each incoming HTTP prediction request, routing the request to the appropriate in-memory model based on the request's URL path;

**(d)** returning prediction results without reloading models between requests; and

**(e)** upon server shutdown, releasing all model references and freeing associated memory.

---

## DEPENDENT CLAIMS

### Claim 11
The system of Claim 1, wherein the gradient boosting classifier is an XGBoost classifier serialised in JSON format and loaded via the `xgboost` Python library's `load_model()` method.

### Claim 12
The system of Claim 1 or 2, wherein the voice input module uses the `SpeechRecognition` or `webkitSpeechRecognition` interface of the W3C Web Speech API, and wherein the selected recognition language is stored in a React context shared across all components of the application.

### Claim 13
The system of Claim 3 or 4, wherein the deep convolutional neural network backbone is the **ResNet18** architecture as defined by He et al. (2016), initialised with weights pre-trained on the ImageNet Large Scale Visual Recognition Challenge (ILSVRC) dataset, and fine-tuned on task-specific medical image datasets.

### Claim 14
The system of Claim 5, wherein the cloud-hosted relational database is a **PostgreSQL** database managed by Supabase, and wherein access control is implemented using PostgreSQL Row-Level Security (RLS) policies that restrict data access based on the authenticated user's role attribute.

### Claim 15
The method of Claim 7, wherein the XGBoost classifier is configured with multi-class softmax (`multi:softmax` or `multi:softprob`) as the objective function during training, and wherein training data comprises the `clean_dataset.tsv` file containing binary symptom feature vectors with categorical disease labels converted to integer class indices.

### Claim 16
The method of Claim 8, wherein the method is executed independently for eye disease classification using a 4-class output layer and for skin disease classification using a 14-class output layer, both models sharing the same preprocessing pipeline but being stored as separate weight files.

### Claim 17
The system of Claim 1, wherein the API layer is implemented using the **FastAPI** Python web framework with **Pydantic** models for request and response schema validation, and wherein the server exposes an OpenAPI-compliant interactive documentation endpoint.

### Claim 18
The system of Claim 1, wherein the presentation layer is compiled and deployed as a static web application via a Content Delivery Network (CDN), and the API layer is deployed as a containerised service using **Docker**, and the database layer is hosted on a managed cloud database service.

### Claim 19
The system of Claim 2, wherein the system further comprises a structured output module that presents the AI-generated disease prediction to the healthcare worker alongside the confidence score expressed as a percentage, and includes a recommendation to escalate to the next tier when the confidence score falls below a configurable threshold.

### Claim 20
The method of Claim 9, wherein the method further comprises transmitting an alert notification to the second-tier user's dashboard when a new first-tier referral is received with a priority level classified as "high", and transmitting an alert notification to the third-tier user's dashboard when a new second-tier escalation is received, such that time-critical cases are surfaced immediately upon the dashboard next being accessed.

---

*We claim the above as our invention.*

**Signature of Applicant(s):**

| Name | Signature | Date |
|------|-----------|------|
| [Inventor 1] | _________________ | 12/04/2026 |
| [Inventor 2] | _________________ | 12/04/2026 |
| [Inventor 3] | _________________ | 12/04/2026 |
| [Inventor 4] | _________________ | 12/04/2026 |

---

*End of Claims*
