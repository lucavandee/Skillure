from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy_utils import ChoiceType
from .database import Base
import datetime

class UserRole:
    ADMIN = "admin"
    RECRUITER = "recruiter"
    COMPANY = "company"
    CANDIDATE = "candidate"

    choices = [
        (ADMIN, "Admin"),
        (RECRUITER, "Recruiter"),
        (COMPANY, "Company"),
        (CANDIDATE, "Candidate"),
    ]

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(ChoiceType(UserRole.choices), default=UserRole.CANDIDATE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relaties
    vacancies = relationship("Vacancy", back_populates="owner")  # voor recruiters/bedrijven
    # Kandidaten-profiel (one-to-one)
    candidate_profile = relationship("CandidateProfile", uselist=False, back_populates="user")


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    github_url = Column(String, nullable=True)
    kaggle_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    # Extra velden: BIG-nummer, KYC-documentpath 
    big_number = Column(String, nullable=True)
    kyc_file_path = Column(String, nullable=True)

    # Relatie naar skills
    skills = relationship("CandidateSkill", back_populates="profile")
    user = relationship("User", back_populates="candidate_profile")
    applications = relationship("CandidateApplication", back_populates="candidate")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("candidate_profiles.id"))
    skill_name = Column(String, nullable=False)
    level = Column(Integer, default=1)  # schaal 1-5

    profile = relationship("CandidateProfile", back_populates="skills")


class Vacancy(Base):
    __tablename__ = "vacancies"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    branch = Column(String, nullable=False)
    location = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    rate_min = Column(Integer, nullable=False)
    rate_max = Column(Integer, nullable=False)
    big_number = Column(String, nullable=True)   # alleen voor Healthcare
    kyc_file_path = Column(String, nullable=True) # alleen voor Finance
    availability = Column(String, nullable=False)
    status = Column(String, default="draft")  # draft, pending_approval, live, filled, archived
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="vacancies")
    applications = relationship("CandidateApplication", back_populates="vacancy")


class CandidateApplication(Base):
    __tablename__ = "candidate_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(Integer, ForeignKey("vacancies.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    status = Column(String, default="ingediend")  # ingediend, screening, interview, aanbieding, afgewezen, geplaatst
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)
    match_score = Column(Integer, default=0)  # AI-calculated match percentage

    vacancy = relationship("Vacancy", back_populates="applications")
    candidate = relationship("CandidateProfile", back_populates="applications")