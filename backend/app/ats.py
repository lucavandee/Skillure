from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from . import models, schemas, dependencies
from .database import SessionLocal
import datetime

router = APIRouter(prefix="/ats", tags=["ats"])

@router.post("/apply", response_model=dict)
def apply_to_vacancy(
    data: dict,  # {"vacancy_id": int}
    current_user: models.User = Depends(dependencies.require_role(models.UserRole.CANDIDATE)),
    db: Session = Depends(dependencies.get_db)
):
    """Kandidaat solliciteert op een vacature"""
    # Kijk of kandidaatprofiel bestaat
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Kandidaatprofiel niet gevonden. Maak eerst een profiel aan."
        )
    
    # Controleer vacature
    vacancy = db.query(models.Vacancy).filter(
        models.Vacancy.id == data["vacancy_id"], 
        models.Vacancy.status == "live"
    ).first()
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Vacature niet beschikbaar"
        )
    
    # Kijk of al aangevraagd
    existing_application = db.query(models.CandidateApplication).filter(
        models.CandidateApplication.vacancy_id == vacancy.id,
        models.CandidateApplication.candidate_id == profile.id
    ).first()
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="U heeft al gesolliciteerd op deze vacature"
        )
    
    # Bereken match score (placeholder - later AI-matching)
    match_score = calculate_match_score(profile, vacancy)
    
    application = models.CandidateApplication(
        vacancy_id=vacancy.id, 
        candidate_id=profile.id,
        match_score=match_score
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return {"detail": "Sollicitatie succesvol ingediend", "application_id": application.id}

@router.get("/my-applications", response_model=List[dict])
def get_my_applications(
    current_user: models.User = Depends(dependencies.require_role(models.UserRole.CANDIDATE)),
    db: Session = Depends(dependencies.get_db)
):
    """Kandidaat bekijkt eigen sollicitaties"""
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    if not profile:
        return []
    
    applications = db.query(models.CandidateApplication).filter(
        models.CandidateApplication.candidate_id == profile.id
    ).all()
    
    result = []
    for app in applications:
        vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == app.vacancy_id).first()
        company = db.query(models.User).filter(models.User.id == vacancy.owner_id).first()
        result.append({
            "application_id": app.id,
            "vacancy_title": vacancy.title,
            "company_name": company.full_name,
            "status": app.status,
            "applied_at": app.applied_at,
            "match_score": app.match_score
        })
    
    return result

@router.get("/pipeline/{vacancy_id}", response_model=List[dict])
def get_pipeline_for_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.require_recruiter_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Recruiter bekijkt pipeline voor eigen vacature"""
    vacancy = db.query(models.Vacancy).filter(
        models.Vacancy.id == vacancy_id
    ).first()
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Vacature niet gevonden"
        )
    
    # Check ownership (alleen eigenaar of admin)
    if vacancy.owner_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Geen toegang tot deze vacature"
        )
    
    applications = db.query(models.CandidateApplication).filter(
        models.CandidateApplication.vacancy_id == vacancy_id
    ).all()
    
    pipeline = []
    for app in applications:
        candidate = db.query(models.CandidateProfile).filter(
            models.CandidateProfile.id == app.candidate_id
        ).first()
        user = db.query(models.User).filter(models.User.id == candidate.user_id).first()
        
        pipeline.append({
            "application_id": app.id,
            "candidate_id": candidate.id,
            "candidate_name": user.full_name,
            "candidate_email": user.email,
            "candidate_phone": candidate.phone,
            "candidate_location": candidate.location,
            "match_score": app.match_score,
            "status": app.status,
            "applied_at": app.applied_at,
            "updated_at": app.updated_at,
            "notes": app.notes
        })
    
    return pipeline

@router.patch("/application/{application_id}", response_model=dict)
def update_application_status(
    application_id: int,
    data: dict,  # {"status": "screening" / "interview" / "afgewezen" / "geplaatst", "notes": "optional"}
    current_user: models.User = Depends(dependencies.require_recruiter_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Update status van een sollicitatie"""
    app_record = db.query(models.CandidateApplication).filter(
        models.CandidateApplication.id == application_id
    ).first()
    if not app_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Sollicitatie niet gevonden"
        )
    
    vacancy = db.query(models.Vacancy).filter(
        models.Vacancy.id == app_record.vacancy_id
    ).first()
    
    # Check ownership
    if vacancy.owner_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Geen toegang"
        )
    
    # Validate status
    valid_statuses = ["ingediend", "screening", "interview", "aanbieding", "afgewezen", "geplaatst"]
    if data["status"] not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ongeldige status. Moet een van zijn: {valid_statuses}"
        )
    
    app_record.status = data["status"]
    if "notes" in data:
        app_record.notes = data["notes"]
    app_record.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(app_record)
    
    return {"detail": "Status bijgewerkt", "new_status": app_record.status}

@router.get("/pipeline-stats/{vacancy_id}", response_model=dict)
def get_pipeline_stats(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.require_recruiter_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Statistieken voor een vacature pipeline"""
    vacancy = db.query(models.Vacancy).filter(
        models.Vacancy.id == vacancy_id
    ).first()
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Vacature niet gevonden"
        )
    
    if vacancy.owner_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Geen toegang"
        )
    
    applications = db.query(models.CandidateApplication).filter(
        models.CandidateApplication.vacancy_id == vacancy_id
    ).all()
    
    stats = {
        "total_applications": len(applications),
        "ingediend": len([a for a in applications if a.status == "ingediend"]),
        "screening": len([a for a in applications if a.status == "screening"]),
        "interview": len([a for a in applications if a.status == "interview"]),
        "aanbieding": len([a for a in applications if a.status == "aanbieding"]),
        "afgewezen": len([a for a in applications if a.status == "afgewezen"]),
        "geplaatst": len([a for a in applications if a.status == "geplaatst"]),
        "avg_match_score": sum([a.match_score for a in applications]) / len(applications) if applications else 0
    }
    
    return stats

def calculate_match_score(profile: models.CandidateProfile, vacancy: models.Vacancy) -> int:
    """Bereken match score tussen kandidaat en vacature (placeholder)"""
    # Placeholder logic - later vervangen door AI-matching
    base_score = 60
    
    # Location match
    if profile.location and vacancy.location:
        if profile.location.lower() in vacancy.location.lower():
            base_score += 20
    
    # Skills match (basic keyword matching)
    if profile.skills:
        skill_names = [skill.skill_name.lower() for skill in profile.skills]
        vacancy_text = f"{vacancy.title} {vacancy.description}".lower()
        matches = sum(1 for skill in skill_names if skill in vacancy_text)
        base_score += min(matches * 5, 20)
    
    return min(base_score, 100)