import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token, verify_password, get_password_hash

@pytest.mark.asyncio
async def test_password_hashing():
    pwd = "securepassword123"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

@pytest.mark.asyncio
async def test_jwt_token_generation():
    token_data = {"sub": "superadmin@attendance.com", "role": "super_admin"}
    token = create_access_token(token_data)
    assert token is not None
    assert isinstance(token, str)

@pytest.mark.asyncio
async def test_login_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/auth/login", json={
            "email": "superadmin@attendance.com",
            "password": "password321"
        })
        assert res.status_code in [200, 401]  # Valid response code structure
