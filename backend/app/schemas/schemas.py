from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date
from decimal import Decimal

# --- Patients ---
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    dob: date

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: str
    class Config:
        from_attributes = True

# --- Visits ---
class VisitBase(BaseModel):
    visit_date: date
    provider_name: str
    clinical_note_text: str

class VisitCreate(VisitBase):
    patient_id: str

class Visit(VisitBase):
    id: str
    patient_id: str
    class Config:
        from_attributes = True

# --- Claim Items ---
class ClaimItemBase(BaseModel):
    billing_code: str
    description: str
    billed_amount: float

class ClaimItemCreate(ClaimItemBase):
    pass

class ClaimItem(ClaimItemBase):
    id: str
    claim_id: str
    class Config:
        from_attributes = True

# --- Claims ---
class ClaimBase(BaseModel):
    total_amount: float

class ClaimCreate(ClaimBase):
    visit_id: str
    items: List[ClaimItemCreate]

class Claim(ClaimBase):
    id: str
    visit_id: str
    status: str
    claim_items: List[ClaimItem] = []
    class Config:
        from_attributes = True

# --- Audit Results ---
class AuditResultBase(BaseModel):
    confidence_score: float
    missing_codes: List[Dict[str, Any]] = []
    unsupported_codes: List[Dict[str, Any]] = []
    audit_summary: str

class AuditResultCreate(AuditResultBase):
    claim_id: str

class AuditResult(AuditResultBase):
    id: str
    claim_id: str
    class Config:
        from_attributes = True

# Compound return
class ClaimWithAudit(Claim):
    audit_result: Optional[AuditResult] = None
