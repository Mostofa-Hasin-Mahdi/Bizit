from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.routes.auth import get_current_user
from app.schemas.user import UserResponse
from app.schemas.sales import SaleCreate, SaleResponse
from app.services import sales_service

router = APIRouter(prefix="/sales", tags=["sales"])

def check_sales_access(user: UserResponse):
    """Check if user has permission to record/view sales"""
    if user.role == "owner" or user.role == "admin":
        return True
    if user.role == "employee" and (user.department == "sales" or user.department == "stock"):
        return True
    raise HTTPException(status_code=403, detail="Insufficient permissions for sales management")

@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
async def record_sale(
    sale_data: SaleCreate,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    check_sales_access(current_user)
    
    target_org_id = current_user.org_id
    if current_user.role == "owner" and org_id:
        target_org_id = org_id
        
    if not target_org_id:
        raise HTTPException(status_code=400, detail="Organization ID required")
        
    try:
        return sales_service.create_sale(sale_data, current_user.id, target_org_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[SaleResponse])
async def get_sales(
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    check_sales_access(current_user)
    
    target_org_id = current_user.org_id
    if current_user.role == "owner" and org_id:
        target_org_id = org_id
        
    if not target_org_id:
        return []
        
    return sales_service.get_sales_history(target_org_id)
