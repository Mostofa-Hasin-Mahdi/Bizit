from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.routes.auth import get_current_user
from app.schemas.user import UserResponse
from app.schemas.stock import StockItemCreate, StockItemUpdate, StockItemResponse
from app.services import stock_service

router = APIRouter(prefix="/stock", tags=["stock"])

def check_stock_write_access(user: UserResponse):
    """Check if user has permission to modify stock"""
    if user.role == "owner" or user.role == "admin":
        return True
    if user.role == "employee" and user.department == "stock":
        return True
    raise HTTPException(status_code=403, detail="Insufficient permissions for stock management")

def check_stock_read_access(user: UserResponse):
    """Check if user has permission to view stock"""
    if user.role == "owner" or user.role == "admin":
        return True
    if user.role == "employee" and (user.department == "stock" or user.department == "sales"):
        return True
    raise HTTPException(status_code=403, detail="Insufficient permissions to view stock")

def get_org_id(user: UserResponse) -> int:
    # For owners, we might need a way to specify which org context they are in if they have multiple.
    # But for simplicity/MVP, if the frontend is sending the org context via header or similar, we'd use that.
    # However, currently get_current_user returns the user obj. 
    # Important: Owners 'org_id' field in User table might be their default org. 
    # If the owner is viewing a specific dashboard, the frontend should probably pass ?org_id=X 
    # similiar to how we handled user creation.
    # BUT, let's stick to the pattern established: If Owner, they must specify ?org_id param OR rely on default.
    # For now, let's assume valid org_id on user object for employees/admins. 
    # For owners, let's require an org_id query param if they want to operate on non-default?
    # Actually, simpler: Require org_id from query param for flexibility, default to user.org_id.
    
    if user.org_id:
        return user.org_id
    raise HTTPException(status_code=400, detail="Organization context missing")

@router.post("/", response_model=StockItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_data: StockItemCreate,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    check_stock_write_access(current_user)
    
    # Determine target org
    target_org_id = current_user.org_id
    if current_user.role == "owner" and org_id:
        target_org_id = org_id # Should verify ownership ideally
        
    if not target_org_id:
        raise HTTPException(status_code=400, detail="Organization ID required")
        
    return stock_service.create_stock_item(item_data, target_org_id)

@router.get("/", response_model=List[StockItemResponse])
async def get_items(
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    check_stock_read_access(current_user)
    
    target_org_id = current_user.org_id
    if current_user.role == "owner" and org_id:
        target_org_id = org_id
        
    if not target_org_id:
        return [] # Or raise error
        
    return stock_service.get_stock_items(target_org_id)

@router.patch("/{item_id}", response_model=StockItemResponse)
async def update_item(
    item_id: int,
    item_data: StockItemUpdate,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    check_stock_write_access(current_user)
    
    target_org_id = current_user.org_id
    if current_user.role == "owner" and org_id:
        target_org_id = org_id
        
    updated_item = stock_service.update_stock_item(item_id, item_data, target_org_id)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    return updated_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    check_stock_write_access(current_user)
    
    target_org_id = current_user.org_id
    if current_user.role == "owner" and org_id:
        target_org_id = org_id
        
    success = stock_service.delete_stock_item(item_id, target_org_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return None
