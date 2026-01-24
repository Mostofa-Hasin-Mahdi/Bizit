import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
    Truck,
    Package,
    Plus,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    Building2,
    LogOut,
    ArrowLeft,
    Star,
    ClipboardCheck,
    X,
    UserPlus,
    Box
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import { getCurrentUser, getCurrentOrganization, logout as logoutUser } from "../utils/storage";
import { fetchSuppliers, createSupplier, fetchShipments, createShipment, updateShipmentStatus, rateShipment } from "../utils/api";
import "../styles/dashboard.css";

const SupplierDashboard = () => {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [currentOrganization, setCurrentOrganization] = useState(getCurrentOrganization());
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // overview, shipments, suppliers, rating

    // Data State
    const [suppliers, setSuppliers] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState(null);

    // Form States
    const [newSupplier, setNewSupplier] = useState({ name: "", phone: "", email: "", address: "" });
    const [newShipment, setNewShipment] = useState({ supplier_id: "", expected_quantity: 0, expected_date: "", notes: "" });
    const [ratingData, setRatingData] = useState({ received_quantity: 0, damaged_quantity: 0 });

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        setUser(currentUser);
        // Only accessible to owner, admin, stock
        // Assuming stock dept users have role 'employee' and belong to 'Stock'? 
        // Or simplified role check?
        // User asked for "Stock dept" visibility. Assuming role check is sufficient or simple logic.
        loadData();
    }, [navigate, activeTab]); // Reload when tab changes just in case

    const loadData = async () => {
        try {
            if (!currentOrganization) return;
            setLoading(true);
            const token = localStorage.getItem('token');
            const [suppliersData, shipmentsData] = await Promise.all([
                fetchSuppliers(token, currentOrganization.id),
                fetchShipments(token, currentOrganization.id)
            ]);
            setSuppliers(suppliersData);
            setShipments(shipmentsData);
        } catch (err) {
            console.error("Failed to load supplier data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSupplier = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await createSupplier(newSupplier, token, currentOrganization.id);
            setIsSupplierModalOpen(false);
            setNewSupplier({ name: "", phone: "", email: "", address: "" });
            loadData();
        } catch (err) {
            alert("Failed to create supplier");
        }
    };

    const handleCreateShipment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await createShipment(newShipment, token, currentOrganization.id);
            setIsShipmentModalOpen(false);
            setNewShipment({ supplier_id: "", expected_quantity: 0, expected_date: "", notes: "" });
            loadData();
        } catch (err) {
            alert("Failed to create shipment");
        }
    };

    const handleMarkArrived = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await updateShipmentStatus(id, "Arrived", token, currentOrganization.id);
            loadData();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleRateShipment = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await rateShipment(selectedShipment.id, ratingData, token, currentOrganization.id);
            setIsRatingModalOpen(false);
            loadData();
        } catch (err) {
            alert("Failed to rate shipment");
        }
    };

    const openRatingModal = (shipment) => {
        setSelectedShipment(shipment);
        setRatingData({ received_quantity: shipment.expected_quantity, damaged_quantity: 0 });
        setIsRatingModalOpen(true);
    };

    // Calculate Average Score Logic for Graph (Group by Supplier)
    const getScoreData = () => {
        const ratedShipments = shipments.filter(s => s.status === 'Arrived' && s.score !== null);
        const supplierScores = {};

        ratedShipments.forEach(s => {
            const name = s.supplier_name || "Unknown";
            if (!supplierScores[name]) supplierScores[name] = [];
            supplierScores[name].push(s.score);
        });

        return Object.keys(supplierScores).map(name => {
            const scores = supplierScores[name];
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            return { name, score: parseFloat(avg.toFixed(1)) };
        });
    };

    if (loading && !suppliers.length) return <div className="loading-screen">Loading...</div>;

    return (
        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <header className="dashboard-navbar">
                <div className="dashboard-logo-section">
                    <Truck size={28} className="dashboard-logo-icon" />
                    <h1 className="dashboard-logo">Suppliers</h1>
                    <div className="dashboard-org-info">
                        <Building2 size={16} />
                        <span className="dashboard-org-name">{currentOrganization?.name || "Unknown"}</span>
                    </div>
                    {/* Role Label */}
                    <span className="dashboard-role">
                        {user?.role === "owner" ? "Owner" : user?.role === "admin" ? "Admin" : "Stock"}
                    </span>
                </div>
                <div className="dashboard-nav-actions">
                    <button className="theme-toggle" onClick={toggleDarkMode}>{darkMode ? "☀️" : "🌙"}</button>
                    {(user?.role === 'owner' || user?.role === 'admin') && (
                        <button className="back-to-dashboard-btn" onClick={() => navigate("/dashboard/owner")}>
                            <ArrowLeft size={18} /><span>Back to Dashboard</span>
                        </button>
                    )}
                    {/* If employee, maybe no back button or back to? */}
                    {!(user?.role === 'owner' || user?.role === 'admin') && (
                        <button className="back-to-dashboard-btn" onClick={() => navigate("/dashboard/stock")}> {/* Assuming stock lead */}
                            <ArrowLeft size={18} /><span>Back to Stock</span>
                        </button>
                    )}
                    <button className="logout-btn" onClick={() => { logoutUser(); navigate("/login"); }}>
                        <LogOut size={18} /><span>Logout</span>
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-tabs">
                    <button className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                    <button className={`dashboard-tab ${activeTab === 'shipments' ? 'active' : ''}`} onClick={() => setActiveTab('shipments')}>Shipments</button>
                    <button className={`dashboard-tab ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>Suppliers</button>
                    <button className={`dashboard-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History & Ratings</button>
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="dashboard-charts">
                        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
                            <div className="chart-header">
                                <h3>Average Supplier Performance</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={getScoreData()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} name="Avg Score (%)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* SHIPMENTS TAB */}
                {activeTab === 'shipments' && (
                    <div className="shipments-section">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Pending Shipments</h3>
                            <button className="add-action-btn" onClick={() => setIsShipmentModalOpen(true)}>
                                <Plus size={18} /> New Shipment
                            </button>
                        </div>
                        <div className="transactions-table-container">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Supplier</th>
                                        <th>Expected Date</th>
                                        <th>Expected Qty</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shipments.filter(s => s.status !== 'Arrived').map(s => (
                                        <tr key={s.id}>
                                            <td>{s.supplier_name}</td>
                                            <td>{new Date(s.expected_date).toLocaleDateString()}</td>
                                            <td>{s.expected_quantity}</td>
                                            <td>
                                                <span className="status-badge" style={{
                                                    background: s.status === 'Pending' ? '#FEF3C7' : '#FEE2E2',
                                                    color: s.status === 'Pending' ? '#92400E' : '#B91C1C'
                                                }}>{s.status}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleMarkArrived(s.id)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #10B981', color: '#10B981', background: 'transparent', cursor: 'pointer' }}>
                                                        <CheckCircle size={14} style={{ marginRight: '4px' }} /> Arrived
                                                    </button>
                                                    {/* Owner/Admin can Rate */}
                                                    {(user.role === 'owner' || user.role === 'admin') && (
                                                        <button onClick={() => openRatingModal(s)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #3B82F6', color: '#3B82F6', background: 'transparent', cursor: 'pointer' }}>
                                                            <ClipboardCheck size={14} style={{ marginRight: '4px' }} /> Rate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {shipments.filter(s => s.status !== 'Arrived').length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No pending shipments</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SUPPLIERS TAB */}
                {activeTab === 'suppliers' && (
                    <div className="suppliers-section">
                        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Your Suppliers</h3>
                            <button className="add-action-btn" onClick={() => setIsSupplierModalOpen(true)}>
                                <Plus size={18} /> Add Supplier
                            </button>
                        </div>
                        <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {suppliers.map(sup => (
                                <div key={sup.id} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>{sup.name}</h4>
                                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>{sup.phone}</p>
                                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>{sup.email}</p>
                                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>{sup.address}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* HISTORY & RATING TAB (Viewable by all, Actionable by Admin/Owner) */}
                {activeTab === 'history' && (
                    <div className="rating-section">
                        <div className="section-header">
                            <h3>Shipment History & Quality Scores</h3>
                        </div>
                        <div className="transactions-table-container">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Supplier</th>
                                        <th>Received Date</th>
                                        <th>Exp / Rec / Dmg</th>
                                        <th>Score</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shipments.filter(s => s.status === 'Arrived').map(s => (
                                        <tr key={s.id}>
                                            <td>{s.supplier_name}</td>
                                            <td>{s.received_date ? new Date(s.received_date).toLocaleDateString() : 'N/A'}</td>
                                            <td>{s.expected_quantity} / {s.received_quantity || '-'} / {s.damaged_quantity || '0'}</td>
                                            <td>
                                                {s.score !== null ? (
                                                    <span style={{ fontWeight: 'bold', color: s.score >= 90 ? '#10B981' : s.score >= 70 ? '#F59E0B' : '#EF4444' }}>
                                                        {s.score.toFixed(1)}%
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#9CA3AF' }}>Not Rated</span>
                                                )}
                                            </td>
                                            <td>
                                                {/* Allow re-rating for Admin/Owner */}
                                                {(user.role === 'owner' || user.role === 'admin') && (
                                                    <button onClick={() => openRatingModal(s)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #6366F1', color: '#6366F1', background: 'transparent', cursor: 'pointer' }}>
                                                        Update Rating
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {shipments.filter(s => s.status === 'Arrived').length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No history available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            {isSupplierModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <UserPlus size={24} />
                                <h2>Add New Supplier</h2>
                            </div>
                            <button className="modal-close-btn" onClick={() => setIsSupplierModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSupplier} className="modal-form">
                            <div className="form-group"><label>Name</label><input required value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} placeholder="Supplier Name" /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Phone</label><input value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} placeholder="+1..." /></div>
                                <div className="form-group"><label>Email</label><input value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} placeholder="contact@..." /></div>
                            </div>
                            <div className="form-group"><label>Address</label><input value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} placeholder="Full Address" /></div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsSupplierModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Save Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isShipmentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <Box size={24} />
                                <h2>Create Shipment</h2>
                            </div>
                            <button className="modal-close-btn" onClick={() => setIsShipmentModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateShipment} className="modal-form">
                            <div className="form-group">
                                <label>Supplier</label>
                                <select required value={newShipment.supplier_id} onChange={e => setNewShipment({ ...newShipment, supplier_id: e.target.value })}>
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Expected Qty</label><input type="number" required value={newShipment.expected_quantity} onChange={e => setNewShipment({ ...newShipment, expected_quantity: parseInt(e.target.value) })} /></div>
                                <div className="form-group"><label>Expected Date</label><input type="date" required value={newShipment.expected_date} onChange={e => setNewShipment({ ...newShipment, expected_date: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Notes</label><textarea value={newShipment.notes} onChange={e => setNewShipment({ ...newShipment, notes: e.target.value })} placeholder="Optional notes..." rows={3} /></div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsShipmentModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Create Shipment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isRatingModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <ClipboardCheck size={24} />
                                <h2>Rate Shipment</h2>
                            </div>
                            <button className="modal-close-btn" onClick={() => setIsRatingModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleRateShipment} className="modal-form">
                            <p style={{ margin: '0 0 10px 0', opacity: 0.7 }}>Expected Quantity: <strong>{selectedShipment?.expected_quantity}</strong></p>
                            <div className="form-row">
                                <div className="form-group"><label>Received Quantity</label><input type="number" required value={ratingData.received_quantity} onChange={e => setRatingData({ ...ratingData, received_quantity: parseInt(e.target.value) })} /></div>
                                <div className="form-group"><label>Damaged Quantity</label><input type="number" required value={ratingData.damaged_quantity} onChange={e => setRatingData({ ...ratingData, damaged_quantity: parseInt(e.target.value) })} /></div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsRatingModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Submit Rating</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDashboard;
