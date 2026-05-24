import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.db.database import SessionLocal
from app.db import models

def run_audit(claim_id: str):
    db = SessionLocal()
    try:
        # Fetch data
        claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
        if not claim:
            print(f"Claim {claim_id} not found.")
            return

        visit = claim.visit
        claim_items = claim.claim_items

        clinical_note = visit.clinical_note_text
        billed_items_str = "\n".join([f"- Code: {item.billing_code}, Desc: {item.description}" for item in claim_items])

        # Initialize LLM
        # Assumes GOOGLE_API_KEY is set in environment
        try:
            llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0)
            
            # Define Prompt
            system_prompt = """
            You are an expert medical coder and auditor. 
            You will be provided with a patient's clinical note and the items that were billed for this visit.
            
            Task 1: Extract all supported procedures and diagnoses from the clinical note.
            Task 2: Compare the supported codes against the billed items.
            Task 3: Identify 'missing_codes' (supported by notes but not billed).
            Task 4: Identify 'unsupported_codes' (billed but not supported by notes).
            
            Return the output in the following JSON format strictly:
            {{
                "confidence_score": 0.0 to 1.0,
                "missing_codes": [{{"code": "...", "reason": "..."}}],
                "unsupported_codes": [{{"code": "...", "reason": "..."}}],
                "audit_summary": "Overall explanation of the audit findings."
            }}
            """
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", "Clinical Note:\n{clinical_note}\n\nBilled Items:\n{billed_items}")
            ])
            
            parser = JsonOutputParser()
            chain = prompt | llm | parser
            
            # Run inference
            result = chain.invoke({
                "clinical_note": clinical_note,
                "billed_items": billed_items_str
            })
            
            # Save results
            audit_result = models.AuditResult(
                claim_id=claim.id,
                confidence_score=result.get("confidence_score", 0.0),
                missing_codes=result.get("missing_codes", []),
                unsupported_codes=result.get("unsupported_codes", []),
                audit_summary=result.get("audit_summary", "Audit completed.")
            )
            db.add(audit_result)
            claim.status = "AUDITED"
            db.commit()
            print(f"Audit completed for claim {claim_id}")
            
        except Exception as e:
            print(f"Error during Gemini audit: {e}")
            claim.status = "FLAGGED"
            db.commit()

    finally:
        db.close()
