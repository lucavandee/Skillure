from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.vacancy import VacancyType, VacancyStatus

class VacancyBase(BaseModel):
    title: str
    description: str
    company_name: str
    location: str
    type: VacancyType
    remote_allowed: bool = False
    experience_required: Optional[str] = None
    skills_required: List[str] = []
    skills_preferred: List[str] = []
    requirements: List[str] = []
    hourly_rate_min: Optional[int] = None
    hourly_rate_max: Optional[int] = None
    currency: str = "EUR"
    duration: Optional[str] = None
    start_date: Optional[str] = None
    branch: Optional[str] = None
    big_required: bool = False
    kyc_required: bool = False

class VacancyCreate(VacancyBase):
    @validator('hourly_rate_min', 'hourly_rate_max')
    def validate_rates(cls, v):
        if v is not None and v < 0:
            raise ValueError('Hourly rate must be positive')
        return v
    
    @validator('title')
    def validate_title(cls, v):
        if len(v.strip()) < 5:
            raise ValueError('Title must be at least 5 characters long')
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if len(v.strip()) < 50:
            raise ValueError('Description must be at least 50 characters long')
        return v.strip()

class VacancyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    type: Optional[VacancyType] = None
    remote_allowed: Optional[bool] = None
    experience_required: Optional[str] = None
    skills_required: Optional[List[str]] = None
    skills_preferred: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    hourly_rate_min: Optional[int] = None
    hourly_rate_max: Optional[int] = None
    duration: Optional[str] = None
    start_date: Optional[str] = None
    branch: Optional[str] = None
    big_required: Optional[bool] = None
    kyc_required: Optional[bool] = None
    status: Optional[VacancyStatus] = None

class VacancyInDB(VacancyBase):
    id: int
    created_by_id: int
    compliance_required: List[str] = []
    status: VacancyStatus
    views_count: int = 0
    applications_count: int = 0
    ai_generated_tags: List[str] = []
    match_criteria: Dict[str, Any] = {}
    created_at: datetime
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Vacancy(VacancyInDB):
    pass

class VacancySearch(BaseModel):
    query: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    type: Optional[VacancyType] = None
    remote_only: Optional[bool] = None
    rate_min: Optional[int] = None
    rate_max: Optional[int] = None
    branch: Optional[str] = None
    limit: int = 20
    offset: int = 0

class VacancySearchResult(BaseModel):
    vacancies: List[Vacancy]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

class VacancyWithMatches(Vacancy):
    matched_candidates: List[Dict[str, Any]] = []
    match_count: int = 0