from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    experience_years: Optional[int] = None
    skills: List[str] = []
    languages: List[str] = []
    availability: Optional[str] = None
    remote_preference: bool = False
    hourly_rate_min: Optional[int] = None
    hourly_rate_max: Optional[int] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    big_number: Optional[str] = None
    
    @validator('hourly_rate_min', 'hourly_rate_max')
    def validate_rates(cls, v):
        if v is not None and v < 0:
            raise ValueError('Hourly rate must be positive')
        return v

class CandidateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    experience_years: Optional[int] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    availability: Optional[str] = None
    remote_preference: Optional[bool] = None
    hourly_rate_min: Optional[int] = None
    hourly_rate_max: Optional[int] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    is_available: Optional[bool] = None

class CandidateInDB(CandidateBase):
    id: int
    user_id: Optional[int] = None
    ai_profile_data: Dict[str, Any] = {}
    match_scores: Dict[str, Any] = {}
    big_number: Optional[str] = None
    kyc_verified: bool = False
    compliance_documents: List[str] = []
    is_active: bool = True
    is_available: bool = True
    last_activity: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Candidate(CandidateInDB):
    match_score: Optional[int] = None  # Calculated dynamically for search results

class CandidateSearch(BaseModel):
    query: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    availability: Optional[str] = None
    remote_only: Optional[bool] = None
    rate_min: Optional[int] = None
    rate_max: Optional[int] = None
    limit: int = 20
    offset: int = 0

class CandidateSearchResult(BaseModel):
    candidates: List[Candidate]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool