from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from ..models.candidate import Candidate
from ..schemas.candidate import CandidateCreate, CandidateUpdate, CandidateSearch

def get_candidate(db: Session, candidate_id: int) -> Optional[Candidate]:
    """Get candidate by ID"""
    return db.query(Candidate).filter(Candidate.id == candidate_id).first()

def get_candidate_by_email(db: Session, email: str) -> Optional[Candidate]:
    """Get candidate by email"""
    return db.query(Candidate).filter(Candidate.email == email).first()

def get_candidates(db: Session, skip: int = 0, limit: int = 100) -> List[Candidate]:
    """Get list of candidates with pagination"""
    return db.query(Candidate).filter(Candidate.is_active == True).offset(skip).limit(limit).all()

def create_candidate(db: Session, candidate: CandidateCreate) -> Candidate:
    """Create new candidate"""
    db_candidate = Candidate(**candidate.dict())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def update_candidate(db: Session, candidate_id: int, candidate_update: CandidateUpdate) -> Optional[Candidate]:
    """Update candidate"""
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return None
    
    update_data = candidate_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_candidate, field, value)
    
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def delete_candidate(db: Session, candidate_id: int) -> bool:
    """Soft delete candidate"""
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return False
    
    db_candidate.is_active = False
    db.commit()
    return True

def search_candidates(db: Session, search_params: CandidateSearch) -> Dict[str, Any]:
    """Search candidates with filters"""
    query = db.query(Candidate).filter(Candidate.is_active == True)
    
    # Text search
    if search_params.query:
        search_term = f"%{search_params.query}%"
        query = query.filter(
            or_(
                Candidate.first_name.ilike(search_term),
                Candidate.last_name.ilike(search_term),
                Candidate.title.ilike(search_term),
                Candidate.summary.ilike(search_term),
                func.array_to_string(Candidate.skills, ' ').ilike(search_term)
            )
        )
    
    # Skills filter
    if search_params.skills:
        for skill in search_params.skills:
            query = query.filter(Candidate.skills.contains([skill]))
    
    # Location filter
    if search_params.location:
        query = query.filter(Candidate.location.ilike(f"%{search_params.location}%"))
    
    # Experience filter
    if search_params.experience_min is not None:
        query = query.filter(Candidate.experience_years >= search_params.experience_min)
    if search_params.experience_max is not None:
        query = query.filter(Candidate.experience_years <= search_params.experience_max)
    
    # Availability filter
    if search_params.availability:
        query = query.filter(Candidate.availability == search_params.availability)
    
    # Remote preference filter
    if search_params.remote_only:
        query = query.filter(Candidate.remote_preference == True)
    
    # Rate filter
    if search_params.rate_min is not None:
        query = query.filter(Candidate.hourly_rate_min >= search_params.rate_min)
    if search_params.rate_max is not None:
        query = query.filter(Candidate.hourly_rate_max <= search_params.rate_max)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    candidates = query.offset(search_params.offset).limit(search_params.limit).all()
    
    # Calculate pagination info
    page = (search_params.offset // search_params.limit) + 1
    has_next = search_params.offset + search_params.limit < total
    has_prev = search_params.offset > 0
    
    return {
        "candidates": candidates,
        "total": total,
        "page": page,
        "per_page": search_params.limit,
        "has_next": has_next,
        "has_prev": has_prev
    }

def get_candidates_by_skills(db: Session, skills: List[str], limit: int = 50) -> List[Candidate]:
    """Get candidates that match any of the given skills"""
    query = db.query(Candidate).filter(Candidate.is_active == True)
    
    for skill in skills:
        query = query.filter(Candidate.skills.contains([skill]))
    
    return query.limit(limit).all()

def update_candidate_match_scores(db: Session, candidate_id: int, match_scores: Dict[str, int]) -> Optional[Candidate]:
    """Update candidate's cached match scores"""
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return None
    
    db_candidate.match_scores = match_scores
    db.commit()
    db.refresh(db_candidate)
    return db_candidate