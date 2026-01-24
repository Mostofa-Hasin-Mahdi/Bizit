from typing import List, Optional
from datetime import date
from app.core.database import get_db_cursor
from app.schemas.supplier import (
    SupplierCreate, SupplierResponse, 
    ShipmentCreate, ShipmentResponse, ShipmentRate, ShipmentUpdateStatus
)

# --- Suppliers ---

def create_supplier(data: SupplierCreate, org_id: int) -> SupplierResponse:
    with get_db_cursor() as cursor:
        cursor.execute("""
            INSERT INTO suppliers (org_id, name, phone, email, address)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, org_id, name, phone, email, address, created_at, updated_at
        """, (org_id, data.name, data.phone, data.email, data.address))
        row = cursor.fetchone()
        if not row:
            raise Exception("Failed to create supplier")
        return SupplierResponse(**row)

def get_suppliers(org_id: int) -> List[SupplierResponse]:
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT id, org_id, name, phone, email, address, created_at, updated_at
            FROM suppliers WHERE org_id = %s ORDER BY name ASC
        """, (org_id,))
        rows = cursor.fetchall()
        return [SupplierResponse(**row) for row in rows]

# --- Shipments ---

def create_shipment(data: ShipmentCreate, org_id: int) -> ShipmentResponse:
    with get_db_cursor() as cursor:
        # Verify supplier belongs to org
        cursor.execute("SELECT id FROM suppliers WHERE id = %s AND org_id = %s", (data.supplier_id, org_id))
        if not cursor.fetchone():
            raise Exception("Supplier not found")

        cursor.execute("""
            INSERT INTO shipments (org_id, supplier_id, expected_quantity, expected_date, notes, status)
            VALUES (%s, %s, %s, %s, %s, 'Pending')
            RETURNING id, org_id, supplier_id, expected_quantity, expected_date, notes, status, created_at, updated_at
        """, (org_id, data.supplier_id, data.expected_quantity, data.expected_date, data.notes))
        
        row = cursor.fetchone()
        if not row:
            raise Exception("Failed to create shipment")
            
        # Enrich with supplier name for convenience mostly
        # Actually returning simple response for now, list view will join
        return ShipmentResponse(**row, received_quantity=None, damaged_quantity=None, received_date=None, score=None)

def get_shipments(org_id: int) -> List[ShipmentResponse]:
    with get_db_cursor() as cursor:
        cursor.execute("""
            SELECT s.*, sup.name as supplier_name
            FROM shipments s
            JOIN suppliers sup ON s.supplier_id = sup.id
            WHERE s.org_id = %s
            ORDER BY s.expected_date ASC
        """, (org_id,))
        rows = cursor.fetchall()
        return [ShipmentResponse(**row) for row in rows]

def update_shipment_status(shipment_id: int, data: ShipmentUpdateStatus, org_id: int) -> bool:
    with get_db_cursor() as cursor:
        updates = ["status = %s", "updated_at = NOW()"]
        values = [data.status]
        
        if data.received_date:
            updates.append("received_date = %s")
            values.append(data.received_date)
            
        values.append(shipment_id)
        values.append(org_id)
        
        cursor.execute(f"""
            UPDATE shipments SET {', '.join(updates)}
            WHERE id = %s AND org_id = %s
        """, tuple(values))
        return True

def rate_shipment(shipment_id: int, data: ShipmentRate, org_id: int) -> ShipmentResponse:
    with get_db_cursor() as cursor:
        # Get expected quantity first
        cursor.execute("SELECT expected_quantity, supplier_id FROM shipments WHERE id = %s AND org_id = %s", (shipment_id, org_id))
        ship = cursor.fetchone()
        if not ship:
            raise Exception("Shipment not found")
            
        expected = ship['expected_quantity']
        rec = data.received_quantity
        dmg = data.damaged_quantity
        
        # Calculate Score: (Received - Damaged) / Expected * 100
        # Cap at 0? No, allow negative? No, score implies performance.
        # If Rec=0, score 0.
        score = 0.0
        if expected > 0:
            good_items = max(0, rec - dmg)
            score = (good_items / expected) * 100
            score = min(score, 100.0) # Cap at 100 if they sent extra? Optional.
            
        recv_date = data.received_date if data.received_date else date.today()
        
        cursor.execute("""
            UPDATE shipments 
            SET received_quantity = %s, damaged_quantity = %s, score = %s, 
                received_date = %s, status = 'Arrived', updated_at = NOW()
            WHERE id = %s AND org_id = %s
            RETURNING *
        """, (rec, dmg, score, recv_date, shipment_id, org_id))
        
        row = cursor.fetchone()
        if not row:
            raise Exception("Failed to update shipment")
            
        # Get supplier name
        cursor.execute("SELECT name FROM suppliers WHERE id = %s", (ship['supplier_id'],))
        sup = cursor.fetchone()
        
        return ShipmentResponse(**row, supplier_name=sup['name'] if sup else "Unknown")
