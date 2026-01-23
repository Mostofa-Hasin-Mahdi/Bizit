from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from app.api.routes.auth import get_current_user
from app.schemas.user import UserResponse
from app.schemas.auth import UserRegister
from app.services.auth_service import create_org_user, get_db_cursor
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

class UserCreateRequest(UserRegister):
    department: Optional[str] = None

class DepartmentUpdateRequest(BaseModel):
    department: str

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_new_user(
    user_data: UserCreateRequest,
    role: str,
    org_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a new user (admin or employee).
    Owners must specify org_id (and own it).
    Admins create in their own org.
    """
    # 1. Permission Check
    if current_user.role == "owner":
        if role not in ["admin", "employee"]:
             raise HTTPException(status_code=403, detail="Owners can only create admins or employees")
    elif current_user.role == "admin":
        if role != "employee":
            raise HTTPException(status_code=403, detail="Admins can only create employees")
    else:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    if not current_user.org_id and current_user.role != "owner":
         raise HTTPException(status_code=400, detail="Current user does not belong to an organization")

    # Determine validation logic for target organization
    target_org_id = current_user.org_id
    
    with get_db_cursor() as cursor:
        if current_user.role == "owner":
            if not org_id:
                 raise HTTPException(status_code=400, detail="Organization ID is required for owners")
            
            # Verify ownership
            cursor.execute("SELECT id FROM organizations WHERE id = %s AND created_by = %s", (org_id, current_user.id))
            if not cursor.fetchone():
                raise HTTPException(status_code=403, detail="You do not own this organization")
            target_org_id = org_id
        else:
            # Admins always use their assigned org
            target_org_id = current_user.org_id

    try:
        # Check uniqueness
        with get_db_cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (user_data.username, user_data.email))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Username or email already exists")

        # Create User
        new_user = create_org_user(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
            full_name=user_data.full_name,
            role=role,
            org_id=target_org_id,
            department_name=user_data.department
        )
        
        return UserResponse(
            id=new_user.id,
            org_id=new_user.org_id,
            email=new_user.email,
            username=new_user.username,
            full_name=new_user.full_name,
            is_active=new_user.is_active,
            created_at=new_user.created_at,
            role=new_user.role,
            department=getattr(new_user, 'department', None)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[UserResponse])
async def get_users_by_role(
    role: str = None,
    org_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get all users in the specified organization (for owners) or current org (for others).
    """
    target_org_id = current_user.org_id

    with get_db_cursor() as cursor:
        if current_user.role == "owner":
            if org_id:
                # Verify ownership
                cursor.execute("SELECT id FROM organizations WHERE id = %s AND created_by = %s", (org_id, current_user.id))
                if not cursor.fetchone():
                    # Fallback or empty? Let's raise explicit error or return empty to be safe.
                    # Raising error is clearer.
                     raise HTTPException(status_code=403, detail="You do not own this organization")
                target_org_id = org_id
            else:
                # If no org_id passed, owner gets users from their default org? 
                # Or maybe all their orgs? For now let's stick to single org view per request.
                pass 
        
        if not target_org_id:
             raise HTTPException(status_code=400, detail="Organization context missing")

        query = """
            SELECT u.id, u.org_id, u.email, u.password_hash, u.username, u.full_name, u.is_active, u.created_at, 
                   r.name as role, d.name as department, o.name as org_name
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN user_departments ud ON u.id = ud.user_id
            LEFT JOIN departments d ON ud.department_id = d.id
            LEFT JOIN organizations o ON u.org_id = o.id
            WHERE u.org_id = %s
        """
        params = [target_org_id]

        if role:
            query += " AND r.name = %s"
            params.append(role)
        
        cursor.execute(query, tuple(params))
        users_data = cursor.fetchall()
        
        return [User.from_dict(user) for user in users_data]


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Delete a user. Owners can delete Admins/Employees. Admins can delete Employees.
    """
    if not current_user.org_id:
        raise HTTPException(status_code=400, detail="Current user does not belong to an organization")

    with get_db_cursor() as cursor:
        # Get target user role and org
        cursor.execute("""
            SELECT u.org_id, r.name as role 
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = %s
        """, (user_id,))
        target_user = cursor.fetchone()
        
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if target_user['org_id'] != current_user.org_id:
            raise HTTPException(status_code=403, detail="Cannot delete user from another organization")
            
        target_role = target_user['role']
        
        # Permission logic
        if current_user.role == "owner":
            if target_role == "owner":
                raise HTTPException(status_code=403, detail="Owners cannot delete other owners (or themselves via this endpoint)")
        elif current_user.role == "admin":
            if target_role != "employee":
                raise HTTPException(status_code=403, detail="Admins can only delete employees")
        else:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
            
        # Perform delete
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))


@router.patch("/{user_id}/department", response_model=UserResponse)
async def update_user_department(
    user_id: int,
    data: DepartmentUpdateRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update a user's department.
    """
    if not current_user.org_id:
        raise HTTPException(status_code=400, detail="Current user does not belong to an organization")
        
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
        
    if data.department not in ["stock", "sales"]:
        raise HTTPException(status_code=400, detail="Invalid department. Must be 'stock' or 'sales'")

    with get_db_cursor() as cursor:
        # Verify user exists and is in same org
        cursor.execute("SELECT id FROM users WHERE id = %s AND org_id = %s", (user_id, current_user.org_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found in your organization")

        # Get department ID
        cursor.execute("SELECT id FROM departments WHERE name = %s AND org_id = %s", (data.department, current_user.org_id))
        dept_data = cursor.fetchone()
        
        if not dept_data:
            # If default departments are missing for some reason, create them (fallback)
            cursor.execute("INSERT INTO departments (name, org_id, created_by) VALUES (%s, %s, %s) RETURNING id", 
                           (data.department, current_user.org_id, current_user.id))
            dept_id = cursor.fetchone()['id']
        else:
            dept_id = dept_data['id']
            
        # Update link
        cursor.execute("""
            INSERT INTO user_departments (user_id, department_id)
            VALUES (%s, %s)
            ON CONFLICT (user_id, department_id) DO NOTHING
        """, (user_id, dept_id))
        
        # Remove other departments (enforce single department for now per requirements)
        cursor.execute("""
            DELETE FROM user_departments 
            WHERE user_id = %s AND department_id != %s
        """, (user_id, dept_id))
        
        # Return updated user
        # (Re-use existing get logic or just fetch manually)
        # For simplicity, returning the user object by re-fetching
        pass
    
    # Re-fetch user to return
    # This calls get_current_user equivalent but for specific ID.
    # We can just call get_user_by_id logic from service, but we didn't expose it to API directly.
    # Let's duplicate the fetch logic briefly or refactor. 
    # Actually, let's use the DB cursor we have.
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT u.id, u.org_id, u.email, u.password_hash, u.username, u.full_name, u.is_active, u.created_at, 
                   r.name as role, d.name as department
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN user_departments ud ON u.id = ud.user_id
            LEFT JOIN departments d ON ud.department_id = d.id
            WHERE u.id = %s
        """, (user_id,))
        user_data = cursor.fetchone()
        return User.from_dict(user_data)
