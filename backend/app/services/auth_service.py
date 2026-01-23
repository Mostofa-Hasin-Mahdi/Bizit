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
        
        # Create default organization for owner
        cursor.execute("""
            INSERT INTO organizations (name, created_by)
            VALUES (%s, %s)
            RETURNING id, name, created_by, created_at
        """, (f"{username}'s Organization", user_data['id']))
        
        org_data = cursor.fetchone()
        
        # Update user with org_id
        cursor.execute("""
            UPDATE users
            SET org_id = %s
            WHERE id = %s
        """, (org_data['id'], user_data['id']))
        
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

        
        user_data['org_id'] = org_data['id']
        user_data['role'] = 'owner'  # Set the role explicitly for the response
        return User.from_dict(user_data)



def authenticate_user(username: str, password: str) -> Optional[User]:
    """Authenticate a user by username and password"""
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT id, org_id, email, password_hash, username, full_name, is_active, created_at
            FROM users
            WHERE username = %s OR email = %s
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
            SELECT id, org_id, email, password_hash, username, full_name, is_active, created_at
            FROM users
            WHERE id = %s
        """, (user_id,))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            return None
        
        return User.from_dict(user_data)


def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email"""
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT id, org_id, email, password_hash, username, full_name, is_active, created_at
            FROM users
            WHERE email = %s
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

