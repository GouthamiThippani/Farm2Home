import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function Products({ buyerName = "Buyer", onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("ib_cart") || "[]"));
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("ib_favorites") || "[]"));
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [refresh, setRefresh] = useState(0);

  // Fetch products from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/products/")
      .then(res => res.json())
      .then(data => {
        console.log("📦 Products loaded:", data);
        setProducts(data);
      })
      .catch(err => console.error("Error fetching products:", err));
  }, [refresh]);

  // Real-time updates listener
  useEffect(() => {
    const handleProductsUpdate = () => {
      console.log("🔄 Refreshing products...");
      setRefresh(prev => prev + 1);
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, []);

  // Add to cart with stock validation
  const addToCart = (product) => {
    console.log("🛒 Adding to cart:", product.name, "Stock:", product.quantity);
    
    if (product.quantity === 0) {
      alert("❌ This product is out of stock!");
      return;
    }
    
    // Check if adding this would exceed available stock
    const cartQuantity = cart.filter(item => item._id === product._id).length;
    if (cartQuantity >= product.quantity) {
      alert(`⚠️ Only ${product.quantity} kg available! You already have ${cartQuantity} in cart.`);
      return;
    }
    
    const nextCart = [...cart, product];
    setCart(nextCart);
    localStorage.setItem("ib_cart", JSON.stringify(nextCart));
    
    console.log("✅ Added to cart. Refreshing products...");
    setRefresh(prev => prev + 1);
  };

  // Toggle favorite
  const toggleFavorite = (id) => {
    let nextFav = [...favorites];
    if (nextFav.includes(id)) nextFav = nextFav.filter(f => f !== id);
    else nextFav.push(id);
    setFavorites(nextFav);
    localStorage.setItem("ib_favorites", JSON.stringify(nextFav));
  };

  // Filter + sort products
  const displayedProducts = useMemo(() => {
    let filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    
    if (sortBy === "priceLow") filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "priceHigh") filtered.sort((a, b) => b.price - a.price);
    if (sortBy === "latest") filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return filtered;
  }, [products, search, sortBy]);

  // Get stock status with visual indicators
  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { 
        text: "OUT OF STOCK", 
        color: "#dc2626", 
        bgColor: "#fef2f2",
        borderColor: "#dc2626"
      };
    }
    if (quantity <= 3) {
      return { 
        text: `LOW STOCK (${quantity} left)`, 
        color: "#d97706", 
        bgColor: "#fffbeb",
        borderColor: "#d97706"
      };
    }
    if (quantity <= 10) {
      return { 
        text: `IN STOCK (${quantity})`, 
        color: "#2563eb", 
        bgColor: "#f0f9ff",
        borderColor: "#2563eb"
      };
    }
    return { 
      text: `IN STOCK (${quantity})`, 
      color: "#2563eb", 
      bgColor: "#f0f9ff",
      borderColor: "#2563eb"
    };
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="latest">📅 Latest</option>
          <option value="priceLow">💰 Price: Low → High</option>
          <option value="priceHigh">💰 Price: High → Low</option>
        </select>
      </div>

      <div className="products-grid">
        {displayedProducts.length === 0 ? (
          <div className="no-products">
            <p>😔 No products found</p>
            <p className="hint">Try adjusting your search or filters</p>
          </div>
        ) : (
          displayedProducts.map((p) => {
            const stockStatus = getStockStatus(p.quantity);
            const isOutOfStock = p.quantity === 0;
            const isLowStock = p.quantity > 0 && p.quantity <= 3;
            
            return (
              <div 
                key={p._id} 
                className={`product-card fade-card ${isOutOfStock ? 'out-of-stock' : ''} ${isLowStock ? 'low-stock' : ''}`}
              >
                <img src={p.image} alt={p.name} loading="lazy" />
                
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <p className="price">₹{p.price} / kg</p>
                  
                  {/* Stock Status Badge */}
                  <div 
                    className="stock-badge"
                    style={{ 
                      color: stockStatus.color, 
                      backgroundColor: stockStatus.bgColor,
                      border: `1px solid ${stockStatus.borderColor}`
                    }}
                  >
                    {stockStatus.text}
                  </div>

                  {/* Farmer Info */}
                  {p.farmer_name && (
                    <div className="farmer-info">
                      👨‍🌾 Sold by: {p.farmer_name}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button 
                    onClick={() => addToCart(p)}
                    disabled={isOutOfStock}
                    className={isOutOfStock ? 'disabled-btn' : 'add-to-cart-btn'}
                  >
                    {isOutOfStock ? '❌ Out of Stock' : '🛒 Add to Cart'}
                  </button>

                  {/* Favorite Icon */}
                  <div
                    className="favorite-icon"
                    onClick={() => toggleFavorite(p._id)}
                    title={favorites.includes(p._id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.includes(p._id) ? <FaHeart color="red" /> : <FaRegHeart />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary */}
      <div className="cart-summary">
        <button onClick={() => navigate("/cart")} className="go-to-cart-btn">
          🛒 Go to Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
        </button>
      </div>

      {/* CSS Styles */}
      <style>{`
        .products-page { 
          max-width: 1200px; 
          margin: 20px auto; 
          font-family: 'Poppins', sans-serif; 
          padding: 0 20px;
        }

        .products-header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
          gap: 15px;
          flex-wrap: wrap;
        }

        .search-input { 
          flex: 1; 
          min-width: 250px;
          padding: 12px 16px; 
          border-radius: 12px; 
          border: 2px solid #e2e8f0; 
          transition: all 0.3s; 
          font-size: 16px;
        }

        .search-input:focus { 
          outline: none; 
          border-color: #2563eb; 
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); 
        }

        .sort-select { 
          padding: 12px 16px; 
          border-radius: 12px; 
          border: 2px solid #e2e8f0; 
          transition: all 0.3s; 
          cursor: pointer; 
          font-size: 16px;
          background: white;
        }

        .sort-select:focus { 
          outline: none; 
          border-color: #2563eb; 
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); 
        }

        .products-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: 25px; 
        }

        .product-card { 
          background: #fff; 
          padding: 20px; 
          border-radius: 20px; 
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); 
          text-align: center; 
          position: relative; 
          cursor: pointer; 
          transition: all 0.3s; 
          border: 2px solid #dbeafe; /* BLUE BORDER */
        }

        .product-card:hover { 
          transform: translateY(-8px) scale(1.02); 
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15); 
          border-color: #2563eb; /* DARKER BLUE ON HOVER */
        }

        .product-card.out-of-stock { 
          opacity: 0.6; 
          border-color: #fecaca; /* KEEP RED FOR OUT OF STOCK */
        }

        .product-card.out-of-stock:hover { 
          transform: none; 
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08); 
          border-color: #fecaca; /* KEEP RED FOR OUT OF STOCK */
        }

        .product-card.low-stock {
          border-color: #93c5fd; /* BLUE FOR LOW STOCK */
        }

        .product-card.low-stock:hover {
          border-color: #60a5fa; /* DARKER BLUE ON HOVER */
        }
        
        .product-card img { 
          width: 160px; 
          height: 160px; 
          object-fit: cover; 
          border-radius: 16px; 
          margin-bottom: 15px; 
          transition: transform 0.3s; 
          border: 2px solid #f1f5f9;
        }

        .product-card:hover img { 
          transform: scale(1.08) rotate(1deg); 
        }

        .product-card.out-of-stock:hover img { 
          transform: none; 
          rotate: 0deg; 
        }

        .product-info h3 { 
          font-size: 20px; 
          color: #1e293b; 
          margin-bottom: 8px; 
          font-weight: 700;
        }

        .price { 
          font-size: 18px; 
          color: #2563eb; 
          margin-bottom: 12px; 
          font-weight: 600; 
        }

        /* Stock Badge */
        .stock-badge {
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Farmer Info */
        .farmer-info {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 15px;
          font-style: italic;
        }

        /* Buttons */
        .add-to-cart-btn { 
          padding: 12px 20px; 
          border: none; 
          border-radius: 12px; 
          background: linear-gradient(135deg, #2563eb, #3b82f6); 
          color: #fff; 
          cursor: pointer; 
          font-weight: 600; 
          transition: all 0.3s; 
          width: 100%;
          font-size: 16px;
        }

        .add-to-cart-btn:hover { 
          background: linear-gradient(135deg, #1e40af, #2563eb); 
          transform: scale(1.05); 
        }
        
        .disabled-btn { 
          background: #9ca3af !important; 
          cursor: not-allowed !important; 
          color: #6b7280 !important;
        }

        .disabled-btn:hover { 
          background: #9ca3af !important; 
          transform: none !important; 
        }

        .favorite-icon { 
          position: absolute; 
          top: 20px; 
          right: 20px; 
          cursor: pointer; 
          font-size: 24px; 
          transition: transform 0.3s; 
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          padding: 8px;
        }

        .favorite-icon:hover { 
          transform: scale(1.3) rotate(10deg); 
        }

        .cart-summary { 
          text-align: center; 
          margin-top: 40px; 
          padding: 20px;
        }

        .go-to-cart-btn { 
          padding: 15px 30px; 
          background: linear-gradient(135deg, #2563eb, #3b82f6); /* BLUE COLOR */
          color: #fff; 
          border: none; 
          border-radius: 15px; 
          cursor: pointer; 
          font-weight: bold; 
          font-size: 18px; 
          transition: all 0.3s; 
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3); /* BLUE SHADOW */
        }

        .go-to-cart-btn:hover { 
          background: linear-gradient(135deg, #1e40af, #2563eb); /* DARKER BLUE */
          transform: scale(1.05) translateY(-3px);
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.4); /* BLUE SHADOW */
        }

        /* No Products */
        .no-products {
          text-align: center;
          padding: 60px 20px;
          grid-column: 1 / -1;
        }

        .no-products p {
          font-size: 20px;
          color: #64748b;
          margin-bottom: 10px;
        }

        .hint {
          font-size: 14px;
          color: #94a3b8;
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

        /* Responsive */
        @media (max-width: 768px) {
          .products-header {
            flex-direction: column;
          }
          
          .search-input, .sort-select {
            width: 100%;
          }
          
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}