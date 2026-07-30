import pytest
from httpx import AsyncClient
from app.main import app
from app.recognition.engine import biometric_engine

@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_biometric_engine_embedding():
    mock_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP..."
    vec = biometric_engine.extract_embedding(mock_base64)
    assert len(vec) == 512
    assert isinstance(vec, list)

def test_cosine_similarity():
    vec1 = [0.1] * 512
    vec2 = [0.1] * 512
    score = biometric_engine.compute_cosine_similarity(vec1, vec2)
    assert score >= 99.0
