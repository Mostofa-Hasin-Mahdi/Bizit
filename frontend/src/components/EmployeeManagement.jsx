import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Mail, User, Package, ShoppingCart } from "lucide-react";
import { 
  getEmployeesByOrganization, 
  createEmployee, 
  deleteEmployee,
  updateEmployeeDepartment,
  getCurrentOrganization 
} from "../utils/storage";
import "../styles/management.css";

const EmployeeManagement = () => {
  const organization = getCurrentOrganization();
  const [employees, setEmployees] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "stock"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEmployees = () => {
    if (organization) {
      const orgEmployees = getEmployeesByOrganization(organization.id);
      setEmployees(orgEmployees);
    }
  };

  useEffect(() => {
    if (organization) {
      const orgEmployees = getEmployeesByOrganization(organization.id);
      setEmployees(orgEmployees);
    }
  }, [organization]);

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      createEmployee(
        formData.username,
        formData.password,
        formData.email,
        formData.department,
        organization.id
      );
      setSuccess("Employee created successfully!");
      setFormData({ 
        username: "", 
        email: "", 
        password: "", 
        confirmPassword: "",
        department: "stock"
      });
      setShowCreateForm(false);
      loadEmployees();
    } catch (err) {
      setError(err.message || "Failed to create employee");
    }
  };

  const handleDelete = (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      deleteEmployee(employeeId);
      setSuccess("Employee deleted successfully!");
      loadEmployees();
    } catch (err) {
      setError(err.message || "Failed to delete employee");
    }
  };

  const handleDepartmentChange = (employeeId, newDepartment) => {
    try {
      updateEmployeeDepartment(employeeId, newDepartment);
      setSuccess("Employee department updated successfully!");
      loadEmployees();
    } catch (err) {
      setError(err.message || "Failed to update department");
    }
  };

  const getDepartmentIcon = (department) => {
    return department === "stock" ? Package : ShoppingCart;
  };

  const getDepartmentLabel = (department) => {
    return department === "stock" ? "Stock Department" : "Sales Department";
  };

  return (
    <div className="management-section">
      <div className="management-header">
        <div className="management-title-section">
          <Users size={28} className="management-icon" />
          <div>
            <h2>Employee Management</h2>
            <p>Create and manage employee accounts, assign departments</p>
          </div>
        </div>
        <button
          className="management-add-btn"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setError("");
            setSuccess("");
          }}
        >
          <Plus size={18} />
          {showCreateForm ? "Cancel" : "Add Employee"}
        </button>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="management-form-card">
          <h3>Create New Employee</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="employee-username">Username *</label>
              <input
                id="employee-username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="employee-email">Email *</label>
              <input
                id="employee-email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="employee-password">Password *</label>
              <input
                id="employee-password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="employee-confirm-password">Confirm Password *</label>
              <input
                id="employee-confirm-password"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="employee-department">Department *</label>
              <select
                id="employee-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="stock">Stock Department</option>
                <option value="sales">Sales Department</option>
              </select>
            </div>
            <button type="submit" className="form-submit-btn">
              Create Employee
            </button>
          </form>
        </div>
      )}

      <div className="management-list">
        <h3>Employees ({employees.length})</h3>
        {employees.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>No employees created yet</p>
          </div>
        ) : (
          <div className="management-grid">
            {employees.map((employee) => {
              const DepartmentIcon = getDepartmentIcon(employee.department);
              return (
                <div key={employee.id} className="management-card">
                  <div className="management-card-header">
                    <div className={`management-card-icon-wrapper employee-icon ${employee.department}`}>
                      <DepartmentIcon size={24} />
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(employee.id)}
                      title="Delete employee"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="management-card-content">
                    <div className="management-card-info">
                      <User size={16} />
                      <span className="management-card-name">{employee.username}</span>
                    </div>
                    <div className="management-card-info">
                      <Mail size={16} />
                      <span>{employee.email}</span>
                    </div>
                    <div className="management-card-department">
                      <label>Department:</label>
                      <select
                        value={employee.department}
                        onChange={(e) => handleDepartmentChange(employee.id, e.target.value)}
                        className="department-select"
                      >
                        <option value="stock">Stock Department</option>
                        <option value="sales">Sales Department</option>
                      </select>
                    </div>
                    <div className="management-card-meta">
                      Created: {new Date(employee.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;

