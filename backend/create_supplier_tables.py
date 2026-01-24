
import psycopg2
from app.core.config import settings
from app.core.database import get_db_cursor

def create_tables():
    print("Creating supplier tables...")
    try:
        with get_db_cursor() as cursor:
            # Create Suppliers Table
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
            """)
            print("Suppliers table created.")

            # Create Shipments Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS shipments (
                    id SERIAL PRIMARY KEY,
                    org_id INTEGER REFERENCES organizations(id),
                    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
                    expected_quantity INTEGER NOT NULL,
                    received_quantity INTEGER,
                    damaged_quantity INTEGER,
                    expected_date DATE,
                    received_date DATE,
                    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Arrived, Late, Cancelled
                    score DOUBLE PRECISION,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            print("Shipments table created.")
            
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    create_tables()
