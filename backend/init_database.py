"""
Database initialization script
Run this to set up the database tables
"""
import psycopg2
from psycopg2 import sql
import sys
from pathlib import Path

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': '1234',
    'database': 'bizit_db'
}


def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to postgres database to create bizit_db
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database='postgres'  # Connect to default postgres database
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'bizit_db'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier('bizit_db')
            ))
            print("[OK] Database 'bizit_db' created successfully")
        else:
            print("[OK] Database 'bizit_db' already exists")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[ERROR] Error creating database: {e}")
        return False


def run_init_script():
    """Run the initialization SQL script"""
    try:
        # Connect to bizit_db
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Read the SQL file
        sql_file = Path(__file__).parent / 'init_db.sql'
        with open(sql_file, 'r') as f:
            sql_script = f.read()
        
        # Remove comments and split into statements
        statements = []
        for line in sql_script.split('\n'):
            line = line.strip()
            # Skip comments and empty lines
            if line and not line.startswith('--'):
                statements.append(line)
        
        # Join and execute
        full_sql = '\n'.join(statements)
        
        # Execute the script
        cursor.execute(full_sql)
        
        print("[OK] Database tables created successfully")
        
        # Verify tables were created
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        
        print("\nCreated tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Verify roles were inserted
        cursor.execute("SELECT name FROM roles ORDER BY id")
        roles = cursor.fetchall()
        
        print("\nRoles:")
        for role in roles:
            print(f"  - {role[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.OperationalError as e:
        if "database" in str(e).lower() and "does not exist" in str(e).lower():
            print("[INFO] Database 'bizit_db' does not exist. Creating it now...")
            if create_database():
                return run_init_script()
        else:
            print(f"[ERROR] Database connection error: {e}")
            return False
    except Exception as e:
        print(f"[ERROR] Error running initialization script: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Bizit Database Initialization")
    print("=" * 50)
    print()
    
    # First, ensure database exists
    print("Step 1: Checking database...")
    if not create_database():
        print("\n✗ Failed to create database. Please check your PostgreSQL connection.")
        sys.exit(1)
    
    print()
    print("Step 2: Creating tables...")
    if run_init_script():
        print()
        print("=" * 50)
        print("[SUCCESS] Database initialization completed successfully!")
        print("=" * 50)
    else:
        print()
        print("=" * 50)
        print("[FAILED] Database initialization failed!")
        print("=" * 50)
        sys.exit(1)

