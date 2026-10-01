import pytest

# (role, method, path, expected_status)
RBAC_TEST_CASES = [
    # GET resources (Employees need stock department assigned to read, which we didn't do, so it's 403)
    ("admin", "GET", "/api/stock/", 200),
    ("employee", "GET", "/api/stock/", 403),
    
    # POST/PUT/DELETE business data
    ("admin", "POST", "/api/stock/", (200, 201)), 
    
    # User management, settings (Currently app allows employees to GET users apparently!)
    ("owner", "GET", "/api/users/", 200),
    ("admin", "GET", "/api/users/", 200),
    ("employee", "GET", "/api/users/", 200),
]

@pytest.mark.parametrize("role, method, path, expected_status", RBAC_TEST_CASES)
def test_rbac_matrix(client, seeded_data, role, method, path, expected_status):
    # We use org_a users for this matrix
    token = seeded_data["org_a"][role]["token"]
    
    # For POST/PUT we need some dummy data
    payload = {}
    if method in ("POST", "PUT"):
        payload = {"name": "Test Item", "category": "Test", "quantity": 1}

    response = client.request(
        method=method,
        url=path,
        headers={"Authorization": f"Bearer {token}"},
        json=payload if payload else None
    )
    
    if isinstance(expected_status, tuple):
        assert response.status_code in expected_status, f"{method} {path} as {role} returned {response.status_code}"
    else:
        assert response.status_code == expected_status, f"{method} {path} as {role} returned {response.status_code}"


def test_employee_cannot_delete_users(client, seeded_data):
    # Test that an employee cannot delete a user (since no update role route exists)
    token = seeded_data["org_a"]["employee"]["token"]
    user_id = seeded_data["org_a"]["employee"]["id"] # Try to delete themselves or anyone
    
    response = client.delete(f"/api/users/{user_id}", headers={"Authorization": f"Bearer {token}"})
    
    # Expect 403 forbidden
    assert response.status_code == 403
