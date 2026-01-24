from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LossCreate(BaseModel):
    stock_item_id: int
    quantity: int
    reason: str
    notes: Optional[str] = None

class LossResponse(BaseModel):
    id: int
    stock_item_id: int
    stock_item_name: Optional[str] = None
    quantity: int
    cost_at_loss: float
    reason: str
    notes: Optional[str] = None
    reported_by: int
    loss_date: datetime

    class Config:
        from_attributes = True
