import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/buyer.jpeg"; // buyer hero image

const buyerFeatures = [
  { name: "Products", desc: "Browse available products from trusted farmers.", path: "/products" },
  { name: "Cart", desc: "View your cart and checkout easily.", path: "/cart" },
  { name: "Help", desc: "Get assistance and tips for smooth shopping.", path: "/help" },
];

export default function BuyerHome({ buyerName = "Buyer", buyerEmail = "buyer@example.com", onLogout }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleNav = (path) => navigate(path);

  // Scroll fade animation
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-section").forEach(section => {
        if (section.getBoundingClientRect().top < window.innerHeight - 100) section.classList.add("visible");
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="buyer-home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">Farm2Home 🛒</div>
        <div className="nav-right">
          <a onClick={() => handleNav("/buyer-home")}>Home</a>
          <a onClick={() => handleNav("/products")}>Products</a>
          <a onClick={() => handleNav("/cart")}>Cart</a>
          <a onClick={() => handleNav("/help")}>Help</a>

          {/* Profile Circle */}
          <div className="profile-container">
            <div
              className="profile-circle"
              style={{ background: "#2563eb", color: "white" }} // blue color
              onClick={() => setShowProfile(!showProfile)}
            >
              {buyerName[0].toUpperCase()}
            </div>
            {showProfile && (
              <div className="profile-dropdown">
                <button onClick={() => handleNav("/buyer-profile")}>View Profile</button>
                <button onClick={() => { if (onLogout) onLogout(); navigate("/"); }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero fade-section">
        <div className="hero-left">
          <h1>Welcome, {buyerName} 👋</h1>
          <p>Browse products, add to your cart, and generate your bill easily!</p>
        </div>
        <div className="hero-right">
          <img src={heroImg} alt="Buyer" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features fade-section">
        <h2 className="features-heading">Your Dashboard</h2>
        <div className="features-grid">
          {buyerFeatures.map(f => (
            <div key={f.name} className="feature-card">
              <h3>{f.name}</h3>
              <p>{f.desc}</p>
              <button onClick={() => handleNav(f.path)}>Go</button>
            </div>
          ))}
        </div>
      </section>

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
        .buyer-home { font-family: 'Poppins', sans-serif; background: #e6f2ff; min-height:100vh; display:flex; flex-direction:column; }

        .navbar { display:flex; justify-content:space-between; align-items:center; padding:10px 40px; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.05); position:sticky; top:0; z-index:1000; }
        .nav-left { font-size:24px; font-weight:700; color:#2563eb; }
        .nav-right { display:flex; align-items:center; gap:14px; }
        .nav-right a { cursor:pointer; text-decoration:none; color:#2563eb; font-weight:500; padding:6px 10px; border-radius:6px; transition:0.2s; }
        .nav-right a:hover { background:#dbe9ff; }

        /* Profile */
        .profile-container { position: relative; }
        .profile-circle {
          width: 40px; height: 40px; border-radius: 50%;
          display:flex; align-items:center; justify-content:center;
          font-weight:600; cursor:pointer; transition:0.3s;
        }
        .profile-circle:hover { opacity:0.85; }
        .profile-dropdown {
          position:absolute; top:50px; right:0; background:white;
          border-radius:10px; padding:8px; display:flex; flex-direction:column;
          gap:6px; box-shadow:0 8px 20px rgba(0,0,0,0.15); z-index:100;
        }
        .profile-dropdown button {
          border:none; background:transparent; padding:6px 10px;
          cursor:pointer; font-weight:600; color:#2563eb; border-radius:6px;
          text-align:left; transition:0.2s;
        }
        .profile-dropdown button:last-child { color:#ef4444; }
        .profile-dropdown button:hover { background:#f0f4ff; }

        /* Hero */
        .hero { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; padding:80px 40px; min-height:60vh; background:#dbe9ff; border-radius:12px; margin:20px; }
        .hero-left { flex:1; min-width:300px; }
        .hero-left h1 { font-size:40px; color:#2563eb; margin-bottom:12px; }
        .hero-left p { font-size:18px; color:#1e40af; max-width:500px; }
        .hero-right { flex:1; min-width:300px; display:flex; justify-content:center; align-items:center; }
        .hero-right img { width:100%; max-width:450px; border-radius:12px; }

        /* Features */
        .features { padding:40px; }
        .features-heading { font-size:32px; color:#2563eb; text-align:center; margin-bottom:24px; }
        .features-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap:16px; }
        .feature-card { background:white; padding:20px; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); text-align:center; transition:0.2s; }
        .feature-card:hover { transform:translateY(-4px); box-shadow:0 8px 20px rgba(0,0,0,0.12); }
        .feature-card h3 { margin-bottom:8px; color:#2563eb; }
        .feature-card p { font-size:14px; margin-bottom:12px; color:#1e40af; }
        .feature-card button { padding:8px 14px; border:none; border-radius:8px; background:#2563eb; color:white; cursor:pointer; transition:0.2s; }
        .feature-card button:hover { opacity:0.9; transform:translateY(-2px); }

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
