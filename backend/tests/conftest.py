import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.core.config import settings

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "role": "recruiter"
    }

@pytest.fixture
def test_candidate():
    return {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "title": "Software Engineer",
        "skills": ["Python", "JavaScript", "React"],
        "location": "Amsterdam",
        "experience_years": 5,
        "availability": "Direct",
        "hourly_rate_min": 75,
        "hourly_rate_max": 95
    }

@pytest.fixture
def test_vacancy():
    return {
        "title": "Senior Python Developer",
        "description": "We are looking for an experienced Python developer to join our team.",
        "company_name": "Tech Corp",
        "location": "Amsterdam",
        "type": "fulltime",
        "skills_required": ["Python", "Django", "PostgreSQL"],
        "hourly_rate_min": 80,
        "hourly_rate_max": 100,
        "branch": "Tech"
    }