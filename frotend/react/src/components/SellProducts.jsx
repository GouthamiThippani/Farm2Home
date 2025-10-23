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

  // Fetch only this farmer's products
  const fetchMyProducts = async () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.email) {
        console.log("🔍 Fetching products for farmer:", currentUser.email);
        const response = await axios.get(`${API_URL}/farmer/${currentUser.email}`);
        console.log("✅ Products fetched:", response.data);
        setProducts(response.data);
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

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log("👤 Current user:", currentUser);
      fetchMyProducts();
      fetchMyOrders();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!name || !price || !quantity) {
      setError("Please fill all required fields");
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
      } else {
        response = await axios.post(API_URL, payload);
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
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
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
        <h2 className="title">Sell Your Products</h2>
        <p className="subtitle">Welcome, {currentUser.name || currentUser.email}! Manage your farm products.</p>
      </div>

      {error && (
        <div className="error-message" style={{
          background: '#dbeafe',
          color: '#1e40af',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #93c5fd',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
        }}>
          {error}
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
          💰 My Sales ({orders.length})
        </button>
      </div>

      {activeTab === "products" && (
        <>
          <form className="sell-form" onSubmit={handleSubmit}>
            <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>
            
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
                  {file ? file.name : "Choose Image File"}
                </label>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                  <button type="button" onClick={removeImage} className="remove-image-btn">
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span className="button-content">
                    <span className="spinner"></span>
                    Saving...
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
            <h3>Your Products</h3>
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products yet. Add your first product to start selling!</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-image-container">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="product-image" />
                      ) : (
                        <div className="no-image">🌱 No Image</div>
                      )}
                    </div>
                    
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="price">₹{product.price}/kg</p>
                      <p className="quantity">
                        <span className={`stock ${product.quantity > 0 ? "in-stock" : "out-of-stock"}`}>
                          {product.quantity > 0 ? `${product.quantity} kg available` : "Out of Stock"}
                        </span>
                      </p>
                      
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
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <div className="orders-section">
          <h3>Your Sales History</h3>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No sales yet. Your orders will appear here when buyers purchase your products.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <h4>{order.product_name}</h4>
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

        .form-group {
          margin-bottom: 24px;
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

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
          align-items: center;
          margin-bottom: 18px;
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

        .empty-state {
          text-align: center;
          padding: 50px 40px;
          background: #f8fafc;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
          color: #475569;
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
          .product-grid, .orders-grid {
            grid-template-columns: 1fr;
          }
          .page-header {
            padding: 25px 15px;
          }
          .title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}