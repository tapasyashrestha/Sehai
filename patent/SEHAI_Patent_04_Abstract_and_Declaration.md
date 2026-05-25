# ABSTRACT AND DECLARATION OF INVENTORSHIP
## SEHAI: A MULTI-MODAL AI-POWERED DISEASE PREDICTION AND THREE-TIER REFERRAL MANAGEMENT SYSTEM FOR RURAL HEALTHCARE

*(Filed under Section 10(6) of the Indian Patents Act, 1970)*

---

## PART A — ABSTRACT
*(Not exceeding 150 words as required by Indian Patent Office Rule 13)*

---

> **SEHAI** is a computer-implemented system for multi-modal AI-driven disease prediction and digital referral management in rural healthcare. The system integrates three machine learning models: **(1)** an XGBoost gradient boosting classifier that accepts a 133-dimensional binary symptom feature vector and predicts among 42 diseases with a confidence score; **(2)** a fine-tuned ResNet18 convolutional neural network for four-class ocular disease classification from fundus photographs; and **(3)** a fine-tuned ResNet18 convolutional neural network for fourteen-class dermatological condition classification from skin images. A FastAPI REST server serves all three models. A voice-enabled, multilingual React web frontend supports Auxiliary Nurse Midwives (ANMs), PHC doctors, and CHC specialists through role-differentiated dashboards. A cloud PostgreSQL database implements India's three-tier Sub-Centre → PHC → CHC referral chain with full audit trails. Drawings accompany: FIG. 1 (system architecture), FIG. 2 (XGBoost pipeline), FIG. 3 (eye CNN), FIG. 4 (skin CNN).

---

## PART B — REPRESENTATIVE DRAWING

**FIG. 1** is selected as the representative drawing that best discloses the invention.

*(Refer to FIG. 1 in accompanying Excalidraw diagrams — `FIG1_System_Architecture.excalidraw`)*

---

## PART C — DECLARATION OF INVENTORSHIP
### Form 5 — Declaration as to Inventorship
*(Pursuant to Section 7(2) and Rule 13(6) of the Patents Act, 1970 and Rules, 2003)*

**In the matter of Patent Application No.:** [To be assigned by IPO]

**Title of Invention:** SEHAI: A MULTI-MODAL AI-POWERED DISEASE PREDICTION AND THREE-TIER REFERRAL MANAGEMENT SYSTEM FOR RURAL HEALTHCARE

I/We, the undersigned, hereby declare that:

1. I am/We are the true and first inventor(s) of the invention described in the Complete Specification filed with the above application.

2. My/Our address(es) and nationality are as stated in Form 1 accompanying this application.

3. The invention described in the Complete Specification was made by me/us and was not obtained from any other person.

4. I am/We are not aware of any patent or published patent application in any country that discloses the invention as claimed.

5. This declaration is made in good faith and the statements made herein are true to the best of my/our knowledge, information, and belief.

**Verified at:** ________________________________

**Date:** April 12, 2026

| Inventor | Full Name | Signature | Date |
|----------|-----------|-----------|------|
| Inventor 1 | ___________________________ | ___________ | 12/04/2026 |
| Inventor 2 | ___________________________ | ___________ | 12/04/2026 |
| Inventor 3 | ___________________________ | ___________ | 12/04/2026 |
| Inventor 4 | ___________________________ | ___________ | 12/04/2026 |

---

## PART D — SEQUENCE OF DRAWINGS

| Figure | Title | File |
|--------|-------|------|
| FIG. 1 | SEHAI Complete System Architecture | `diagrams/FIG1_System_Architecture.excalidraw` |
| FIG. 2 | XGBoost Symptom-Based Disease Prediction Model Architecture | `diagrams/FIG2_XGBoost_Disease_Model.excalidraw` |
| FIG. 3 | Eye Disease Classification — ResNet18 CNN Pipeline | `diagrams/FIG3_Eye_Disease_CNN.excalidraw` |
| FIG. 4 | Skin Disease Classification — ResNet18 CNN Pipeline | `diagrams/FIG4_Skin_Disease_CNN.excalidraw` |

---

## PART E — PRIOR ART SEARCH STATEMENT

The inventors have conducted a prior art search and acknowledge the following related works, none of which discloses or anticipates the present invention as claimed:

| Reference | Authors / Source | Relevance | Distinguishing Feature of Present Invention |
|-----------|-----------------|-----------|---------------------------------------------|
| eSanjeevani (NHM India) | Ministry of Health, Govt. of India | Telemedicine video consultation for India | No AI disease prediction; no image-based diagnosis; no structured referral chain |
| "Disease Prediction Using Machine Learning" (various) | Academic publications (IEEE, Springer) | Symptom-based ML classification | Isolated models; not integrated with voice input, image models, or referral chain |
| ResNet-based skin lesion classifiers (ISIC Challenge) | ISIC / Kaggle | CNN-based dermatology | Standalone classifiers; no healthcare worker workflow integration |
| Hospital Management Information System (HMIS) | NIC, Govt. of India | Patient record management | No AI prediction capability |
| Ada Health, WebMD Symptom Checker | Private companies | Symptom-to-disease mapping | Not adapted for India disease prevalence; no image analysis; no referral chain; no voice/multilingual input for low-literacy users |

**Conclusion:** No prior art was found that discloses or renders obvious the combination of: (i) multi-modal AI prediction spanning symptom, eye image, and skin image modalities; (ii) voice-enabled multilingual input; and (iii) a digitised three-tier referral chain for India's public healthcare hierarchy — as integrated in the present invention.

---

## PART F — STATEMENT ON PATENTABILITY

### Novelty (Section 2(1)(l) of the Patents Act, 1970)

The invention is novel as it discloses, for the first time to the inventors' knowledge, a unified system combining:
- XGBoost-based 133-feature / 42-disease symptom prediction,
- Dual ResNet18 CNNs for eye (4-class) and skin (14-class) image diagnosis,
- A voice-enabled multilingual ANM interface,
- A digitised Sub-Centre → PHC → CHC referral chain,

in a single integrated, deployable web platform.

### Inventive Step (Section 2(1)(ja))

The combination of the above elements in a unified, deployable system that serves low-literacy field healthcare workers and integrates with India's three-tier public health infrastructure is non-obvious to a person skilled in the art of software engineering and medical informatics. The specific engineering choices — XGBoost over neural networks for symptom-based prediction (to enable fast CPU inference), ResNet18 as a lightweight CNN backbone suitable for edge deployment, the use of Supabase RLS for multi-tenant role-based data security, and the Web Speech API for zero-infrastructure voice input — each represent inventive choices made in light of the constraints of rural deployment.

### Industrial Applicability (Section 2(1)(ac))

The invention is clearly capable of industrial application in:
- India's National Health Mission (NHM) Sub-Centre network
- Rural telemedicine deployments
- NGO-operated community health programmes
- Global developing-nation healthcare systems

---

## PART G — TECHNOLOGY READINESS LEVEL (TRL)

| Component | TRL Level | Status |
|-----------|-----------|--------|
| XGBoost Disease Model | TRL 7 | Prototype validated; model trained and serving |
| Eye Disease ResNet18 | TRL 6 | System prototype in relevant environment |
| Skin Disease ResNet18 | TRL 6 | System prototype in relevant environment |
| FastAPI Backend | TRL 7 | Deployed on cloud inference platform |
| React Frontend | TRL 7 | Deployed on Vercel CDN |
| Supabase DB + Auth | TRL 7 | Live with production-grade RLS policies |
| 3-Tier Referral Chain | TRL 6-7 | Functional prototype validated |

---

## PART H — GLOSSARY OF KEY TERMS

| Term | Definition as Used in This Application |
|------|---------------------------------------|
| **ANM** | Auxiliary Nurse Midwife — a field-level healthcare worker under India's NHM |
| **PHC** | Primary Health Centre — India's first doctor-staffed public healthcare facility |
| **CHC** | Community Health Centre — India's specialist-level public healthcare facility |
| **XGBoost** | eXtreme Gradient Boosting — an ensemble machine learning algorithm using gradient-boosted decision trees |
| **ResNet18** | Residual Network with 18 layers — a deep CNN architecture by He et al. (2016) |
| **Binary Feature Vector** | A vector where each element is 0 or 1, representing the absence or presence of a specific feature |
| **Softmax** | A normalisation function converting a vector of logits to a probability distribution |
| **REST API** | Representational State Transfer Application Programming Interface |
| **FastAPI** | A Python web framework for building REST APIs with automatic OpenAPI documentation |
| **Supabase** | An open-source Firebase alternative providing PostgreSQL + Auth + Row-Level Security |
| **React** | A JavaScript library for building component-based user interfaces |
| **Vite** | A modern JavaScript/TypeScript frontend build tool |
| **Web Speech API** | A W3C browser API for speech recognition and synthesis |
| **RLS** | Row-Level Security — a PostgreSQL feature enabling per-row access control |
| **TailwindCSS** | A utility-first CSS framework |
| **ImageNet normalisation** | Normalisation of image tensors using ImageNet dataset statistics: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225] |
| **Confidence score** | The softmax probability associated with the predicted class, expressed as a value in [0, 1] |

---

*End of Abstract and Declaration Document*

---

**COMPLETE FILE SET FOR PATENT APPLICATION:**

```
patent/
├── SEHAI_Patent_01_Application_Form.md       ← Form 1 (Application)
├── SEHAI_Patent_02_Complete_Specification.md ← Complete Specification (Section 10)
├── SEHAI_Patent_03_Claims.md                 ← Claims (20 claims)
├── SEHAI_Patent_04_Abstract_and_Declaration.md ← Abstract + Form 5 + Supporting Docs
└── diagrams/
    ├── FIG1_System_Architecture.excalidraw
    ├── FIG2_XGBoost_Disease_Model.excalidraw
    ├── FIG3_Eye_Disease_CNN.excalidraw
    └── FIG4_Skin_Disease_CNN.excalidraw
```
