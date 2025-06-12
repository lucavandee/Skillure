from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str  # moet één van UserRole.values zijn

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True  # Updated for Pydantic v2

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CandidateSkillCreate(BaseModel):
    skill_name: str
    level: int = 1

class CandidateSkillOut(BaseModel):
    id: int
    skill_name: str
    level: int

    class Config:
        from_attributes = True

class CandidateProfileCreate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    github_url: Optional[str] = None
    kaggle_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    big_number: Optional[str] = None
    availability: Optional[str] = None
    skills: Optional[List[CandidateSkillCreate]] = []

class CandidateProfileUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    github_url: Optional[str] = None
    kaggle_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    big_number: Optional[str] = None
    availability: Optional[str] = None

class CandidateProfileOut(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    github_url: Optional[str] = None
    kaggle_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    big_number: Optional[str] = None
    availability: Optional[str] = None
    skills: List[CandidateSkillOut] = []

    class Config:
        from_attributes = True

class VacancyCreate(BaseModel):
    title: str
    description: str
    branch: str
    location: str
    duration: str
    rate_min: int
    rate_max: int
    big_number: Optional[str] = None
    availability: str

class VacancyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    branch: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    rate_min: Optional[int] = None
    rate_max: Optional[int] = None
    big_number: Optional[str] = None
    availability: Optional[str] = None
    status: Optional[str] = None

class VacancyOut(BaseModel):
    id: int
    title: str
    description: str
    branch: str
    location: str
    duration: str
    rate_min: int
    rate_max: int
    status: str
    owner_id: int
    big_number: Optional[str] = None
    availability: str
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# Additional schemas for API responses
class UserWithProfile(UserOut):
    candidate_profile: Optional[CandidateProfileOut] = None

class VacancyWithOwner(VacancyOut):
    owner: UserOut

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool