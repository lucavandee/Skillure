from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...database import get_db
from ...core.deps import get_current_active_user, require_permission
from ...crud import candidate as crud_candidate
from ...schemas.candidate import (
    Candidate, CandidateCreate, CandidateUpdate, CandidateSearch, CandidateSearchResult
)
from ...models.user import User

router = APIRouter()

@router.get("/", response_model=List[Candidate])
def read_candidates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_permission("read_candidates")),
    db: Session = Depends(get_db)
) -> Any:
    """Get all candidates"""
    candidates = crud_candidate.get_candidates(db, skip=skip, limit=limit)
    return candidates

@router.post("/search", response_model=CandidateSearchResult)
def search_candidates(
    search_params: CandidateSearch,
    current_user: User = Depends(require_permission("read_candidates")),
    db: Session = Depends(get_db)
) -> Any:
    """Search candidates with filters"""
    result = crud_candidate.search_candidates(db, search_params)
    return result

@router.get("/{candidate_id}", response_model=Candidate)
def read_candidate(
    candidate_id: int,
    current_user: User = Depends(require_permission("read_candidates")),
    db: Session = Depends(get_db)
) -> Any:
    """Get candidate by ID"""
    candidate = crud_candidate.get_candidate(db, candidate_id=candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    return candidate

@router.post("/", response_model=Candidate, status_code=status.HTTP_201_CREATED)
def create_candidate(
    candidate_in: CandidateCreate,
    current_user: User = Depends(require_permission("write_candidates")),
    db: Session = Depends(get_db)
) -> Any:
    """Create new candidate"""
    # Check if candidate with this email already exists
    existing_candidate = crud_candidate.get_candidate_by_email(db, email=candidate_in.email)
    if existing_candidate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate with this email already exists"
        )
    
    candidate = crud_candidate.create_candidate(db, candidate=candidate_in)
    return candidate

@router.put("/{candidate_id}", response_model=Candidate)
def update_candidate(
    candidate_id: int,
    candidate_in: CandidateUpdate,
    current_user: User = Depends(require_permission("write_candidates")),
    db: Session = Depends(get_db)
) -> Any:
    """Update candidate"""
    candidate = crud_candidate.update_candidate(
        db, candidate_id=candidate_id, candidate_update=candidate_in
    )
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    return candidate

@router.delete("/{candidate_id}")
def delete_candidate(
    candidate_id: int,
    current_user: User = Depends(require_permission("delete_candidates")),
    db: Session = Depends(get_db)
) -> Any:
    """Delete candidate"""
    success = crud_candidate.delete_candidate(db, candidate_id=candidate_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    return {"message": "Candidate deleted successfully"}

@router.get("/skills/{skills}", response_model=List[Candidate])
def get_candidates_by_skills(
    skills: str,  # Comma-separated skills
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_permission("read_candidates")),
    db: Session = Depends(get_db)
) -> Any:
    """Get candidates by skills"""
    skills_list = [skill.strip() for skill in skills.split(",")]
    candidates = crud_candidate.get_candidates_by_skills(db, skills=skills_list, limit=limit)
    return candidates

@router.post("/{candidate_id}/match-scores")
def update_candidate_match_scores(
    candidate_id: int,
    match_scores: dict,
    current_user: User = Depends(require_permission("write_candidates")),
    db: Session = Depends(get_db)
) -> Any:
    """Update candidate's cached match scores"""
    candidate = crud_candidate.update_candidate_match_scores(
        db, candidate_id=candidate_id, match_scores=match_scores
    )
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    return {"message": "Match scores updated successfully"}