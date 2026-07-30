from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import AuditLogResponse
from app.models.models import AuditLogModel
from app.authorization.rbac import require_super_admin

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_super_admin)
):
    result = await db.execute(select(AuditLogModel))
    return result.scalars().all()
