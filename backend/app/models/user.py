from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class UserRole(enum.Enum):
    ADMIN = "admin"
    RECRUITER = "recruiter"
    CANDIDATE = "candidate"
    COMPANY = "company"

class UserStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.RECRUITER, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.PENDING, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    phone = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships will be added here as we create more models
    # candidates = relationship("Candidate", back_populates="user")
    # vacancies = relationship("Vacancy", back_populates="created_by")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission based on role"""
        permissions = {
            UserRole.ADMIN: [
                "read_all_users", "write_all_users", "delete_users",
                "read_all_candidates", "write_all_candidates", "delete_candidates",
                "read_all_vacancies", "write_all_vacancies", "delete_vacancies",
                "manage_system", "view_analytics"
            ],
            UserRole.RECRUITER: [
                "read_candidates", "write_candidates", "contact_candidates",
                "read_vacancies", "write_vacancies", "delete_own_vacancies",
                "view_own_analytics"
            ],
            UserRole.COMPANY: [
                "read_candidates", "contact_candidates",
                "read_vacancies", "write_vacancies", "delete_own_vacancies",
                "view_own_analytics"
            ],
            UserRole.CANDIDATE: [
                "read_own_profile", "write_own_profile",
                "read_vacancies", "apply_to_vacancies"
            ]
        }
        
        return permission in permissions.get(self.role, [])