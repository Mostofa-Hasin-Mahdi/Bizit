from typing import List, Optional
from app.core.database import get_db_cursor
from app.schemas.stock import StockItemCreate, StockItemUpdate, StockItemResponse

def get_stock_status(quantity: int, min_threshold: int, max_capacity: int) -> str:
    if quantity <= min_threshold:
        return "low"
    
    percentage = (quantity / max_capacity) * 100
    if percentage >= 80:
        return "high"
        
    return "medium"

def create_stock_item(item_data: StockItemCreate, org_id: int) -> StockItemResponse:
    with get_db_cursor() as cursor:
        cursor.execute("""
            INSERT INTO stock_items (org_id, name, category, quantity, min_threshold, max_capacity, price)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, org_id, name, category, quantity, min_threshold, max_capacity, price, created_at, updated_at
        """, (org_id, item_data.name, item_data.category, item_data.quantity, item_data.min_threshold, item_data.max_capacity, item_data.price))
        
        row = cursor.fetchone()
        if not row:
            raise Exception("Failed to create stock item")
            
        status = get_stock_status(row['quantity'], row['min_threshold'], row['max_capacity'])
        
        return StockItemResponse(
            id=row['id'],
            org_id=row['org_id'],
            name=row['name'],
            category=row['category'],
            quantity=row['quantity'],
            min_threshold=row['min_threshold'],
            max_capacity=row['max_capacity'],
            price=float(row['price']),
            status=status,
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )

def get_stock_items(org_id: int) -> List[StockItemResponse]:
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT id, org_id, name, category, quantity, min_threshold, max_capacity, price, created_at, updated_at
            FROM stock_items
            WHERE org_id = %s
            ORDER BY created_at DESC
        """, (org_id,))
        
        rows = cursor.fetchall()
        items = []
        for row in rows:
            status = get_stock_status(row['quantity'], row['min_threshold'], row['max_capacity'])
            items.append(StockItemResponse(
                id=row['id'],
                org_id=row['org_id'],
                name=row['name'],
                category=row['category'],
                quantity=row['quantity'],
                min_threshold=row['min_threshold'],
                max_capacity=row['max_capacity'],
                price=float(row['price']),
                status=status,
                created_at=row['created_at'],
                updated_at=row['updated_at']
            ))
            
        return items

def update_stock_item(item_id: int, item_data: StockItemUpdate, org_id: int) -> Optional[StockItemResponse]:
    updates = []
    values = []
    
    if item_data.name is not None:
        updates.append("name = %s")
        values.append(item_data.name)
    if item_data.category is not None:
        updates.append("category = %s")
        values.append(item_data.category)
    if item_data.quantity is not None:
        updates.append("quantity = %s")
        values.append(item_data.quantity)
    if item_data.min_threshold is not None:
        updates.append("min_threshold = %s")
        values.append(item_data.min_threshold)
    if item_data.max_capacity is not None:
        updates.append("max_capacity = %s")
        values.append(item_data.max_capacity)
    if item_data.price is not None:
        updates.append("price = %s")
        values.append(item_data.price)
        
    if not updates:
        return None
        
    updates.append("updated_at = NOW()")
    values.append(item_id)
    values.append(org_id)
    
    query = f"""
        UPDATE stock_items
        SET {', '.join(updates)}
        WHERE id = %s AND org_id = %s
        RETURNING id, org_id, name, category, quantity, min_threshold, max_capacity, price, created_at, updated_at
    """
    
    with get_db_cursor() as cursor:
        cursor.execute(query, tuple(values))
        row = cursor.fetchone()
        
        if not row:
            return None
            
        status = get_stock_status(row['quantity'], row['min_threshold'], row['max_capacity'])
        
        return StockItemResponse(
            id=row['id'],
            org_id=row['org_id'],
            name=row['name'],
            category=row['category'],
            quantity=row['quantity'],
            min_threshold=row['min_threshold'],
            max_capacity=row['max_capacity'],
            price=float(row['price']),
            status=status,
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )

def delete_stock_item(item_id: int, org_id: int) -> bool:
    with get_db_cursor() as cursor:
        cursor.execute("""
            DELETE FROM stock_items
            WHERE id = %s AND org_id = %s
            RETURNING id
        """, (item_id, org_id))
        
        return cursor.fetchone() is not None
