
import psycopg2

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '1234',
    'database': 'bizit_db'
}

def update_schema_profit():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Updating schema for Profit & Loss system...")
        
        # 1. Add cost_price to stock_items
        print("Adding cost_price to stock_items...")
        try:
            cursor.execute("""
                ALTER TABLE stock_items 
                ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10, 2) DEFAULT 0;
            """)
        except Exception as e:
            print(f"Notice: cost_price column might already exist ({e})")

        # 2. Create losses table
        print("Creating losses table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS losses (
                id SERIAL PRIMARY KEY,
                org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
                stock_item_id INT REFERENCES stock_items(id) ON DELETE SET NULL,
                quantity INT NOT NULL CHECK (quantity > 0),
                cost_at_loss DECIMAL(10, 2) NOT NULL,
                reason VARCHAR(50) NOT NULL, -- 'Damaged', 'Stolen', 'Expired', 'Other'
                notes TEXT,
                reported_by INT REFERENCES users(id) ON DELETE SET NULL,
                loss_date TIMESTAMP DEFAULT NOW()
            );
        """)
        
        print("Success: Schema updated.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_schema_profit()
