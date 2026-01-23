const API_URL = 'http://localhost:8000/api';

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Registration failed');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (userId, token) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to delete user`);
        }
        return true;
    } catch (error) {
        throw error;
    }
};

export const updateUserDepartment = async (userId, department, token) => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/department`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ department })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to update department`);
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const getUsersByRole = async (role, token, orgId = null) => {
    try {
        let url = `${API_URL}/users/?role=${role}`;
        if (orgId) {
            url += `&org_id=${orgId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to fetch ${role}s`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${role}s:`, error);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        // 1. Get Token
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        params.append('password', credentials.password);

        const tokenResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        const tokenData = await tokenResponse.json();
        const token = tokenData.access_token;

        // Store token immediately
        localStorage.setItem('token', token);

        // 2. Get User Details
        const userResponse = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await userResponse.json();
        return { user, token };
    } catch (error) {
        throw error;
    }
};

export const createUser = async (userData, role, token, orgId = null) => {
    try {
        let url = `${API_URL}/users/?role=${role}`;
        if (orgId) {
            url += `&org_id=${orgId}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to create ${role}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const fetchOrganizations = async (token) => {
    try {
        const response = await fetch(`${API_URL}/organizations/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch organizations');
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching organizations:", error);
        throw error;
    }
};

export const createOrganizationApi = async (orgData, token) => {
    try {
        const response = await fetch(`${API_URL}/organizations/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orgData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create organization');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Stock Management APIs
export const fetchStock = async (token, orgId = null) => {
    try {
        let url = `${API_URL}/stock/`;
        if (orgId) {
            url += `?org_id=${orgId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stock items');
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching stock:", error);
        throw error;
    }
};

export const createStockItem = async (itemData, token, orgId = null) => {
    try {
        let url = `${API_URL}/stock/`;
        if (orgId) {
            url += `?org_id=${orgId}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create stock item');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const updateStockItem = async (itemId, itemData, token, orgId = null) => {
    try {
        let url = `${API_URL}/stock/${itemId}`;
        if (orgId) {
            url += `?org_id=${orgId}`;
        }

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to update stock item');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const deleteStockItem = async (itemId, token, orgId = null) => {
    try {
        let url = `${API_URL}/stock/${itemId}`;
        if (orgId) {
            url += `?org_id=${orgId}`;
        }

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete stock item');
        }
        return true;
    } catch (error) {
        throw error;
    }
};

// Sales Management APIs
export const fetchSales = async (token, orgId = null) => {
    try {
        let url = `${API_URL}/sales/`;
        if (orgId) {
            url += `?org_id=${orgId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sales history');
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching sales:", error);
        throw error;
    }
};

export const recordSale = async (saleData, token, orgId = null) => {
    try {
        let url = `${API_URL}/sales/`;
        if (orgId) {
            url += `?org_id=${orgId}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(saleData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to record sale');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};
