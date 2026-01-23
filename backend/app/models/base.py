"""
Base model utilities for database operations
"""
from typing import Optional, Dict, Any
from datetime import datetime


class BaseModel:
    """Base model with common methods"""
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        """Create instance from dictionary"""
        return cls(**{k: v for k, v in data.items() if hasattr(cls, k)})
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert instance to dictionary"""
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

