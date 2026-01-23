import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Connection pool
pool: Optional[SimpleConnectionPool] = None


def init_db_pool():
    """Initialize database connection pool"""
    global pool
    try:
        pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=settings.DATABASE_URL,
            cursor_factory=RealDictCursor
        )
        logger.info("Database connection pool initialized")
    except Exception as e:
        logger.error(f"Error initializing database pool: {e}")
        raise


def close_db_pool():
    """Close all database connections"""
    global pool
    if pool:
        pool.closeall()
        logger.info("Database connection pool closed")


@contextmanager
def get_db_connection():
    """Get database connection from pool"""
    if pool is None:
        init_db_pool()
    
    conn = pool.getconn()
    try:
        yield conn
    finally:
        pool.putconn(conn)


@contextmanager
def get_db_cursor():
    """Get database cursor with automatic commit/rollback"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            cursor.close()

