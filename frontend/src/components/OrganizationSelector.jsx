import { useState, useEffect } from "react";
import { Building2, Plus, Check } from "lucide-react";
import { setCurrentOrganization, getCurrentUser } from "../utils/storage";
import { fetchOrganizations, createOrganizationApi } from "../utils/api";
import "../styles/organization.css";

const OrganizationSelector = ({ onSelect }) => {
  const user = getCurrentUser();
  const [organizations, setOrganizations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const orgs = await fetchOrganizations(token);
          setOrganizations(orgs);
          // Update local storage backup
          localStorage.setItem('organizations', JSON.stringify(orgs));

          if (orgs.length === 0 && user?.role === "owner") {
            setShowCreateForm(true);
          }
        }
      } catch (err) {
        console.error("Failed to load organizations", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrgs();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const newOrg = await createOrganizationApi({
        name: formData.name,
        description: formData.description
      }, token);

      const updatedOrgs = [...organizations, newOrg];
      setOrganizations(updatedOrgs);
      localStorage.setItem('organizations', JSON.stringify(updatedOrgs));

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
    if (user?.role === "admin" && organizations.length === 1 && !loading) {
      const org = organizations[0];
      handleSelect(org);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, organizations.length, loading]);

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
        user?.role === "owner" && (
          <button
            className="org-add-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} />
            {organizations.length === 0 ? "Create Your First Organization" : "Create New Organization"}
          </button>
        )
      )}
    </div>
  );
};

export default OrganizationSelector;

