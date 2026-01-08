import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  LogOut,
  BarChart3,
  Building2,
  ArrowLeft,
  Search
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { getCurrentUser, getCurrentOrganization, logout as logoutUser } from "../utils/storage";
import "../styles/dashboard.css";
import "../styles/sales-dashboard.css";

const SalesDashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [currentOrganization, setCurrentOrganization] = useState(getCurrentOrganization());
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample items data (will be replaced with API calls later)
  // Using the same items as stock dashboard for consistency
  const [items] = useState([
    { id: 1, name: "Ryzen 5 7500F", quantity: 150, price: 199.99, category: "Components" },
    { id: 2, name: "Galax RTX 4070ti 8GB", quantity: 25, price: 799.99, category: "Components" },
    { id: 3, name: "ASROCK B550 Motherboard", quantity: 320, price: 149.99, category: "Components" },
    { id: 4, name: "Kinera Freya", quantity: 45, price: 89.99, category: "Accessories" },
    { id: 5, name: "Netac 512GB M.2 NVME SSD", quantity: 180, price: 59.99, category: "Storage" },
  ]);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total available items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total inventory value
  const totalInventoryValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Items by category for chart
  const itemsByCategory = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const categoryData = Object.entries(itemsByCategory).map(([name, quantity]) => ({
    name,
    quantity
  }));

  // Top selling items (sample data - will be replaced with API)
  const topItems = items
    .filter(item => item.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  useEffect(() => {
    // Check if user is logged in - allow sales employees, owners, and admins
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    // Allow access for: sales employees, owners, and admins
    const hasAccess = 
      (currentUser.role === "employee" && currentUser.department === "sales") ||
      currentUser.role === "owner" ||
      currentUser.role === "admin";
    
    if (!hasAccess) {
      navigate("/login");
      return;
    }
    
    setUser(currentUser);
    
    // Set organization for employees
    if (currentUser.organizationId) {
      const timer = setTimeout(() => {
        const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
        const userOrg = organizations.find(o => o.id === currentUser.organizationId);
        if (userOrg) {
          setCurrentOrganization(userOrg);
          localStorage.setItem('currentOrganization', JSON.stringify(userOrg));
        }
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const org = getCurrentOrganization();
      if (org) {
        const timer = setTimeout(() => {
          setCurrentOrganization(org);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (!currentOrganization) {
    return (
      <div className={`dashboard ${darkMode ? "dark" : ""}`}>
        <header className="dashboard-navbar">
          <div className="dashboard-logo-section">
            <BarChart3 size={28} className="dashboard-logo-icon" />
            <h1 className="dashboard-logo">Bizit</h1>
            <span className="dashboard-role">Sales Employee</span>
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
        <main className="dashboard-main">
          <div className="loading-message">Loading organization...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      <header className="dashboard-navbar">
        <div className="dashboard-logo-section">
          <BarChart3 size={28} className="dashboard-logo-icon" />
          <h1 className="dashboard-logo">Bizit</h1>
          <div className="dashboard-org-info">
            <Building2 size={16} />
            <span className="dashboard-org-name">{currentOrganization?.name || "Unknown"}</span>
          </div>
          <span className="dashboard-role sales-role">
            {user?.role === "owner" ? "Owner" : user?.role === "admin" ? "Admin" : "Sales Department"}
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
              <h2>Sales Dashboard</h2>
              <p>View available items and manage sales</p>
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
          </div>
        </div>

        {/* Overview Stats */}
        <div className="sales-overview">
          <div className="sales-stat-card">
            <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
              <ShoppingCart size={32} />
            </div>
            <div className="sales-stat-content">
              <h3>Total Items</h3>
              <p className="sales-stat-value">{items.length}</p>
            </div>
          </div>
          <div className="sales-stat-card">
            <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
              <Package size={32} />
            </div>
            <div className="sales-stat-content">
              <h3>Total Units Available</h3>
              <p className="sales-stat-value">{totalItems.toLocaleString()}</p>
            </div>
          </div>
          <div className="sales-stat-card">
            <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
              <DollarSign size={32} />
            </div>
            <div className="sales-stat-content">
              <h3>Inventory Value</h3>
              <p className="sales-stat-value">${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="sales-stat-card">
            <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #6F00FF, #3B0270)" }}>
              <TrendingUp size={32} />
            </div>
            <div className="sales-stat-content">
              <h3>Available Categories</h3>
              <p className="sales-stat-value">{Object.keys(itemsByCategory).length}</p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="dashboard-charts">
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title-section">
                <Package size={24} className="chart-icon" />
                <h3>Items by Category</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? "rgba(233, 179, 251, 0.1)" : "rgba(111, 0, 255, 0.1)"} 
                />
                <XAxis 
                  dataKey="name" 
                  stroke={darkMode ? "#f4eaff" : "#2b2b2b"}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={darkMode ? "#f4eaff" : "#2b2b2b"}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#2a0144' : '#E9B3FB',
                    border: `1px solid ${darkMode ? '#E9B3FB' : '#6F00FF'}`,
                    borderRadius: '12px',
                    color: darkMode ? '#f4eaff' : '#2b2b2b'
                  }}
                />
                <Bar dataKey="quantity" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Items Section */}
        <div className="sales-items-section">
          <div className="section-header">
            <h3>Available Items</h3>
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search items by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>No items found matching your search</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-card-header">
                    <div className="item-category-badge">{item.category}</div>
                    <div className={`item-availability ${item.quantity > 0 ? 'available' : 'out-of-stock'}`}>
                      {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                  <div className="item-card-body">
                    <h4 className="item-name">{item.name}</h4>
                    <div className="item-details">
                      <div className="item-detail-row">
                        <span className="item-label">Quantity Available:</span>
                        <span className="item-value quantity-value">{item.quantity}</span>
                      </div>
                      <div className="item-detail-row">
                        <span className="item-label">Price:</span>
                        <span className="item-value price-value">${item.price.toFixed(2)}</span>
                      </div>
                      <div className="item-detail-row">
                        <span className="item-label">Total Value:</span>
                        <span className="item-value total-value">
                          ${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesDashboard;

