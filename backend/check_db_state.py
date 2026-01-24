
import psycopg2
from app.core.config import settings

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '1234',
    'database': 'bizit_db'
}

def check_db():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("--- Checking Users ---")
        cursor.execute("SELECT * FROM users LIMIT 5")
        for row in cursor.fetchall():
            print(f"User: {row}")

        print("\n--- Checking Stock Items ---")
        cursor.execute("SELECT id, name, quantity, price, cost_price, org_id FROM stock_items")
        for row in cursor.fetchall():
            print(f"Item: {row}")

        print("\n--- Checking Sales ---")
        cursor.execute("SELECT id, org_id, stock_item_id, quantity, total_price, sale_date FROM sales ORDER BY sale_date DESC LIMIT 10")
        for row in cursor.fetchall():
            print(f"Sale: {row}")
            
        print("\n--- Checking COGS Query ---")
        cursor.execute("""
            SELECT s.org_id, SUM(s.quantity * si.cost_price) as cogs
            FROM sales s
            JOIN stock_items si ON s.stock_item_id = si.id
            GROUP BY s.org_id
        """)
        for row in cursor.fetchall():
            print(f"COGS Result: {row}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
