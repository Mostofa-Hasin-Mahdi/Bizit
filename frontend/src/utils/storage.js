// Utility functions for managing users and organizations in localStorage

// User management
export const createUser = (username, password, email) => {
  const users = getUsers();
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  const newUser = {
    id: Date.now().toString(),
    username,
    password, // In production, this should be hashed
    email,
    role: 'owner',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const getUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const authenticateUser = (username, password) => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user ? { ...user, password: undefined } : null; // Don't return password
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentOrganization');
};

// Organization management
export const createOrganization = (name, description) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be logged in to create organization');
  }
  
  const organizations = getOrganizations();
  const newOrg = {
    id: Date.now().toString(),
    name,
    description: description || '',
    ownerId: user.id,
    createdAt: new Date().toISOString()
  };
  
  organizations.push(newOrg);
  localStorage.setItem('organizations', JSON.stringify(organizations));
  return newOrg;
};

export const getOrganizations = () => {
  const orgs = localStorage.getItem('organizations');
  return orgs ? JSON.parse(orgs) : [];
};

export const getUserOrganizations = (userId) => {
  const organizations = getOrganizations();
  return organizations.filter(org => org.ownerId === userId);
};

export const getCurrentOrganization = () => {
  const org = localStorage.getItem('currentOrganization');
  return org ? JSON.parse(org) : null;
};

export const setCurrentOrganization = (organization) => {
  localStorage.setItem('currentOrganization', JSON.stringify(organization));
};

// Admin management (only owners can create/delete admins)
export const createAdmin = (username, password, email, organizationId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User must be logged in to create admins');
  }
  // Check role (case-insensitive and trimmed for safety)
  const userRole = currentUser.role?.toLowerCase()?.trim();
  if (userRole !== 'owner') {
    throw new Error(`Only owners can create admins. Current role: ${currentUser.role || 'undefined'}`);
  }
  
  const users = getUsers();
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  const newAdmin = {
    id: Date.now().toString(),
    username,
    password, // In production, this should be hashed
    email,
    role: 'admin',
    organizationId,
    createdBy: currentUser.id,
    createdAt: new Date().toISOString()
  };
  
  users.push(newAdmin);
  localStorage.setItem('users', JSON.stringify(users));
  return { ...newAdmin, password: undefined };
};

export const deleteAdmin = (adminId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User must be logged in to delete admins');
  }
  const userRole = currentUser.role?.toLowerCase()?.trim();
  if (userRole !== 'owner') {
    throw new Error('Only owners can delete admins');
  }
  
  const users = getUsers();
  const admin = users.find(u => u.id === adminId && u.role === 'admin');
  if (!admin) {
    throw new Error('Admin not found');
  }
  
  const updatedUsers = users.filter(u => u.id !== adminId);
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  return true;
};

export const getAdminsByOrganization = (organizationId) => {
  const users = getUsers();
  return users.filter(u => u.role === 'admin' && u.organizationId === organizationId)
    .map(u => ({ ...u, password: undefined }));
};

// Employee management (admins can create/delete employees)
export const createEmployee = (username, password, email, department, organizationId) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User must be logged in to create employees');
  }
  if (currentUser.role !== 'admin' && currentUser.role !== 'owner') {
    throw new Error('Only owners and admins can create employees');
  }
  
  if (!['stock', 'sales'].includes(department)) {
    throw new Error('Department must be either "stock" or "sales"');
  }
  
  const users = getUsers();
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  const newEmployee = {
    id: Date.now().toString(),
    username,
    password, // In production, this should be hashed
    email,
    role: 'employee',
    department,
    organizationId,
    createdBy: currentUser.id,
    createdAt: new Date().toISOString()
  };
  
  users.push(newEmployee);
  localStorage.setItem('users', JSON.stringify(users));
  return { ...newEmployee, password: undefined };
};

export const deleteEmployee = (employeeId) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can delete employees');
  }
  
  const users = getUsers();
  const employee = users.find(u => u.id === employeeId && u.role === 'employee');
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  const updatedUsers = users.filter(u => u.id !== employeeId);
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  return true;
};

export const updateEmployeeDepartment = (employeeId, department) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Only admins can update employee departments');
  }
  
  if (!['stock', 'sales'].includes(department)) {
    throw new Error('Department must be either "stock" or "sales"');
  }
  
  const users = getUsers();
  const employee = users.find(u => u.id === employeeId && u.role === 'employee');
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  employee.department = department;
  localStorage.setItem('users', JSON.stringify(users));
  return { ...employee, password: undefined };
};

export const getEmployeesByOrganization = (organizationId) => {
  const users = getUsers();
  return users.filter(u => u.role === 'employee' && u.organizationId === organizationId)
    .map(u => ({ ...u, password: undefined }));
};

