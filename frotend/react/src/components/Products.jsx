import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart, FaUser, FaExclamationTriangle, FaSearch, FaFilter } from "react-icons/fa";

export default function Products({ onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("ib_cart") || "[]"));
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("ib_favorites") || "[]"));
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    email: localStorage.getItem("ib_buyer_email") || "",
    name: localStorage.getItem("ib_buyer_name") || "Guest"
  });

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        console.log("📦 Products loaded:", data.length, "products");
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        alert("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refresh]);

  // REAL-TIME UPDATES: Refresh products every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing products...");
      setRefresh(prev => prev + 1);
    }, 10000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👀 Page visible, refreshing products...");
        setRefresh(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Add to favorites with API call
  const toggleFavorite = async (productId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("ib_user"));
      if (!currentUser || !currentUser.email) {
        alert("Please login to add favorites");
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/favorites/user/${currentUser.email}/toggle/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Update local favorites state
        let nextFav = [...favorites];
        if (result.is_favorite) {
          if (!nextFav.includes(productId)) {
            nextFav.push(productId);
          }
        } else {
          nextFav = nextFav.filter(f => f !== productId);
        }
        setFavorites(nextFav);
        localStorage.setItem("ib_favorites", JSON.stringify(nextFav));
      }
    } catch (error) {
      console.error("❌ Error toggling favorite:", error);
      // Fallback to local toggle if API fails
      let nextFav = [...favorites];
      if (nextFav.includes(productId)) {
        nextFav = nextFav.filter(f => f !== productId);
      } else {
        nextFav.push(productId);
      }
      setFavorites(nextFav);
      localStorage.setItem("ib_favorites", JSON.stringify(nextFav));
    }
  };

  // Load user favorites from API on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      const currentUser = JSON.parse(localStorage.getItem("ib_user"));
      if (currentUser && currentUser.email) {
        try {
          const response = await fetch(`http://localhost:5000/api/favorites/user/${currentUser.email}`);
          if (response.ok) {
            const data = await response.json();
            const favoriteIds = data.favorites.map(fav => fav._id);
            setFavorites(favoriteIds);
            localStorage.setItem("ib_favorites", JSON.stringify(favoriteIds));
          }
        } catch (error) {
          console.error("Error loading favorites:", error);
        }
      }
    };

    loadFavorites();
  }, []);

  // Enhanced Add to cart with better stock validation
  const addToCart = async (product) => {
    console.log("🛒 Adding to cart:", product.name);
    
    try {
      // Get fresh product data from API to ensure we have latest stock
      const freshResponse = await fetch(`http://localhost:5000/api/products/${product._id}`);
      if (!freshResponse.ok) throw new Error("Failed to fetch product details");
      const freshProduct = await freshResponse.json();
      
      console.log("🔄 Fresh stock for", freshProduct.name, ":", freshProduct.quantity);
      
      // Check if product is out of stock
      if (freshProduct.quantity === 0) {
        alert("❌ This product is out of stock!");
        setRefresh(prev => prev + 1); // Refresh to update UI
        return;
      }
      
      // Check if already in cart
      const existingCartItem = cart.find(item => item._id === freshProduct._id);
      const currentCartQuantity = existingCartItem ? existingCartItem.qty : 0;
      
      // Check if adding more would exceed available stock
      if (currentCartQuantity + 1 > freshProduct.quantity) {
        alert(`⚠️ Only ${freshProduct.quantity} kg available! You already have ${currentCartQuantity} kg in cart.`);
        return;
      }
      
      // Add to local cart (without creating order)
      const cartItem = {
        ...freshProduct,
        cart_id: Date.now().toString(), // Unique ID for cart item
        qty: currentCartQuantity + 1,
        farmer_email: freshProduct.farmer_email,
        farmer_name: freshProduct.farmer_name,
        added_at: new Date().toISOString()
      };
      
      // Remove existing item if present
      const filteredCart = cart.filter(item => item._id !== freshProduct._id);
      const nextCart = [...filteredCart, cartItem];
      
      setCart(nextCart);
      localStorage.setItem("ib_cart", JSON.stringify(nextCart));
      
      console.log("✅ Added to cart:", freshProduct.name);
      
      // Show success message
      alert(`✅ ${freshProduct.name} added to cart! (${currentCartQuantity + 1} kg total)`);
      
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      alert(`Failed to add to cart: ${error.message}`);
    }
  };

  // Quick buy function (direct purchase - creates order immediately)
  const quickBuy = async (product, quantity = 1) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("ib_user"));
      if (!currentUser || !currentUser.email) {
        alert("Please log in to purchase products");
        navigate("/login");
        return;
      }

      // Get fresh product data first
      const freshResponse = await fetch(`http://localhost:5000/api/products/${product._id}`);
      if (!freshResponse.ok) throw new Error("Failed to fetch product details");
      const freshProduct = await freshResponse.json();
      
      // Check stock availability
      if (freshProduct.quantity < quantity) {
        alert(`❌ Only ${freshProduct.quantity} kg available!`);
        setRefresh(prev => prev + 1); // Refresh to update UI
        return;
      }
      
      // Create order
      const orderData = {
        product_id: freshProduct._id,
        buyer_email: currentUser.email,
        buyer_name: currentUser.name || currentUser.email,
        quantity: quantity
      };

      const response = await fetch("http://localhost:5000/api/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        console.log("✅ Order created successfully:", order);
        alert("✅ Order placed successfully!");
        setRefresh(prev => prev + 1); // Refresh to show updated stock
        navigate("/orders");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }
      
    } catch (error) {
      console.error("❌ Quick buy error:", error);
      alert(`Purchase failed: ${error.message}`);
    }
  };

  // Filter + sort products
  const displayedProducts = useMemo(() => {
    let filtered = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.farmer_name && p.farmer_name.toLowerCase().includes(search.toLowerCase()))
    );
    
    if (sortBy === "priceLow") filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "priceHigh") filtered.sort((a, b) => b.price - a.price);
    if (sortBy === "latest") filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    
    return filtered;
  }, [products, search, sortBy]);

  // Get stock status with enhanced warnings
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { 
      text: "OUT OF STOCK", 
      color: "#dc2626", 
      bgColor: "#fef2f2",
      icon: "❌",
      warning: "This product is currently unavailable"
    };
    if (quantity <= 2) return { 
      text: `VERY LOW STOCK (${quantity} left)`, 
      color: "#dc2626", 
      bgColor: "#fef2f2",
      icon: "🚨",
      warning: "Hurry! Almost sold out"
    };
    if (quantity <= 5) return { 
      text: `LOW STOCK (${quantity} left)`, 
      color: "#d97706", 
      bgColor: "#fffbeb",
      icon: "⚠️",
      warning: "Limited stock available"
    };
    if (quantity <= 10) return { 
      text: `IN STOCK (${quantity})`, 
      color: "#2563eb", 
      bgColor: "#f0f9ff",
      icon: "✅",
      warning: ""
    };
    return { 
      text: `IN STOCK (${quantity})`, 
      color: "#16a34a", 
      bgColor: "#f0fdf4",
      icon: "✅",
      warning: ""
    };
  };

  // Clear cart
  const clearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setCart([]);
      localStorage.setItem("ib_cart", "[]");
      alert("Cart cleared!");
    }
  };

  // Get total cart quantity
  const totalCartQuantity = cart.reduce((total, item) => total + item.qty, 0);

  // Check if user is logged in
  const isLoggedIn = buyerInfo.email && buyerInfo.email !== "guest@example.com";

  return (
    <div className="products-page">
      {/* Enhanced Blue Theme Header */}
      <div className="products-top-bar">
        <div className="user-info">
          <FaUser className="user-icon" />
          <div className="user-details">
            <span className="user-name">Welcome, {buyerInfo.name}</span>
            {isLoggedIn && (
              <span className="user-email">{buyerInfo.email}</span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => navigate("/favorites")} 
            className="favorites-btn"
            disabled={favorites.length === 0}
          >
            <FaHeart color={favorites.length > 0 ? "red" : "gray"} />
            Favorites ({favorites.length})
          </button>
          
          <button 
            onClick={() => navigate("/cart")} 
            className="cart-btn"
            disabled={cart.length === 0}
          >
            <FaShoppingCart />
            Cart ({totalCartQuantity})
          </button>
          
          <button 
            onClick={() => navigate("/orders")} 
            className="orders-btn"
          >
            📋 My Orders
          </button>

          {isLoggedIn && (
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters with Blue Theme */}
      <div className="products-header">
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products or farmers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filters-container">
          <div className="filter-select-wrapper">
            <FaFilter className="filter-icon" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="latest">📅 Latest</option>
              <option value="name">🔤 Name A-Z</option>
              <option value="priceLow">💰 Price: Low → High</option>
              <option value="priceHigh">💰 Price: High → Low</option>
            </select>
          </div>

          <button 
            onClick={() => { setSearch(""); setSortBy("latest"); }} 
            className="clear-filters-btn"
            disabled={!search && sortBy === "latest"}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Real-time Updates Indicator */}
      <div className="real-time-indicator">
        <span className="pulse-dot"></span>
        Live Stock Updates - Refreshes every 10 seconds
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading fresh products...</p>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {displayedProducts.length === 0 && !loading ? (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>No products found</h3>
            <p className="hint">Try adjusting your search or filters</p>
            <button 
              onClick={() => { setSearch(""); setSortBy("latest"); }} 
              className="reset-btn"
            >
              Show All Products
            </button>
          </div>
        ) : (
          displayedProducts.map((p, index) => {
            const stockStatus = getStockStatus(p.quantity);
            const isOutOfStock = p.quantity === 0;
            const isVeryLowStock = p.quantity > 0 && p.quantity <= 2;
            const isLowStock = p.quantity > 2 && p.quantity <= 5;
            const isFavorite = favorites.includes(p._id);
            const cartItem = cart.find(item => item._id === p._id);
            const cartQuantity = cartItem ? cartItem.qty : 0;
            
            return (
              <div 
                key={p._id} 
                className={`product-card fade-card ${isOutOfStock ? 'out-of-stock' : ''} ${isVeryLowStock ? 'very-low-stock' : ''} ${isLowStock ? 'low-stock' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Stock Warning Badge */}
                {(isVeryLowStock || isLowStock) && (
                  <div className="stock-warning-badge">
                    <FaExclamationTriangle />
                    {isVeryLowStock ? "Almost Gone!" : "Low Stock"}
                  </div>
                )}
                
                {/* Product Image */}
                <div className="image-container">
                  <img 
                    src={p.image || "/api/placeholder/200/200"} 
                    alt={p.name} 
                    loading="lazy" 
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBDODkuNTI0IDUwIDgxIDU4LjUyNCA4MSA2OUM4MSA3OS40NzYgODkuNTI0IDg4IDEwMCA4OEMxMTAuNDc2IDg4IDExOSA3OS40NzYgMTE5IDY5QzExOSA1OC41MjQgMTEwLjQ3NiA1MCAxMDAgNTBaTTE0OC4zNzUgMTE2Ljg3NUg1MS42MjVDNTAuNzI5IDExNi44NzUgNTAgMTE3LjYwNCA1MCAxMTguNVYxMjUuNjI1QzUwIDEyNi41MzUgNTAuNzI5IDEyNy4yNSA1MS42MjUgMTI3LjI1SDE0OC4zNzVDMTQ5LjI3MSAxMjcuMjUgMTUwIDEyNi41MzUgMTUwIDEyNS42MjVWMTE4LjVDMTUwIDExNy42MDQgMTQ5LjI3MSAxMTYuODc1IDE0OC4zNzUgMTE2Ljg3NVoiIGZpbGw9IiM5Q0EzQkYiLz4KPC9zdmc+";
                    }}
                  />
                </div>
                
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <p className="price">₹{p.price} / kg</p>
                  
                  {/* Enhanced Stock Status */}
                  <div 
                    className="stock-badge"
                    style={{ 
                      color: stockStatus.color, 
                      backgroundColor: stockStatus.bgColor,
                      border: `1px solid ${stockStatus.color}`
                    }}
                  >
                    <span className="stock-icon">{stockStatus.icon}</span>
                    {stockStatus.text}
                  </div>

                  {/* Stock Warning Message */}
                  {stockStatus.warning && (
                    <div className="stock-warning-message">
                      {stockStatus.warning}
                    </div>
                  )}

                  {/* Cart Quantity Indicator */}
                  {cartQuantity > 0 && (
                    <div className="cart-quantity-indicator">
                      🛒 In cart: {cartQuantity} kg
                    </div>
                  )}

                  {/* Enhanced Farmer Info */}
                  <div className="farmer-info">
                    <div className="farmer-label">👨‍🌾 Farmer:</div>
                    <div className="farmer-name">{p.farmer_name || "Unknown Farmer"}</div>
                    {p.farmer_email && (
                      <div className="farmer-email">{p.farmer_email}</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={isOutOfStock}
                      className={`action-btn ${isOutOfStock ? 'disabled-btn' : 'cart-btn'}`}
                      title={isOutOfStock ? "Out of stock" : "Add to cart"}
                    >
                      <FaShoppingCart />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>

                    <button 
                      onClick={() => quickBuy(p, 1)}
                      disabled={isOutOfStock || !isLoggedIn}
                      className={`action-btn ${isOutOfStock ? 'disabled-btn' : 'buy-btn'}`}
                      title={!isLoggedIn ? "Please login to buy" : isOutOfStock ? "Out of stock" : "Buy immediately"}
                    >
                      ⚡ Buy Now
                    </button>
                  </div>

                  {/* Favorite Icon */}
                  <div
                    className={`favorite-icon ${isFavorite ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(p._id)}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Cart Summary */}
      {cart.length > 0 && (
        <div className="cart-summary">
          <div className="cart-info">
            <span className="cart-count">
              🛒 {cart.length} {cart.length === 1 ? 'item' : 'items'} 
              ({totalCartQuantity} kg total)
            </span>
            <div className="cart-actions">
              <button onClick={() => navigate("/cart")} className="go-to-cart-btn">
                View Cart & Checkout
              </button>
              <button onClick={clearCart} className="clear-cart-btn">
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style>{`
        .products-page { 
          max-width: 1200px; 
          margin: 20px auto; 
          font-family: 'Poppins', sans-serif; 
          padding: 0 20px;
          background: linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%);
          min-height: 100vh;
        }

        /* Real-time Indicator */
        .real-time-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          padding: 10px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 25px;
          width: fit-content;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        /* Enhanced Blue Theme Top Bar */
        .products-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 25px;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          border-radius: 20px;
          color: white;
          box-shadow: 0 8px 25px rgba(30, 64, 175, 0.3);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .user-email {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-top: 2px;
        }

        .user-icon {
          font-size: 24px;
          background: rgba(255, 255, 255, 0.2);
          padding: 10px;
          border-radius: 50%;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .favorites-btn, .cart-btn, .orders-btn, .logout-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .favorites-btn:hover, .cart-btn:hover, .orders-btn:hover, .logout-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }

        .favorites-btn:disabled, .cart-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Enhanced Products Header with Blue Theme */
        .products-header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
          gap: 20px;
          flex-wrap: wrap;
        }

        .search-container {
          flex: 1;
          min-width: 300px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          color: #64748b;
          font-size: 16px;
        }

        .search-input { 
          width: 100%;
          padding: 14px 16px 14px 45px; 
          border-radius: 12px; 
          border: 2px solid #e2e8f0; 
          transition: all 0.3s; 
          font-size: 16px;
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .search-input:focus { 
          outline: none; 
          border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
        }

        .filters-container {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .filter-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
          font-size: 14px;
          z-index: 2;
        }

        .sort-select { 
          padding: 12px 16px 12px 35px; 
          border-radius: 12px; 
          border: 2px solid #e2e8f0; 
          transition: all 0.3s; 
          cursor: pointer; 
          font-size: 14px;
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          appearance: none;
        }

        .sort-select:focus { 
          outline: none; 
          border-color: #3b82f6; 
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
        }

        .clear-filters-btn {
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .clear-filters-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-filters-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #3b82f6;
          transform: translateY(-1px);
        }

        /* Enhanced Product Cards with Blue Theme */
        .products-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 25px; 
        }

        .product-card { 
          background: white; 
          padding: 20px; 
          border-radius: 20px; 
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); 
          text-align: center; 
          position: relative; 
          cursor: pointer; 
          transition: all 0.3s; 
          border: 2px solid #e2e8f0;
          overflow: hidden;
        }

        .product-card:hover { 
          transform: translateY(-8px) scale(1.02); 
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.15); 
          border-color: #3b82f6;
        }

        .product-card.out-of-stock { 
          opacity: 0.7; 
          border-color: #fecaca;
        }

        .product-card.very-low-stock {
          border-color: #fecaca;
          background: linear-gradient(135deg, #fff, #fef2f2);
        }

        .product-card.low-stock {
          border-color: #fed7aa;
          background: linear-gradient(135deg, #fff, #fffbeb);
        }

        .product-card.out-of-stock:hover { 
          transform: none; 
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); 
          border-color: #fecaca;
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
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
          animation: pulse 2s infinite;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }

        .stock-warning-message {
          background: #fef3c7;
          color: #92400e;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          margin: 8px 0;
          border-left: 3px solid #f59e0b;
        }
        
        .image-container {
          width: 100%;
          height: 200px;
          overflow: hidden;
          border-radius: 16px;
          margin-bottom: 15px;
          background: #f8fafc;
        }

        .product-card img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          transition: transform 0.3s; 
        }

        .product-card:hover img { 
          transform: scale(1.08); 
        }

        .product-card.out-of-stock:hover img { 
          transform: none; 
        }

        .product-info h3 { 
          font-size: 18px; 
          color: #1e293b; 
          margin-bottom: 8px; 
          font-weight: 700;
          line-height: 1.3;
        }

        .price { 
          font-size: 20px; 
          color: #1e40af; 
          margin-bottom: 12px; 
          font-weight: 700; 
        }

        /* Enhanced Stock Badge */
        .stock-badge {
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stock-icon {
          font-size: 14px;
        }

        /* Enhanced Farmer Info */
        .farmer-info {
          background: #f8fafc;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 15px;
          text-align: left;
          border: 1px solid #e2e8f0;
        }

        .farmer-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .farmer-name {
          font-weight: 600;
          color: #374151;
          font-size: 13px;
        }

        .farmer-email {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
          font-style: italic;
        }

        /* Cart Quantity Indicator */
        .cart-quantity-indicator {
          background: #dbeafe;
          color: #1e40af;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
          display: inline-block;
          border: 1px solid #93c5fd;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .action-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
        }

        .cart-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .cart-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .buy-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .buy-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .disabled-btn { 
          background: #94a3b8 !important; 
          cursor: not-allowed !important; 
          color: #cbd5e1 !important;
          box-shadow: none !important;
          transform: none !important;
        }

        /* Favorite Icon */
        .favorite-icon { 
          position: absolute; 
          top: 20px; 
          right: 20px; 
          cursor: pointer; 
          font-size: 22px; 
          transition: all 0.3s; 
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          padding: 8px;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .favorite-icon:hover { 
          transform: scale(1.2); 
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .favorite-icon.favorited {
          background: rgba(254, 226, 226, 0.95);
        }

        /* Enhanced Cart Summary */
        .cart-summary {
          position: fixed;
          bottom: 25px;
          right: 25px;
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border: 2px solid #3b82f6;
          z-index: 1000;
          min-width: 280px;
          backdrop-filter: blur(10px);
        }

        .cart-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cart-count {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
          text-align: center;
        }

        .cart-actions {
          display: flex;
          gap: 10px;
        }

        .go-to-cart-btn, .clear-cart-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          font-size: 13px;
          flex: 1;
        }

        .go-to-cart-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
        }

        .go-to-cart-btn:hover {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .clear-cart-btn {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .clear-cart-btn:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
          grid-column: 1 / -1;
        }

        .spinner {
          border: 4px solid #f1f5f9;
          border-left: 4px solid #3b82f6;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* No Products */
        .no-products {
          text-align: center;
          padding: 80px 40px;
          grid-column: 1 / -1;
          background: white;
          border-radius: 20px;
          border: 2px dashed #cbd5e1;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .no-products-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .no-products h3 {
          font-size: 1.5rem;
          color: #374151;
          margin-bottom: 10px;
        }

        .hint {
          font-size: 1rem;
          color: #64748b;
          margin-bottom: 25px;
        }

        .reset-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .reset-btn:hover {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
        }

        /* Animations */
        .fade-card { 
          opacity: 0; 
          transform: translateY(30px); 
          animation: fadeInUp 0.6s forwards; 
        }

        @keyframes fadeInUp { 
          0% { 
            opacity: 0; 
            transform: translateY(30px); 
          } 
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          } 
        }

        @keyframes pulse { 
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          } 
          50% { 
            opacity: 0.7; 
            transform: scale(1.05);
          } 
        }

        /* Responsive */
        @media (max-width: 768px) {
          .products-top-bar {
            flex-direction: column;
            gap: 15px;
            text-align: center;
            padding: 20px;
          }

          .user-info {
            justify-content: center;
          }

          .header-actions {
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
          }

          .products-header {
            flex-direction: column;
            gap: 15px;
          }
          
          .search-container, .filters-container {
            width: 100%;
          }
          
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .cart-summary {
            position: static;
            margin-top: 30px;
            width: 100%;
          }

          .farmer-info {
            font-size: 12px;
          }

          .favorites-btn, .cart-btn, .orders-btn, .logout-btn {
            padding: 8px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}