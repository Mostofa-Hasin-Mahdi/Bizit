from typing import List, Optional
from app.core.database import get_db_cursor
from app.schemas.sales import SaleCreate, SaleResponse

def create_sale(sale_data: SaleCreate, user_id: int, org_id: int) -> SaleResponse:
    with get_db_cursor() as cursor:
        # 1. Check stock availability and get item details
        cursor.execute("""
            SELECT name, quantity, price 
            FROM stock_items 
            WHERE id = %s AND org_id = %s
        """, (sale_data.stock_item_id, org_id))
        
        item = cursor.fetchone()
        if not item:
            raise Exception("Stock item not found")
            
        if item['quantity'] < sale_data.quantity:
            raise Exception(f"Insufficient stock. Available: {item['quantity']}")
            
        # 2. Calculate total price
        total_price = float(item['price']) * sale_data.quantity
        
        # 3. Deduct stock
        cursor.execute("""
            UPDATE stock_items 
            SET quantity = quantity - %s, updated_at = NOW()
            WHERE id = %s
        """, (sale_data.quantity, sale_data.stock_item_id))
        
        # 4. Record sale
        cursor.execute("""
            INSERT INTO sales (org_id, stock_item_id, sold_by, quantity, total_price)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, sale_date
        """, (org_id, sale_data.stock_item_id, user_id, sale_data.quantity, total_price))
        
        sale_row = cursor.fetchone()
        
        # Get user name for response
        cursor.execute("SELECT full_name FROM users WHERE id = %s", (user_id,))
        user_row = cursor.fetchone()
        user_name = user_row['full_name'] if user_row else "Unknown"
        
        return SaleResponse(
            id=sale_row['id'],
            org_id=org_id,
            stock_item_id=sale_data.stock_item_id,
            stock_item_name=item['name'],
            sold_by=user_id,
            sold_by_name=user_name,
            quantity=sale_data.quantity,
            total_price=total_price,
            sale_date=sale_row['sale_date']
        )

def get_sales_history(org_id: int) -> List[SaleResponse]:
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT s.id, s.org_id, s.stock_item_id, s.sold_by, s.quantity, s.total_price, s.sale_date,
                   i.name as item_name, u.full_name as user_name
            FROM sales s
            LEFT JOIN stock_items i ON s.stock_item_id = i.id
            LEFT JOIN users u ON s.sold_by = u.id
            WHERE s.org_id = %s
            ORDER BY s.sale_date DESC
        """, (org_id,))
        
        rows = cursor.fetchall()
        sales = []
        for row in rows:
            sales.append(SaleResponse(
                id=row['id'],
                org_id=row['org_id'],
                stock_item_id=row['stock_item_id'],
                stock_item_name=row['item_name'],
                sold_by=row['sold_by'],
                sold_by_name=row['user_name'],
                quantity=row['quantity'],
                total_price=float(row['total_price']),
                sale_date=row['sale_date']
            ))
            
        return sales
