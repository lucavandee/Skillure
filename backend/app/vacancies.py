from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas, dependencies
from .database import SessionLocal
import datetime

router = APIRouter(prefix="/vacancies", tags=["vacancies"])

@router.post("/", response_model=schemas.VacancyOut)
def create_vacancy(
    vacancy_in: schemas.VacancyCreate,
    current_user: models.User = Depends(dependencies.require_recruiter_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Create a new vacancy"""
    # Validate compliance requirements
    if not dependencies.validate_branch_compliance(
        vacancy_in.branch, vacancy_in.big_number, None
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required compliance information for this branch"
        )
    
    vacancy = models.Vacancy(
        owner_id=current_user.id,
        title=vacancy_in.title,
        description=vacancy_in.description,
        branch=vacancy_in.branch,
        location=vacancy_in.location,
        duration=vacancy_in.duration,
        rate_min=vacancy_in.rate_min,
        rate_max=vacancy_in.rate_max,
        big_number=vacancy_in.big_number,
        availability=vacancy_in.availability,
        status="draft"  # Always start as draft
    )
    
    db.add(vacancy)
    db.commit()
    db.refresh(vacancy)
    return vacancy

@router.get("/", response_model=List[schemas.VacancyOut])
def read_vacancies(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    branch_filter: Optional[str] = Query(None, description="Filter by branch"),
    location_filter: Optional[str] = Query(None, description="Filter by location"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Get vacancies with optional filters"""
    query = db.query(models.Vacancy)
    
    # Apply role-based filtering
    if current_user.role == models.UserRole.ADMIN:
        # Admin can see all vacancies
        pass
    elif current_user.role in [models.UserRole.RECRUITER, models.UserRole.COMPANY]:
        # Recruiters/Companies can see live vacancies + their own
        query = query.filter(
            (models.Vacancy.status == "live") | 
            (models.Vacancy.owner_id == current_user.id)
        )
    else:
        # Candidates can only see live vacancies
        query = query.filter(models.Vacancy.status == "live")
    
    # Apply filters
    if status_filter:
        query = query.filter(models.Vacancy.status == status_filter)
    
    if branch_filter:
        query = query.filter(models.Vacancy.branch.ilike(f"%{branch_filter}%"))
    
    if location_filter:
        query = query.filter(models.Vacancy.location.ilike(f"%{location_filter}%"))
    
    # Order by creation date (newest first)
    query = query.order_by(models.Vacancy.created_at.desc())
    
    vacancies = query.offset(skip).limit(limit).all()
    return vacancies

@router.get("/my", response_model=List[schemas.VacancyOut])
def read_my_vacancies(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: models.User = Depends(dependencies.require_recruiter_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get current user's vacancies"""
    query = db.query(models.Vacancy).filter(
        models.Vacancy.owner_id == current_user.id
    )
    
    if status_filter:
        query = query.filter(models.Vacancy.status == status_filter)
    
    query = query.order_by(models.Vacancy.created_at.desc())
    vacancies = query.offset(skip).limit(limit).all()
    return vacancies

@router.get("/{vacancy_id}", response_model=schemas.VacancyOut)
def read_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Get vacancy by ID"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    # Check access permissions
    if not dependencies.can_access_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot deze vacature"
        )
    
    return vacancy

@router.put("/{vacancy_id}", response_model=schemas.VacancyOut)
def update_vacancy(
    vacancy_id: int,
    updates: schemas.VacancyUpdate,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Update vacancy"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    # Check edit permissions
    if not dependencies.can_edit_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang om deze vacature te bewerken"
        )
    
    # Update fields
    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vacancy, field, value)
    
    # Reset to pending approval if content changed and was live
    content_fields = ['title', 'description', 'branch', 'location', 'duration', 'rate_min', 'rate_max']
    if any(field in update_data for field in content_fields) and vacancy.status == "live":
        vacancy.status = "pending_approval"
    
    # Update timestamp
    vacancy.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(vacancy)
    return vacancy

@router.delete("/{vacancy_id}")
def delete_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Delete vacancy"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    # Check edit permissions
    if not dependencies.can_edit_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang om deze vacature te verwijderen"
        )
    
    db.delete(vacancy)
    db.commit()
    
    return {"message": "Vacature succesvol verwijderd"}

# Lifecycle Management Endpoints

@router.patch("/{vacancy_id}/status", response_model=schemas.VacancyOut)
def change_vacancy_status(
    vacancy_id: int,
    status_update: dict,  # {"status": "live" / "filled" / "archived" / "paused"}
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Change vacancy status"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    # Check edit permissions
    if not dependencies.can_edit_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang om deze vacature te bewerken"
        )
    
    new_status = status_update.get("status")
    valid_statuses = ["draft", "pending_approval", "live", "paused", "filled", "archived", "cancelled"]
    
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ongeldige status. Moet een van zijn: {valid_statuses}"
        )
    
    # Validate status transitions
    current_status = vacancy.status
    valid_transitions = {
        "draft": ["pending_approval", "archived"],
        "pending_approval": ["live", "draft", "archived"],
        "live": ["paused", "filled", "archived", "cancelled"],
        "paused": ["live", "archived", "cancelled"],
        "filled": ["archived"],
        "archived": [],  # Final state
        "cancelled": ["archived"]  # Final state
    }
    
    if new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ongeldige status overgang van '{current_status}' naar '{new_status}'"
        )
    
    # Additional validation for going live
    if new_status == "live":
        if not dependencies.validate_branch_compliance(
            vacancy.branch, vacancy.big_number, vacancy.kyc_file_path
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Compliance vereisten niet volledig voor deze branche"
            )
    
    vacancy.status = new_status
    vacancy.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(vacancy)
    
    return vacancy

@router.post("/{vacancy_id}/publish", response_model=schemas.VacancyOut)
def publish_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Publish vacancy (draft -> pending_approval -> live)"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    if not dependencies.can_edit_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang om deze vacature te publiceren"
        )
    
    if vacancy.status not in ["draft", "pending_approval"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alleen concept of goedkeurings-vacatures kunnen gepubliceerd worden"
        )
    
    # Validate compliance requirements
    if not dependencies.validate_branch_compliance(
        vacancy.branch, vacancy.big_number, vacancy.kyc_file_path
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Compliance vereisten niet volledig voor deze branche"
        )
    
    # Auto-approve for now (in production, this might require admin approval)
    vacancy.status = "live"
    vacancy.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(vacancy)
    
    return vacancy

@router.post("/{vacancy_id}/pause", response_model=schemas.VacancyOut)
def pause_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Pause a live vacancy"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    if not dependencies.can_edit_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang om deze vacature te pauzeren"
        )
    
    if vacancy.status != "live":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alleen actieve vacatures kunnen gepauzeerd worden"
        )
    
    vacancy.status = "paused"
    vacancy.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(vacancy)
    
    return vacancy

@router.post("/{vacancy_id}/resume", response_model=schemas.VacancyOut)
def resume_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Resume a paused vacancy"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    if not dependencies.can_edit_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang om deze vacature te hervatten"
        )
    
    if vacancy.status != "paused":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alleen gepauzeerde vacatures kunnen hervat worden"
        )
    
    vacancy.status = "live"
    vacancy.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(vacancy)
    
    return vacancy

@router.post("/{vacancy_id}/close", response_model=schemas.VacancyOut)
def close_vacancy(
    vacancy_id: int,
    reason: str = "filled",  # filled, cancelled
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Close a vacancy with reason"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    if not dependencies.can_edit_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang om deze vacature te sluiten"
        )
    
    valid_reasons = ["filled", "cancelled"]
    if reason not in valid_reasons:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ongeldige reden. Moet een van zijn: {valid_reasons}"
        )
    
    if vacancy.status not in ["live", "paused"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Alleen actieve of gepauzeerde vacatures kunnen gesloten worden"
        )
    
    vacancy.status = reason
    vacancy.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(vacancy)
    
    return vacancy

@router.post("/{vacancy_id}/archive", response_model=schemas.VacancyOut)
def archive_vacancy(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Archive a vacancy (final state)"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    if not dependencies.can_edit_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang om deze vacature te archiveren"
        )
    
    if vacancy.status == "archived":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vacature is al gearchiveerd"
        )
    
    vacancy.status = "archived"
    vacancy.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(vacancy)
    
    return vacancy

# Analytics and Statistics

@router.get("/{vacancy_id}/stats")
def get_vacancy_stats(
    vacancy_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Get vacancy statistics"""
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacature niet gevonden"
        )
    
    if not dependencies.can_access_vacancy(vacancy, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Geen toegang tot deze vacature"
        )
    
    # Calculate days since creation
    days_active = (datetime.datetime.utcnow() - vacancy.created_at).days
    
    # TODO: Implement actual metrics tracking
    # For now, return mock data
    return {
        "vacancy_id": vacancy.id,
        "days_active": days_active,
        "views": 0,  # TODO: Implement view tracking
        "applications": 0,  # TODO: Implement application tracking
        "matches": 0,  # TODO: Implement AI matching
        "status": vacancy.status,
        "created_at": vacancy.created_at,
        "updated_at": vacancy.updated_at
    }

@router.get("/stats/summary")
def get_vacancy_summary_stats(
    current_user: models.User = Depends(dependencies.require_recruiter_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get summary statistics for user's vacancies"""
    # Count vacancies by status
    stats = {}
    statuses = ["draft", "pending_approval", "live", "paused", "filled", "archived", "cancelled"]
    
    for status in statuses:
        count = db.query(models.Vacancy).filter(
            models.Vacancy.owner_id == current_user.id,
            models.Vacancy.status == status
        ).count()
        stats[f"{status}_count"] = count
    
    # Total vacancies
    total = db.query(models.Vacancy).filter(
        models.Vacancy.owner_id == current_user.id
    ).count()
    stats["total_count"] = total
    
    # Calculate rates
    if total > 0:
        stats["fill_rate"] = (stats["filled_count"] / total) * 100
        stats["active_rate"] = (stats["live_count"] / total) * 100
    else:
        stats["fill_rate"] = 0
        stats["active_rate"] = 0
    
    return stats

# Search and Filtering

@router.get("/search/advanced", response_model=List[schemas.VacancyOut])
def advanced_vacancy_search(
    title: Optional[str] = Query(None, description="Search in title"),
    description: Optional[str] = Query(None, description="Search in description"),
    branch: Optional[str] = Query(None, description="Filter by branch"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_rate: Optional[int] = Query(None, description="Minimum hourly rate"),
    max_rate: Optional[int] = Query(None, description="Maximum hourly rate"),
    status: Optional[str] = Query(None, description="Filter by status"),
    availability: Optional[str] = Query(None, description="Filter by availability"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Advanced vacancy search with multiple filters"""
    query = db.query(models.Vacancy)
    
    # Apply role-based filtering
    if current_user.role != models.UserRole.ADMIN:
        if current_user.role in [models.UserRole.RECRUITER, models.UserRole.COMPANY]:
            query = query.filter(
                (models.Vacancy.status == "live") | 
                (models.Vacancy.owner_id == current_user.id)
            )
        else:
            query = query.filter(models.Vacancy.status == "live")
    
    # Apply search filters
    if title:
        query = query.filter(models.Vacancy.title.ilike(f"%{title}%"))
    
    if description:
        query = query.filter(models.Vacancy.description.ilike(f"%{description}%"))
    
    if branch:
        query = query.filter(models.Vacancy.branch.ilike(f"%{branch}%"))
    
    if location:
        query = query.filter(models.Vacancy.location.ilike(f"%{location}%"))
    
    if min_rate:
        query = query.filter(models.Vacancy.rate_min >= min_rate)
    
    if max_rate:
        query = query.filter(models.Vacancy.rate_max <= max_rate)
    
    if status:
        query = query.filter(models.Vacancy.status == status)
    
    if availability:
        query = query.filter(models.Vacancy.availability.ilike(f"%{availability}%"))
    
    # Order by relevance (for now, just by creation date)
    query = query.order_by(models.Vacancy.created_at.desc())
    
    vacancies = query.offset(skip).limit(limit).all()
    return vacancies