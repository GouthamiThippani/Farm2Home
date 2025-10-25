import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SellProducts({ user, onLogout }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });

  const API_URL = "http://localhost:5000/api/products";
  const ORDERS_API_URL = "http://localhost:5000/api/orders";

  // Get current user data
  const getCurrentUser = () => {
    if (user && user.email) {
      return user;
    }
    
    // Fallback to localStorage
    const storedUser = JSON.parse(localStorage.getItem("ib_user") || "null");
    if (storedUser && storedUser.email) {
      return storedUser;
    }
    
    return null;
  };

  // Calculate statistics
  const calculateStats = (products) => {
    const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
    const lowStockItems = products.filter(product => product.quantity > 0 && product.quantity <= 5).length;
    const outOfStockItems = products.filter(product => product.quantity === 0).length;

    setStats({
      totalProducts: products.length,
      totalStock,
      lowStockItems,
      outOfStockItems
    });
  };

  // Fetch only this farmer's products
  const fetchMyProducts = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.email) {
        console.log("🔍 Fetching products for farmer:", currentUser.email);
        const response = await axios.get(`${API_URL}/farmer/${currentUser.email}`);
        console.log("✅ Products fetched:", response.data);
        setProducts(response.data);
        calculateStats(response.data);
        setError("");
      } else {
        setError("User not found. Please login again.");
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError("Failed to fetch your products");
    }
  };

  // Fetch orders for this farmer
  const fetchMyOrders = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.email) {
        const response = await axios.get(`${ORDERS_API_URL}/farmer/${currentUser.email}`);
        setOrders(response.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Real-time updates - refresh every 30 seconds
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log("👤 Current user:", currentUser);
      fetchMyProducts();
      fetchMyOrders();

      // Set up interval for real-time updates
      const interval = setInterval(() => {
        fetchMyProducts();
        fetchMyOrders();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    } else {
      setError("Please login to access this page");
    }
  }, []);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeImage = () => {
    setFile(null);
    setImagePreview(null);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form
    if (!name || !price || !quantity) {
      setError("Please fill all required fields");
      return;
    }

    if (price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      setError("User not found. Please login again.");
      return;
    }

    try {
      setLoading(true);
      
      let imageBase64 = null;
      if (file) {
        imageBase64 = await toBase64(file);
      }

      const payload = {
        name: name.trim(),
        price: Number(price),
        quantity: Number(quantity),
        image: imageBase64,
        farmer_email: currentUser.email,
        farmer_name: currentUser.name || currentUser.email
      };

      console.log("🚀 Submitting product:", payload);

      let response;
      if (editingId) {
        response = await axios.put(`${API_URL}/${editingId}`, payload);
        showSuccess("Product updated successfully!");
      } else {
        response = await axios.post(API_URL, payload);
        showSuccess("Product added successfully!");
      }

      console.log("✅ Product saved successfully:", response.data);

      // Reset form
      setName("");
      setPrice("");
      setQuantity("");
      setFile(null);
      setImagePreview(null);
      setEditingId(null);

      // Refresh products
      await fetchMyProducts();
      
    } catch (err) {
      console.error("❌ Error saving product:", err);
      setError(err.response?.data?.error || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      showSuccess("Product deleted successfully!");
      await fetchMyProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setPrice(product.price);
    setQuantity(product.quantity);
    setFile(null);
    setImagePreview(product.image || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setQuantity("");
    setFile(null);
    setImagePreview(null);
    setError("");
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: "Out of Stock", color: "#ef4444", bgColor: "#fef2f2" };
    if (quantity <= 5) return { status: "Low Stock", color: "#f59e0b", bgColor: "#fffbeb" };
    return { status: "In Stock", color: "#10b981", bgColor: "#f0fdf4" };
  };

  const currentUser = getCurrentUser();

  if (!currentUser) {
    return (
      <div style={{ 
        padding: '50px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2>Please Login</h2>
        <p>You need to be logged in to access this page.</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(96, 165, 250, 0.3)'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="sell-page">
      <div className="page-header">
        <h2 className="title">Manage Your Products</h2>
        <p className="subtitle">Welcome, {currentUser.name || currentUser.email}! Manage your farm products and track sales.</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.totalStock} kg</h3>
            <p>Total Stock</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats.lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <h3>{stats.outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          ✅ {success}
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          📦 My Products ({products.length})
        </button>
        <button 
          className={`tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          💰 Sales History ({orders.length})
        </button>
      </div>

      {activeTab === "products" && (
        <>
          <form className="sell-form" onSubmit={handleSubmit}>
            <h3>{editingId ? "✏️ Edit Product" : "➕ Add New Product"}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={name}
                  placeholder="e.g., Organic Tomatoes"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price (₹ / kg) *</label>
                <input
                  type="number"
                  value={price}
                  min="1"
                  step="0.5"
                  placeholder="e.g., 50"
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity (kg) *</label>
                <input
                  type="number"
                  value={quantity}
                  min="1"
                  placeholder="e.g., 100"
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Image</label>
              <div className="file-input-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  id="file-input"
                />
                <label htmlFor="file-input" className="file-input-label">
                  {file ? `📁 ${file.name}` : "📸 Choose Image File"}
                </label>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                  <button type="button" onClick={removeImage} className="remove-image-btn">
                    🗑️ Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span className="button-content">
                    <span className="spinner"></span>
                    {editingId ? "Updating..." : "Adding..."}
                  </span>
                ) : editingId ? (
                  <span className="button-content">
                    ✏️ Update Product
                  </span>
                ) : (
                  <span className="button-content">
                    🚀 Add Product
                  </span>
                )}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="cancel-btn">
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="product-list-section">
            <div className="section-header">
              <h3>Your Products ({products.length})</h3>
              <div className="stock-legends">
                <div className="legend-item">
                  <span className="legend-color in-stock"></span>
                  <span>In Stock</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color low-stock"></span>
                  <span>Low Stock</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color out-of-stock"></span>
                  <span>Out of Stock</span>
                </div>
              </div>
            </div>
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🌱</div>
                <h4>No products yet</h4>
                <p>Add your first product to start selling!</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.quantity);
                  return (
                    <div key={product._id} className="product-card" style={{ borderLeft: `4px solid ${stockStatus.color}` }}>
                      <div className="product-image-container">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="product-image" />
                        ) : (
                          <div className="no-image">🌱 No Image</div>
                        )}
                        <div className="stock-badge" style={{ backgroundColor: stockStatus.bgColor, color: stockStatus.color }}>
                          {stockStatus.status}
                        </div>
                      </div>
                      
                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>
                        <p className="price">₹{product.price}/kg</p>
                        <p className="quantity">
                          <span className="stock-text" style={{ color: stockStatus.color }}>
                            {product.quantity} kg available
                          </span>
                        </p>
                        
                        <div className="product-meta">
                          <span className="created-date">
                            Added: {new Date(product.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="actions">
                          <button className="edit-btn" onClick={() => handleEdit(product)}>
                            ✏️ Edit
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <div className="orders-section">
          <h3>Sales History ({orders.length})</h3>
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💰</div>
              <h4>No sales yet</h4>
              <p>Your sales will appear here when buyers purchase your products.</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-title">
                      <h4>{order.product_name}</h4>
                      <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className={`status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="label">Buyer:</span>
                      <span className="value">{order.buyer_name || order.buyer_email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Quantity Sold:</span>
                      <span className="value">{order.quantity} kg</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Price per kg:</span>
                      <span className="value">₹{order.total_price / order.quantity}</span>
                    </div>
                    <div className="detail-row total">
                      <span className="label">Total Revenue:</span>
                      <span className="value price">₹{order.total_price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .sell-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          min-height: calc(100vh - 160px);
          font-family: 'Poppins', sans-serif;
        }

        .page-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 30px 20px;
          background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
          color: white;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(147, 197, 253, 0.3);
        }

        .title {
          margin: 0 0 10px 0;
          font-size: 2.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .subtitle {
          margin: 0;
          font-size: 1.2rem;
          opacity: 0.95;
          font-weight: 500;
        }

        /* Stats Overview */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          gap: 15px;
          border-left: 4px solid #60a5fa;
        }

        .stat-card.warning {
          border-left-color: #f59e0b;
        }

        .stat-card.danger {
          border-left-color: #ef4444;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-info p {
          margin: 5px 0 0 0;
          color: #64748b;
          font-weight: 500;
        }

        /* Messages */
        .error-message, .success-message {
          padding: 16px 20px;
          border-radius: 10px;
          margin-bottom: 25px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .error-message {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .success-message {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          background: white;
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }

        .tab {
          flex: 1;
          padding: 16px 24px;
          border: none;
          background: transparent;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.3s ease;
          color: #666;
        }

        .tab.active {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4);
        }

        .sell-form {
          background: white;
          padding: 35px;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          margin-bottom: 40px;
          border: 1px solid #dbeafe;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 0;
        }

        .form-group label {
          font-weight: 600;
          color: #37474F;
          margin-bottom: 8px;
          display: block;
          font-size: 1rem;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #dbeafe;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #FAFAFA;
        }

        .form-group input:focus {
          outline: none;
          border-color: #60a5fa;
          background: white;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        .file-input-container {
          margin-bottom: 15px;
        }

        .file-input {
          display: none;
        }

        .file-input-label {
          display: block;
          padding: 14px 20px;
          background: #f0f9ff;
          border: 2px dashed #93c5fd;
          border-radius: 10px;
          cursor: pointer;
          text-align: center;
          color: #1e40af;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .file-input-label:hover {
          background: #dbeafe;
          border-color: #60a5fa;
        }

        .image-preview {
          text-align: center;
          margin-top: 15px;
        }

        .preview-image {
          max-width: 200px;
          max-height: 150px;
          border-radius: 10px;
          margin-bottom: 12px;
          border: 2px solid #dbeafe;
        }

        .remove-image-btn {
          padding: 10px 18px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .remove-image-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .form-actions {
          display: flex;
          gap: 16px;
          margin-top: 30px;
        }

        .submit-btn {
          flex: 2;
          padding: 18px 28px;
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(96, 165, 250, 0.6);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: #B0BEC5;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }

        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .cancel-btn {
          flex: 1;
          padding: 18px 28px;
          background: #94a3b8;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: #64748b;
          transform: translateY(-1px);
        }

        .product-list-section, .orders-section {
          background: white;
          padding: 35px;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          border: 1px solid #dbeafe;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .stock-legends {
          display: flex;
          gap: 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #64748b;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-color.in-stock { background: #10b981; }
        .legend-color.low-stock { background: #f59e0b; }
        .legend-color.out-of-stock { background: #ef4444; }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
        }

        .product-card {
          background: #f8fafc;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(96, 165, 250, 0.2);
        }

        .product-image-container {
          height: 180px;
          overflow: hidden;
          background: #f1f5f9;
          position: relative;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .no-image {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #475569;
          font-weight: 500;
        }

        .stock-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .product-info {
          padding: 20px;
        }

        .product-name {
          margin: 0 0 12px 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #37474F;
        }

        .price {
          font-size: 1.4rem;
          font-weight: bold;
          color: #1e40af;
          margin: 12px 0;
        }

        .stock-text {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .product-meta {
          margin: 15px 0;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }

        .created-date {
          font-size: 0.8rem;
          color: #64748b;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .edit-btn, .delete-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-btn {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
        }

        .edit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(96, 165, 250, 0.4);
        }

        .delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-card {
          background: #f8fafc;
          padding: 24px;
          border-radius: 14px;
          border-left: 5px solid #60a5fa;
          box-shadow: 0 6px 20px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .order-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(96, 165, 250, 0.15);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .order-title h4 {
          margin: 0 0 5px 0;
          font-size: 1.1rem;
          color: #37474F;
        }

        .order-date {
          font-size: 0.8rem;
          color: #64748b;
        }

        .status {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status.confirmed {
          background: #dbeafe;
          color: #1e40af;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-row.total {
          border-bottom: none;
          border-top: 2px solid #e2e8f0;
          font-weight: 700;
          margin-top: 15px;
          padding-top: 15px;
        }

        .empty-state {
          text-align: center;
          padding: 50px 40px;
          background: #f8fafc;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
          color: #475569;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .empty-state h4 {
          margin: 0 0 10px 0;
          color: #37474F;
        }

        @media (max-width: 768px) {
          .sell-page {
            padding: 15px;
          }
          .tabs {
            flex-direction: column;
          }
          .form-actions {
            flex-direction: column;
          }
          .product-grid {
            grid-template-columns: 1fr;
          }
          .page-header {
            padding: 25px 15px;
          }
          .title {
            font-size: 2rem;
          }
          .stats-overview {
            grid-template-columns: 1fr 1fr;
          }
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}