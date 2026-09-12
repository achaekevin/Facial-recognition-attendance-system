import os
import io
import re
import uuid
import base64
import hmac
import time
import hashlib
from typing import Tuple, Optional, Union, Dict, Any
from PIL import Image
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from loguru import logger

from app.config.settings import settings

# Strict UUID pattern to prevent path traversal attacks
UUID_PATTERN = re.compile(r"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$")

class SecureImageStorage:
    """
    Enterprise-grade secure biometric image storage.
    
    Provides:
    - Zero plaintext biometric images stored on disk or database.
    - AES-256-GCM authenticated envelope encryption at rest.
    - Automatic EXIF metadata stripping (eliminates GPS / device leakage).
    - SHA-256 cryptographic anti-tampering checksums.
    - Ephemeral HMAC-SHA256 signed access tokens for web rendering.
    - GDPR/BIPA crypto-shredding (overwriting binary blocks before unlink).
    """

    def __init__(self, storage_dir: Optional[str] = None, key_source: Optional[str] = None):
        self.storage_dir = storage_dir or settings.ENCRYPTED_STORAGE_DIR
        os.makedirs(self.storage_dir, exist_ok=True)
        
        # Derive 256-bit AES key via SHA-256 HKDF/Digest
        raw_key = key_source or settings.IMAGE_ENCRYPTION_KEY or settings.SECRET_KEY
        self.key = hashlib.sha256(raw_key.encode("utf-8")).digest()
        self.aesgcm = AESGCM(self.key)
        
        # Salt for HMAC ephemeral tokens
        self.token_secret = (settings.IMAGE_TOKEN_SECRET or settings.SECRET_KEY).encode("utf-8")

    def normalize_image_input(self, image_input: Union[bytes, str]) -> bytes:
        """Converts Base64 data URL, raw Base64 string, or bytes to raw image bytes."""
        if isinstance(image_input, bytes):
            return image_input

        if not isinstance(image_input, str) or not image_input:
            raise ValueError("Invalid image input: expected non-empty string or bytes")

        # Strip data URL header if present (e.g., 'data:image/jpeg;base64,...')
        if "," in image_input:
            image_input = image_input.split(",", 1)[1]

        # Decode base64
        try:
            return base64.b64decode(image_input)
        except Exception as e:
            raise ValueError(f"Failed to decode base64 image data: {str(e)}")

    def sanitize_and_strip_exif(self, raw_bytes: bytes) -> Tuple[bytes, str]:
        """
        Strips EXIF, GPS, and device telemetry from images.
        Re-encodes image into a clean JPEG to neutralize steganography and polyglot exploits.
        """
        try:
            img = Image.open(io.BytesIO(raw_bytes))
            
            # Defense against decompression bomb attacks
            if img.width * img.height > 25_000_000:
                raise ValueError("Image dimensions exceed 25 Megapixels limit.")

            # Convert RGBA/P palette modes to RGB for clean JPEG encoding
            if img.mode in ("RGBA", "LA", "P"):
                clean_img = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "RGBA":
                    clean_img.paste(img, mask=img.split()[3])
                else:
                    clean_img.paste(img.convert("RGB"))
            else:
                clean_img = img.convert("RGB")

            # Create clean output stream without any EXIF or metadata tags
            out_buf = io.BytesIO()
            clean_img.save(out_buf, format="JPEG", quality=92, optimize=True)
            return out_buf.getvalue(), "image/jpeg"
        except Exception as e:
            logger.error(f"Image sanitization failed: {e}")
            raise ValueError(f"Invalid or corrupted image format: {str(e)}")

    def store_image(self, image_input: Union[bytes, str]) -> Dict[str, Any]:
        """
        Sanitizes, hashes, encrypts (AES-256-GCM), and saves biometric image to disk.
        Returns metadata dict containing image_id, sha256_hash, and secure API URL.
        """
        raw_bytes = self.normalize_image_input(image_input)
        clean_bytes, mime_type = self.sanitize_and_strip_exif(raw_bytes)

        # Cryptographic integrity checksum of the clean image
        sha256_hash = hashlib.sha256(clean_bytes).hexdigest()
        image_id = str(uuid.uuid4())

        # Generate 96-bit (12 byte) random initialization vector for AES-GCM
        nonce = os.urandom(12)
        encrypted_payload = self.aesgcm.encrypt(nonce, clean_bytes, None)

        # Write [12-byte nonce] + [ciphertext with GCM auth tag]
        target_path = os.path.join(self.storage_dir, f"{image_id}.bin")
        with open(target_path, "wb") as f:
            f.write(nonce + encrypted_payload)

        secure_url = f"/api/v1/storage/images/{image_id}"

        return {
            "image_id": image_id,
            "sha256_hash": sha256_hash,
            "mime_type": mime_type,
            "file_size": len(clean_bytes),
            "encrypted_size": len(nonce + encrypted_payload),
            "url": secure_url,
        }

    def retrieve_image(self, image_id: str) -> Optional[bytes]:
        """
        Reads encrypted binary file from disk, verifies auth tag, and decrypts in memory.
        Returns raw decrypted image bytes or None if not found or corrupted.
        """
        if not UUID_PATTERN.match(image_id):
            logger.warning(f"Rejecting invalid image_id format: {image_id}")
            return None

        file_path = os.path.join(self.storage_dir, f"{image_id}.bin")
        if not os.path.exists(file_path):
            return None

        try:
            with open(file_path, "rb") as f:
                payload = f.read()

            if len(payload) < 28:  # 12-byte nonce + 16-byte tag minimum
                logger.error(f"Corrupted encrypted payload for image_id: {image_id}")
                return None

            nonce = payload[:12]
            ciphertext = payload[12:]
            decrypted_bytes = self.aesgcm.decrypt(nonce, ciphertext, None)
            return decrypted_bytes
        except Exception as e:
            logger.error(f"Decryption failed or data tampered for image_id {image_id}: {e}")
            return None

    def generate_signed_token(self, image_id: str, expires_in_seconds: int = 900) -> Tuple[str, int]:
        """Generates an HMAC-SHA256 signature and expiration timestamp for ephemeral image access."""
        expires_at = int(time.time()) + expires_in_seconds
        message = f"{image_id}:{expires_at}".encode("utf-8")
        token = hmac.new(self.token_secret, message, hashlib.sha256).hexdigest()
        return token, expires_at

    def verify_signed_token(self, image_id: str, token: str, expires_at: int) -> bool:
        """Verifies if an ephemeral signed token is valid and has not expired."""
        if int(time.time()) > expires_at:
            return False

        message = f"{image_id}:{expires_at}".encode("utf-8")
        expected_token = hmac.new(self.token_secret, message, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_token, token)

    def generate_signed_url(self, image_id: str, expires_in_seconds: int = 900) -> str:
        """Returns full authenticated URL with signed token query params."""
        token, expires_at = self.generate_signed_token(image_id, expires_in_seconds)
        return f"/api/v1/storage/images/{image_id}?token={token}&expires={expires_at}"

    def shred_image(self, image_id: str) -> bool:
        """
        Cryptographic shredding for GDPR / BIPA compliance:
        Overwrites file contents with cryptographically random bytes before deletion.
        """
        if not UUID_PATTERN.match(image_id):
            return False

        file_path = os.path.join(self.storage_dir, f"{image_id}.bin")
        if not os.path.exists(file_path):
            return False

        try:
            file_size = os.path.getsize(file_path)
            # Overwrite with random bytes
            with open(file_path, "wb") as f:
                f.write(os.urandom(file_size))
                f.flush()
                os.fsync(f.fileno())
            # Unlink file
            os.remove(file_path)
            logger.info(f"Biometric image {image_id} crypto-shredded successfully.")
            return True
        except Exception as e:
            logger.error(f"Error during crypto-shredding {image_id}: {e}")
            return False

# Global singleton storage instance
secure_storage = SecureImageStorage()
