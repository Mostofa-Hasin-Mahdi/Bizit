import os
import pytest
from typing import Generator, Dict
from fastapi.testclient import TestClient
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool

# We must set the database URL for testing before importing the app
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL", 
    "postgresql://postgres:1234@localhost:5432/bizit_test_db"
)

from app.main import app
from app.core import database
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token

@pytest.fixture(scope="session")
def setup_test_db():
    """Create test database schema and initialize pool."""
    # Initialize the test pool
    database.init_db_pool()
    
    # Read the init_db.sql script
    with open("init_db.sql", "r") as f:
        schema = f.read()
        
    with database.get_db_connection() as conn:
        with conn.cursor() as cursor:
            # We must drop tables and recreate them to ensure a clean slate
            cursor.execute("DROP TABLE IF EXISTS shipments, suppliers, losses, sales, stock_items, user_departments, departments, user_roles, users, organizations, roles CASCADE;")
            cursor.execute(schema)
            # Add missing columns from update scripts
            cursor.execute("ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;")
            cursor.execute("ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0;")
            
            # Create Suppliers, Shipments, Sales, and Losses for complete coverage
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS suppliers (
                    id SERIAL PRIMARY KEY,
                    org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(50),
                    email VARCHAR(255),
                    address TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS shipments (
                    id SERIAL PRIMARY KEY,
                    org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
                    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
                    expected_quantity INTEGER NOT NULL,
                    received_quantity INTEGER,
                    damaged_quantity INTEGER,
                    expected_date DATE,
                    received_date DATE,
                    status VARCHAR(50) DEFAULT 'Pending',
                    score DOUBLE PRECISION,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS sales (
                    id SERIAL PRIMARY KEY,
                    org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
                    stock_item_id INT REFERENCES stock_items(id) ON DELETE SET NULL,
                    sold_by INT REFERENCES users(id) ON DELETE SET NULL,
                    quantity INT NOT NULL CHECK (quantity > 0),
                    total_price DECIMAL(10, 2) NOT NULL,
                    sale_date TIMESTAMP DEFAULT NOW()
                );
                
                CREATE TABLE IF NOT EXISTS losses (
                    id SERIAL PRIMARY KEY,
                    org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
                    stock_item_id INT REFERENCES stock_items(id) ON DELETE SET NULL,
                    quantity INT NOT NULL CHECK (quantity > 0),
                    cost_at_loss DECIMAL(10, 2) NOT NULL,
                    reason VARCHAR(50) NOT NULL,
                    notes TEXT,
                    reported_by INT REFERENCES users(id) ON DELETE SET NULL,
                    loss_date TIMESTAMP DEFAULT NOW()
                );
            """)
            conn.commit()
    
    yield
    
    # Teardown (TestClient lifespan might have already closed it)
    try:
        database.close_db_pool()
    except Exception:
        pass


@pytest.fixture(scope="function")
def clean_db(setup_test_db):
    """Clean the tables before each test but keep schema."""
    with database.get_db_connection() as conn:
        with conn.cursor() as cursor:
            # Truncate tables to remove data from previous tests
            cursor.execute("TRUNCATE stock_items, departments, user_roles, users, organizations RESTART IDENTITY CASCADE;")
            conn.commit()


@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="function")
def seeded_data(clean_db) -> Dict:
    """Seed Org A and Org B and return their info and tokens."""
    data = {"org_a": {}, "org_b": {}}
    
    with database.get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Create Orgs
            cursor.execute("INSERT INTO organizations (name) VALUES ('Org A Target') RETURNING id;")
            org_a_id = cursor.fetchone()['id']
            data["org_a"]["id"] = org_a_id
            
            cursor.execute("INSERT INTO organizations (name) VALUES ('Org B Noise') RETURNING id;")
            org_b_id = cursor.fetchone()['id']
            data["org_b"]["id"] = org_b_id
            
            # Helper to create user and token
            def create_user(org_id, username, role_name):
                email = f"{username}@example.com"
                pwd = get_password_hash("testpass")
                cursor.execute("""
                    INSERT INTO users (org_id, email, password_hash, username, is_active)
                    VALUES (%s, %s, %s, %s, true) RETURNING id;
                """, (org_id, email, pwd, username))
                user_id = cursor.fetchone()['id']
                
                # We assume roles table was seeded by init_db.sql ('owner', 'admin', 'employee')
                cursor.execute("SELECT id FROM roles WHERE name = %s;", (role_name,))
                role_row = cursor.fetchone()
                if role_row:
                    cursor.execute("INSERT INTO user_roles (user_id, role_id) VALUES (%s, %s);", (user_id, role_row['id']))
                
                token = create_access_token({"sub": str(user_id), "org_id": org_id, "role": role_name})
                return {"id": user_id, "token": token}

            # Seed Org A users
            data["org_a"]["owner"] = create_user(org_a_id, "a_owner", "owner")
            data["org_a"]["admin"] = create_user(org_a_id, "a_admin", "admin")
            data["org_a"]["employee"] = create_user(org_a_id, "a_employee", "employee")
            
            # Seed Org B users
            data["org_b"]["owner"] = create_user(org_b_id, "b_owner", "owner")
            data["org_b"]["admin"] = create_user(org_b_id, "b_admin", "admin")
            data["org_b"]["employee"] = create_user(org_b_id, "b_employee", "employee")
            
            # Seed Org A Stock Items (Normal values)
            cursor.execute("""
                INSERT INTO stock_items (org_id, name, category, quantity)
                VALUES (%s, 'Normal Item 1', 'Test', 10) RETURNING id;
            """, (org_a_id,))
            org_a_stock_id = cursor.fetchone()['id']
            data["org_a"]["stock_id"] = org_a_stock_id
            
            # Seed Org B Stock Items (Absurd values to catch leaks)
            cursor.execute("""
                INSERT INTO stock_items (org_id, name, category, quantity)
                VALUES (%s, 'LEAKED NOISE ITEM', 'Test', 999999) RETURNING id;
            """, (org_b_id,))
            org_b_stock_id = cursor.fetchone()['id']
            data["org_b"]["stock_id"] = org_b_stock_id
            
            # Seed Suppliers
            cursor.execute("INSERT INTO suppliers (org_id, name) VALUES (%s, 'Org A Supplier') RETURNING id;", (org_a_id,))
            cursor.execute("INSERT INTO suppliers (org_id, name) VALUES (%s, 'Org B Leaked Supplier') RETURNING id;", (org_b_id,))
            
            # Seed Sales
            cursor.execute("INSERT INTO sales (org_id, stock_item_id, quantity, total_price) VALUES (%s, %s, 1, 10.00);", (org_a_id, org_a_stock_id))
            cursor.execute("INSERT INTO sales (org_id, stock_item_id, quantity, total_price) VALUES (%s, %s, 999, 9999.00);", (org_b_id, org_b_stock_id))
            
            conn.commit()
            
    return data
