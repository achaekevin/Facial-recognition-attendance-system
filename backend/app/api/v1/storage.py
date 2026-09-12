from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header, Response, UploadFile, File, status
from pydantic import BaseModel
from app.core.storage import secure_storage
from app.authorization.rbac import get_current_user
from app.core.security import decode_access_token
from app.models.models import UserModel

router = APIRouter(prefix="/storage", tags=["Secure Biometric Storage"])

class SignUrlRequest(BaseModel):
    image_id: str
    expires_in_seconds: Optional[int] = 900

class SignUrlResponse(BaseModel):
    image_id: str
    signed_url: str
    expires_at: int

@router.get("/images/{image_id}", summary="Retrieve and decrypt a protected biometric image")
async def get_secure_image(
    image_id: str,
    token: Optional[str] = Query(default=None, description="HMAC signed ephemeral access token"),
    expires: Optional[int] = Query(default=None, description="Expiration UNIX timestamp of the signed token"),
    authorization: Optional[str] = Header(default=None, description="Bearer JWT access token")
):
    """
    Streams a decrypted biometric facial image in-memory.
    Authentication is verified via:
    1. Ephemeral HMAC-SHA256 signed query parameters (?token=...&expires=...), OR
    2. Bearer JWT authorization header.
    
    Zero plaintext images are read from disk; raw files on storage remain AES-256-GCM encrypted.
    """
    authorized = False

    # 1. Check ephemeral signed token (for direct <img> tag rendering)
    if token and expires:
        if secure_storage.verify_signed_token(image_id, token, expires):
            authorized = True
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ephemeral image access token has expired or is invalid"
            )

    # 2. Check Bearer JWT token if signed token was not provided
    if not authorized and authorization and authorization.startswith("Bearer "):
        jwt_token = authorization.split(" ", 1)[1]
        payload = decode_access_token(jwt_token)
        if payload and payload.get("sub"):
            authorized = True

    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide a valid Bearer token or signed access parameters."
        )

    # Decrypt image from storage
    image_bytes = secure_storage.retrieve_image(image_id)
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Biometric image not found, corrupted, or integrity check failed"
        )

    return Response(
        content=image_bytes,
        media_type="image/jpeg",
        headers={
            "Cache-Control": "private, max-age=900",
            "X-Content-Type-Options": "nosniff",
            "X-Biometric-Security": "AES-256-GCM Encrypted at Rest"
        }
    )

@router.post("/sign-url", response_model=SignUrlResponse, summary="Generate an ephemeral signed URL for an image")
async def create_signed_image_url(
    req: SignUrlRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Generates a secure, time-limited HMAC-SHA256 signed URL for authorized frontends.
    Default validity is 15 minutes (900 seconds).
    """
    expires_sec = min(max(req.expires_in_seconds or 900, 60), 86400) # Between 1 min and 24 hours
    signed_url = secure_storage.generate_signed_url(req.image_id, expires_in_seconds=expires_sec)
    _, expires_at = secure_storage.generate_signed_token(req.image_id, expires_in_seconds=expires_sec)

    return SignUrlResponse(
        image_id=req.image_id,
        signed_url=signed_url,
        expires_at=expires_at
    )

@router.post("/upload", summary="Sanitize and encrypt an uploaded image")
async def upload_secure_image(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Accepts an uploaded image file, strips all EXIF metadata, encrypts with AES-256-GCM,
    and returns secure reference identifiers.
    """
    file_bytes = await file.read()
    try:
        stored_info = secure_storage.store_image(file_bytes)
        signed_url = secure_storage.generate_signed_url(stored_info["image_id"])
        return {
            "success": True,
            "image_id": stored_info["image_id"],
            "url": stored_info["url"],
            "signed_url": signed_url,
            "sha256_hash": stored_info["sha256_hash"],
            "file_size": stored_info["file_size"],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image processing failed: {str(e)}"
        )
