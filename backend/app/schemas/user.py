from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    """User response schema"""
    id: int
    org_id: Optional[int] = None
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    org_name: Optional[str] = None
    department: Optional[str] = None
    is_active: bool
    created_at: datetime

    
    class Config:
        from_attributes = True

