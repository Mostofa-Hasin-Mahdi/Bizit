import { useState, useEffect } from "react";
import { X, Save, Package } from "lucide-react";
import { createStockItem, updateStockItem } from "../utils/api";
import "../styles/modal.css";

const StockItemModal = ({ isOpen, onClose, onItemSaved, editItem = null, orgId }) => {
    const [formData, setFormData] = useState({
        name: "",
        category: "Components",
        quantity: 0,
        price: 0,
        min_threshold: 10,
        max_capacity: 100
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editItem) {
            setFormData({
                name: editItem.name,
                category: editItem.category,
                quantity: editItem.quantity,
                price: editItem.price || 0,
                cost_price: editItem.cost_price || 0,
                min_threshold: editItem.min_threshold,
                max_capacity: editItem.max_capacity
            });
        } else {
            setFormData({
                name: "",
                category: "Components",
                quantity: 0,
                price: 0,
                cost_price: 0,
                min_threshold: 10,
                max_capacity: 100
            });
        }
    }, [editItem, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            if (editItem) {
                await updateStockItem(editItem.id, formData, token, orgId);
            } else {
                await createStockItem(formData, token, orgId);
            }

            onItemSaved();
            onClose();
        } catch (err) {
            setError(err.message || "Failed to save item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <Package size={24} />
                        <h2>{editItem ? "Edit Stock Item" : "Add New Stock Item"}</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Item Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Ryzen 5 7600X"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Components">Components</option>
                            <option value="Peripherals">Peripherals</option>
                            <option value="Storage">Storage</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Laptops">Laptops</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Selling Price ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Cost Price ($) <small>(For Profit Calc)</small></label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.cost_price}
                            onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Current Quantity</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Min Threshold</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.min_threshold}
                                onChange={(e) => setFormData({ ...formData, min_threshold: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Max Capacity</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.max_capacity}
                            onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            <Save size={18} />
                            {loading ? "Saving..." : editItem ? "Update Item" : "Create Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockItemModal;
