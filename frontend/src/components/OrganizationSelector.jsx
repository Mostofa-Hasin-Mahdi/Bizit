import { useState, useEffect } from "react";
import { Building2, Plus, Check } from "lucide-react";
import { getUserOrganizations, createOrganization, setCurrentOrganization, getCurrentUser, getOrganizations } from "../utils/storage";
import "../styles/organization.css";

const OrganizationSelector = ({ onSelect }) => {
  const user = getCurrentUser();
  const [organizations, setOrganizations] = useState(() => {
    if (user?.role === "owner") {
      return getUserOrganizations(user?.id || "");
    } else if (user?.role === "admin" && user?.organizationId) {
      // Admins see only their assigned organization
      const allOrgs = getOrganizations();
      const userOrg = allOrgs.find(o => o.id === user.organizationId);
      return userOrg ? [userOrg] : [];
    }
    return [];
  });
  const [showCreateForm, setShowCreateForm] = useState(organizations.length === 0);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [error, setError] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      const newOrg = createOrganization(formData.name, formData.description);
      setOrganizations([...organizations, newOrg]);
      setFormData({ name: "", description: "" });
      setShowCreateForm(false);
      // Auto-select the newly created organization
      handleSelect(newOrg);
    } catch (err) {
      setError(err.message || "Failed to create organization");
    }
  };

  const handleSelect = (organization) => {
    setCurrentOrganization(organization);
    onSelect(organization);
  };

  useEffect(() => {
    // Auto-select organization for admins
    if (user?.role === "admin" && organizations.length === 1) {
      const org = organizations[0];
      setCurrentOrganization(org);
      onSelect(org);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, organizations.length]);

  return (
    <div className="organization-selector">
      <div className="org-selector-header">
        <Building2 size={32} className="org-header-icon" />
        <h2>Select or Create Organization</h2>
        <p>Choose an organization to view its dashboard, or create a new one</p>
      </div>

      {organizations.length > 0 && (
        <div className="org-list">
          <h3>{user?.role === "admin" ? "Your Organization" : "Your Organizations"}</h3>
          <div className="org-cards">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="org-card"
                onClick={() => handleSelect(org)}
              >
                <div className="org-card-content">
                  <Building2 size={24} className="org-card-icon" />
                  <div className="org-card-info">
                    <h4>{org.name}</h4>
                    {org.description && <p>{org.description}</p>}
                  </div>
                </div>
                <Check size={20} className="org-select-icon" />
              </div>
            ))}
          </div>
        </div>
      )}

      {user?.role === "owner" && showCreateForm ? (
        <div className="org-create-form">
          <h3>{organizations.length > 0 ? "Create New Organization" : "Create Your First Organization"}</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="org-name">Organization Name *</label>
              <input
                id="org-name"
                type="text"
                placeholder="Enter organization name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="org-description">Description (Optional)</label>
              <textarea
                id="org-description"
                placeholder="Enter organization description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="org-form-actions">
              <button type="submit" className="org-create-btn">
                <Plus size={18} />
                Create Organization
              </button>
              {organizations.length > 0 && (
                <button
                  type="button"
                  className="org-cancel-btn"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: "", description: "" });
                    setError("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        user?.role === "owner" && organizations.length > 0 && (
          <button
            className="org-add-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} />
            Create New Organization
          </button>
        )
      )}
    </div>
  );
};

export default OrganizationSelector;

