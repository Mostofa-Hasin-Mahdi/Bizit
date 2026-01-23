from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SaleBase(BaseModel):
    stock_item_id: int
    quantity: int

class SaleCreate(SaleBase):
    pass

class SaleResponse(BaseModel):
    id: int
    org_id: int
    stock_item_id: Optional[int]
    stock_item_name: Optional[str] = None
    sold_by: Optional[int]
    sold_by_name: Optional[str] = None
    quantity: int
    total_price: float
    sale_date: datetime

    class Config:
        from_attributes = True
