from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.routes.auth import get_current_user
from app.schemas.user import UserResponse
from app.schemas.loss import LossCreate
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

def check_owner_access(user: UserResponse):
    if user.role != "owner" and user.role != "admin": # Admin can view? Maybe just owner. Let's allow Admin for now.
        raise HTTPException(status_code=403, detail="Restricted access")

@router.post("/loss")
async def report_loss(
    loss_data: LossCreate,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        target_org_id = org_id if org_id else current_user.org_id
        # In a real app, verify user access to target_org_id here
        analytics_service.report_loss(loss_data, current_user.id, target_org_id)
        return {"message": "Loss reported successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/summary")
async def get_summary(
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    check_owner_access(current_user)
    target_org_id = org_id if org_id else current_user.org_id
    # Add simple check if user belongs to this org if not admin/owner
    return analytics_service.get_analytics_summary(target_org_id)

@router.get("/losses")
async def get_loss_history(
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    check_owner_access(current_user)
    target_org_id = org_id if org_id else current_user.org_id
    return analytics_service.get_loss_history(target_org_id)
