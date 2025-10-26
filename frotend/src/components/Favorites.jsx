import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaTrash, FaHome, FaStore, FaUser, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import axios from "axios";

export default function Favorites({ user, onLogout }) {
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [removingProduct, setRemovingProduct] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const FAVORITES_API_URL = "http://localhost:5000/api/favorites";
  const PRODUCTS_API_URL = "http://localhost:5000/api/products";

  // Get current user
  const getCurrentUser = () => {
    if (user && user.email) {
      return user;
    }
    const storedUser = JSON.parse(localStorage.getItem("ib_user") || "null");
    return storedUser;
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Fetch favorite products from backend
  const fetchFavorites = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      setError("Please login to view favorites");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("🔍 Fetching favorites for:", currentUser.email);
      const response = await axios.get(`${FAVORITES_API_URL}/user/${currentUser.email}`);
      console.log("✅ Favorites loaded:", response.data.favorites.length, "items");
      setFavoriteProducts(response.data.favorites);
    } catch (err) {
      console.error("❌ Error fetching favorites:", err);
      setError("Failed to load favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove product from favorites
  const removeFromFavorites = async (productId) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      setError("Please login to manage favorites");
      return;
    }

    try {
      setRemovingProduct(productId);
      console.log("🗑️ Removing favorite:", productId);
      await axios.delete(`${FAVORITES_API_URL}/user/${currentUser.email}/remove/${productId}`);
      
      // Update local state
      setFavoriteProducts(prev => prev.filter(product => product._id !== productId));
      showSuccess("Removed from favorites!");
      
      console.log("✅ Favorite removed successfully");
    } catch (err) {
      console.error("❌ Error removing from favorites:", err);
      setError("Failed to remove from favorites");
    } finally {
      setRemovingProduct(null);
    }
  };

  // Add to cart with stock validation
  const addToCart = async (product) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      setError("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(product._id);
      
      // Check current stock first
      const response = await fetch(`${PRODUCTS_API_URL}/${product._id}`);
      if (!response.ok) throw new Error("Failed to fetch product details");
      
      const freshProduct = await response.json();
      
      if (freshProduct.quantity === 0) {
        alert("❌ This product is out of stock!");
        // Refresh favorites to update stock status
        await fetchFavorites();
        return;
      }

      // Check if already in cart
      const currentCart = JSON.parse(localStorage.getItem("ib_cart") || "[]");
      const existingItem = currentCart.find(item => item._id === product._id);
      
      if (existingItem && existingItem.qty >= freshProduct.quantity) {
        alert(`⚠️ Only ${freshProduct.quantity} kg available! You already have ${existingItem.qty} in cart.`);
        return;
      }

      // Add to cart
      const cartItem = {
        ...freshProduct,
        cart_id: Date.now().toString(),
        qty: existingItem ? existingItem.qty + 1 : 1,
        added_at: new Date().toISOString()
      };

      const updatedCart = existingItem 
        ? currentCart.map(item => item._id === product._id ? cartItem : item)
        : [...currentCart, cartItem];

      setCart(updatedCart);
      localStorage.setItem("ib_cart", JSON.stringify(updatedCart));
      
      showSuccess(`${product.name} added to cart!`);
      console.log("✅ Added to cart:", product.name);

    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      setError("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  // Quick buy function
  const quickBuy = async (product) => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) {
      setError("Please login to purchase products");
      navigate("/login");
      return;
    }

    try {
      // Check stock first
      const response = await fetch(`${PRODUCTS_API_URL}/${product._id}`);
      if (!response.ok) throw new Error("Failed to fetch product details");
      
      const freshProduct = await response.json();
      
      if (freshProduct.quantity < 1) {
        alert("❌ This product is out of stock!");
        await fetchFavorites();
        return;
      }

      // Create order directly
      const orderData = {
        product_id: freshProduct._id,
        buyer_email: currentUser.email,
        buyer_name: currentUser.name || currentUser.email,
        quantity: 1
      };

      const orderResponse = await fetch("http://localhost:5000/api/orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (orderResponse.ok) {
        const order = await orderResponse.json();
        showSuccess("Order placed successfully!");
        console.log("✅ Quick buy order created:", order);
        
        // Refresh favorites to update stock
        await fetchFavorites();
        navigate("/orders");
      } else {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to create order");
      }

    } catch (error) {
      console.error("❌ Quick buy error:", error);
      alert(`Purchase failed: ${error.message}`);
    }
  };

  // Get stock status with enhanced warnings
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { 
      text: "OUT OF STOCK", 
      color: "#dc2626", 
      bgColor: "#fef2f2",
      icon: "❌"
    };
    if (quantity <= 2) return { 
      text: `VERY LOW STOCK (${quantity} left)`, 
      color: "#dc2626", 
      bgColor: "#fef2f2",
      icon: "🚨"
    };
    if (quantity <= 5) return { 
      text: `LOW STOCK (${quantity} left)`, 
      color: "#d97706", 
      bgColor: "#fffbeb",
      icon: "⚠️"
    };
    return { 
      text: `IN STOCK (${quantity})`, 
      color: "#16a34a", 
      bgColor: "#f0fdf4",
      icon: "✅"
    };
  };

  // Scroll fade animation
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-section").forEach(section => {
        if (section.getBoundingClientRect().top < window.innerHeight - 100) {
          section.classList.add("visible");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load cart on component mount
  useEffect(() => {
    const currentCart = JSON.parse(localStorage.getItem("ib_cart") || "[]");
    setCart(currentCart);
  }, []);

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Auto-refresh favorites every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (favoriteProducts.length > 0) {
        console.log("🔄 Auto-refreshing favorites...");
        fetchFavorites();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [favoriteProducts.length]);

  const currentUser = getCurrentUser();

  if (!currentUser) {
    return (
      <div className="favorites-page">
        <div className="login-prompt fade-section">
          <div className="login-icon">🔒</div>
          <h2>Login Required</h2>
          <p>Please login to view and manage your favorite products</p>
          <button onClick={() => navigate("/login")} className="login-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <FaCheckCircle /> {successMessage}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero fade-section">
        <div className="hero-left">
          <h1>Your Favorites ❤️</h1>
          <p>All your loved farm-fresh products in one place. Easy to find, easy to shop!</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{favoriteProducts.length}</span>
              <span className="stat-label">Saved Items</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {favoriteProducts.filter(p => p.quantity > 0).length}
              </span>
              <span className="stat-label">In Stock</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {favoriteProducts.filter(p => p.quantity === 0).length}
              </span>
              <span className="stat-label">Out of Stock</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-icon">❤️</div>
        </div>
      </section>

      {/* Real-time Updates Indicator */}
      <div className="real-time-indicator">
        <span className="pulse-dot"></span>
        Live Stock Updates
      </div>

      {/* Main Content */}
      <section className="favorites-content fade-section">
        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your favorite products...</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">❤️</div>
            <h3>No favorites yet</h3>
            <p>Start adding products to your favorites by clicking the heart icon on any product!</p>
            <button onClick={() => navigate("/products")} className="browse-btn">
              <FaStore /> Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Favorites Summary */}
            <div className="favorites-summary">
              <h3>Your Favorite Products ({favoriteProducts.length})</h3>
              <div className="summary-actions">
                <button 
                  onClick={() => navigate("/products")} 
                  className="continue-shopping-btn"
                >
                  <FaStore /> Continue Shopping
                </button>
                <button 
                  onClick={() => navigate("/cart")} 
                  className="view-cart-btn"
                  disabled={cart.length === 0}
                >
                  <FaShoppingCart /> View Cart ({cart.length})
                </button>
              </div>
            </div>

            {/* Favorites Grid */}
            <div className="favorites-grid">
              {favoriteProducts.map((product, index) => {
                const stockStatus = getStockStatus(product.quantity);
                const isOutOfStock = product.quantity === 0;
                const isLowStock = product.quantity > 0 && product.quantity <= 5;
                
                return (
                  <div 
                    key={product._id} 
                    className={`favorite-card fade-section ${isOutOfStock ? 'out-of-stock' : ''} ${isLowStock ? 'low-stock' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Stock Warning Badge */}
                    {isLowStock && !isOutOfStock && (
                      <div className="stock-warning-badge">
                        <FaExclamationTriangle />
                        {product.quantity <= 2 ? "Almost Gone!" : "Low Stock"}
                      </div>
                    )}

                    <div className="product-image-section">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="product-image"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBDODkuNTI0IDUwIDgxIDU4LjUyNCA4MSA2OUM4MSA3OS40NzYgODkuNTI0IDg4IDEwMCA4OEMxMTAuNDc2IDg4IDExOSA3OS40NzYgMTE5IDY5QzExOSA1OC41MjQgMTEwLjQ3NiA1MCAxMDAgNTBaTTE0OC4zNzUgMTE2Ljg3NUg1MS42MjVDNTAuNzI5IDExNi44NzUgNTAgMTE3LjYwNCA1MCAxMTguNVYxMjUuNjI1QzUwIDEyNi41MzUgNTAuNzI5IDEyNy4yNSA1MS42MjUgMTI3LjI1SDE0OC4zNzVDMTQ5LjI3MSAxMjcuMjUgMTUwIDEyNi41MzUgMTUwIDEyNS42MjVWMTE4LjVDMTUwIDExNy42MDQgMTQ5LjI3MSAxMTYuODc1IDE0OC4zNzUgMTE2Ljg3NVoiIGZpbGw9IiM5Q0EzQkYiLz4KPC9zdmc+";
                          }}
                        />
                      ) : (
                        <div className="no-image">🌱 No Image</div>
                      )}
                      
                      <button
                        className={`remove-favorite-btn ${removingProduct === product._id ? 'removing' : ''}`}
                        onClick={() => removeFromFavorites(product._id)}
                        disabled={removingProduct === product._id}
                        title="Remove from favorites"
                      >
                        {removingProduct === product._id ? (
                          <div className="spinner-small"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-price">₹{product.price}/kg</p>
                      
                      {/* Enhanced Stock Status */}
                      <div 
                        className="stock-badge"
                        style={{ 
                          color: stockStatus.color, 
                          backgroundColor: stockStatus.bgColor 
                        }}
                      >
                        <span className="stock-icon">{stockStatus.icon}</span>
                        {stockStatus.text}
                      </div>

                      <div className="product-details">
                        {product.farmer_name && (
                          <span className="farmer-name">
                            <FaUser size={12} /> By: {product.farmer_name}
                          </span>
                        )}
                        {product.farmer_email && (
                          <span className="farmer-email">{product.farmer_email}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="action-buttons">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock || addingToCart === product._id}
                          className={`action-btn cart-btn ${isOutOfStock ? 'disabled' : ''}`}
                        >
                          {addingToCart === product._id ? (
                            <div className="spinner-small"></div>
                          ) : (
                            <FaShoppingCart />
                          )}
                          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>

                        <button
                          onClick={() => quickBuy(product)}
                          disabled={isOutOfStock}
                          className={`action-btn buy-btn ${isOutOfStock ? 'disabled' : ''}`}
                        >
                          ⚡ Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <style>{`
        * { box-sizing: border-box; margin:0; padding:0; }
        .favorites-page { 
          font-family: 'Poppins', sans-serif; 
          background: #f0f7ff; 
          min-height:100vh; 
          display:flex; 
          flex-direction:column; 
        }

        /* Success Message */
        .success-message {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #d1fae5;
          color: #065f46;
          padding: 12px 20px;
          border-radius: 10px;
          border: 1px solid #a7f3d0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          z-index: 1000;
          animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Real-time Indicator */
        .real-time-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #dbeafe;
          color: #2563eb;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin: 0 40px 20px;
          width: fit-content;
          border: 1px solid #93c5fd;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        /* Hero Section */
        .hero { 
          display:flex; 
          flex-wrap:wrap; 
          align-items:center; 
          justify-content:space-between; 
          padding:80px 40px; 
          min-height:50vh; 
          background:#dbeafe; 
          border-radius:16px; 
          margin:20px 40px; 
          box-shadow:0 10px 25px rgba(0,0,0,0.05); 
        }

        .hero-left { 
          flex:1; 
          min-width:300px; 
        }

        .hero-left h1 { 
          font-size:42px; 
          color:#1e40af; 
          margin-bottom:16px; 
          animation: fadeInDown 1s ease forwards; 
        }

        .hero-left p { 
          font-size:18px; 
          color:#334155; 
          max-width:500px; 
          line-height:1.6; 
          margin-bottom: 2rem;
          animation: fadeInDown 1.2s ease forwards; 
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          animation: fadeInDown 1.4s ease forwards;
        }

        .stat {
          text-align: center;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          min-width: 120px;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #1e40af;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }

        .hero-right { 
          flex:1; 
          min-width:300px; 
          display:flex; 
          justify-content:center; 
          align-items:center; 
          animation: float 6s ease-in-out infinite; 
        }

        .hero-icon {
          font-size: 8rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes fadeInDown { 
          from { 
            opacity:0; 
            transform:translateY(-30px); 
          } 
          to { 
            opacity:1; 
            transform:translateY(0); 
          } 
        }

        @keyframes float { 
          0%,100% { 
            transform:translateY(0px); 
          } 
          50% { 
            transform:translateY(-10px); 
          } 
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Main Content */
        .favorites-content {
          padding: 60px 40px;
          flex: 1;
        }

        /* Favorites Summary */
        .favorites-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .favorites-summary h3 {
          color: #1e293b;
          font-size: 1.5rem;
          margin: 0;
        }

        .summary-actions {
          display: flex;
          gap: 1rem;
        }

        .continue-shopping-btn, .view-cart-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .continue-shopping-btn {
          background: #3b82f6;
          color: white;
        }

        .continue-shopping-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .view-cart-btn {
          background: #10b981;
          color: white;
        }

        .view-cart-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
        }

        .view-cart-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        /* Error Message */
        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid #fecaca;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: fadeIn 0.5s ease;
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 4rem;
          color: #64748b;
          animation: fadeIn 0.5s ease;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #1e40af;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid #e2e8f0;
          border-top: 2px solid #1e40af;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
          animation: fadeIn 0.5s ease;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 2s infinite;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #374151;
        }

        .browse-btn {
          padding: 0.75rem 2rem;
          background: #1e40af;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .browse-btn:hover {
          background: #1e3a8a;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(30, 64, 175, 0.3);
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        /* Favorites Grid */
        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .favorite-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          cursor: pointer;
          animation: fadeInUp 0.6s ease forwards;
          border: 2px solid #f1f5f9;
          position: relative;
        }

        .favorite-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
          border-color: #dbeafe;
        }

        .favorite-card.out-of-stock {
          opacity: 0.7;
          border-color: #fecaca;
        }

        .favorite-card.low-stock {
          border-color: #fed7aa;
        }

        /* Stock Warning Badge */
        .stock-warning-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #dc2626;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
          animation: pulse 2s infinite;
        }

        .product-image-section {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .favorite-card:hover .product-image {
          transform: scale(1.05);
        }

        .no-image {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #64748b;
          font-size: 1.2rem;
        }

        .remove-favorite-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          color: #dc2626;
          z-index: 2;
        }

        .remove-favorite-btn:hover:not(.removing) {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }

        .remove-favorite-btn.removing {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .product-info {
          padding: 1.5rem;
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .product-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
          margin-bottom: 1rem;
        }

        /* Enhanced Stock Badge */
        .stock-badge {
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stock-icon {
          font-size: 14px;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .farmer-name {
          font-size: 0.9rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .farmer-email {
          font-size: 0.8rem;
          color: #94a3b8;
          font-style: italic;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 14px;
        }

        .cart-btn {
          background: #dbeafe;
          color: #2563eb;
        }

        .cart-btn:hover:not(.disabled) {
          background: #2563eb;
          color: white;
          transform: translateY(-2px);
        }

        .buy-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .buy-btn:hover:not(.disabled) {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-2px);
        }

        .action-btn.disabled {
          background: #94a3b8;
          cursor: not-allowed;
          color: #6b7280;
          transform: none;
        }

        /* Login Prompt */
        .login-prompt {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .login-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .login-btn {
          padding: 0.75rem 2rem;
          background: #1e40af;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          background: #1e3a8a;
          transform: translateY(-2px);
        }

        /* Fade sections */
        .fade-section { 
          opacity:0; 
          transform:translateY(20px); 
          transition:0.8s ease-out; 
        }
        .fade-section.visible { 
          opacity:1; 
          transform:translateY(0); 
        }

        @keyframes fadeInUp { 
          from { 
            opacity:0; 
            transform:translateY(20px); 
          } 
          to { 
            opacity:1; 
            transform:translateY(0); 
          } 
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero {
            padding: 40px 20px;
            margin: 10px 20px;
            text-align: center;
          }

          .hero-left h1 {
            font-size: 2rem;
          }

          .hero-stats {
            justify-content: center;
            flex-wrap: wrap;
          }

          .favorites-content {
            padding: 40px 20px;
          }

          .favorites-grid {
            grid-template-columns: 1fr;
          }

          .favorites-summary {
            flex-direction: column;
            align-items: flex-start;
          }

          .summary-actions {
            width: 100%;
            flex-direction: column;
          }

          .action-buttons {
            flex-direction: column;
          }

          .real-time-indicator {
            margin: 0 20px 20px;
          }
        }
      `}</style>
    </div>
  );
}