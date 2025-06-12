from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
from .database import SessionLocal
import os
import datetime
from typing import Optional

# Security setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

def get_db():
    """Database dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[int] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_delta)
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """Authenticate user with email and password"""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(user_id=user_id, role=payload.get("role"))
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(required_role: str):
    """Dependency factory to require specific role"""
    def role_checker(current_user: models.User = Depends(get_current_active_user)) -> models.User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Operation not permitted"
            )
        return current_user
    return role_checker

def require_admin(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    """Require admin role"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_recruiter_or_admin(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    """Require recruiter or admin role"""
    if current_user.role not in [models.UserRole.RECRUITER, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter or admin access required"
        )
    return current_user

def require_company_or_admin(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    """Require company or admin role"""
    if current_user.role not in [models.UserRole.COMPANY, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company or admin access required"
        )
    return current_user

def can_access_vacancy(vacancy: models.Vacancy, current_user: models.User) -> bool:
    """Check if user can access a specific vacancy"""
    # Admin can access all
    if current_user.role == models.UserRole.ADMIN:
        return True
    
    # Owner can access their own
    if vacancy.owner_id == current_user.id:
        return True
    
    # Recruiters and companies can view live vacancies
    if (current_user.role in [models.UserRole.RECRUITER, models.UserRole.COMPANY] 
        and vacancy.status == "live"):
        return True
    
    return False

def can_edit_vacancy(vacancy: models.Vacancy, current_user: models.User) -> bool:
    """Check if user can edit a specific vacancy"""
    # Admin can edit all
    if current_user.role == models.UserRole.ADMIN:
        return True
    
    # Owner can edit their own
    if vacancy.owner_id == current_user.id:
        return True
    
    return False

def validate_branch_compliance(branch: str, big_number: Optional[str], kyc_file_path: Optional[str]) -> bool:
    """Validate compliance requirements based on branch"""
    if branch.lower() == "healthcare":
        return big_number is not None and len(big_number.strip()) > 0
    elif branch.lower() == "finance":
        return kyc_file_path is not None and len(kyc_file_path.strip()) > 0
    return True  # No special requirements for other branches

# Pagination helper
def get_pagination_params(page: int = 1, per_page: int = 20):
    """Get pagination parameters"""
    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20
    
    skip = (page - 1) * per_page
    return skip, per_page

def create_paginated_response(items: list, total: int, page: int, per_page: int) -> schemas.PaginatedResponse:
    """Create paginated response"""
    has_next = (page * per_page) < total
    has_prev = page > 1
    
    return schemas.PaginatedResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        has_next=has_next,
        has_prev=has_prev
    )