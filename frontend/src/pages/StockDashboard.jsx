import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
  Package,
  AlertTriangle,
  Search,
  Plus,
  Filter,
  LogOut,
  BarChart3,
  Building2,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertOctagon,
  TrendingUp,
  Truck
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getCurrentUser, getCurrentOrganization, logout as logoutUser } from "../utils/storage";
import { fetchStock, deleteStockItem } from "../utils/api";
import StockItemModal from "../components/StockItemModal";
import ReportLossModal from "../components/ReportLossModal";
import "../styles/dashboard.css";
import "../styles/stock-dashboard.css";

const StockDashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [currentOrganization, setCurrentOrganization] = useState(getCurrentOrganization());
  const [user, setUser] = useState(null);

  // Real data state
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Loss Reporting State
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [itemForLoss, setItemForLoss] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const hasAccess =
      (currentUser.role === "employee" && currentUser.department === "stock") ||
      currentUser.role === "owner" ||
      currentUser.role === "admin";

    if (!hasAccess) {
      navigate("/login");
      return;
    }

    setUser(currentUser);

    if (currentUser.organizationId) {
      const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      const userOrg = organizations.find(o => o.id === currentUser.organizationId);
      if (userOrg) {
        setCurrentOrganization(userOrg);
        localStorage.setItem('currentOrganization', JSON.stringify(userOrg));
      }
    } else {
      const org = getCurrentOrganization();
      if (org) setCurrentOrganization(org);
    }
  }, [navigate]);

  // Fetch stock items
  const loadStockItems = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Pass orgId explicity 
      const items = await fetchStock(token, currentOrganization.id);
      setStockItems(items);
    } catch (err) {
      console.error("Failed to load stock:", err);
      setError("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrganization) {
      loadStockItems();
    }
  }, [currentOrganization]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleReportLoss = (item) => {
    setItemForLoss(item);
    setIsLossModalOpen(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const token = localStorage.getItem('token');
      await deleteStockItem(itemId, token, currentOrganization.id);
      loadStockItems();
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  // Derived stats
  const lowStockItems = stockItems.filter(item => item.quantity <= item.min_threshold);
  const totalStockValue = stockItems.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);

  // Charts data preparation
  const stockByCategory = stockItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const categoryData = Object.entries(stockByCategory).map(([name, value]) => ({
    name,
    quantity: value
  }));

  if (!currentOrganization) {
    return <div className="loading-screen">Loading...</div>; // Simple loading
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'low': return '#EF4444';
      case 'high': return '#10B981';
      default: return '#F59E0B';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'low': return 'Low Stock';
      case 'high': return 'Well Stocked';
      default: return 'Medium';
    }
  }

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      <StockItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onItemSaved={loadStockItems}
        editItem={editingItem}
        orgId={currentOrganization.id}
      />

      <ReportLossModal
        isOpen={isLossModalOpen}
        onClose={() => setIsLossModalOpen(false)}
        stockItem={itemForLoss}
        onLossReported={loadStockItems}
        orgId={currentOrganization?.id}
      />

      {/* Navbar */}
      <header className="dashboard-navbar">
        <div className="dashboard-logo-section">
          <BarChart3 size={28} className="dashboard-logo-icon" />
          <h1 className="dashboard-logo">Bizit</h1>
          <div className="dashboard-org-info">
            <Building2 size={16} />
            <span className="dashboard-org-name">{currentOrganization?.name || "Unknown"}</span>
          </div>
          <span className="dashboard-role stock-role">
            {user?.role === "owner" ? "Owner" : user?.role === "admin" ? "Admin" : "Stock Department"}
          </span>
        </div>
        <div className="dashboard-nav-actions">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div>
              <h2>Stock Management Dashboard</h2>
              <p>Monitor and manage your inventory levels</p>
            </div>
            {(user?.role === "owner" || user?.role === "admin") && (
              <button
                className="back-to-dashboard-btn"
                onClick={() => navigate("/dashboard/owner")}
              >
                <ArrowLeft size={18} />
                <span>Back to Dashboard</span>
              </button>
            )}
            <button
              className="back-to-dashboard-btn" // Reusing style
              onClick={() => navigate("/dashboard/suppliers")}
              style={{ marginLeft: '10px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
            >
              <Truck size={18} />
              <span>Supplier Portal</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="stock-overview">
          <div className="stock-stat-card">
            <div className="stock-stat-icon" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
              <Package size={32} />
            </div>
            <div className="stock-stat-content">
              <h3>Total Items</h3>
              <p className="stock-stat-value">{stockItems.length}</p>
            </div>
          </div>
          <div className="stock-stat-card">
            <div className="stock-stat-icon" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}>
              <AlertTriangle size={32} />
            </div>
            <div className="stock-stat-content">
              <h3>Low Stock Alerts</h3>
              <p className="stock-stat-value">{lowStockItems.length}</p>
            </div>
          </div>
          <div className="stock-stat-card">
            <div className="stock-stat-icon" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
              <TrendingUp size={32} />
            </div>
            <div className="stock-stat-content">
              <h3>Total Stock Value</h3>
              <p className="stock-stat-value">${totalStockValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="stock-stat-card">
            <div className="stock-stat-icon" style={{ background: "linear-gradient(135deg, #0284c7, #0f172a)" }}>
              <Package size={32} />
            </div>
            <div className="stock-stat-content">
              <h3>Total Units</h3>
              <p className="stock-stat-value">
                {stockItems.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-charts">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title-section">
                <Package size={24} className="chart-icon" />
                <h3>Stock by Category</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={darkMode ? "rgba(96, 165, 250, 0.15)" : "rgba(2, 132, 199, 0.1)"}
                />
                <XAxis
                  dataKey="name"
                  stroke={darkMode ? "#f1f5f9" : "#1e293b"}
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke={darkMode ? "#f1f5f9" : "#1e293b"}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
                    border: `1px solid ${darkMode ? '#60a5fa' : '#0284c7'}`,
                    borderRadius: '12px',
                    color: darkMode ? '#f1f5f9' : '#1e293b'
                  }}
                />
                <Bar dataKey="quantity" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Items Table */}
        <div className="stock-items-section">
          <div className="section-header">
            <h3>Stock Items</h3>
            <button className="add-item-btn" onClick={handleAddNew}>
              <Plus size={18} />
              Add Item
            </button>
          </div>

          {lowStockItems.length > 0 && (
            <div className="low-stock-alert">
              <AlertTriangle size={20} />
              <span>{lowStockItems.length} item(s) are running low on stock</span>
            </div>
          )}

          <div className="stock-items-table">
            {loading ? (
              <p>Loading items...</p>
            ) : stockItems.length === 0 ? (
              <p className="empty-state-text">No items in stock. Add your first item!</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                    <th>Min Threshold</th>
                    <th>Max Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((item) => {
                    const statusColor = getStatusColor(item.status);
                    const statusLabel = getStatusLabel(item.status);

                    return (
                      <tr key={item.id} className={item.status === "low" ? "low-stock-row" : ""}>
                        <td className="item-name">{item.name}</td>
                        <td>{item.category}</td>
                        <td>${(item.price || 0).toFixed(2)}</td>
                        <td>
                          <div className="stock-quantity">
                            <span className="quantity-value">{item.quantity}</span>
                            <div className="stock-bar-container">
                              <div
                                className="stock-bar"
                                style={{
                                  width: `${Math.min((item.quantity / item.max_capacity) * 100, 100)}%`,
                                  backgroundColor: statusColor
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{item.min_threshold}</td>
                        <td>{item.max_capacity}</td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                            {statusLabel}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-btn" title="Edit" onClick={() => handleEdit(item)}>
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="delete-btn"
                              title="Report Loss"
                              onClick={() => handleReportLoss(item)}
                              style={{ background: '#FEE2E2', color: '#EF4444' }}
                            >
                              <AlertOctagon size={16} />
                            </button>
                            <button className="delete-btn" title="Delete" onClick={() => handleDelete(item.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockDashboard;

