from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import models
from app.schemas import schemas
from app.services.audit_service import run_audit

router = APIRouter()

# --- Patients ---
@router.post("/patients", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/patients", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Patient).offset(skip).limit(limit).all()

# --- Visits ---
@router.post("/visits", response_model=schemas.Visit)
def create_visit(visit: schemas.VisitCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == visit.patient_id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db_visit = models.Visit(**visit.model_dump())
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

@router.get("/visits", response_model=List[schemas.Visit])
def read_visits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Visit).offset(skip).limit(limit).all()

# --- Claims ---
@router.post("/claims", response_model=schemas.Claim)
def create_claim(claim: schemas.ClaimCreate, db: Session = Depends(get_db)):
    db_visit = db.query(models.Visit).filter(models.Visit.id == claim.visit_id).first()
    if not db_visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    db_claim = models.Claim(
        visit_id=claim.visit_id,
        total_amount=claim.total_amount,
        status="PENDING_AUDIT"
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    
    for item in claim.items:
        db_item = models.ClaimItem(**item.model_dump(), claim_id=db_claim.id)
        db.add(db_item)
    
    db.commit()
    db.refresh(db_claim)
    return db_claim

@router.get("/claims", response_model=List[schemas.ClaimWithAudit])
def get_claims(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Claim).offset(skip).limit(limit).all()

@router.get("/claims/{claim_id}", response_model=schemas.ClaimWithAudit)
def get_claim(claim_id: str, db: Session = Depends(get_db)):
    db_claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not db_claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return db_claim

# --- Audit Trigger ---
@router.post("/claims/{claim_id}/audit")
def trigger_audit(claim_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not db_claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    if db_claim.status == "AUDITED":
        raise HTTPException(status_code=400, detail="Claim already audited")
        
    db_claim.status = "AUDITING"
    db.commit()
    
    # Run the Gemini audit in the background
    background_tasks.add_task(run_audit, claim_id)
    
    return {"message": "Audit triggered successfully", "claim_id": claim_id}
