from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas, dependencies
from .database import SessionLocal
from typing import List, Dict, Any

router = APIRouter(prefix="/company", tags=["company"])

@router.get("/me", response_model=schemas.UserOut)
def read_company_me(
    current_user: models.User = Depends(dependencies.require_company_or_admin)
):
    """Get current company/recruiter information"""
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_company_me(
    updates: Dict[str, Any],
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Update company/recruiter profile"""
    user = current_user
    
    # Only allow updating specific fields
    allowed_fields = ["full_name"]
    
    for field, value in updates.items():
        if field in allowed_fields and hasattr(user, field):
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.get("/vacancies", response_model=List[schemas.VacancyOut])
def get_company_vacancies(
    status_filter: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get company's vacancies"""
    query = db.query(models.Vacancy).filter(
        models.Vacancy.owner_id == current_user.id
    )
    
    if status_filter:
        query = query.filter(models.Vacancy.status == status_filter)
    
    vacancies = query.offset(skip).limit(limit).all()
    return vacancies

@router.get("/vacancies/{vacancy_id}/candidates", response_model=List[schemas.CandidateProfileOut])
def get_vacancy_candidates(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get candidates that match a specific vacancy"""
    # Check if vacancy belongs to current user
    vacancy = db.query(models.Vacancy).filter(
        models.Vacancy.id == vacancy_id,
        models.Vacancy.owner_id == current_user.id
    ).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    # TODO: Implement AI matching logic
    # For now, return all active candidate profiles
    candidates = db.query(models.CandidateProfile).join(models.User).filter(
        models.User.is_active == True,
        models.User.role == models.UserRole.CANDIDATE
    ).limit(50).all()
    
    return candidates

@router.post("/vacancies/{vacancy_id}/publish")
def publish_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Publish a vacancy (change status from draft to live)"""
    vacancy = db.query(models.Vacancy).filter(
        models.Vacancy.id == vacancy_id,
        models.Vacancy.owner_id == current_user.id
    ).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    if vacancy.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alleen concept vacatures kunnen gepubliceerd worden"
        )
    
    # Validate compliance requirements before publishing
    if not dependencies.validate_branch_compliance(
        vacancy.branch, vacancy.big_number, vacancy.kyc_file_path
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compliance vereisten niet volledig voor deze branche"
        )
    
    vacancy.status = "live"
    db.commit()
    
    return {"message": "Vacature succesvol gepubliceerd"}

@router.post("/vacancies/{vacancy_id}/pause")
def pause_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Pause a live vacancy"""
    vacancy = db.query(models.Vacancy).filter(
        models.Vacancy.id == vacancy_id,
        models.Vacancy.owner_id == current_user.id
    ).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    if vacancy.status != "live":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alleen actieve vacatures kunnen gepauzeerd worden"
        )
    
    vacancy.status = "paused"
    db.commit()
    
    return {"message": "Vacature gepauzeerd"}

@router.post("/vacancies/{vacancy_id}/close")
def close_vacancy(
    vacancy_id: int,
    reason: str = "filled",  # filled, cancelled, expired
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Close a vacancy"""
    vacancy = db.query(models.Vacancy).filter(
        models.Vacancy.id == vacancy_id,
        models.Vacancy.owner_id == current_user.id
    ).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    valid_reasons = ["filled", "cancelled", "expired"]
    if reason not in valid_reasons:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ongeldige reden. Moet een van zijn: {valid_reasons}"
        )
    
    vacancy.status = reason
    db.commit()
    
    return {"message": f"Vacature gesloten met reden: {reason}"}

@router.get("/stats")
def get_company_stats(
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get company statistics"""
    # Count vacancies by status
    total_vacancies = db.query(models.Vacancy).filter(
        models.Vacancy.owner_id == current_user.id
    ).count()
    
    live_vacancies = db.query(models.Vacancy).filter(
        models.Vacancy.owner_id == current_user.id,
        models.Vacancy.status == "live"
    ).count()
    
    draft_vacancies = db.query(models.Vacancy).filter(
        models.Vacancy.owner_id == current_user.id,
        models.Vacancy.status == "draft"
    ).count()
    
    filled_vacancies = db.query(models.Vacancy).filter(
        models.Vacancy.owner_id == current_user.id,
        models.Vacancy.status == "filled"
    ).count()
    
    # TODO: Add more advanced statistics
    # - Average time to fill
    # - Most popular skills
    # - Application rates
    
    return {
        "total_vacancies": total_vacancies,
        "live_vacancies": live_vacancies,
        "draft_vacancies": draft_vacancies,
        "filled_vacancies": filled_vacancies,
        "fill_rate": (filled_vacancies / total_vacancies * 100) if total_vacancies > 0 else 0,
        "active_rate": (live_vacancies / total_vacancies * 100) if total_vacancies > 0 else 0
    }

@router.get("/candidates/search", response_model=List[schemas.CandidateProfileOut])
def search_candidates_for_company(
    skill: str = None,
    location: str = None,
    availability: str = None,
    min_level: int = 1,
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Search candidates for company/recruiter"""
    query = db.query(models.CandidateProfile).join(models.User)
    
    # Filter by skill and level
    if skill:
        query = query.join(models.CandidateSkill).filter(
            models.CandidateSkill.skill_name.ilike(f"%{skill}%"),
            models.CandidateSkill.level >= min_level
        )
    
    # Filter by location
    if location:
        query = query.filter(
            models.CandidateProfile.location.ilike(f"%{location}%")
        )
    
    # Filter by availability
    if availability:
        query = query.filter(
            models.CandidateProfile.availability.ilike(f"%{availability}%")
        )
    
    # Only show profiles of active candidate users
    query = query.filter(
        models.User.is_active == True,
        models.User.role == models.UserRole.CANDIDATE
    )
    
    candidates = query.offset(skip).limit(limit).all()
    return candidates

@router.get("/dashboard")
def get_company_dashboard(
    current_user: models.User = Depends(dependencies.require_company_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get company dashboard data"""
    # Recent vacancies
    recent_vacancies = db.query(models.Vacancy).filter(
        models.Vacancy.owner_id == current_user.id
    ).order_by(models.Vacancy.created_at.desc()).limit(5).all()
    
    # Statistics
    stats = get_company_stats(current_user, db)
    
    # TODO: Add more dashboard data
    # - Recent candidate matches
    # - Application notifications
    # - Performance metrics
    
    return {
        "stats": stats,
        "recent_vacancies": [
            {
                "id": v.id,
                "title": v.title,
                "status": v.status,
                "created_at": v.created_at,
                "branch": v.branch,
                "location": v.location
            } for v in recent_vacancies
        ],
        "notifications": [],  # TODO: Implement notifications
        "quick_actions": [
            {"label": "Nieuwe vacature", "action": "create_vacancy"},
            {"label": "Zoek kandidaten", "action": "search_candidates"},
            {"label": "Bekijk statistieken", "action": "view_stats"}
        ]
    }