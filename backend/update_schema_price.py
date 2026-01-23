
import psycopg2

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '1234',
    'database': 'bizit_db'
}

def add_price_column():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Adding price column to stock_items table...")
        
        cursor.execute("""
            ALTER TABLE stock_items 
            ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0.00;
        """)
        
        print("Success: price column added.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_price_column()
