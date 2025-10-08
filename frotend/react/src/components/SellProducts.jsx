import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SellProducts({ farmerName = "Farmer", farmerEmail = "farmer@example.com", onLogout }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    try {
      setProducts(JSON.parse(localStorage.getItem("ib_products") || "[]"));
    } catch {}
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !price || (!file && editingId === null)) {
      alert("Fill all fields");
      return;
    }

    let base64 = file ? await toBase64(file) : null;

    if (editingId) {
      const updated = products.map((p) => {
        if (p.id === editingId) {
          return { ...p, name, price: Number(price), image: base64 || p.image };
        }
        return p;
      });
      setProducts(updated);
      localStorage.setItem("ib_products", JSON.stringify(updated));
      setEditingId(null);
    } else {
      const p = {
        id: Date.now(),
        name,
        price: Number(price),
        image: base64,
        seller: JSON.parse(localStorage.getItem("ib_user") || "{}"),
      };
      const next = [p, ...products];
      setProducts(next);
      localStorage.setItem("ib_products", JSON.stringify(next));
    }

    setName("");
    setPrice("");
    setFile(null);
  };

  const toBase64 = (f) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(f);
    });

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem("ib_products", JSON.stringify(updated));
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(p.price);
    setFile(null);
  };

  const handleNav = (path) => navigate(path);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <div className="sell-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">Farm2Home 🌾</div>
        <div className="nav-right">
          <a onClick={() => handleNav("/farmer-home")}>Home</a>
          <a onClick={() => handleNav("/market-prices")}>Market Prices</a>
          <a onClick={() => handleNav("/sell-products")} className="active">Sell</a>
          <a onClick={() => handleNav("/analytics")}>Analytics</a>
          <a onClick={() => handleNav("/payments")}>Payments</a>
          <a onClick={() => handleNav("/help")}>Help</a>

          {/* Profile Circle */}
          <div className="profile-container">
            <div className="profile-circle" onClick={() => setShowProfile(!showProfile)}>
              {farmerName[0].toUpperCase()}
            </div>
            {showProfile && (
              <div className="profile-dropdown">
                <button onClick={() => handleNav("/profile")}>View Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sell Form + Product List */}
      <section className="content">
        <h2 className="section-title">Sell Your Products</h2>
        <div className="sell-container">
          <form onSubmit={handleAdd} className="sell-form">
            <label>Product Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />

            <label>Price (₹ / kg)</label>
            <input value={price} type="number" onChange={(e) => setPrice(e.target.value)} />

            <label>Image</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />

            <button>{editingId ? "Update Product" : "Submit Product"}</button>
          </form>

          <div className="product-list">
            <h3>Your Products</h3>
            <div className="product-grid">
              {products.map((p) => (
                <div key={p.id} className="product-card">
                  <img src={p.image} alt={p.name} />
                  <div className="product-info">
                    <strong>{p.name}</strong>
                    <p>₹{p.price} / kg</p>
                  </div>
                  <div className="product-actions">
                    <button className="edit" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="delete" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p>No products added yet.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-box">
            <h3>Farm2Home</h3>
            <p>Empowering small and marginal farmers with AI-powered market insights and digital access.</p>
          </div>
          <div className="footer-box">
            <h3>Contact</h3>
            <p>Email: support@farm2home.com</p>
            <p>Phone: +91 789xx xxxxx</p>
            <p>Address: Hyderabad, India</p>
          </div>
          <div className="footer-box">
            <h3>Follow Us</h3>
            <p>Facebook | Twitter | Instagram | Email</p>
          </div>
        </div>
        <p className="footer-bottom">© 2025 Farm2Home — All rights reserved.</p>
      </footer>

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; }
        .sell-page { font-family: 'Poppins', sans-serif; background:#e6f0fa; min-height:100vh; display:flex; flex-direction:column; }

        /* Navbar */
        .navbar { display:flex; justify-content:space-between; align-items:center; padding:10px 40px; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.05); position:sticky; top:0; z-index:100; }
        .nav-left { font-size:24px; font-weight:700; color:#2a68d4; }
        .nav-right { display:flex; align-items:center; gap:12px; }
        .nav-right a { cursor:pointer; text-decoration:none; color:#2a68d4; font-weight:500; padding:6px 8px; border-radius:6px; transition:0.2s; }
        .nav-right a:hover, .nav-right a.active { background:#cce0ff; }

        /* Profile Circle & Dropdown */
        .profile-container { position: relative; margin-left: 10px; }
        .profile-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background:#2a68d4;
          color:white;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:bold;
          cursor:pointer;
          box-shadow:0 2px 8px rgba(0,0,0,0.15);
        }
        .profile-dropdown {
          position:absolute;
          top:45px;
          right:0;
          background:white;
          border-radius:10px;
          padding:8px;
          display:flex;
          flex-direction:column;
          gap:6px;
          box-shadow:0 8px 20px rgba(0,0,0,0.15);
          z-index:100;
        }
        .profile-dropdown button {
          border:none;
          background:transparent;
          padding:6px 10px;
          cursor:pointer;
          font-weight:600;
          color:#2a68d4;
          text-align:left;
          border-radius:6px;
        }
        .profile-dropdown button:last-child { color:#ef4444; }
        .profile-dropdown button:hover { background:#f0f4ff; }

        /* Main Content */
        .content { flex:1; padding:40px 20px; max-width:1100px; margin:auto; }
        .section-title { font-size:28px; color:#2a68d4; margin-bottom:24px; text-align:center; }

        .sell-container { display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap; }
        .sell-form { background:white; padding:18px; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.06); width:320px; display:flex; flex-direction:column; }
        .sell-form label { font-size:13px; color:#333; margin-bottom:4px; }
        .sell-form input { padding:10px; margin-bottom:12px; border-radius:8px; border:1px solid #ddd; }
        .sell-form button { padding:10px; background:#2a68d4; color:white; border:none; border-radius:10px; cursor:pointer; transition:0.3s; }
        .sell-form button:hover { background:#1e56b3; }

        .product-list { flex:1; }
        .product-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
        .product-card { background:white; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.06); padding:10px; transition:0.3s; }
        .product-card:hover { transform:translateY(-4px); box-shadow:0 8px 20px rgba(0,0,0,0.1); }
        .product-card img { width:100%; height:140px; object-fit:cover; border-radius:8px; }
        .product-info { margin-top:8px; }
        .product-actions { margin-top:8px; display:flex; justify-content:space-between; }
        .product-actions button { padding:6px 10px; border:none; border-radius:6px; color:white; cursor:pointer; font-size:12px; }
        .edit { background:#0288d1; }
        .delete { background:#d32f2f; }

        /* Footer */
        .footer { background:linear-gradient(135deg,#2a68d4,#5a9dfc); color:white; padding:40px 20px 25px; text-align:center; border-radius:12px 12px 0 0; margin-top:auto; }
        .footer-content { display:flex; flex-wrap:wrap; justify-content:space-around; margin-bottom:20px; }
        .footer-box { max-width:300px; margin:20px; text-align:left; }
        .footer-bottom { font-size:12px; opacity:0.8; }
      `}</style>
    </div>
  );
}
