from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.models import SystemSettingModel
from app.authorization.rbac import require_super_admin

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("")
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_super_admin)
):
    result = await db.execute(select(SystemSettingModel).where(SystemSettingModel.id == "default"))
    setting = result.scalars().first()
    if not setting:
        setting = SystemSettingModel(id="default")
        db.add(setting)
        await db.commit()
        await db.refresh(setting)
    return setting

@router.put("")
async def update_settings(
    threshold: float,
    enable_liveness: bool,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_super_admin)
):
    result = await db.execute(select(SystemSettingModel).where(SystemSettingModel.id == "default"))
    setting = result.scalars().first()
    if not setting:
        setting = SystemSettingModel(id="default")
        db.add(setting)
    
    setting.recognition_threshold = threshold
    setting.enable_liveness_detection = enable_liveness
    await db.commit()
    return {"success": True, "threshold": threshold, "enable_liveness": enable_liveness}
