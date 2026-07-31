from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared Rate Limiter instance with default rate limit for all endpoints (100 requests per minute)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"]
)
