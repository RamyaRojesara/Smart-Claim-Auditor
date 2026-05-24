import uuid
from sqlalchemy import Column, String, Date, Numeric, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=generate_uuid)
    first_name = Column(String)
    last_name = Column(String)
    dob = Column(Date)
    
    visits = relationship("Visit", back_populates="patient")

class Visit(Base):
    __tablename__ = "visits"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"))
    visit_date = Column(Date)
    provider_name = Column(String)
    clinical_note_text = Column(String)
    
    patient = relationship("Patient", back_populates="visits")
    claims = relationship("Claim", back_populates="visit", uselist=False)

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, default=generate_uuid)
    visit_id = Column(String, ForeignKey("visits.id"))
    total_amount = Column(Numeric(10, 2))
    status = Column(String, default="PENDING")
    
    visit = relationship("Visit", back_populates="claims")
    claim_items = relationship("ClaimItem", back_populates="claim")
    audit_result = relationship("AuditResult", back_populates="claim", uselist=False)

class ClaimItem(Base):
    __tablename__ = "claim_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    claim_id = Column(String, ForeignKey("claims.id"))
    billing_code = Column(String)
    description = Column(String)
    billed_amount = Column(Numeric(10, 2))
    
    claim = relationship("Claim", back_populates="claim_items")

class AuditResult(Base):
    __tablename__ = "audit_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    claim_id = Column(String, ForeignKey("claims.id"), unique=True)
    confidence_score = Column(Numeric(3, 2))
    missing_codes = Column(JSON) # e.g., [{"code": "...", "reason": "..."}]
    unsupported_codes = Column(JSON) # e.g., [{"code": "...", "reason": "..."}]
    audit_summary = Column(String)
    
    claim = relationship("Claim", back_populates="audit_result")
