import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaArrowUp, FaArrowDown } from "react-icons/fa";
import axios from "axios"; // to fetch products from database

export default function Products({ buyerName = "Buyer", onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("default");

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products"); // replace with your API endpoint
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();

    // Load cart & favorites from localStorage
    const savedCart = JSON.parse(localStorage.getItem("ib_cart") || "[]");
    const savedFav = JSON.parse(localStorage.getItem("ib_favorites") || "[]");
    setCart(savedCart);
    setFavorites(savedFav);
  }, []);

  // Scroll fade animation
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-section").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 50) {
          el.classList.add("visible");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add to cart
  const addToCart = (product) => {
    const nextCart = [...cart, product];
    setCart(nextCart);
    localStorage.setItem("ib_cart", JSON.stringify(nextCart));
    alert(`${product.name} added to cart`);
  };

  // Toggle favorite
  const toggleFavorite = (productId) => {
    let nextFavorites = [...favorites];
    if (nextFavorites.includes(productId)) {
      nextFavorites = nextFavorites.filter((id) => id !== productId);
    } else {
      nextFavorites.push(productId);
    }
    setFavorites(nextFavorites);
    localStorage.setItem("ib_favorites", JSON.stringify(nextFavorites));
  };

  // Sort products
  const sortedProducts = [...products]
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === "price-low") return a.price - b.price;
      if (sortOption === "price-high") return b.price - a.price;
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

  const getPriceTrend = (product) => {
    if (!product.history || product.history.length < 2) return null;
    const lastPrice = product.history[product.history.length - 2];
    const currentPrice = product.price;
    if (currentPrice > lastPrice) return "up";
    if (currentPrice < lastPrice) return "down";
    return "stable";
  };

  return (
    <div className="buyer-products-page">
      {/* Header */}
      <div className="products-header fade-section">
        <h2>Available Products</h2>
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="default">Sort By</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid fade-section">
        {sortedProducts.length === 0 && <div className="no-products">No products found</div>}
        {sortedProducts.map((p) => (
          <div key={p.id} className="product-card fade-section">
            <img src={p.image} alt={p.name} />
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-price">
                ₹{p.price} / kg{" "}
                {getPriceTrend(p) === "up" && <FaArrowUp color="green" />}
                {getPriceTrend(p) === "down" && <FaArrowDown color="red" />}
              </div>
              <div className="product-actions">
                <button onClick={() => addToCart(p)}>Add to Cart</button>
                <div
                  className="favorite-icon"
                  onClick={() => toggleFavorite(p.id)}
                  title={favorites.includes(p.id) ? "Remove from favorites" : "Save for later"}
                >
                  {favorites.includes(p.id) ? <FaHeart color="red" /> : <FaRegHeart />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Go to Cart Button */}
      {sortedProducts.length > 0 && (
        <div className="cart-button fade-section">
          <button onClick={() => navigate("/cart")}>Go to Cart ({cart.length})</button>
        </div>
      )}

      {/* Styles */}
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        .buyer-products-page { font-family:'Poppins',sans-serif; background:#f0f7ff; min-height:100vh; padding:20px; }

        .products-header { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .products-header h2 { color:#1e40af; font-size:28px; margin-bottom:12px; }
        .search-sort { display:flex; gap:12px; flex-wrap:wrap; }
        .search-sort input { padding:8px 12px; border-radius:8px; border:1px solid #ccc; width:200px; }
        .search-sort select { padding:8px 12px; border-radius:8px; border:1px solid #ccc; }

        .products-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; }
        .product-card { background:white; border-radius:12px; padding:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); position:relative; transition:0.3s; }
        .product-card:hover { transform:translateY(-4px) scale(1.02); box-shadow:0 8px 20px rgba(0,0,0,0.12); }
        .product-card img { width:100%; height:150px; object-fit:cover; border-radius:12px; }
        .product-info { margin-top:8px; position:relative; }
        .product-name { font-weight:600; margin-bottom:4px; }
        .product-price { color:#1e40af; display:flex; align-items:center; justify-content:center; gap:4px; margin-bottom:8px; }
        .product-actions { display:flex; justify-content:space-between; align-items:center; }
        .product-actions button { padding:6px 12px; border:none; border-radius:8px; background:#2563eb; color:white; cursor:pointer; transition:0.3s; }
        .product-actions button:hover { background:#1e3a8a; }
        .favorite-icon { cursor:pointer; font-size:18px; }
        .favorite-icon:hover { transform:scale(1.2); }

        .cart-button { text-align:center; margin-top:20px; }
        .cart-button button { padding:10px 16px; background:#2563eb; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.3s; }
        .cart-button button:hover { background:#1e3a8a; }

        .fade-section { opacity:0; transform:translateY(20px); transition:0.6s ease-out; }
        .fade-section.visible { opacity:1; transform:translateY(0); }
      `}</style>
    </div>
  );
}
