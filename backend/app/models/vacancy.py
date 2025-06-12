from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class VacancyType(enum.Enum):
    FULLTIME = "fulltime"
    PARTTIME = "parttime"
    FREELANCE = "freelance"
    CONTRACT = "contract"

class VacancyStatus(enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    EXPIRED = "expired"

class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Basic Info
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    company_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    
    # Job Details
    type = Column(SQLEnum(VacancyType), nullable=False)
    remote_allowed = Column(Boolean, default=False)
    experience_required = Column(String, nullable=True)  # "1-3 jaar", "5+ jaar", etc.
    
    # Skills & Requirements
    skills_required = Column(JSON, default=list)  # List of required skills
    skills_preferred = Column(JSON, default=list)  # List of preferred skills
    requirements = Column(JSON, default=list)  # List of requirements
    
    # Compensation
    hourly_rate_min = Column(Integer, nullable=True)
    hourly_rate_max = Column(Integer, nullable=True)
    currency = Column(String, default="EUR")
    
    # Duration & Availability
    duration = Column(String, nullable=True)  # "3 maanden", "6-12 maanden", etc.
    start_date = Column(String, nullable=True)  # "Direct", "Binnen 2 weken", etc.
    
    # Compliance
    branch = Column(String, nullable=True)  # "Tech", "Healthcare", "Finance"
    compliance_required = Column(JSON, default=list)  # List of compliance requirements
    big_required = Column(Boolean, default=False)  # BIG registration required
    kyc_required = Column(Boolean, default=False)  # KYC verification required
    
    # Status & Metadata
    status = Column(SQLEnum(VacancyStatus), default=VacancyStatus.DRAFT)
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    
    # AI/Matching Data
    ai_generated_tags = Column(JSON, default=list)  # AI-generated tags for better matching
    match_criteria = Column(JSON, default=dict)  # Stored matching criteria
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    # created_by = relationship("User", back_populates="vacancies")
    # applications = relationship("Application", back_populates="vacancy")
    
    def is_expired(self) -> bool:
        """Check if vacancy has expired"""
        if not self.expires_at:
            return False
        return self.expires_at < func.now()
    
    def get_match_score_for_candidate(self, candidate) -> int:
        """Calculate match score for a specific candidate"""
        if not self.skills_required:
            return 0
            
        return candidate.calculate_match_score(self.skills_required)