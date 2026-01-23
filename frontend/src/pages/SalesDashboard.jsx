import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Package,
  Plus,
  LogOut,
  BarChart3,
  Building2,
  ArrowLeft,
  Search,
  History,
  LayoutGrid
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { getCurrentUser, getCurrentOrganization, logout as logoutUser } from "../utils/storage";
import { fetchSales, fetchStock } from "../utils/api";
import RecordSaleModal from "../components/RecordSaleModal";
import "../styles/dashboard.css";
import "../styles/sales-dashboard.css";

const SalesDashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [currentOrganization, setCurrentOrganization] = useState(getCurrentOrganization());
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' or 'history'

  // Real Data State
  const [sales, setSales] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemForSale, setSelectedItemForSale] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Access check
    const hasAccess =
      (currentUser.role === "employee" && currentUser.department === "sales") ||
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

  const loadData = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const orgId = currentOrganization.id;

      const [salesData, stockData] = await Promise.all([
        fetchSales(token, orgId),
        fetchStock(token, orgId)
      ]);

      setSales(salesData);
      setStockItems(stockData);
    } catch (err) {
      console.error("Failed to load sales data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrganization) {
      loadData();
    }
  }, [currentOrganization]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleItemClick = (item) => {
    if (item.quantity > 0) {
      setSelectedItemForSale(item);
      setIsModalOpen(true);
    }
  };

  const handleRecordNewSale = () => {
    setSelectedItemForSale(null);
    setIsModalOpen(true);
  };

  // --- CATALOG DATA PREP ---
  const filteredItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = stockItems.length;
  const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const inventoryValue = stockItems.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);

  const itemsByCategory = stockItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const categoryData = Object.entries(itemsByCategory).map(([name, quantity]) => ({
    name,
    quantity
  }));


  // --- HISTORY DATA PREP ---
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_price, 0);
  const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  const salesByDate = sales.reduce((acc, sale) => {
    const date = new Date(sale.sale_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + sale.total_price;
    return acc;
  }, {});

  const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
  const chartData = sortedDates.slice(-7).map(date => ({
    name: date,
    sales: salesByDate[date]
  }));

  const recentTransactions = [...sales].slice(0, 10);

  if (!currentOrganization) return <div className="loading-screen">Loading...</div>;

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      <RecordSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaleRecorded={loadData}
        stockItems={stockItems}
        orgId={currentOrganization.id}
        initialItem={selectedItemForSale}
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
              <p>Manage sales and view history</p>
            </div>
            <div className="dashboard-action-buttons">
              {(user?.role === "owner" || user?.role === "admin") && (
                <button
                  className="back-to-dashboard-btn"
                  onClick={() => navigate("/dashboard/owner")}
                >
                  <ArrowLeft size={18} />
                  <span>Back</span>
                </button>
              )}
              <div className="tab-buttons" style={{ display: 'flex', gap: '10px', background: 'var(--bg-secondary)', padding: '5px', borderRadius: '8px', marginRight: '10px' }}>
                <button
                  className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                  onClick={() => setActiveTab('catalog')}
                  style={{
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: activeTab === 'catalog' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'catalog' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LayoutGrid size={16} /> Catalog
                </button>
                <button
                  className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                  style={{
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'history' ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <History size={16} /> History
                </button>
              </div>
              <button className="record-sale-btn" onClick={handleRecordNewSale}>
                <Plus size={18} />
                New Sale
              </button>
            </div>
          </div>
        </div>

        {/* --- TAB CONTENT: CATALOG --- */}
        {activeTab === 'catalog' && (
          <>
            {/* Catalog Stats */}
            <div className="sales-overview">
              <div className="sales-stat-card">
                <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
                  <ShoppingCart size={32} />
                </div>
                <div className="sales-stat-content">
                  <h3>Total Items</h3>
                  <p className="sales-stat-value">{totalItems}</p>
                </div>
              </div>
              <div className="sales-stat-card">
                <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                  <Package size={32} />
                </div>
                <div className="sales-stat-content">
                  <h3>Units in Stock</h3>
                  <p className="sales-stat-value">{totalUnits.toLocaleString()}</p>
                </div>
              </div>
              <div className="sales-stat-card">
                <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
                  <DollarSign size={32} />
                </div>
                <div className="sales-stat-content">
                  <h3>Stock Value</h3>
                  <p className="sales-stat-value">${inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="sales-stat-card">
                <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #0284c7, #0f172a)" }}>
                  <TrendingUp size={32} />
                </div>
                <div className="sales-stat-content">
                  <h3>Categories</h3>
                  <p className="sales-stat-value">{Object.keys(itemsByCategory).length}</p>
                </div>
              </div>
            </div>

            {/* Catalog Chart */}
            <div className="dashboard-charts">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Items by Category</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(96, 165, 250, 0.15)" : "rgba(2, 132, 199, 0.1)"} />
                    <XAxis dataKey="name" stroke={darkMode ? "#f1f5f9" : "#1e293b"} style={{ fontSize: '12px' }} />
                    <YAxis stroke={darkMode ? "#f1f5f9" : "#1e293b"} style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#f1f5f9', borderRadius: '12px', border: '1px solid var(--border-color)', color: darkMode ? '#f1f5f9' : '#1e293b' }} />
                    <Bar dataKey="quantity" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Catalog Grid */}
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

              {loading ? <p>Loading catalog...</p> : filteredItems.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <p>No items found matching your search</p>
                </div>
              ) : (
                <div className="items-grid">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="item-card"
                      onClick={() => handleItemClick(item)}
                      style={{ cursor: item.quantity > 0 ? 'pointer' : 'default', opacity: item.quantity > 0 ? 1 : 0.6 }}
                      title={item.quantity > 0 ? "Click to Sell" : "Out of Stock"}
                    >
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
                            <span className="item-label">Qty:</span>
                            <span className="item-value quantity-value">{item.quantity}</span>
                          </div>
                          <div className="item-detail-row">
                            <span className="item-label">Price:</span>
                            <span className="item-value price-value">${(item.price || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        {item.quantity > 0 && (
                          <div style={{ marginTop: '10px', width: '100%', textAlign: 'center', padding: '6px', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '500' }}>
                            Click to Sell
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* --- TAB CONTENT: HISTORY --- */}
        {activeTab === 'history' && (
          <>
            <div className="sales-overview">
              <div className="sales-stat-card">
                <div className="sales-stat-icon-wrapper revenue">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="sales-stat-label">Total Revenue</p>
                  <h3 className="sales-stat-value">${totalRevenue.toLocaleString()}</h3>
                </div>
              </div>
              <div className="sales-stat-card">
                <div className="sales-stat-icon-wrapper orders">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <p className="sales-stat-label">Total Transactions</p>
                  <h3 className="sales-stat-value">{sales.length}</h3>
                </div>
              </div>
              <div className="sales-stat-card">
                <div className="sales-stat-icon-wrapper items">
                  <Package size={24} />
                </div>
                <div>
                  <p className="sales-stat-label">Items Sold</p>
                  <h3 className="sales-stat-value">{totalItemsSold}</h3>
                </div>
              </div>
              <div className="sales-stat-card">
                <div className="sales-stat-icon-wrapper avg">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="sales-stat-label">Avg. Order Value</p>
                  <h3 className="sales-stat-value">${avgOrderValue.toFixed(2)}</h3>
                </div>
              </div>
            </div>

            <div className="sales-charts-grid">
              <div className="sales-chart-card">
                <div className="chart-header">
                  <h3>Revenue Trends</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} />
                    <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: darkMode ? "#1e293b" : "#fff", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                      formatter={(value) => [`$${value}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="recent-transactions-section">
              <div className="section-header">
                <h3>Recent Transactions</h3>
              </div>
              <div className="transactions-table-container">
                {loading ? (
                  <p>Loading transactions...</p>
                ) : sales.length === 0 ? (
                  <p className="empty-state-text">No sales recorded yet.</p>
                ) : (
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        <th>Sold By</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((sale) => (
                        <tr key={sale.id}>
                          <td>
                            <div className="transaction-item">
                              <div className="transaction-icon">
                                <Package size={16} />
                              </div>
                              <span>{sale.stock_item_name}</span>
                            </div>
                          </td>
                          <td>{sale.quantity}</td>
                          <td className="amount-cell">${sale.total_price.toFixed(2)}</td>
                          <td>{sale.sold_by_name}</td>
                          <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                          <td>
                            <span className="status-badge completed">Completed</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SalesDashboard;
