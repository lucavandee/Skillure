import pytest
from fastapi.testclient import TestClient

def get_auth_headers(client: TestClient, test_user):
    """Helper function to get authentication headers"""
    client.post("/api/v1/auth/register", json=test_user)
    login_response = client.post("/api/v1/auth/login", json={
        "email": test_user["email"],
        "password": test_user["password"]
    })
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_candidate(client: TestClient, test_user, test_candidate):
    headers = get_auth_headers(client, test_user)
    
    response = client.post("/api/v1/candidates/", json=test_candidate, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_candidate["email"]
    assert data["first_name"] == test_candidate["first_name"]
    assert "id" in data

def test_get_candidates(client: TestClient, test_user, test_candidate):
    headers = get_auth_headers(client, test_user)
    
    # Create a candidate first
    client.post("/api/v1/candidates/", json=test_candidate, headers=headers)
    
    # Get candidates
    response = client.get("/api/v1/candidates/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == test_candidate["email"]

def test_get_candidate_by_id(client: TestClient, test_user, test_candidate):
    headers = get_auth_headers(client, test_user)
    
    # Create a candidate first
    create_response = client.post("/api/v1/candidates/", json=test_candidate, headers=headers)
    candidate_id = create_response.json()["id"]
    
    # Get candidate by ID
    response = client.get(f"/api/v1/candidates/{candidate_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == candidate_id
    assert data["email"] == test_candidate["email"]

def test_update_candidate(client: TestClient, test_user, test_candidate):
    headers = get_auth_headers(client, test_user)
    
    # Create a candidate first
    create_response = client.post("/api/v1/candidates/", json=test_candidate, headers=headers)
    candidate_id = create_response.json()["id"]
    
    # Update candidate
    update_data = {"title": "Senior Software Engineer"}
    response = client.put(f"/api/v1/candidates/{candidate_id}", json=update_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Senior Software Engineer"

def test_search_candidates(client: TestClient, test_user, test_candidate):
    headers = get_auth_headers(client, test_user)
    
    # Create a candidate first
    client.post("/api/v1/candidates/", json=test_candidate, headers=headers)
    
    # Search candidates
    search_data = {
        "query": "Python",
        "limit": 10,
        "offset": 0
    }
    response = client.post("/api/v1/candidates/search", json=search_data, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["candidates"]) == 1

def test_delete_candidate(client: TestClient, test_user, test_candidate):
    headers = get_auth_headers(client, test_user)
    
    # Create a candidate first
    create_response = client.post("/api/v1/candidates/", json=test_candidate, headers=headers)
    candidate_id = create_response.json()["id"]
    
    # Delete candidate
    response = client.delete(f"/api/v1/candidates/{candidate_id}", headers=headers)
    assert response.status_code == 200
    
    # Verify candidate is deleted (soft delete - should not appear in list)
    response = client.get("/api/v1/candidates/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0