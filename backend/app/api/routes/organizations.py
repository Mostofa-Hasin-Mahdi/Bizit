from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from app.api.routes.auth import get_current_user
from app.core.database import get_db_cursor
from app.schemas.user import UserResponse
from app.models.organization import Organization

router = APIRouter(prefix="/organizations", tags=["organizations"])

class OrganizationCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None

class OrganizationResponse(BaseModel):
    id: int
    name: str
    created_by: int
    created_at: str

@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreateRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a new organization. Only owners can create organizations.
    """
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can create organizations")
    
    with get_db_cursor() as cursor:
        # Insert organization
        cursor.execute("""
            INSERT INTO organizations (name, created_by)
            VALUES (%s, %s)
            RETURNING id, name, created_by, created_at
        """, (org_data.name, current_user.id))
        
        org_row = cursor.fetchone()
        if not org_row:
            raise HTTPException(status_code=500, detail="Failed to create organization")
            
        # Create default departments
        cursor.execute("""
            INSERT INTO departments (org_id, name, created_by)
            VALUES 
                (%s, 'stock', %s),
                (%s, 'sales', %s)
        """, (org_row['id'], current_user.id, org_row['id'], current_user.id))
        
        # If this is the user's first/only org, potentially update their default org_id?
        # For now, we prefer explicit context, so we might not force it, 
        # BUT for the 'default' dashboard behavior to work initially, maybe we should update `users.org_id` 
        # if it's currently NULL.
        
        cursor.execute("SELECT org_id FROM users WHERE id = %s", (current_user.id,))
        user_data = cursor.fetchone()
        if user_data and user_data['org_id'] is None:
             cursor.execute("""
                UPDATE users
                SET org_id = %s
                WHERE id = %s
            """, (org_row['id'], current_user.id))

        return OrganizationResponse(
            id=org_row['id'],
            name=org_row['name'],
            created_by=org_row['created_by'],
            created_at=str(org_row['created_at'])
        )

@router.get("/", response_model=List[OrganizationResponse])
async def get_my_organizations(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get all organizations created by the current user (owner) 
    OR the assigned organization for admin/employee.
    """
    
    query = ""
    params = []
    
    if current_user.role == "owner":
        query = "SELECT id, name, created_by, created_at FROM organizations WHERE created_by = %s"
        params = [current_user.id]
    elif current_user.org_id:
        query = "SELECT id, name, created_by, created_at FROM organizations WHERE id = %s"
        params = [current_user.org_id]
    else:
        return []

    with get_db_cursor() as cursor:
        cursor.execute(query, tuple(params))
        orgs = cursor.fetchall()
        
        return [
            OrganizationResponse(
                id=org['id'],
                name=org['name'],
                created_by=org['created_by'],
                created_at=str(org['created_at'])
            ) for org in orgs
        ]
