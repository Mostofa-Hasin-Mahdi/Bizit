import { useState, useEffect } from "react";
import { X, Save, ShoppingCart } from "lucide-react";
import { recordSale } from "../utils/api";
import "../styles/modal.css";

const RecordSaleModal = ({ isOpen, onClose, onSaleRecorded, stockItems = [], orgId, initialItem = null }) => {
    const [formData, setFormData] = useState({
        stock_item_id: "",
        quantity: 1
    });
    const [selectedItem, setSelectedItem] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialItem) {
                setFormData({
                    stock_item_id: initialItem.id,
                    quantity: 1
                });
                setSelectedItem(initialItem);
            } else {
                setFormData({
                    stock_item_id: "",
                    quantity: 1
                });
                setSelectedItem(null);
            }
            setError("");
        }
    }, [isOpen, initialItem]);

    const handleItemChange = (e) => {
        const itemId = parseInt(e.target.value);
        setFormData({ ...formData, stock_item_id: itemId });

        const item = stockItems.find(i => i.id === itemId);
        setSelectedItem(item);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.stock_item_id) {
            setError("Please select an item");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await recordSale(formData, token, orgId);
            onSaleRecorded();
            onClose();
        } catch (err) {
            setError(err.message || "Failed to record sale");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <ShoppingCart size={24} />
                        <h2>Record New Sale</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Select Value *</label>
                        <select
                            value={formData.stock_item_id}
                            onChange={handleItemChange}
                            required
                        >
                            <option value="">-- Choose Item --</option>
                            {stockItems.map(item => (
                                <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                                    {item.name} (Stock: {item.quantity}) - ${item.price}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Quantity *</label>
                        <input
                            type="number"
                            min="1"
                            max={selectedItem ? selectedItem.quantity : 9999}
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                            required
                        />
                    </div>

                    {selectedItem && (
                        <div className="sale-summary" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Price per Unit:</span>
                                <span>${selectedItem.price}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                                <span>Total Amount:</span>
                                <span style={{ color: 'var(--primary)' }}>${(selectedItem.price * formData.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={loading || !selectedItem}>
                            <Save size={18} />
                            {loading ? "Recording..." : "Confirm Sale"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordSaleModal;
