"""
User model
"""
from typing import Optional
from datetime import datetime


class User:
    """User model"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        org_id: Optional[int] = None,
        email: str = "",
        password_hash: str = "",
        username: Optional[str] = None,
        full_name: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        role: Optional[str] = None
    ):
        self.id = id
        self.org_id = org_id
        self.email = email
        self.password_hash = password_hash
        self.username = username
        self.full_name = full_name
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
        self.role = role
    
    @classmethod
    def from_dict(cls, data: dict):
        """Create User from dictionary"""
        return cls(
            id=data.get('id'),
            org_id=data.get('org_id'),
            email=data.get('email', ''),
            password_hash=data.get('password_hash', ''),
            username=data.get('username'),
            full_name=data.get('full_name'),
            is_active=data.get('is_active', True),
            created_at=data.get('created_at'),
            role=data.get('role')
        )

    
    def to_dict(self, exclude_password: bool = True) -> dict:
        """Convert User to dictionary"""
        data = {
            'id': self.id,
            'org_id': self.org_id,
            'email': self.email,
            'username': self.username,
            'full_name': self.full_name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'role': self.role
        }

        if not exclude_password:
            data['password_hash'] = self.password_hash
        return data

