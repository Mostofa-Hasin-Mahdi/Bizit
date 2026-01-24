from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.routes.auth import get_current_user
from app.schemas.user import UserResponse
from app.schemas.supplier import (
    SupplierCreate, SupplierResponse,
    ShipmentCreate, ShipmentResponse, ShipmentRate, ShipmentUpdateStatus
)
from app.services import supplier_service

router = APIRouter(tags=["suppliers"])

# --- Suppliers Endpoints ---

@router.post("/suppliers", response_model=SupplierResponse)
async def create_supplier(
    data: SupplierCreate,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        target_org_id = org_id if org_id else current_user.org_id
        return supplier_service.create_supplier(data, target_org_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/suppliers", response_model=List[SupplierResponse])
async def get_suppliers(
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    target_org_id = org_id if org_id else current_user.org_id
    return supplier_service.get_suppliers(target_org_id)

# --- Shipments Endpoints ---

@router.post("/shipments", response_model=ShipmentResponse)
async def create_shipment(
    data: ShipmentCreate,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        target_org_id = org_id if org_id else current_user.org_id
        return supplier_service.create_shipment(data, target_org_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/shipments", response_model=List[ShipmentResponse])
async def get_shipments(
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    target_org_id = org_id if org_id else current_user.org_id
    return supplier_service.get_shipments(target_org_id)

@router.patch("/shipments/{id}/status")
async def update_shipment_status(
    id: int,
    data: ShipmentUpdateStatus,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        target_org_id = org_id if org_id else current_user.org_id
        supplier_service.update_shipment_status(id, data, target_org_id)
        return {"message": "Status updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/shipments/{id}/rate", response_model=ShipmentResponse)
async def rate_shipment(
    id: int,
    data: ShipmentRate,
    org_id: int = None,
    current_user: UserResponse = Depends(get_current_user)
):
    # Allowed for owner, admin, and potentially stock lead in future?
    # User said "owner can also give rating... viewed as admin or stock".
    # Previous restriction: if current_user.role not in ["owner", "admin"]
    # I will keep the restriction for RATING to Owner/Admin as per Plan, but Stock can View.
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Only Admins/Owners can rate shipments")
    
    try:
        target_org_id = org_id if org_id else current_user.org_id
        return supplier_service.rate_shipment(id, data, target_org_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
