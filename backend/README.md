# Skillure Backend API

FastAPI-based backend for the Skillure AI recruitment platform with PostgreSQL, JWT authentication, and RBAC.

## Features

- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Robust relational database
- **JWT Authentication** - Secure token-based authentication
- **RBAC** - Role-based access control (Admin, Recruiter, Company, Candidate)
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **CORS** - Cross-origin resource sharing support

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip or poetry

### Installation

1. **Clone and setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Database setup**:
```bash
# Create PostgreSQL database
createdb skillure_db
createuser skillure_user --pwprompt  # Set password: skillure_password
```

3. **Environment configuration**:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Run migrations**:
```bash
alembic upgrade head
```

5. **Start development server**:
```bash
python run.py
# Or: uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## Authentication

### Register a new user:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe",
    "role": "recruiter"
  }'
```

### Login:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Use the token:
```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## User Roles & Permissions

### Admin
- Full system access
- User management
- All CRUD operations

### Recruiter
- Read/write candidates
- Read/write own vacancies
- Contact candidates
- View analytics

### Company
- Read candidates
- Read/write own vacancies
- Contact candidates
- View analytics

### Candidate
- Read/write own profile
- Read vacancies
- Apply to vacancies

## Database Models

### User
- Authentication and profile information
- Role-based permissions
- Company association

### Candidate
- Professional profile
- Skills and experience
- Availability and rates
- Compliance data (BIG, KYC)
- AI profile data

### Vacancy
- Job posting details
- Requirements and skills
- Compensation
- Compliance requirements
- Status tracking

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user
- `GET /api/v1/users/` - List users (admin)
- `GET /api/v1/users/search` - Search users (admin)

### Candidates
- `GET /api/v1/candidates/` - List candidates
- `POST /api/v1/candidates/search` - Search candidates
- `POST /api/v1/candidates/` - Create candidate
- `GET /api/v1/candidates/{id}` - Get candidate
- `PUT /api/v1/candidates/{id}` - Update candidate
- `DELETE /api/v1/candidates/{id}` - Delete candidate

### Vacancies
- `GET /api/v1/vacancies/` - List vacancies
- `GET /api/v1/vacancies/my` - Get my vacancies
- `POST /api/v1/vacancies/search` - Search vacancies
- `POST /api/v1/vacancies/` - Create vacancy
- `GET /api/v1/vacancies/{id}` - Get vacancy
- `PUT /api/v1/vacancies/{id}` - Update vacancy
- `DELETE /api/v1/vacancies/{id}` - Delete vacancy

## Development

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

### Testing

```bash
pytest
```

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## Production Deployment

1. **Environment variables**:
```bash
export DATABASE_URL="postgresql://user:pass@host:port/db"
export SECRET_KEY="your-super-secret-key"
export ENVIRONMENT="production"
```

2. **Run with Gunicorn**:
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

3. **Docker deployment**:
```bash
# Build image
docker build -t skillure-api .

# Run container
docker run -p 8000:8000 --env-file .env skillure-api
```

## Security Considerations

- JWT tokens expire after 60 minutes (configurable)
- Passwords are hashed using bcrypt
- CORS is configured for specific origins
- Input validation using Pydantic
- SQL injection protection via SQLAlchemy ORM
- Role-based access control on all endpoints

## Support

For questions or issues, please contact the development team or create an issue in the repository.