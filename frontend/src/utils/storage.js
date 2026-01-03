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

