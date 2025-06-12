from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from ..models.vacancy import Vacancy, VacancyStatus
from ..schemas.vacancy import VacancyCreate, VacancyUpdate, VacancySearch

def get_vacancy(db: Session, vacancy_id: int) -> Optional[Vacancy]:
    """Get vacancy by ID"""
    return db.query(Vacancy).filter(Vacancy.id == vacancy_id).first()

def get_vacancies(db: Session, skip: int = 0, limit: int = 100) -> List[Vacancy]:
    """Get list of active vacancies with pagination"""
    return db.query(Vacancy).filter(
        Vacancy.status == VacancyStatus.ACTIVE
    ).offset(skip).limit(limit).all()

def get_vacancies_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Vacancy]:
    """Get vacancies created by specific user"""
    return db.query(Vacancy).filter(
        Vacancy.created_by_id == user_id
    ).offset(skip).limit(limit).all()

def create_vacancy(db: Session, vacancy: VacancyCreate, user_id: int) -> Vacancy:
    """Create new vacancy"""
    # Determine compliance requirements based on branch
    compliance_required = []
    if vacancy.big_required:
        compliance_required.append("BIG_registration")
    if vacancy.kyc_required:
        compliance_required.append("KYC_verification")
    
    db_vacancy = Vacancy(
        **vacancy.dict(),
        created_by_id=user_id,
        compliance_required=compliance_required
    )
    db.add(db_vacancy)
    db.commit()
    db.refresh(db_vacancy)
    return db_vacancy

def update_vacancy(db: Session, vacancy_id: int, vacancy_update: VacancyUpdate, user_id: int) -> Optional[Vacancy]:
    """Update vacancy (only by owner or admin)"""
    db_vacancy = get_vacancy(db, vacancy_id)
    if not db_vacancy:
        return None
    
    # Check ownership (this should be handled by permissions in the API layer)
    if db_vacancy.created_by_id != user_id:
        return None
    
    update_data = vacancy_update.dict(exclude_unset=True)
    
    # Update compliance requirements if needed
    if 'big_required' in update_data or 'kyc_required' in update_data:
        compliance_required = []
        big_required = update_data.get('big_required', db_vacancy.big_required)
        kyc_required = update_data.get('kyc_required', db_vacancy.kyc_required)
        
        if big_required:
            compliance_required.append("BIG_registration")
        if kyc_required:
            compliance_required.append("KYC_verification")
        
        update_data['compliance_required'] = compliance_required
    
    for field, value in update_data.items():
        setattr(db_vacancy, field, value)
    
    db.commit()
    db.refresh(db_vacancy)
    return db_vacancy

def delete_vacancy(db: Session, vacancy_id: int, user_id: int) -> bool:
    """Delete vacancy (only by owner or admin)"""
    db_vacancy = get_vacancy(db, vacancy_id)
    if not db_vacancy:
        return False
    
    # Check ownership (this should be handled by permissions in the API layer)
    if db_vacancy.created_by_id != user_id:
        return False
    
    db.delete(db_vacancy)
    db.commit()
    return True

def search_vacancies(db: Session, search_params: VacancySearch) -> Dict[str, Any]:
    """Search vacancies with filters"""
    query = db.query(Vacancy).filter(Vacancy.status == VacancyStatus.ACTIVE)
    
    # Text search
    if search_params.query:
        search_term = f"%{search_params.query}%"
        query = query.filter(
            or_(
                Vacancy.title.ilike(search_term),
                Vacancy.description.ilike(search_term),
                Vacancy.company_name.ilike(search_term),
                func.array_to_string(Vacancy.skills_required, ' ').ilike(search_term)
            )
        )
    
    # Skills filter
    if search_params.skills:
        for skill in search_params.skills:
            query = query.filter(
                or_(
                    Vacancy.skills_required.contains([skill]),
                    Vacancy.skills_preferred.contains([skill])
                )
            )
    
    # Location filter
    if search_params.location:
        query = query.filter(Vacancy.location.ilike(f"%{search_params.location}%"))
    
    # Type filter
    if search_params.type:
        query = query.filter(Vacancy.type == search_params.type)
    
    # Remote filter
    if search_params.remote_only:
        query = query.filter(Vacancy.remote_allowed == True)
    
    # Rate filter
    if search_params.rate_min is not None:
        query = query.filter(Vacancy.hourly_rate_min >= search_params.rate_min)
    if search_params.rate_max is not None:
        query = query.filter(Vacancy.hourly_rate_max <= search_params.rate_max)
    
    # Branch filter
    if search_params.branch:
        query = query.filter(Vacancy.branch == search_params.branch)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    vacancies = query.offset(search_params.offset).limit(search_params.limit).all()
    
    # Calculate pagination info
    page = (search_params.offset // search_params.limit) + 1
    has_next = search_params.offset + search_params.limit < total
    has_prev = search_params.offset > 0
    
    return {
        "vacancies": vacancies,
        "total": total,
        "page": page,
        "per_page": search_params.limit,
        "has_next": has_next,
        "has_prev": has_prev
    }

def increment_vacancy_views(db: Session, vacancy_id: int) -> Optional[Vacancy]:
    """Increment vacancy view count"""
    db_vacancy = get_vacancy(db, vacancy_id)
    if not db_vacancy:
        return None
    
    db_vacancy.views_count += 1
    db.commit()
    db.refresh(db_vacancy)
    return db_vacancy

def get_vacancy_statistics(db: Session, user_id: int) -> Dict[str, Any]:
    """Get vacancy statistics for a user"""
    total_vacancies = db.query(Vacancy).filter(Vacancy.created_by_id == user_id).count()
    active_vacancies = db.query(Vacancy).filter(
        Vacancy.created_by_id == user_id,
        Vacancy.status == VacancyStatus.ACTIVE
    ).count()
    
    total_views = db.query(func.sum(Vacancy.views_count)).filter(
        Vacancy.created_by_id == user_id
    ).scalar() or 0
    
    total_applications = db.query(func.sum(Vacancy.applications_count)).filter(
        Vacancy.created_by_id == user_id
    ).scalar() or 0
    
    return {
        "total_vacancies": total_vacancies,
        "active_vacancies": active_vacancies,
        "total_views": total_views,
        "total_applications": total_applications
    }