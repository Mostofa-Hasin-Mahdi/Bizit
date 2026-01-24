import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { reportLoss } from "../utils/api";
import "../styles/modal.css";

const ReportLossModal = ({ isOpen, onClose, stockItem, onLossReported, orgId }) => {
    const [formData, setFormData] = useState({
        quantity: 1,
        reason: "Damaged",
        notes: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !stockItem) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem('token');
            await reportLoss({
                stock_item_id: stockItem.id,
                ...formData
            }, token, orgId);
            onLossReported();
            onClose();
        } catch (err) {
            setError(err.message || "Failed to report loss");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header" style={{ borderBottom: '2px solid #EF4444' }}>
                    <div className="modal-title" style={{ color: '#EF4444' }}>
                        <Trash2 size={24} />
                        <h2>Report Loss: {stockItem.name}</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Reporting a loss will remove items from stock and record the cost as a loss.
                    </p>

                    <div className="form-group">
                        <label>Quantity Lost *</label>
                        <input
                            type="number"
                            min="1"
                            max={stockItem.quantity}
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Reason *</label>
                        <select
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        >
                            <option value="Damaged">Damaged</option>
                            <option value="Stolen">Stolen / Theft</option>
                            <option value="Expired">Expired</option>
                            <option value="Operational">Operational Use</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional details..."
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-btn" style={{ background: '#EF4444' }} disabled={loading}>
                            {loading ? "Reporting..." : "Confirm Loss"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportLossModal;
