from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from . import models, schemas, dependencies
from .database import SessionLocal
import shutil
import os
import uuid
from typing import List

router = APIRouter(prefix="/candidates", tags=["candidates"])

@router.post("/me/profile", response_model=schemas.CandidateProfileOut)
def create_or_update_profile(
    profile_in: schemas.CandidateProfileCreate,
    current_user: models.User = Depends(dependencies.require_role(models.UserRole.CANDIDATE)),
    db: Session = Depends(dependencies.get_db)
):
    """Create or update candidate profile"""
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    
    if profile is None:
        # Create new profile
        profile = models.CandidateProfile(
            user_id=current_user.id,
            phone=profile_in.phone,
            location=profile_in.location,
            summary=profile_in.summary,
            github_url=profile_in.github_url,
            kaggle_url=profile_in.kaggle_url,
            linkedin_url=profile_in.linkedin_url,
            big_number=profile_in.big_number,
            availability=profile_in.availability
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # Add skills if provided
        if profile_in.skills:
            for skill_data in profile_in.skills:
                skill = models.CandidateSkill(
                    profile_id=profile.id,
                    skill_name=skill_data.skill_name,
                    level=skill_data.level
                )
                db.add(skill)
            db.commit()
            db.refresh(profile)
    else:
        # Update existing profile
        for field, value in profile_in.dict(exclude={'skills'}).items():
            if value is not None:
                setattr(profile, field, value)
        
        # Update skills if provided
        if profile_in.skills is not None:
            # Remove existing skills
            db.query(models.CandidateSkill).filter(
                models.CandidateSkill.profile_id == profile.id
            ).delete()
            
            # Add new skills
            for skill_data in profile_in.skills:
                skill = models.CandidateSkill(
                    profile_id=profile.id,
                    skill_name=skill_data.skill_name,
                    level=skill_data.level
                )
                db.add(skill)
        
        db.commit()
        db.refresh(profile)
    
    return profile

@router.get("/me/profile", response_model=schemas.CandidateProfileOut)
def read_my_profile(
    current_user: models.User = Depends(dependencies.require_role(models.UserRole.CANDIDATE)), 
    db: Session = Depends(dependencies.get_db)
):
    """Get current user's candidate profile"""
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profiel niet gevonden"
        )
    
    return profile

@router.post("/me/skills", response_model=schemas.CandidateProfileOut)
def add_skill(
    skill: schemas.CandidateSkillCreate,
    current_user: models.User = Depends(dependencies.require_role(models.UserRole.CANDIDATE)),
    db: Session = Depends(dependencies.get_db)
):
    """Add a skill to candidate profile"""
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profiel niet gevonden"
        )
    
    # Check if skill already exists
    existing_skill = db.query(models.CandidateSkill).filter(
        models.CandidateSkill.profile_id == profile.id,
        models.CandidateSkill.skill_name == skill.skill_name
    ).first()
    
    if existing_skill:
        # Update existing skill level
        existing_skill.level = skill.level
    else:
        # Add new skill
        new_skill = models.CandidateSkill(
            profile_id=profile.id,
            skill_name=skill.skill_name,
            level=skill.level
        )
        db.add(new_skill)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/me/skills/{skill_id}")
def remove_skill(
    skill_id: int,
    current_user: models.User = Depends(dependencies.require_role(models.UserRole.CANDIDATE)),
    db: Session = Depends(dependencies.get_db)
):
    """Remove a skill from candidate profile"""
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profiel niet gevonden"
        )
    
    skill = db.query(models.CandidateSkill).filter(
        models.CandidateSkill.id == skill_id,
        models.CandidateSkill.profile_id == profile.id
    ).first()
    
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill niet gevonden"
        )
    
    db.delete(skill)
    db.commit()
    
    return {"message": "Skill succesvol verwijderd"}

@router.post("/me/upload-kyc", response_model=schemas.CandidateProfileOut)
async def upload_kyc_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(dependencies.require_role(models.UserRole.CANDIDATE)),
    db: Session = Depends(dependencies.get_db)
):
    """Upload KYC document for Finance branch compliance"""
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profiel niet gevonden"
        )
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ongeldig bestandstype. Alleen PDF, JPEG en PNG bestanden zijn toegestaan."
        )
    
    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bestand te groot. Maximum grootte is 10MB."
        )
    
    # Create upload directory
    upload_dir = "uploads/kyc"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    unique_filename = f"{current_user.id}_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    # Update profile with file path
    profile.kyc_file_path = file_path
    db.commit()
    db.refresh(profile)
    
    return profile

@router.get("/search", response_model=List[schemas.CandidateProfileOut])
def search_candidates(
    skill: str = None,
    location: str = None,
    availability: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(dependencies.require_recruiter_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Search candidates (for recruiters and admins)"""
    query = db.query(models.CandidateProfile).join(models.User)
    
    # Filter by skill
    if skill:
        query = query.join(models.CandidateSkill).filter(
            models.CandidateSkill.skill_name.ilike(f"%{skill}%")
        )
    
    # Filter by location
    if location:
        query = query.filter(
            models.CandidateProfile.location.ilike(f"%{location}%")
        )
    
    # Filter by availability
    if availability:
        query = query.filter(
            models.CandidateProfile.availability.ilike(f"%{availability}%")
        )
    
    # Only show profiles of active users
    query = query.filter(models.User.is_active == True)
    
    candidates = query.offset(skip).limit(limit).all()
    return candidates

@router.get("/{candidate_id}/profile", response_model=schemas.CandidateProfileOut)
def get_candidate_profile(
    candidate_id: int,
    current_user: models.User = Depends(dependencies.require_recruiter_or_admin),
    db: Session = Depends(dependencies.get_db)
):
    """Get specific candidate profile (for recruiters and admins)"""
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == candidate_id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kandidaat profiel niet gevonden"
        )
    
    # Check if the candidate user is active
    user = db.query(models.User).filter(models.User.id == candidate_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kandidaat niet gevonden of niet actief"
        )
    
    return profile

@router.get("/me/stats")
def get_my_candidate_stats(
    current_user: models.User = Depends(dependencies.require_role(models.UserRole.CANDIDATE)),
    db: Session = Depends(dependencies.get_db)
):
    """Get candidate statistics"""
    profile = db.query(models.CandidateProfile).filter(
        models.CandidateProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        return {
            "profile_completed": False,
            "skills_count": 0,
            "profile_views": 0,
            "applications_sent": 0
        }
    
    skills_count = db.query(models.CandidateSkill).filter(
        models.CandidateSkill.profile_id == profile.id
    ).count()
    
    # Calculate profile completion percentage
    completion_fields = [
        profile.phone, profile.location, profile.summary,
        profile.github_url, profile.linkedin_url, profile.availability
    ]
    completed_fields = sum(1 for field in completion_fields if field)
    completion_percentage = (completed_fields / len(completion_fields)) * 100
    
    return {
        "profile_completed": completion_percentage >= 80,
        "completion_percentage": completion_percentage,
        "skills_count": skills_count,
        "profile_views": 0,  # TODO: Implement view tracking
        "applications_sent": 0  # TODO: Implement application tracking
    }