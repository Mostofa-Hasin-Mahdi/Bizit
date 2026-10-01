import pytest
from jose import jwt
from datetime import datetime, timedelta

def test_unauthenticated_request(client):
    # Test 1.1: Unauthenticated request
    response = client.get("/api/stock")
    assert response.status_code == 401

def test_a_lists_resource(client, seeded_data):
    # Test 1.2: A lists a resource -> Only A's rows
    token = seeded_data["org_a"]["admin"]["token"]
    response = client.get("/api/stock", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    # Assuming it returns a list of items
    assert len(data) > 0
    for item in data:
        assert item["org_id"] == seeded_data["org_a"]["id"]
        # Ensure B's data didn't leak
        assert item["id"] != seeded_data["org_b"]["stock_id"]

def test_b_requests_a_record_by_id(client, seeded_data):
    # Test 1.3: B requests A's record by id -> 404/403
    # The API only has PATCH and DELETE for specific items
    token = seeded_data["org_b"]["admin"]["token"]
    target_id = seeded_data["org_a"]["stock_id"]
    payload = {"quantity": 5}
    response = client.patch(f"/api/stock/{target_id}", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code in (403, 404)

def test_b_modifies_a_record(client, seeded_data):
    # Test 1.4: B sends PUT/DELETE to A's id -> 404/403
    token = seeded_data["org_b"]["admin"]["token"]
    target_id = seeded_data["org_a"]["stock_id"]
    response = client.delete(f"/api/stock/{target_id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code in (403, 404)

def test_b_posts_body_containing_a_org_id(client, seeded_data):
    # Test 1.5: B POSTs body containing A's org_id
    token = seeded_data["org_b"]["admin"]["token"]
    payload = {
        "name": "Malicious Post",
        "category": "Test",
        "quantity": 100,
        "org_id": seeded_data["org_a"]["id"]
    }
    response = client.post("/api/stock", json=payload, headers={"Authorization": f"Bearer {token}"})
    # Either it ignores the org_id and puts it in org B, or it rejects it
    if response.status_code in (200, 201):
        data = response.json()
        assert data.get("org_id") == seeded_data["org_b"]["id"]
    else:
        assert response.status_code in (400, 403, 422)

def test_aggregates_exclude_b_data(client, seeded_data):
    # Test 1.6: Dashboard totals exclude B's data
    token = seeded_data["org_a"]["admin"]["token"]
    response = client.get("/api/analytics/dashboard", headers={"Authorization": f"Bearer {token}"})
    # If the endpoint exists and returns a total stock quantity:
    if response.status_code == 200:
        data = response.json()
        total_quantity = data.get("total_stock_quantity", 0)
        # B has an item with 999999 quantity, so if total is massive, we leaked
        assert total_quantity < 500000

def test_owner_switches_to_unowned_org(client, seeded_data):
    # Test 1.7: Owner switches org to one they don't own
    token = seeded_data["org_a"]["owner"]["token"]
    target_org = seeded_data["org_b"]["id"]
    response = client.get(f"/api/organizations/{target_org}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code in (403, 404)

def test_tampered_jwt(client, seeded_data):
    # Test 1.8: Tampered JWT
    from app.core.config import settings
    # Create a forged token claiming to be Org A but signed randomly
    fake_payload = {
        "sub": str(seeded_data["org_b"]["admin"]["id"]),
        "org_id": seeded_data["org_a"]["id"],
        "role": "admin",
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    # Using a wrong secret key to forge it
    forged_token = jwt.encode(fake_payload, "wrong_secret", algorithm="HS256")
    
    response = client.get("/api/stock", headers={"Authorization": f"Bearer {forged_token}"})
    assert response.status_code == 401
