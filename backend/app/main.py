from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
import os
import logging

from . import models, schemas, dependencies
from .database import engine, SessionLocal
from .auth import router as auth_router
from .candidates import router as candidates_router
from .companies import router as companies_router
from .vacancies import router as vacancies_router
from .ats import router as ats_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Skillure API",
    description="AI-powered recruitment platform API with role-based access control",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "https://animated-travesseiro-c84a41.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
            "body": exc.body,
        },
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request, exc):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Database error occurred"},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )

# Mount all routers
app.include_router(auth_router)
app.include_router(candidates_router)
app.include_router(companies_router)
app.include_router(vacancies_router)
app.include_router(ats_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Skillure API is running",
        "version": "1.0.0",
        "database": "connected"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Skillure API",
        "description": "AI-powered recruitment platform",
        "version": "1.0.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_check": "/health"
    }

# Admin endpoints
@app.get("/admin/users", response_model=list[schemas.UserOut])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(dependencies.require_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get all users (admin only)"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.get("/admin/stats")
def get_admin_stats(
    current_user: models.User = Depends(dependencies.require_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get platform statistics (admin only)"""
    total_users = db.query(models.User).count()
    total_candidates = db.query(models.User).filter(
        models.User.role == models.UserRole.CANDIDATE
    ).count()
    total_recruiters = db.query(models.User).filter(
        models.User.role == models.UserRole.RECRUITER
    ).count()
    total_companies = db.query(models.User).filter(
        models.User.role == models.UserRole.COMPANY
    ).count()
    total_vacancies = db.query(models.Vacancy).count()
    live_vacancies = db.query(models.Vacancy).filter(
        models.Vacancy.status == "live"
    ).count()
    total_applications = db.query(models.CandidateApplication).count()
    
    return {
        "total_users": total_users,
        "total_candidates": total_candidates,
        "total_recruiters": total_recruiters,
        "total_companies": total_companies,
        "total_vacancies": total_vacancies,
        "live_vacancies": live_vacancies,
        "total_applications": total_applications,
        "platform_health": "excellent"
    }

# User profile endpoints
@app.get("/users/{user_id}", response_model=schemas.UserWithProfile)
def get_user_profile(
    user_id: int,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Get user profile by ID"""
    # Users can only access their own profile unless they're admin
    if user_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

# File upload endpoint for KYC documents
@app.post("/upload/kyc")
async def upload_kyc_document(
    file: UploadFile = File(...),
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Upload KYC document for compliance"""
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF, JPEG, and PNG files are allowed."
        )
    
    # Validate file size (max 10MB)
    content = await file.read()
    max_size = 10 * 1024 * 1024  # 10MB
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 10MB."
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/kyc"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    import uuid
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    unique_filename = f"{current_user.id}_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    # Update user's candidate profile with file path if exists
    if current_user.role == models.UserRole.CANDIDATE:
        profile = db.query(models.CandidateProfile).filter(
            models.CandidateProfile.user_id == current_user.id
        ).first()
        
        if profile:
            profile.kyc_file_path = file_path
            db.commit()
    
    return {
        "message": "File uploaded successfully",
        "file_path": file_path,
        "filename": unique_filename
    }

# Platform statistics endpoint
@app.get("/stats/public")
def get_public_stats(db: Session = Depends(dependencies.get_db)):
    """Get public platform statistics"""
    live_vacancies = db.query(models.Vacancy).filter(
        models.Vacancy.status == "live"
    ).count()
    
    active_candidates = db.query(models.User).filter(
        models.User.role == models.UserRole.CANDIDATE,
        models.User.is_active == True
    ).count()
    
    return {
        "live_vacancies": live_vacancies,
        "active_candidates": active_candidates,
        "platform_status": "operational"
    }

# Search endpoint for all entities
@app.get("/search")
def global_search(
    q: str,
    entity_type: str = "all",  # all, vacancies, candidates
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(dependencies.get_current_active_user),
    db: Session = Depends(dependencies.get_db)
):
    """Global search across platform"""
    results = {"vacancies": [], "candidates": []}
    
    if entity_type in ["all", "vacancies"]:
        # Search vacancies
        vacancy_query = db.query(models.Vacancy)
        
        # Apply role-based filtering
        if current_user.role != models.UserRole.ADMIN:
            if current_user.role in [models.UserRole.RECRUITER, models.UserRole.COMPANY]:
                vacancy_query = vacancy_query.filter(
                    (models.Vacancy.status == "live") | 
                    (models.Vacancy.owner_id == current_user.id)
                )
            else:
                vacancy_query = vacancy_query.filter(models.Vacancy.status == "live")
        
        # Apply search filter
        vacancy_query = vacancy_query.filter(
            (models.Vacancy.title.ilike(f"%{q}%")) |
            (models.Vacancy.description.ilike(f"%{q}%")) |
            (models.Vacancy.branch.ilike(f"%{q}%")) |
            (models.Vacancy.location.ilike(f"%{q}%"))
        )
        
        vacancies = vacancy_query.offset(skip).limit(limit).all()
        results["vacancies"] = [
            {
                "id": v.id,
                "title": v.title,
                "branch": v.branch,
                "location": v.location,
                "status": v.status,
                "type": "vacancy"
            } for v in vacancies
        ]
    
    if entity_type in ["all", "candidates"] and current_user.role in [
        models.UserRole.RECRUITER, models.UserRole.COMPANY, models.UserRole.ADMIN
    ]:
        # Search candidates (only for recruiters, companies, and admins)
        candidate_query = db.query(models.CandidateProfile).join(models.User).filter(
            models.User.is_active == True,
            models.User.role == models.UserRole.CANDIDATE
        )
        
        # Apply search filter
        candidate_query = candidate_query.filter(
            (models.CandidateProfile.summary.ilike(f"%{q}%")) |
            (models.CandidateProfile.location.ilike(f"%{q}%")) |
            (models.User.full_name.ilike(f"%{q}%"))
        )
        
        candidates = candidate_query.offset(skip).limit(limit).all()
        results["candidates"] = [
            {
                "id": c.user_id,
                "name": c.user.full_name,
                "location": c.location,
                "summary": c.summary[:100] + "..." if c.summary and len(c.summary) > 100 else c.summary,
                "type": "candidate"
            } for c in candidates
        ]
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )