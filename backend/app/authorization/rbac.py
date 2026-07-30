from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.core.security import decode_access_token
from app.models.models import UserModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> UserModel:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    if user.status != "active":
        raise HTTPException(status_code=400, detail="Inactive or suspended user account")
    
    return user

class RoleChecker:
    """
    Role-Based Access Control (RBAC) Dependency.
    Bypasses permission checks for Super Admin ('super_admin').
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: UserModel = Depends(get_current_user)):
        if user.role == "super_admin":
            return user
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation forbidden for role '{user.role}'. Required roles: {self.allowed_roles}"
            )
        return user

# Role Guards matching the 5 System Roles
require_super_admin = RoleChecker(["super_admin"])
require_hr_admin = RoleChecker(["super_admin", "hr_admin"])
require_lecturer = RoleChecker(["super_admin", "hr_admin", "lecturer_teacher"])
require_security_officer = RoleChecker(["super_admin", "security_officer"])
require_hr_or_security = RoleChecker(["super_admin", "hr_admin", "security_officer"])
require_authenticated = get_current_user
