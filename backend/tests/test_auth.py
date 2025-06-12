import pytest
from fastapi.testclient import TestClient

def test_register_user(client: TestClient, test_user):
    response = client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_user["email"]
    assert data["first_name"] == test_user["first_name"]
    assert "id" in data

def test_register_duplicate_user(client: TestClient, test_user):
    # Register user first time
    client.post("/api/v1/auth/register", json=test_user)
    
    # Try to register same user again
    response = client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_user(client: TestClient, test_user):
    # Register user first
    client.post("/api/v1/auth/register", json=test_user)
    
    # Login
    login_data = {
        "email": test_user["email"],
        "password": test_user["password"]
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data

def test_login_invalid_credentials(client: TestClient):
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401

def test_access_protected_endpoint(client: TestClient, test_user):
    # Register and login user
    client.post("/api/v1/auth/register", json=test_user)
    login_response = client.post("/api/v1/auth/login", json={
        "email": test_user["email"],
        "password": test_user["password"]
    })
    token = login_response.json()["access_token"]
    
    # Access protected endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]

def test_access_protected_endpoint_without_token(client: TestClient):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 403