import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  UserCog,
  LogOut,
  BarChart3
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
import "../styles/dashboard.css";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Hard-coded dashboard data (will be replaced with API calls later)
  const [dashboardData] = useState({
    stockLevels: 1247,
    maxStockCapacity: 2000,
    totalSold: 45230,
    totalProfit: 18500,
    totalLoss: 3200,
    numAdmins: 3,
    numEmployees: 12
  });

  // Sample data for total sold chart (last 7 days)
  const salesData = [
    { day: "Mon", sold: 5200 },
    { day: "Tue", sold: 6800 },
    { day: "Wed", sold: 6100 },
    { day: "Thu", sold: 7500 },
    { day: "Fri", sold: 8200 },
    { day: "Sat", sold: 6900 },
    { day: "Sun", sold: 5530 }
  ];

  // Data for profit/loss pie chart
  const profitLossData = [
    { name: "Profit", value: dashboardData.totalProfit, color: "#10B981" },
    { name: "Loss", value: dashboardData.totalLoss, color: "#EF4444" }
  ];

  // Calculate stock level percentage
  const stockLevelPercentage = (dashboardData.stockLevels / dashboardData.maxStockCapacity) * 100;

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "owner") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Stats for simple display cards
  const stats = [
    {
      id: "admins",
      title: "No. of Admins",
      value: dashboardData.numAdmins,
      icon: UserCog,
      color: "var(--primary)",
      bgGradient: "linear-gradient(135deg, var(--primary), var(--accent))"
    },
    {
      id: "employees",
      title: "No. of Employees",
      value: dashboardData.numEmployees,
      icon: Users,
      color: "var(--accent)",
      bgGradient: "linear-gradient(135deg, var(--accent), var(--primary))"
    }
  ];

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      <header className="dashboard-navbar">
        <div className="dashboard-logo-section">
          <BarChart3 size={28} className="dashboard-logo-icon" />
          <h1 className="dashboard-logo">Bizit</h1>
          <span className="dashboard-role">Owner</span>
        </div>
        <div className="dashboard-nav-actions">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
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
        <div className="dashboard-header">
          <h2>Dashboard Overview</h2>
          <p>Welcome back! Here's your business at a glance.</p>
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
                <span className="stock-current">{dashboardData.stockLevels.toLocaleString()}</span>
                <span className="stock-max">/ {dashboardData.maxStockCapacity.toLocaleString()}</span>
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
              <span className="chart-total">${dashboardData.totalSold.toLocaleString()}</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? "rgba(233, 179, 251, 0.1)" : "rgba(111, 0, 255, 0.1)"} 
                />
                <XAxis 
                  dataKey="day" 
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
                <Line 
                  type="monotone" 
                  dataKey="sold" 
                  stroke="#6F00FF" 
                  strokeWidth={3}
                  dot={{ fill: '#6F00FF', r: 5 }}
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
                      backgroundColor: darkMode ? '#2a0144' : '#E9B3FB',
                      border: `1px solid ${darkMode ? '#E9B3FB' : '#6F00FF'}`,
                      borderRadius: '12px',
                      color: darkMode ? '#f4eaff' : '#2b2b2b'
                    }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '14px', 
                      color: darkMode ? '#f4eaff' : '#2b2b2b' 
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
      </main>
    </div>
  );
};

export default OwnerDashboard;

