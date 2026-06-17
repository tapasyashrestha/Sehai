import sqlite3
import json
import time
import base64
import hmac
import hashlib
import os
import uuid
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent.parent / "data" / "sehai.db"
JWT_SECRET = "sehai_super_secure_token_secret_99881122"
TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600  # 7 days

def get_db():
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Make sure data directory exists
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT CHECK(role IN ('anm', 'phc', 'chc')) NOT NULL,
        facility_name TEXT DEFAULT '',
        facility_location TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Patients table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        patient_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
        symptoms TEXT NOT NULL,
        symptom_tags TEXT DEFAULT '[]',
        contact TEXT,
        address TEXT,
        medical_history TEXT,
        vitals TEXT DEFAULT '{}',
        notes TEXT,
        created_by TEXT NOT NULL,
        facility_name TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        symptoms_used TEXT NOT NULL,
        predicted_disease TEXT NOT NULL,
        confidence REAL NOT NULL,
        disease_description TEXT,
        precautions TEXT DEFAULT '[]',
        predicted_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY(predicted_by) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # Referrals table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS referrals (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        referred_by TEXT NOT NULL,
        referred_to TEXT CHECK(referred_to IN ('phc', 'chc')) NOT NULL,
        target_facility TEXT,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) NOT NULL DEFAULT 'medium',
        status TEXT CHECK(status IN ('pending', 'reviewed', 'in_progress', 'completed', 'rejected')) NOT NULL DEFAULT 'pending',
        reason TEXT,
        notes TEXT,
        reviewed_by TEXT,
        reviewed_at TIMESTAMP,
        prediction_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY(referred_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(reviewed_by) REFERENCES users(id),
        FOREIGN KEY(prediction_id) REFERENCES predictions(id)
    )
    """)
    
    # Insert a few mock users if table is empty for testing ease
    cursor.execute("SELECT count(*) FROM users")
    if cursor.fetchone()[0] == 0:
        mock_users = [
            ("anm1-id", "anm@sehai.org", "anm123", "ANM Sister Mary", "anm", "Village Sub-Centre"),
            ("phc1-id", "phc@sehai.org", "phc123", "Dr. Rajesh Kumar", "phc", "Primary Health Centre A"),
            ("chc1-id", "chc@sehai.org", "chc123", "Dr. Geeta Patel", "chc", "CHC Specialist Hospital")
        ]
        for uid, email, pwd, name, role, facility in mock_users:
            hp = hash_password(pwd)
            cursor.execute(
                "INSERT INTO users (id, email, hashed_password, full_name, role, facility_name) VALUES (?, ?, ?, ?, ?, ?)",
                (uid, email, hp, name, role, facility)
            )
    
    conn.commit()
    conn.close()

# Password Security Helpers
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    rounds = 100000
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, rounds)
    return f"{salt.hex()}:{rounds}:{key.hex()}"

def verify_password(stored_hash: str, password: str) -> bool:
    try:
        salt_hex, rounds_str, key_hex = stored_hash.split(':')
        salt = bytes.fromhex(salt_hex)
        rounds = int(rounds_str)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, rounds)
        return hmac.compare_digest(key, new_key)
    except Exception:
        return False

# Token Security Helpers
def create_token(user_id: str, email: str) -> str:
    expires = int(time.time()) + TOKEN_EXPIRY_SECONDS
    payload = f"{user_id}:{email}:{expires}"
    sig = hmac.new(JWT_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    raw_token = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw_token.encode()).decode()

def verify_token(token_str: str) -> dict | None:
    try:
        decoded = base64.urlsafe_b64decode(token_str.encode()).decode()
        parts = decoded.split(":")
        if len(parts) != 4:
            return None
        user_id, email, expires_str, sig = parts
        expires = int(expires_str)
        if time.time() > expires:
            return None
        payload = f"{user_id}:{email}:{expires}"
        expected_sig = hmac.new(JWT_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        return {"user_id": user_id, "email": email}
    except Exception:
        return None

# Database CRUD Operations
def create_user(email: str, password_raw: str, full_name: str, role: str, facility_name: str = "", facility_location: str = "", phone: str = ""):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise ValueError("User with this email already exists")
    
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(password_raw)
    
    cursor.execute(
        "INSERT INTO users (id, email, hashed_password, full_name, role, facility_name, facility_location, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, email, hashed_pwd, full_name, role, facility_name, facility_location, phone)
    )
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def get_user_by_id(user_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, full_name, role, facility_name, facility_location, phone, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_email(email: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# Patient CRUD
def create_patient(patient_name: str, age: int, gender: str, symptoms: str, symptom_tags: list, created_by: str, facility_name: str, contact: str = "", address: str = "", medical_history: str = "", vitals: dict = None, notes: str = ""):
    conn = get_db()
    cursor = conn.cursor()
    patient_id = str(uuid.uuid4())
    
    symptom_tags_str = json.dumps(symptom_tags)
    vitals_str = json.dumps(vitals or {})
    
    cursor.execute(
        """INSERT INTO patients 
           (id, patient_name, age, gender, symptoms, symptom_tags, contact, address, medical_history, vitals, notes, created_by, facility_name) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (patient_id, patient_name, age, gender, symptoms, symptom_tags_str, contact, address, medical_history, vitals_str, notes, created_by, facility_name)
    )
    conn.commit()
    conn.close()
    return get_patient_by_id(patient_id)

def get_patient_by_id(patient_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT patients.*, users.full_name, users.facility_name AS user_facility
           FROM patients 
           LEFT JOIN users ON patients.created_by = users.id 
           WHERE patients.id = ?""",
        (patient_id,)
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    
    data = dict(row)
    data["symptom_tags"] = json.loads(data["symptom_tags"] or "[]")
    data["vitals"] = json.loads(data["vitals"] or "{}")
    data["profiles"] = {
        "full_name": data.pop("full_name"),
        "facility_name": data.pop("user_facility")
    }
    return data

def get_dashboard_stats_today(user_id: str):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get today's local date prefix (YYYY-MM-DD)
    today = time.strftime("%Y-%m-%d")
    
    # Patients count created today by this user
    cursor.execute(
        "SELECT count(*) FROM patients WHERE created_by = ? AND created_at >= ?", 
        (user_id, today)
    )
    patients_count = cursor.fetchone()[0]
    
    # Referrals count created today by this user
    cursor.execute(
        "SELECT count(*) FROM referrals WHERE referred_by = ? AND created_at >= ?", 
        (user_id, today)
    )
    referrals_count = cursor.fetchone()[0]
    
    conn.close()
    return {"patients_today": patients_count, "referrals_today": referrals_count}

# Predictions CRUD
def create_prediction(patient_id: str, symptoms_used: list, predicted_disease: str, confidence: float, disease_description: str, precautions: list, predicted_by: str):
    conn = get_db()
    cursor = conn.cursor()
    prediction_id = str(uuid.uuid4())
    
    cursor.execute(
        """INSERT INTO predictions 
           (id, patient_id, symptoms_used, predicted_disease, confidence, disease_description, precautions, predicted_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (prediction_id, patient_id, json.dumps(symptoms_used), predicted_disease, confidence, disease_description, json.dumps(precautions), predicted_by)
    )
    conn.commit()
    conn.close()
    return prediction_id

def get_predictions_by_patient_id(patient_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM predictions WHERE patient_id = ? ORDER BY created_at DESC", 
        (patient_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        data = dict(row)
        data["symptoms_used"] = json.loads(data["symptoms_used"] or "[]")
        data["precautions"] = json.loads(data["precautions"] or "[]")
        results.append(data)
    return results

# Referrals CRUD
def create_referral(patient_id: str, referred_by: str, referred_to: str, priority: str = "medium", reason: str = "", prediction_id: str = None):
    conn = get_db()
    cursor = conn.cursor()
    referral_id = str(uuid.uuid4())
    
    cursor.execute(
        """INSERT INTO referrals 
           (id, patient_id, referred_by, referred_to, priority, reason, prediction_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (referral_id, patient_id, referred_by, referred_to, priority, reason, prediction_id)
    )
    conn.commit()
    conn.close()
    return referral_id

def list_referrals(referred_to: str = None, patient_id: str = None):
    conn = get_db()
    cursor = conn.cursor()
    
    if referred_to:
        cursor.execute(
            """SELECT referrals.*, patients.patient_name, patients.symptoms, users.full_name, users.facility_name AS user_facility
               FROM referrals 
               LEFT JOIN patients ON referrals.patient_id = patients.id 
               LEFT JOIN users ON referrals.referred_by = users.id 
               WHERE referrals.referred_to = ? 
               ORDER BY referrals.created_at DESC""",
            (referred_to,)
        )
    elif patient_id:
        cursor.execute(
            """SELECT referrals.*, patients.patient_name, patients.symptoms, users.full_name, users.facility_name AS user_facility
               FROM referrals 
               LEFT JOIN patients ON referrals.patient_id = patients.id 
               LEFT JOIN users ON referrals.referred_by = users.id 
               WHERE referrals.patient_id = ? 
               ORDER BY referrals.created_at DESC""",
            (patient_id,)
        )
    else:
        cursor.execute(
            """SELECT referrals.*, patients.patient_name, patients.symptoms, users.full_name, users.facility_name AS user_facility
               FROM referrals 
               LEFT JOIN patients ON referrals.patient_id = patients.id 
               LEFT JOIN users ON referrals.referred_by = users.id 
               ORDER BY referrals.created_at DESC"""
        )
        
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        data = dict(row)
        results.append({
            "id": data["id"],
            "patient_id": data["patient_id"],
            "referred_by": data["referred_by"],
            "referred_to": data["referred_to"],
            "target_facility": data["target_facility"],
            "priority": data["priority"],
            "status": data["status"],
            "reason": data["reason"],
            "notes": data["notes"],
            "reviewed_by": data["reviewed_by"],
            "reviewed_at": data["reviewed_at"],
            "prediction_id": data["prediction_id"],
            "created_at": data["created_at"],
            "updated_at": data["updated_at"],
            "patients": {
                "id": data["patient_id"],
                "patient_name": data["patient_name"],
                "symptoms": data["symptoms"]
            },
            "profiles": {
                "full_name": data["full_name"],
                "facility_name": data["user_facility"]
            }
        })
    return results

def update_referral_status(referral_id: str, status: str, reviewed_by: str):
    conn = get_db()
    cursor = conn.cursor()
    now = time.strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "UPDATE referrals SET status = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ? WHERE id = ?",
        (status, reviewed_by, now, now, referral_id)
    )
    conn.commit()
    conn.close()
    return True
