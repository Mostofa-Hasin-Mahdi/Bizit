import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  LogOut,
  BarChart3,
  Building2,
  Plus,
  Edit,
  Trash2,
  ArrowLeft
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
  Legend
} from "recharts";
import { getCurrentUser, getCurrentOrganization, logout as logoutUser } from "../utils/storage";
import "../styles/dashboard.css";
import "../styles/stock-dashboard.css";

const StockDashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [currentOrganization, setCurrentOrganization] = useState(getCurrentOrganization());
  const [user, setUser] = useState(null);

  // Sample stock data (will be replaced with API calls later)
  const [stockItems] = useState([
    { id: 1, name: "Ryzen 5 7500F", quantity: 150, minThreshold: 50, maxCapacity: 500, category: "Components" },
    { id: 2, name: "Galax RTX 4070ti 8GB", quantity: 25, minThreshold: 30, maxCapacity: 200, category: "Components" },
    { id: 3, name: "ASROCK B550 Motherboard", quantity: 320, minThreshold: 100, maxCapacity: 600, category: "Components" },
    { id: 4, name: "Kinera Freya", quantity: 45, minThreshold: 50, maxCapacity: 300, category: "Accessories" },
    { id: 5, name: "Netac 512GB M.2 NVME SSD", quantity: 180, minThreshold: 80, maxCapacity: 400, category: "Storage" },
  ]);

  // Calculate low stock items
  const lowStockItems = stockItems.filter(item => item.quantity <= item.minThreshold);
  
  // Calculate total stock value
  const totalStockValue = stockItems.reduce((sum, item) => sum + (item.quantity * 10), 0); // Assuming $10 per unit

  // Stock level trends (last 7 days) - sample data
  const stockTrendData = [
    { day: "Mon", stock: 720 },
    { day: "Tue", stock: 680 },
    { day: "Wed", stock: 750 },
    { day: "Thu", stock: 710 },
    { day: "Fri", stock: 690 },
    { day: "Sat", stock: 730 },
    { day: "Sun", stock: 720 }
  ];

  // Stock by category
  const stockByCategory = stockItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const categoryData = Object.entries(stockByCategory).map(([name, value]) => ({
    name,
    quantity: value
  }));

  useEffect(() => {
    // Check if user is logged in - allow stock employees, owners, and admins
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    // Allow access for: stock employees, owners, and admins
    const hasAccess = 
      (currentUser.role === "employee" && currentUser.department === "stock") ||
      currentUser.role === "owner" ||
      currentUser.role === "admin";
    
    if (!hasAccess) {
      navigate("/login");
      return;
    }
    
    setUser(currentUser);
    
    // Set organization for employees
    if (currentUser.organizationId) {
      const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      const userOrg = organizations.find(o => o.id === currentUser.organizationId);
      if (userOrg) {
        setCurrentOrganization(userOrg);
        localStorage.setItem('currentOrganization', JSON.stringify(userOrg));
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const getStockStatus = (item) => {
    const percentage = (item.quantity / item.maxCapacity) * 100;
    if (item.quantity <= item.minThreshold) return { status: "low", color: "#EF4444", label: "Low Stock" };
    if (percentage >= 80) return { status: "high", color: "#10B981", label: "Well Stocked" };
    return { status: "medium", color: "#F59E0B", label: "Medium" };
  };

  if (!currentOrganization) {
    return (
      <div className={`dashboard ${darkMode ? "dark" : ""}`}>
        <header className="dashboard-navbar">
          <div className="dashboard-logo-section">
            <BarChart3 size={28} className="dashboard-logo-icon" />
            <h1 className="dashboard-logo">Bizit</h1>
            <span className="dashboard-role">Stock Employee</span>
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
          {/* Stock Level Trends */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title-section">
                <TrendingUp size={24} className="chart-icon" />
                <h3>Stock Level Trends (Last 7 Days)</h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stockTrendData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? "rgba(96, 165, 250, 0.15)" : "rgba(2, 132, 199, 0.1)"} 
                />
                <XAxis 
                  dataKey="day" 
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
                <Line 
                  type="monotone" 
                  dataKey="stock" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stock by Category */}
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
            <button className="add-item-btn">
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
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Threshold</th>
                  <th>Max Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className={status.status === "low" ? "low-stock-row" : ""}>
                      <td className="item-name">{item.name}</td>
                      <td>{item.category}</td>
                      <td>
                        <div className="stock-quantity">
                          <span className="quantity-value">{item.quantity}</span>
                          <div className="stock-bar-container">
                            <div 
                              className="stock-bar" 
                              style={{ 
                                width: `${(item.quantity / item.maxCapacity) * 100}%`,
                                backgroundColor: status.color
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>{item.minThreshold}</td>
                      <td>{item.maxCapacity}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="delete-btn" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockDashboard;

