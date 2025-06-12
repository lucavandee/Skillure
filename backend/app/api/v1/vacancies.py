from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...database import get_db
from ...core.deps import get_current_active_user, require_permission
from ...crud import vacancy as crud_vacancy
from ...schemas.vacancy import (
    Vacancy, VacancyCreate, VacancyUpdate, VacancySearch, VacancySearchResult
)
from ...models.user import User

router = APIRouter()

@router.get("/", response_model=List[Vacancy])
def read_vacancies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(require_permission("read_vacancies")),
    db: Session = Depends(get_db)
) -> Any:
    """Get all active vacancies"""
    vacancies = crud_vacancy.get_vacancies(db, skip=skip, limit=limit)
    return vacancies

@router.get("/my", response_model=List[Vacancy])
def read_my_vacancies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get current user's vacancies"""
    vacancies = crud_vacancy.get_vacancies_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return vacancies

@router.post("/search", response_model=VacancySearchResult)
def search_vacancies(
    search_params: VacancySearch,
    current_user: User = Depends(require_permission("read_vacancies")),
    db: Session = Depends(get_db)
) -> Any:
    """Search vacancies with filters"""
    result = crud_vacancy.search_vacancies(db, search_params)
    return result

@router.get("/{vacancy_id}", response_model=Vacancy)
def read_vacancy(
    vacancy_id: int,
    current_user: User = Depends(require_permission("read_vacancies")),
    db: Session = Depends(get_db)
) -> Any:
    """Get vacancy by ID"""
    vacancy = crud_vacancy.get_vacancy(db, vacancy_id=vacancy_id)
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacancy not found"
        )
    
    # Increment view count
    crud_vacancy.increment_vacancy_views(db, vacancy_id=vacancy_id)
    
    return vacancy

@router.post("/", response_model=Vacancy, status_code=status.HTTP_201_CREATED)
def create_vacancy(
    vacancy_in: VacancyCreate,
    current_user: User = Depends(require_permission("write_vacancies")),
    db: Session = Depends(get_db)
) -> Any:
    """Create new vacancy"""
    vacancy = crud_vacancy.create_vacancy(db, vacancy=vacancy_in, user_id=current_user.id)
    return vacancy

@router.put("/{vacancy_id}", response_model=Vacancy)
def update_vacancy(
    vacancy_id: int,
    vacancy_in: VacancyUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update vacancy"""
    # Check if user owns the vacancy or has admin permissions
    vacancy = crud_vacancy.get_vacancy(db, vacancy_id=vacancy_id)
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacancy not found"
        )
    
    if vacancy.created_by_id != current_user.id and not current_user.has_permission("write_all_vacancies"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_vacancy = crud_vacancy.update_vacancy(
        db, vacancy_id=vacancy_id, vacancy_update=vacancy_in, user_id=current_user.id
    )
    return updated_vacancy

@router.delete("/{vacancy_id}")
def delete_vacancy(
    vacancy_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Delete vacancy"""
    # Check if user owns the vacancy or has admin permissions
    vacancy = crud_vacancy.get_vacancy(db, vacancy_id=vacancy_id)
    if not vacancy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacancy not found"
        )
    
    if vacancy.created_by_id != current_user.id and not current_user.has_permission("delete_vacancies"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    success = crud_vacancy.delete_vacancy(db, vacancy_id=vacancy_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vacancy not found"
        )
    return {"message": "Vacancy deleted successfully"}

@router.get("/statistics/my")
def get_my_vacancy_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get current user's vacancy statistics"""
    stats = crud_vacancy.get_vacancy_statistics(db, user_id=current_user.id)
    return stats