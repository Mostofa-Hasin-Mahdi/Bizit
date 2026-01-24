import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertOctagon,
    LogOut,
    BarChart3,
    Building2,
    ArrowLeft,
    Calendar,
    PieChart as PieIcon
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { getCurrentUser, getCurrentOrganization, logout as logoutUser } from "../utils/storage";
import { fetchAnalyticsSummary, fetchLosses } from "../utils/api";
import "../styles/dashboard.css";

const ProfitLossDashboard = () => {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [currentOrganization, setCurrentOrganization] = useState(getCurrentOrganization());
    const [user, setUser] = useState(null);

    const [stats, setStats] = useState({
        revenue: 0,
        cogs: 0,
        gross_profit: 0,
        losses: 0,
        net_profit: 0
    });

    const [lossHistory, setLossHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
            navigate("/login");
            return;
        }

        setUser(currentUser);

        if (currentUser.organizationId) {
            // ... existing org check logic ...
            const organizations = JSON.parse(localStorage.getItem('organizations') || '[]');
            const userOrg = organizations.find(o => o.id === currentUser.organizationId);
            if (userOrg) setCurrentOrganization(userOrg);
        } else {
            const org = getCurrentOrganization();
            if (org) setCurrentOrganization(org);
        }
    }, [navigate]);

    useEffect(() => {
        if (currentOrganization) {
            loadData();
        }
    }, [currentOrganization]);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [summaryData, lossData] = await Promise.all([
                fetchAnalyticsSummary(token, currentOrganization.id),
                fetchLosses(token, currentOrganization.id)
            ]);
            setStats(summaryData);
            setLossHistory(lossData);
        } catch (err) {
            console.error("Failed to load P&L data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    // Chart Data Preparation
    const lossReasons = lossHistory.reduce((acc, loss) => {
        acc[loss.reason] = (acc[loss.reason] || 0) + loss.total_loss;
        return acc;
    }, {});

    const lossChartData = Object.entries(lossReasons).map(([name, value]) => ({ name, value }));
    const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

    if (!currentOrganization) return <div className="loading-screen">Loading...</div>;

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
                    <span className="dashboard-role">
                        {user?.role === "owner" ? "Owner" : "Admin"}
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

            <main className="dashboard-main">
                <div className="dashboard-header">
                    <div className="dashboard-header-content">
                        <div>
                            <h2>Profit & Loss Report</h2>
                            <p>Financial overview and loss tracking</p>
                        </div>
                        <button
                            className="back-to-dashboard-btn"
                            onClick={() => navigate("/dashboard/owner")}
                        >
                            <ArrowLeft size={18} />
                            <span>Back to Dashboard</span>
                        </button>
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="sales-overview">
                    {/* Revenue */}
                    <div className="sales-stat-card">
                        <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}>
                            <DollarSign size={32} />
                        </div>
                        <div className="sales-stat-content">
                            <h3>Total Revenue</h3>
                            <p className="sales-stat-value">${stats.revenue.toLocaleString()}</p>
                            <span className="stat-subtext">Sales Income</span>
                        </div>
                    </div>

                    {/* COGS */}
                    <div className="sales-stat-card">
                        <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}>
                            <TrendingDown size={32} />
                        </div>
                        <div className="sales-stat-content">
                            <h3>Cost of Goods</h3>
                            <p className="sales-stat-value">-${stats.cogs.toLocaleString()}</p>
                            <span className="stat-subtext">Product Costs</span>
                        </div>
                    </div>

                    {/* Losses */}
                    <div className="sales-stat-card">
                        <div className="sales-stat-icon" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}>
                            <AlertOctagon size={32} />
                        </div>
                        <div className="sales-stat-content">
                            <h3>Total Losses</h3>
                            <p className="sales-stat-value">-${stats.losses.toLocaleString()}</p>
                            <span className="stat-subtext">Damaged / Stolen / Expired</span>
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className="sales-stat-card" style={{ border: stats.net_profit >= 0 ? '1px solid #10B981' : '1px solid #EF4444' }}>
                        <div className="sales-stat-icon" style={{ background: stats.net_profit >= 0 ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #EF4444, #B91C1C)" }}>
                            <TrendingUp size={32} />
                        </div>
                        <div className="sales-stat-content">
                            <h3>Net Profit</h3>
                            <p className="sales-stat-value" style={{ color: stats.net_profit >= 0 ? '#10B981' : '#EF4444' }}>
                                ${stats.net_profit.toLocaleString()}
                            </p>
                            <span className="stat-subtext">Revenue - (COGS + Losses)</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-charts" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {/* Profit Waterfall / Composition Chart */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Financial Breakdown</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[
                                { name: 'Revenue', value: stats.revenue, fill: '#3B82F6' },
                                { name: 'COGS', value: stats.cogs, fill: '#F59E0B' },
                                { name: 'Losses', value: stats.losses, fill: '#EF4444' },
                                { name: 'Net Profit', value: stats.net_profit, fill: stats.net_profit >= 0 ? '#10B981' : '#EF4444' }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} />
                                <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: darkMode ? "#1e293b" : "#fff", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                                    formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Loss Breakdown Pie Chart */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Loss Reasons</h3>
                        </div>
                        <div className="pie-chart-container">
                            {lossChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={lossChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {lossChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ display: 'flex', height: '250px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                    No losses recorded yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loss History Table */}
                <div className="recent-transactions-section">
                    <div className="section-header">
                        <h3>Loss History Log</h3>
                    </div>
                    <div className="transactions-table-container">
                        {loading ? <p>Loading...</p> : lossHistory.length === 0 ? (
                            <p className="empty-state-text">No losses recorded.</p>
                        ) : (
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Reason</th>
                                        <th>Qty</th>
                                        <th>Cost Value</th>
                                        <th>Reported By</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lossHistory.map(loss => (
                                        <tr key={loss.id}>
                                            <td>{loss.item_name}</td>
                                            <td>
                                                <span className="status-badge" style={{
                                                    background: loss.reason === 'Damaged' ? '#FEE2E2' : loss.reason === 'Stolen' ? '#FEF3C7' : '#E0E7FF',
                                                    color: loss.reason === 'Damaged' ? '#B91C1C' : loss.reason === 'Stolen' ? '#92400E' : '#3730A3'
                                                }}>
                                                    {loss.reason}
                                                </span>
                                            </td>
                                            <td>{loss.quantity}</td>
                                            <td>${loss.total_loss.toFixed(2)}</td>
                                            <td>{loss.reported_by}</td>
                                            <td>{new Date(loss.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default ProfitLossDashboard;
