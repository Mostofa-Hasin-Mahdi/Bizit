"""
Organization model
"""
from typing import Optional
from datetime import datetime


class Organization:
    """Organization model"""
    
    def __init__(
        self,
        id: Optional[int] = None,
        name: str = "",
        created_by: Optional[int] = None,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.name = name
        self.created_by = created_by
        self.created_at = created_at or datetime.utcnow()
    
    @classmethod
    def from_dict(cls, data: dict):
        """Create Organization from dictionary"""
        return cls(
            id=data.get('id'),
            name=data.get('name', ''),
            created_by=data.get('created_by'),
            created_at=data.get('created_at')
        )
    
    def to_dict(self) -> dict:
        """Convert Organization to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

