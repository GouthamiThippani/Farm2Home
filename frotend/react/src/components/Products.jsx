import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaArrowUp, FaArrowDown } from "react-icons/fa";
import buyerNavbar from "./BuyerNavbar";
export default function Products({ buyerName = "Buyer", onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("ib_cart") || "[]"));
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("ib_favorites") || "[]"));
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Fetch products from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/products/")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  // Add to cart
  const addToCart = (product) => {
    const nextCart = [...cart, product]; // Add exact product clicked
    setCart(nextCart);
    localStorage.setItem("ib_cart", JSON.stringify(nextCart));
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

  return (
    <div className="products-page">
      <div className="products-header">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
          <option value="latest">Latest</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
        </select>
      </div>

      <div className="products-grid">
        {displayedProducts.length === 0 && <p>No products found</p>}
        {displayedProducts.map((p) => (
          <div key={p._id} className="product-card fade-card">
            <img src={p.image} alt={p.name} loading="lazy" />
            <div className="product-info">
              <h3>{p.name}</h3>
              <p>₹{p.price} / kg</p>
              <button onClick={() => addToCart(p)}>Add to Cart</button>
              <div
                className="favorite-icon"
                onClick={() => toggleFavorite(p._id)}
                title={favorites.includes(p._id) ? "Remove from favorites" : "Add to favorites"}
              >
                {favorites.includes(p._id) ? <FaHeart color="red" /> : <FaRegHeart />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <button onClick={() => navigate("/cart")}>Go to Cart ({cart.length})</button>
      </div>

      {/* CSS */}
      <style>{`
        .products-page { max-width:1100px; margin:20px auto; font-family:Poppins, sans-serif; }
        .products-header { display:flex; justify-content:space-between; margin-bottom:20px; gap:12px; }
        .search-input { flex:1; padding:10px 14px; border-radius:10px; border:1px solid #ccc; transition:0.3s; }
        .search-input:focus { outline:none; border-color:#2563eb; box-shadow:0 0 8px rgba(37,99,235,0.3); }
        .sort-select { padding:10px 14px; border-radius:10px; border:1px solid #ccc; transition:0.3s; cursor:pointer; }
        .sort-select:focus { outline:none; border-color:#2563eb; box-shadow:0 0 8px rgba(37,99,235,0.3); }

        .products-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; }

        .product-card { background:#fff; padding:14px; border-radius:16px; box-shadow:0 6px 18px rgba(0,0,0,0.08); text-align:center; position:relative; cursor:pointer; transition:transform 0.3s, box-shadow 0.3s; }
        .product-card:hover { transform:translateY(-6px) scale(1.02); box-shadow:0 10px 25px rgba(0,0,0,0.15); }
        .product-card img { width:140px; height:140px; object-fit:cover; border-radius:16px; margin-bottom:10px; transition:transform 0.3s; }
        .product-card:hover img { transform:scale(1.05) rotate(2deg); }

        .product-info h3 { font-size:18px; color:#2563eb; margin-bottom:6px; }
        .product-info p { font-size:15px; color:#1e40af; margin-bottom:10px; font-weight:500; }

        .product-card button { padding:8px 14px; border:none; border-radius:10px; background:#2563eb; color:#fff; cursor:pointer; font-weight:600; transition:all 0.3s; }
        .product-card button:hover { background:#1e40af; transform:scale(1.05); }

        .favorite-icon { position:absolute; top:12px; right:12px; cursor:pointer; font-size:20px; transition:transform 0.3s; }
        .favorite-icon:hover { transform:scale(1.3) rotate(10deg); }

        .cart-summary { text-align:center; margin-top:24px; }
        .cart-summary button { padding:12px 20px; background:#2563eb; color:#fff; border:none; border-radius:12px; cursor:pointer; font-weight:bold; font-size:16px; transition:all 0.3s; }
        .cart-summary button:hover { background:#1e40af; transform:scale(1.05); }

        /* Animations */
        .fade-card { opacity:0; transform:translateY(20px); animation:fadeInUp 0.6s forwards; }
        @keyframes fadeInUp { 0% { opacity:0; transform:translateY(20px); } 100% { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}