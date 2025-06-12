from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Optional link to user account
    
    # Basic Info
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    
    # Professional Info
    title = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    experience_years = Column(Integer, nullable=True)
    skills = Column(JSON, default=list)  # List of skills
    languages = Column(JSON, default=list)  # List of languages
    
    # Availability
    availability = Column(String, nullable=True)  # "Direct", "Binnen 2 weken", etc.
    remote_preference = Column(Boolean, default=False)
    hourly_rate_min = Column(Integer, nullable=True)
    hourly_rate_max = Column(Integer, nullable=True)
    
    # External Profiles
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    
    # AI/Matching Data
    ai_profile_data = Column(JSON, default=dict)  # Scraped data from GitHub, etc.
    match_scores = Column(JSON, default=dict)  # Cached match scores for vacancies
    
    # Compliance (for healthcare/finance)
    big_number = Column(String, nullable=True)  # BIG registration for healthcare
    kyc_verified = Column(Boolean, default=False)  # KYC verification for finance
    compliance_documents = Column(JSON, default=list)  # List of uploaded documents
    
    # Status
    is_active = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    last_activity = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # user = relationship("User", back_populates="candidates")
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def calculate_match_score(self, vacancy_skills: list) -> int:
        """Calculate match score based on skills overlap"""
        if not self.skills or not vacancy_skills:
            return 0
            
        candidate_skills = set(skill.lower() for skill in self.skills)
        required_skills = set(skill.lower() for skill in vacancy_skills)
        
        if not required_skills:
            return 0
            
        overlap = len(candidate_skills.intersection(required_skills))
        score = int((overlap / len(required_skills)) * 100)
        
        return min(score, 100)