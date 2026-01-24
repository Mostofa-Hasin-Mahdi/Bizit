from app.core.database import get_db_cursor
from app.schemas.loss import LossCreate, LossResponse

def report_loss(loss_data: LossCreate, user_id: int, org_id: int):
    with get_db_cursor() as cursor:
        # 1. Get current item cost and qty
        cursor.execute("SELECT name, quantity, cost_price FROM stock_items WHERE id = %s AND org_id = %s", (loss_data.stock_item_id, org_id))
        item = cursor.fetchone()
        
        if not item:
            raise Exception("Item not found")
        
        if item['quantity'] < loss_data.quantity:
            raise Exception("Insufficient stock to report loss")
            
        # 2. Deduct Stock
        cursor.execute("""
            UPDATE stock_items 
            SET quantity = quantity - %s, updated_at = NOW()
            WHERE id = %s
        """, (loss_data.quantity, loss_data.stock_item_id))
        
        # 3. Record Loss
        cursor.execute("""
            INSERT INTO losses (org_id, stock_item_id, quantity, cost_at_loss, reason, notes, reported_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, loss_date
        """, (org_id, loss_data.stock_item_id, loss_data.quantity, item['cost_price'], loss_data.reason, loss_data.notes, user_id))
        
        return True

def get_analytics_summary(org_id: int):
    # Debug logging
    print(f"DEBUG: Generating analytics for Org ID: {org_id}")
    
    with get_db_cursor() as cursor:
        # Total Revenue (From Sales)
        cursor.execute("SELECT COALESCE(SUM(total_price), 0) as revenue FROM sales WHERE org_id = %s", (org_id,))
        rev_row = cursor.fetchone()
        revenue = float(rev_row['revenue']) if rev_row else 0.0
        print(f"DEBUG: Revenue: {revenue}")
        
        # Cost of Goods Sold (COGS)
        cursor.execute("""
            SELECT COALESCE(SUM(s.quantity * si.cost_price), 0) as cogs
            FROM sales s
            JOIN stock_items si ON s.stock_item_id = si.id
            WHERE s.org_id = %s
        """, (org_id,))
        cogs_row = cursor.fetchone()
        cogs = float(cogs_row['cogs']) if cogs_row else 0.0
        print(f"DEBUG: COGS: {cogs}")
        
        # Total Losses
        cursor.execute("SELECT COALESCE(SUM(cost_at_loss * quantity), 0) as losses FROM losses WHERE org_id = %s", (org_id,))
        loss_row = cursor.fetchone()
        total_lost_value = float(loss_row['losses']) if loss_row else 0.0
        print(f"DEBUG: Losses: {total_lost_value}")
        
        gross_profit = revenue - cogs
        net_profit = gross_profit - total_lost_value
        
        return {
            "revenue": revenue,
            "cogs": cogs,
            "gross_profit": gross_profit,
            "losses": total_lost_value,
            "net_profit": net_profit
        }

def get_loss_history(org_id: int):
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT l.*, si.name as item_name, u.full_name as reported_by_name
            FROM losses l
            JOIN stock_items si ON l.stock_item_id = si.id
            LEFT JOIN users u ON l.reported_by = u.id
            WHERE l.org_id = %s
            ORDER BY l.loss_date DESC
        """, (org_id,))
        
        rows = cursor.fetchall()
        return [
            {
                "id": row['id'],
                "item_name": row['item_name'],
                "quantity": row['quantity'],
                "cost_at_loss": float(row['cost_at_loss']),
                "total_loss": float(row['cost_at_loss']) * row['quantity'],
                "reason": row['reason'],
                "date": row['loss_date'],
                "reported_by": row['reported_by_name']
            } for row in rows
        ]
