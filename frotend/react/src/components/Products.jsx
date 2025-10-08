import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Products({ buyerName = "Buyer", onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("ib_cart") || "[]"));
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    try {
      setProducts(JSON.parse(localStorage.getItem("ib_products") || "[]"));
    } catch {}
  }, []);

  const addToCart = (product) => {
    const nextCart = [...cart, product];
    setCart(nextCart);
    localStorage.setItem("ib_cart", JSON.stringify(nextCart));
    alert(`${product.name} added to cart`);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="buyer-products-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">Farm2Home 🛒</div>
        <div className="nav-right">
          <a onClick={() => navigate("/buyer-home")}>Home</a>
          <a onClick={() => navigate("/products")}>Products</a>
          <a onClick={() => navigate("/cart")}>Cart</a>
          <a onClick={() => navigate("/help")}>Help</a>

          {/* Profile */}
          <div className="profile-container">
            <div
              className="profile-circle"
              style={{ background: "#2563eb", color: "white" }}
              onClick={() => setShowProfile(!showProfile)}
            >
              {buyerName[0].toUpperCase()}
            </div>
            {showProfile && (
              <div className="profile-dropdown">
                <button onClick={() => navigate("/buyer-profile")}>View Profile</button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Products Section */}
      <div className="products-container fade-section">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="products-grid">
          {filteredProducts.length === 0 && <div className="no-products">No products found</div>}
          {filteredProducts.map((p) => (
            <div key={p.id} className="product-card fade-section">
              <img src={p.image} alt={p.name} />
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-price">₹{p.price} / kg</div>
                <button onClick={() => addToCart(p)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length > 0 && (
          <div className="cart-button">
            <button onClick={() => navigate("/cart")}>Go to Cart ({cart.length})</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer fade-section">
        <div className="footer-content">
          <div className="footer-box">
            <h3>Farm2Home</h3>
            <p>Helping buyers shop easily and securely from trusted farmers.</p>
          </div>
          <div className="footer-box">
            <h3>Contact</h3>
            <p>Email: support@farm2home.com</p>
            <p>Phone: +91 789xx xxxxx</p>
            <p>Address: Hyderabad, India</p>
          </div>
          <div className="footer-box">
            <h3>Follow Us</h3>
            <p>Facebook | Twitter | Instagram</p>
          </div>
        </div>
        <p className="footer-bottom">© 2025 Farm2Home — All rights reserved.</p>
      </footer>

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; margin:0; padding:0; }
        .buyer-products-page { font-family: 'Poppins', sans-serif; background:#dbe9ff; min-height:100vh; display:flex; flex-direction:column; }

        /* Navbar */
        .navbar { display:flex; justify-content:space-between; align-items:center; padding:10px 40px; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.05); position:sticky; top:0; z-index:1000; }
        .nav-left { font-size:24px; font-weight:700; color:#2563eb; }
        .nav-right { display:flex; align-items:center; gap:14px; }
        .nav-right a { cursor:pointer; text-decoration:none; color:#2563eb; font-weight:500; padding:6px 10px; border-radius:6px; transition:0.2s; }
        .nav-right a:hover { background:#cfe3ff; }

        /* Profile */
        .profile-container { position: relative; }
        .profile-circle { width: 40px; height: 40px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-weight:600; cursor:pointer; transition:0.3s; }
        .profile-circle:hover { opacity:0.85; }
        .profile-dropdown { position:absolute; top:50px; right:0; background:white; border-radius:10px; padding:8px; display:flex; flex-direction:column; gap:6px; box-shadow:0 8px 20px rgba(0,0,0,0.15); z-index:100; }
        .profile-dropdown button { border:none; background:transparent; padding:6px 10px; cursor:pointer; font-weight:600; color:#2563eb; border-radius:6px; text-align:left; transition:0.2s; }
        .profile-dropdown button:last-child { color:#ef4444; }
        .profile-dropdown button:hover { background:#f0f4ff; }

        /* Products */
        .products-container { max-width:1100px; margin:20px auto; padding:20px; flex:1; }
        .search-input { width:100%; padding:8px 12px; border-radius:8px; border:1px solid #ddd; margin-bottom:20px; }
        .products-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; }
        .product-card { background:#fff; padding:10px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.08); text-align:center; transition:0.3s; }
        .product-card:hover { transform:translateY(-4px); box-shadow:0 8px 20px rgba(0,0,0,0.15); }
        .product-card img { width:120px; height:120px; object-fit:cover; border-radius:12px; margin:0 auto; display:block; }
        .product-info { margin-top:8px; }
        .product-name { font-weight:700; }
        .product-price { color:#1e40af; margin:4px 0; }
        .product-card button { padding:6px 10px; border:none; border-radius:8px; background:#2563eb; color:#fff; cursor:pointer; transition:0.3s; }
        .product-card button:hover { background:#1e40af; }

        .cart-button { text-align:center; margin-top:20px; }
        .cart-button button { padding:10px 16px; background:#2563eb; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.3s; }
        .cart-button button:hover { background:#1e40af; }

        /* Footer */
        .footer { background: linear-gradient(135deg, #3b82f6, #60a5fa); color:white; padding:40px 20px 25px; text-align:center; margin-top:auto; border-radius:12px 12px 0 0; }
        .footer-content { display:flex; flex-wrap:wrap; justify-content:space-around; margin-bottom:20px; }
        .footer-box { max-width:300px; margin:20px; text-align:left; }
        .footer-box h3 { font-size:18px; margin-bottom:8px; }
        .footer-bottom { font-size:12px; opacity:0.8; }

        /* Animations */
        .fade-section { opacity:0; transform:translateY(20px); transition:0.6s ease-out; }
        .fade-section.visible { opacity:1; transform:translateY(0); }
      `}</style>
    </div>
  );
}
