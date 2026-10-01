import time
import os
import sys

# Setup environment variables for testing before importing anything
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL", 
    "postgresql://postgres:1234@localhost:5432/bizit_test_db"
)

from app.core import database
from app.services.analytics_service import get_analytics_summary

def run_benchmark():
    database.init_db_pool()
    
    # 1. First, let's create a ton of fake sales data to test performance
    print("Seeding 10,000 sales records...")
    with database.get_db_connection() as conn:
        with conn.cursor() as cursor:
            # Get an org and stock item to associate with
            cursor.execute("SELECT id FROM organizations LIMIT 1;")
            org = cursor.fetchone()
            if not org:
                print("No orgs found, run tests first to seed db.")
                return
            org_id = org['id']
            
            cursor.execute("SELECT id FROM stock_items WHERE org_id = %s LIMIT 1;", (org_id,))
            item = cursor.fetchone()
            item_id = item['id'] if item else None
            
            if item_id:
                # Insert 10,000 sales records using generate_series for speed
                cursor.execute("""
                    INSERT INTO sales (org_id, stock_item_id, quantity, total_price)
                    SELECT %s, %s, 1, 15.00
                    FROM generate_series(1, 10000);
                """, (org_id, item_id))
                conn.commit()
    print("Seeding complete. Running benchmark...\n")
    
    # 2. Run the benchmark 10 times to get an average
    times = []
    for i in range(10):
        start_time = time.time()
        
        # This is the exact function the dashboard endpoint calls
        result = get_analytics_summary(org_id)
        
        end_time = time.time()
        duration_ms = (end_time - start_time) * 1000
        times.append(duration_ms)
        
    avg_time = sum(times) / len(times)
    
    print(f"--- Benchmark Results ---")
    print(f"Total Sales/Losses Scanned: > 10,000 records")
    print(f"Average execution time: {avg_time:.2f} milliseconds")
    
    if avg_time < 500:
        print("\n✅ VERDICT: TRUE! The dashboard aggregates 10,000+ records in under 500ms.")
    else:
        print(f"\n❌ VERDICT: FALSE! The dashboard took {avg_time:.2f}ms to run.")

if __name__ == "__main__":
    run_benchmark()
