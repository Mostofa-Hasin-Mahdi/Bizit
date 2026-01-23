from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StockItemBase(BaseModel):
    name: str
    category: str
    quantity: int = 0
    min_threshold: int = 10
    max_capacity: int = 100
    price: float = 0.0

class StockItemCreate(StockItemBase):
    pass

class StockItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    min_threshold: Optional[int] = None
    max_capacity: Optional[int] = None
    price: Optional[float] = None

class StockItemResponse(StockItemBase):
    id: int
    org_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
