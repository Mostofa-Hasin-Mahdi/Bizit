
import psycopg2

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '1234',
    'database': 'bizit_db'
}

def create_sales_table():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Creating sales table...")
        
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
        
        print("Success: sales table created.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_sales_table()
