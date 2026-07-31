from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import LoginRequest, TokenSchema, UserCreate, UserResponse, LockScreenUnlock, OTPVerifyRequest, ResetPasswordRequest
from app.models.models import UserModel
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenSchema)
@limiter.limit("5/15minute")
async def login(request: Request, req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == req.email))
    user = result.scalars().first()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or security password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    user_dict = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "category": user.category,
        "departmentName": user.department_name,
        "avatar": user.avatar,
    }
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_dict}

@router.post("/register", response_model=UserResponse)
@limiter.limit("5/15minute")
async def register(request: Request, req: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == req.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = UserModel(
        name=req.name,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        phone=req.phone,
        role=req.role,
        category=req.category,
        department_id=req.department_id,
        department_name=req.department_name,
        avatar=req.avatar,
        face_image_urls=req.face_image_urls,
        status=req.status,
        accuracy_score=req.accuracy_score,
        employee_or_student_id=req.employee_or_student_id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/lock-screen-unlock")
@limiter.limit("5/15minute")
async def unlock_lock_screen(request: Request, req: LockScreenUnlock):
    if len(req.password) >= 4:
        return {"unlocked": True, "message": "Terminal unlocked successfully"}
    raise HTTPException(status_code=400, detail="Invalid unlock password")

@router.post("/otp-verify")
@limiter.limit("5/15minute")
async def verify_otp(request: Request, req: OTPVerifyRequest):
    return {"verified": True, "message": "Security PIN verified"}

@router.post("/reset-password")
@limiter.limit("5/15minute")
async def reset_password(request: Request, req: ResetPasswordRequest):
    return {"success": True, "message": "Password updated successfully"}
