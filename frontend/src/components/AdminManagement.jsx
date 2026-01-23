import { useState, useEffect } from "react";
import { UserCog, Plus, Trash2, Mail, User } from "lucide-react";
import { getCurrentOrganization } from "../utils/storage";
import { createUser, getUsersByRole, deleteUser } from "../utils/api";
import "../styles/management.css";

const AdminManagement = () => {
  const organization = getCurrentOrganization();
  const [admins, setAdmins] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadAdmins = async () => {
    if (organization) {
      try {
        const token = localStorage.getItem('token');
        const orgAdmins = await getUsersByRole("admin", token, organization.id);
        setAdmins(orgAdmins);
      } catch (err) {
        console.error("Failed to load admins:", err);
      }
    }
  };

  useEffect(() => {
    if (!organization) return;
    loadAdmins();
  }, [organization]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!organization) {
      setError("Please select an organization first");
      return;
    }

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
      const token = localStorage.getItem('token');
      await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.username
      }, "admin", token, organization.id);

      setSuccess("Admin created successfully!");
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
      setShowCreateForm(false);
      loadAdmins();
    } catch (err) {
      console.error("Error creating admin:", err);
      setError(err.message || "Failed to create admin");
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await deleteUser(adminId, token);
      setSuccess("Admin deleted successfully!");
      loadAdmins();
    } catch (err) {
      setError(err.message || "Failed to delete admin");
    }
  };

  return (
    <div className="management-section">
      <div className="management-header">
        <div className="management-title-section">
          <UserCog size={28} className="management-icon" />
          <div>
            <h2>Admin Management</h2>
            <p>Create and manage admin accounts for your organization</p>
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
          {showCreateForm ? "Cancel" : "Add Admin"}
        </button>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="management-form-card">
          <h3>Create New Admin</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="admin-username">Username *</label>
              <input
                id="admin-username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-email">Email *</label>
              <input
                id="admin-email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-password">Password *</label>
              <input
                id="admin-password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-confirm-password">Confirm Password *</label>
              <input
                id="admin-confirm-password"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="form-submit-btn">
              Create Admin
            </button>
          </form>
        </div>
      )}

      <div className="management-list">
        <h3>Admins ({admins.length})</h3>
        {admins.length === 0 ? (
          <div className="empty-state">
            <UserCog size={48} />
            <p>No admins created yet</p>
          </div>
        ) : (
          <div className="management-grid">
            {admins.map((admin) => (
              <div key={admin.id} className="management-card">
                <div className="management-card-header">
                  <div className="management-card-icon-wrapper admin-icon">
                    <UserCog size={24} />
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(admin.id)}
                    title="Delete admin"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="management-card-content">
                  <div className="management-card-info">
                    <User size={16} />
                    <span className="management-card-name">{admin.username}</span>
                  </div>
                  <div className="management-card-info">
                    <Mail size={16} />
                    <span>{admin.email}</span>
                  </div>
                  <div className="management-card-meta">
                    Created: {new Date(admin.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
