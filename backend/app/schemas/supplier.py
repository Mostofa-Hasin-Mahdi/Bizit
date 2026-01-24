from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# --- Supplier Schemas ---

class SupplierBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int
    org_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Shipment Schemas ---

class ShipmentBase(BaseModel):
    supplier_id: int
    expected_quantity: int
    expected_date: date
    notes: Optional[str] = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdateStatus(BaseModel):
    status: str # 'Arrived', 'Late', etc.
    received_date: Optional[date] = None

class ShipmentRate(BaseModel):
    received_quantity: int
    damaged_quantity: int
    received_date: Optional[date] = None

class ShipmentResponse(ShipmentBase):
    id: int
    org_id: int
    received_quantity: Optional[int] = None
    damaged_quantity: Optional[int] = None
    received_date: Optional[date] = None
    status: str
    score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    supplier_name: Optional[str] = None # Enriched field

    class Config:
        from_attributes = True
