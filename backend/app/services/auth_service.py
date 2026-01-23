from typing import Optional
from app.core.database import get_db_cursor
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.models.organization import Organization
from datetime import timedelta
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def create_user(email: str, username: str, password: str, full_name: Optional[str] = None) -> User:
    """Create a new user (owner)"""
    password_hash = get_password_hash(password)
    
    with get_db_cursor() as cursor:
        # Insert user
        cursor.execute("""
            INSERT INTO users (email, password_hash, username, full_name, is_active)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, email, password_hash, username, full_name, is_active, created_at, org_id
        """, (email, password_hash, username, full_name, True))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            raise Exception("Failed to create user")
        
        if not user_data:
            raise Exception("Failed to create user")
        
        # Assign owner role (ensure roles exist first)
        print("DEBUG: Attempting to assign owner role")
        cursor.execute("""
            INSERT INTO roles (name) VALUES ('owner')
            ON CONFLICT (name) DO NOTHING
        """)
        
        cursor.execute("""
            SELECT id FROM roles WHERE name = 'owner'
        """)
        role_data = cursor.fetchone()
        print(f"DEBUG: Role data found: {role_data}")
        
        if role_data:
            print(f"DEBUG: Inserting into user_roles: user_id={user_data['id']}, role_id={role_data['id']}")
            try:
                cursor.execute("""
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (user_data['id'], role_data['id']))
                print("DEBUG: Inserted into user_roles successfully")
            except Exception as e:
                print(f"DEBUG: Failed to insert into user_roles: {e}")
                raise e
        else:
            print("DEBUG: Owner role not found!")

        user_data['role'] = 'owner'  # Set the role explicitly for the response
        return User.from_dict(user_data)


def create_org_user(email: str, username: str, password: str, role: str, org_id: int, full_name: Optional[str] = None, department_name: Optional[str] = None) -> User:
    """Create a new user with a specific role in an organization"""
    password_hash = get_password_hash(password)
    
    with get_db_cursor() as cursor:
        # Check if role exists
        cursor.execute("SELECT id FROM roles WHERE name = %s", (role,))
        role_data = cursor.fetchone()
        if not role_data:
            raise Exception(f"Role '{role}' not found")
            
        # Insert user
        cursor.execute("""
            INSERT INTO users (email, password_hash, username, full_name, is_active, org_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, email, password_hash, username, full_name, is_active, created_at, org_id
        """, (email, password_hash, username, full_name, True, org_id))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            raise Exception("Failed to create user")
        
        # Link role
        cursor.execute("""
            INSERT INTO user_roles (user_id, role_id)
            VALUES (%s, %s)
        """, (user_data['id'], role_data['id']))
        
        # Link department if provided
        if department_name:
            cursor.execute("SELECT id FROM departments WHERE name = %s AND org_id = %s", (department_name, org_id))
            dept_data = cursor.fetchone()
            if dept_data:
                cursor.execute("""
                    INSERT INTO user_departments (user_id, department_id)
                    VALUES (%s, %s)
                """, (user_data['id'], dept_data['id']))
                user_data['department'] = department_name

        user_data['role'] = role
        return User.from_dict(user_data)



def authenticate_user(username: str, password: str) -> Optional[User]:
    """Authenticate a user by username and password"""
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT u.id, u.org_id, u.email, u.password_hash, u.username, u.full_name, u.is_active, u.created_at, 
                   r.name as role, d.name as department, o.name as org_name
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN user_departments ud ON u.id = ud.user_id
            LEFT JOIN departments d ON ud.department_id = d.id
            LEFT JOIN organizations o ON u.org_id = o.id
            WHERE u.username = %s OR u.email = %s
        """, (username, username))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            return None
        
        if not verify_password(password, user_data['password_hash']):
            return None
        
        if not user_data['is_active']:
            return None
        
        return User.from_dict(user_data)


def get_user_by_id(user_id: int) -> Optional[User]:
    """Get user by ID"""
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT u.id, u.org_id, u.email, u.password_hash, u.username, u.full_name, u.is_active, u.created_at, 
                   r.name as role, d.name as department, o.name as org_name
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN user_departments ud ON u.id = ud.user_id
            LEFT JOIN departments d ON ud.department_id = d.id
            LEFT JOIN organizations o ON u.org_id = o.id
            WHERE u.id = %s
        """, (user_id,))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            return None
        
        return User.from_dict(user_data)


def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email"""
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT u.id, u.org_id, u.email, u.password_hash, u.username, u.full_name, u.is_active, u.created_at, 
                   r.name as role, d.name as department, o.name as org_name
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN user_departments ud ON u.id = ud.user_id
            LEFT JOIN departments d ON ud.department_id = d.id
            LEFT JOIN organizations o ON u.org_id = o.id
            WHERE u.email = %s
        """, (email,))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            return None
        
        return User.from_dict(user_data)


def create_access_token_for_user(user: User) -> str:
    """Create access token for user"""
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "username": user.username or user.email
    }
    return create_access_token(token_data)

