import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  UserCog,
  LogOut,
  BarChart3,
  Building2,
  Eye,
  ShoppingCart
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { getCurrentUser, getCurrentOrganization, logout as logoutUser } from "../utils/storage";
import { fetchStock, getUsersByRole, fetchSales, fetchAnalyticsSummary } from "../utils/api";
import OrganizationSelector from "../components/OrganizationSelector";
import AdminManagement from "../components/AdminManagement";
import EmployeeManagement from "../components/EmployeeManagement";
import "../styles/dashboard.css";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [currentOrganization, setCurrentOrganization] = useState(getCurrentOrganization());
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, management
  const [numAdmins, setNumAdmins] = useState(0);
  const [numEmployees, setNumEmployees] = useState(0);

  // Real Dashboard Data State
  const [stockStats, setStockStats] = useState({
    currentLevel: 0,
    maxCapacity: 0,
    totalValue: 0
  });

  // Real Dashboard Data State
  const [salesStats, setSalesStats] = useState({
    totalSold: 0,
    chartData: []
  });

  // Real Dashboard Data State (Profit/Loss)
  const [dashboardData, setDashboardData] = useState({
    totalProfit: 0,
    totalLoss: 0
  });

  // Data for profit/loss pie chart
  const profitLossData = [
    { name: "Profit", value: dashboardData.totalProfit, color: "#10B981" },
    { name: "Loss", value: dashboardData.totalLoss, color: "#EF4444" }
  ];

  // Calculate stock level percentage
  const stockLevelPercentage = stockStats.maxCapacity > 0
    ? (stockStats.currentLevel / stockStats.maxCapacity) * 100
    : 0;

  useEffect(() => {
    // Check if user is logged in (owner or admin)
    const currentUser = getCurrentUser();
    if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
      navigate("/login");
      return;
    }
    setUser(currentUser);

    // Check if organization is selected
    const org = getCurrentOrganization();
    setCurrentOrganization(org);

    // For admins, they need to have their organization set
    if (currentUser.role === "admin" && !org && currentUser.organizationId) {
      // Try to find and set the organization
      const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      const userOrg = organizations.find(o => o.id === currentUser.organizationId);
      if (userOrg) {
        setCurrentOrganization(userOrg);
        localStorage.setItem('currentOrganization', JSON.stringify(userOrg));
      }
    }
  }, [navigate]);

  // Update admin and employee counts when organization or activeTab changes
  useEffect(() => {
    if (!currentOrganization) {
      setNumAdmins(0);
      setNumEmployees(0);
      setStockStats({ currentLevel: 0, maxCapacity: 0, totalValue: 0 });
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const orgId = currentOrganization.id;

        // Fetch Stock
        const stockItems = await fetchStock(token, orgId);
        const currentLevel = stockItems.reduce((sum, item) => sum + item.quantity, 0);
        const maxCapacity = stockItems.reduce((sum, item) => sum + (item.max_capacity || 100), 0); // fallback if max_capacity missing
        const totalValue = stockItems.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);

        setStockStats({ currentLevel, maxCapacity, totalValue });

        // Fetch Sales
        const sales = await fetchSales(token, orgId);

        // Process Sales (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSales = sales.filter(sale => new Date(sale.sale_date) >= sevenDaysAgo);
        const totalSold = recentSales.reduce((sum, sale) => sum + sale.total_price, 0);

        // Process options for Chart (Group by Day)
        const salesByDate = {};
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
          salesByDate[dateStr] = 0;
        }

        // Fill with actual data
        recentSales.forEach(sale => {
          const dateStr = new Date(sale.sale_date).toLocaleDateString('en-US', { weekday: 'short' });
          if (salesByDate.hasOwnProperty(dateStr)) {
            salesByDate[dateStr] += sale.total_price;
          }
        });

        const chartData = Object.entries(salesByDate).map(([day, sold]) => ({
          day,
          sold
        }));

        setSalesStats({
          totalSold,
          chartData
        });

        // Fetch Profits/Losses
        const analytics = await fetchAnalyticsSummary(token, orgId);
        setDashboardData({
          totalProfit: analytics.net_profit > 0 ? analytics.net_profit : 0, // Or show gross? Usually Net.
          // Wait, logic in Pie chart uses "Profit" and "Loss".
          // If Net Profit is negative, is it all loss?
          // The Pie chart structure is: Profit (Green), Loss (Red).
          // Let's us Gross Profit vs Total Losses for a better comparison?
          // Or Revenue vs Expenses?
          // User asked for "Profit vs Loss".
          // Let's use: Profit = Gross Profit, Loss = Total Losses.
          // Actually, let's use: Profit = analytics.net_profit (if positive), Loss = analytics.losses
          // If Net Profit is negative, then Profit is 0.
          totalProfit: analytics.net_profit > 0 ? analytics.net_profit : 0,
          totalLoss: analytics.losses
        });

        // Fetch Admins
        const admins = await getUsersByRole("admin", token, orgId);
        setNumAdmins(admins.length);

        // Fetch Employees
        const employees = await getUsersByRole("employee", token, orgId);
        setNumEmployees(employees.length);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, [currentOrganization, activeTab]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleOrganizationSelect = (organization) => {
    setCurrentOrganization(organization);
  };

  // Stats for simple display cards
  const stats = [
    {
      id: "admins",
      title: "No. of Admins",
      value: numAdmins,
      icon: UserCog,
      color: "var(--primary)",
      bgGradient: "linear-gradient(135deg, var(--primary), var(--accent))"
    },
    {
      id: "employees",
      title: "No. of Employees",
      value: numEmployees,
      icon: Users,
      color: "var(--accent)",
      bgGradient: "linear-gradient(135deg, var(--accent), var(--primary))"
    }
  ];

  // Show organization selector if no organization is selected (only for owners)
  if (!currentOrganization && user?.role === "owner") {
    return (
      <div className={`dashboard ${darkMode ? "dark" : ""}`}>
        <header className="dashboard-navbar">
          <div className="dashboard-logo-section">
            <BarChart3 size={28} className="dashboard-logo-icon" />
            <h1 className="dashboard-logo">Bizit</h1>
            <span className="dashboard-role">Owner</span>
          </div>
          <div className="dashboard-nav-actions">
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="dashboard-main">
          <OrganizationSelector onSelect={handleOrganizationSelect} />
        </main>
      </div>
    );
  }

  // If admin has no organization, redirect to login
  if (!currentOrganization && user?.role === "admin") {
    handleLogout();
    return null;
  }

  // Safety check: if no organization, show selector (shouldn't happen but just in case)
  if (!currentOrganization) {
    return (
      <div className={`dashboard ${darkMode ? "dark" : ""}`}>
        <header className="dashboard-navbar">
          <div className="dashboard-logo-section">
            <BarChart3 size={28} className="dashboard-logo-icon" />
            <h1 className="dashboard-logo">Bizit</h1>
            <span className="dashboard-role">{user?.role === "admin" ? "Admin" : "Owner"}</span>
          </div>
          <div className="dashboard-nav-actions">
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="dashboard-main">
          <OrganizationSelector onSelect={handleOrganizationSelect} />
        </main>
      </div>
    );
  }

  const getRoleLabel = () => {
    return user?.role === "admin" ? "Admin" : "Owner";
  };

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
          <span className="dashboard-role">{getRoleLabel()}</span>
        </div>
        <div className="dashboard-nav-actions">
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
          >
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
        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          {user?.role === "owner" && (
            <>
              <button
                className={`dashboard-tab ${activeTab === "admins" ? "active" : ""}`}
                onClick={() => setActiveTab("admins")}
              >
                Admin Management
              </button>
              <button
                className={`dashboard-tab ${activeTab === "employees" ? "active" : ""}`}
                onClick={() => setActiveTab("employees")}
              >
                Employee Management
              </button>
            </>
          )}
          {user?.role === "admin" && (
            <button
              className={`dashboard-tab ${activeTab === "employees" ? "active" : ""}`}
              onClick={() => setActiveTab("employees")}
            >
              Employee Management
            </button>
          )}
        </div>

        {/* Management Sections */}
        {activeTab === "admins" && user?.role === "owner" && (
          <AdminManagement />
        )}
        {activeTab === "employees" && (user?.role === "admin" || user?.role === "owner") && (
          <EmployeeManagement />
        )}

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-header">
              <div className="dashboard-header-content">
                <div>
                  <h2>Dashboard Overview</h2>
                  <p>Welcome back! Here's your business at a glance.</p>
                </div>
                <div className="dashboard-action-buttons">
                  <button
                    className="stock-levels-btn"
                    onClick={() => navigate("/dashboard/stock")}
                  >
                    <Eye size={18} />
                    <span>See Stock Levels</span>
                  </button>
                  <button
                    className="sales-items-btn"
                    onClick={() => navigate("/dashboard/sales")}
                  >
                    <ShoppingCart size={18} />
                    <span>See Sales Items</span>
                  </button>
                  <button
                    className="profit-loss-btn"
                    onClick={() => navigate("/dashboard/profit-loss")}
                  >
                    <TrendingUp size={18} />
                    <span>See Profits/Losses</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-charts">
              {/* Stock Levels Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-section">
                    <Package size={24} className="chart-icon" />
                    <h3>Stock Levels</h3>
                  </div>
                  <div className="stock-level-info">
                    <span className="stock-current">{stockStats.currentLevel.toLocaleString()}</span>
                    <span className="stock-max">/ {stockStats.maxCapacity.toLocaleString()}</span>
                  </div>
                </div>
                <div className="stock-level-chart">
                  <div className="stock-level-bar-container">
                    <div
                      className="stock-level-bar"
                      style={{ width: `${stockLevelPercentage}%` }}
                    >
                      <span className="stock-level-percentage">{stockLevelPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="stock-level-labels">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              {/* Total Sold Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-section">
                    <DollarSign size={24} className="chart-icon" />
                    <h3>Total Sold (Last 7 Days)</h3>
                  </div>
                  <span className="chart-total">${salesStats.totalSold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={salesStats.chartData}>
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
                      dataKey="sold"
                      stroke="#0284c7"
                      strokeWidth={3}
                      dot={{ fill: '#0284c7', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Profit/Loss Pie Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title-section">
                    <TrendingUp size={24} className="chart-icon" />
                    <h3>Profit vs Loss</h3>
                  </div>
                </div>
                <div className="pie-chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                      <Pie
                        data={profitLossData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                          const RADIAN = Math.PI / 180;
                          // Position labels outside the circle
                          const radius = outerRadius + 20;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          // Use color palette - profit is green, loss is red
                          const labelColor = index === 0 ? '#10B981' : '#EF4444';

                          return (
                            <text
                              x={x}
                              y={y}
                              fill={labelColor}
                              textAnchor={x > cx ? 'start' : 'end'}
                              dominantBaseline="central"
                              fontSize={12}
                              fontWeight={700}
                            >
                              {`${name}: ${(percent * 100).toFixed(1)}%`}
                            </text>
                          );
                        }}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {profitLossData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
                          border: `1px solid ${darkMode ? '#60a5fa' : '#0284c7'}`,
                          borderRadius: '12px',
                          color: darkMode ? '#f1f5f9' : '#1e293b'
                        }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: '14px',
                          color: darkMode ? '#f1f5f9' : '#1e293b'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-chart-stats">
                    <div className="pie-stat profit-stat">
                      <TrendingUp size={20} />
                      <div>
                        <span className="pie-stat-label">Profit</span>
                        <span className="pie-stat-value">${dashboardData.totalProfit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pie-stat loss-stat">
                      <TrendingDown size={20} />
                      <div>
                        <span className="pie-stat-label">Loss</span>
                        <span className="pie-stat-value">${dashboardData.totalLoss.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Stats Section */}
            <div className="dashboard-stats">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.id} className="stat-card">
                    <div className="stat-icon-wrapper" style={{ background: stat.bgGradient }}>
                      <Icon size={32} className="stat-icon" />
                    </div>
                    <div className="stat-content">
                      <h3 className="stat-title">{stat.title}</h3>
                      <p className="stat-value">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;

