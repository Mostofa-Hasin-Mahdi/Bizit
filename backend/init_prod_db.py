
import logging
from app.core.database import get_db_cursor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """
    Initialize the production database with all tables and schema updates.
    This script is designed to be idempotent (safe to run multiple times).
    """
    logger.info("Starting database initialization...")
    
    try:
        with get_db_cursor() as cursor:
            # 1. Base Tables (from init_db.sql)
            logger.info("Creating base tables (users, orgs, roles)...")
            cursor.execute("""
                -- Roles
                CREATE TABLE IF NOT EXISTS roles (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(20) UNIQUE NOT NULL
                );
                
                INSERT INTO roles (name) VALUES ('owner'), ('admin'), ('employee')
                ON CONFLICT (name) DO NOTHING;

                -- Organizations
                CREATE TABLE IF NOT EXISTS organizations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    created_by INT,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                -- Users
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    username VARCHAR(50) UNIQUE,
                    full_name VARCHAR(100),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                -- User Roles
                CREATE TABLE IF NOT EXISTS user_roles (
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    role_id INT REFERENCES roles(id),
                    PRIMARY KEY (user_id, role_id)
                );

                -- Departments
                CREATE TABLE IF NOT EXISTS departments (
                    id SERIAL PRIMARY KEY,
                    org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
                    name VARCHAR(50) NOT NULL,
                    created_by INT REFERENCES users(id),
                    created_at TIMESTAMP DEFAULT NOW()
                );

                -- User Departments
                CREATE TABLE IF NOT EXISTS user_departments (
                    user_id INT REFERENCES users(id) ON DELETE CASCADE,
                    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
                    PRIMARY KEY (user_id, department_id)
                );

                -- Stock Items (Basic)
                CREATE TABLE IF NOT EXISTS stock_items (
                    id SERIAL PRIMARY KEY,
                    org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
                    name VARCHAR(100) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    quantity INT DEFAULT 0,
                    min_threshold INT DEFAULT 10,
                    max_capacity INT DEFAULT 100,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """)

            # 2. Schema Updates (Price & Cost)
            logger.info("Applying schema updates (price, cost_price)...")
            cursor.execute("""
                ALTER TABLE stock_items 
                ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0.00;
                
                ALTER TABLE stock_items 
                ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0.00;
            """)

            # 3. Suppliers & Shipments
            logger.info("Creating suppliers and shipments tables...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS suppliers (
                    id SERIAL PRIMARY KEY,
                    org_id INTEGER REFERENCES organizations(id),
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(50),
                    email VARCHAR(255),
                    address TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS shipments (
                    id SERIAL PRIMARY KEY,
                    org_id INTEGER REFERENCES organizations(id),
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
            """)

            # 4. Sales
            logger.info("Creating sales table...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sales (
                    id SERIAL PRIMARY KEY,
                    org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
                    stock_item_id INT REFERENCES stock_items(id) ON DELETE SET NULL,
                    sold_by INT REFERENCES users(id) ON DELETE SET NULL,
                    quantity INT NOT NULL CHECK (quantity > 0),
                    total_price DECIMAL(10, 2) NOT NULL,
                    sale_date TIMESTAMP DEFAULT NOW()
                );
            """)

            # 5. Losses
            logger.info("Creating losses table...")
            cursor.execute("""
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

            logger.info("Database initialization completed successfully!")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    init_db()
