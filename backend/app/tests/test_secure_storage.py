import os
import io
import time
import pytest
from PIL import Image
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.storage import SecureImageStorage, secure_storage
from app.core.security import create_access_token

def create_dummy_image_bytes() -> bytes:
    """Creates a real in-memory JPEG image with Pillow."""
    img = Image.new("RGB", (64, 64), color=(73, 109, 137))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_store_and_retrieve_image(tmp_path):
    storage = SecureImageStorage(storage_dir=str(tmp_path), key_source="test_secret_key_1234567890123456")
    img_bytes = create_dummy_image_bytes()

    result = storage.store_image(img_bytes)
    assert "image_id" in result
    assert "sha256_hash" in result
    assert result["mime_type"] == "image/jpeg"

    # Verify physical file on disk exists and is encrypted (not a readable JPEG)
    stored_path = os.path.join(str(tmp_path), f"{result['image_id']}.bin")
    assert os.path.exists(stored_path)
    with open(stored_path, "rb") as f:
        file_content = f.read()
    # JPEG magic bytes should NOT match because file is AES-256-GCM encrypted
    assert not file_content.startswith(b"\xff\xd8\xff")

    # Decrypt and retrieve
    decrypted = storage.retrieve_image(result["image_id"])
    assert decrypted is not None
    assert decrypted.startswith(b"\xff\xd8\xff")  # Clean JPEG magic bytes

def test_tamper_detection(tmp_path):
    storage = SecureImageStorage(storage_dir=str(tmp_path), key_source="test_secret_key_1234567890123456")
    img_bytes = create_dummy_image_bytes()

    result = storage.store_image(img_bytes)
    stored_path = os.path.join(str(tmp_path), f"{result['image_id']}.bin")

    # Tamper with 1 byte in the ciphertext
    with open(stored_path, "r+b") as f:
        f.seek(20)
        byte = f.read(1)
        tampered_byte = bytes([(byte[0] ^ 0xFF)])
        f.seek(20)
        f.write(tampered_byte)

    # Retrieval should detect tamper via GCM auth tag and reject (return None)
    decrypted = storage.retrieve_image(result["image_id"])
    assert decrypted is None

def test_signed_token_lifecycle():
    storage = secure_storage
    image_id = "12345678-1234-1234-1234-123456789abc"

    token, expires_at = storage.generate_signed_token(image_id, expires_in_seconds=10)
    assert storage.verify_signed_token(image_id, token, expires_at) is True

    # Tampered token fails
    assert storage.verify_signed_token(image_id, "invalid_token_123", expires_at) is False

    # Expired timestamp fails
    expired_time = int(time.time()) - 100
    assert storage.verify_signed_token(image_id, token, expired_time) is False

def test_crypto_shredding(tmp_path):
    storage = SecureImageStorage(storage_dir=str(tmp_path), key_source="test_secret_key_1234567890123456")
    img_bytes = create_dummy_image_bytes()

    result = storage.store_image(img_bytes)
    image_id = result["image_id"]
    stored_path = os.path.join(str(tmp_path), f"{image_id}.bin")

    assert os.path.exists(stored_path)
    shred_ok = storage.shred_image(image_id)
    assert shred_ok is True
    assert not os.path.exists(stored_path)
    assert storage.retrieve_image(image_id) is None

@pytest.mark.asyncio
async def test_api_storage_endpoints():
    img_bytes = create_dummy_image_bytes()
    stored = secure_storage.store_image(img_bytes)
    image_id = stored["image_id"]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Unauthenticated request to /images/{image_id} should return 401
        res_unauth = await ac.get(f"/api/v1/storage/images/{image_id}")
        assert res_unauth.status_code == 401

        # 2. Ephemeral signed URL access should return 200 with image/jpeg
        token, expires_at = secure_storage.generate_signed_token(image_id, expires_in_seconds=60)
        res_signed = await ac.get(f"/api/v1/storage/images/{image_id}?token={token}&expires={expires_at}")
        assert res_signed.status_code == 200
        assert res_signed.headers["content-type"] == "image/jpeg"
        assert res_signed.content.startswith(b"\xff\xd8\xff")

        # 3. Request with JWT token should return 200
        jwt_token = create_access_token("test-user-id")
        res_jwt = await ac.get(
            f"/api/v1/storage/images/{image_id}",
            headers={"Authorization": f"Bearer {jwt_token}"}
        )
        assert res_jwt.status_code == 200
        assert res_jwt.content.startswith(b"\xff\xd8\xff")
