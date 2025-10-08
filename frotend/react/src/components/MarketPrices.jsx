import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MarketPrices({ farmerName = "Farmer", onLogout }) {
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setPrices([
      { name: "Wheat", price: 25 },
      { name: "Rice", price: 40 },
      { name: "Corn", price: 30 },
    ]);
  }, []);

  // Fade animation on scroll
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-section").forEach((section) => {
        if (section.getBoundingClientRect().top < window.innerHeight - 100)
          section.classList.add("visible");
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleNav = (path) => navigate(path);

  const handleLogout = () => {
    if (onLogout) onLogout(); // call parent logout
    navigate("/"); // go to login page
  };

  return (
    <div className="market-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">Farm2Home 🌾</div>
        <div className="nav-right">
          <a onClick={() => handleNav("/farmer-home")}>Home</a>
          <a onClick={() => handleNav("/market-prices")} className="active">Market Prices</a>
          <a onClick={() => handleNav("/sell-products")}>Sell</a>
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

      {/* Market Prices Table */}
      <section className="fade-section content-section">
        <h2 className="section-title">Market Prices</h2>
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Crop</th>
                <th>Price (₹/kg)</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((c, i) => (
                <tr key={i}>
                  <td>{c.name}</td>
                  <td>₹{c.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer fade-section">
        <div className="footer-content">
          <div className="footer-box">
            <h3>Farm2Home</h3>
            <p>
              Empowering small and marginal farmers with AI-powered market insights and digital access.
            </p>
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
        <p className="footer-bottom">
          © 2025 Farm2Home — All rights reserved.
        </p>
      </footer>

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; margin:0; padding:0; }
        .market-page { font-family: 'Poppins', sans-serif; background:#e6f0fa; min-height:100vh; display:flex; flex-direction:column; }

        /* Navbar */
        .navbar { display:flex; justify-content:space-between; align-items:center; padding:10px 40px; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.05); position:sticky; top:0; z-index:1000; }
        .nav-left { font-size:24px; font-weight:700; color:#2a68d4; }
        .nav-right { display:flex; align-items:center; gap:12px; }
        .nav-right a { cursor:pointer; text-decoration:none; color:#2a68d4; font-weight:500; padding:6px 8px; border-radius:6px; transition:0.2s; }
        .nav-right a:hover, .nav-right a.active { background:#cce0ff; }

        /* Profile Circle & Dropdown */
        .profile-container { position: relative; margin-left: 8px; }
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

        /* Table Section */
        .content-section { padding:40px 20px; max-width:1100px; margin: 0 auto; flex:1; }
        .section-title { font-size:28px; color:#2a68d4; margin-bottom:24px; text-align:center; }
        .table-card { background:white; padding:20px; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); transition:0.3s; }
        .table-card:hover { transform:translateY(-4px); box-shadow:0 8px 20px rgba(0,0,0,0.12); }
        table { width:100%; border-collapse:collapse; font-size:16px; }
        thead { background:#cce0ff; color:#003d99; }
        th, td { text-align:left; padding:12px; }
        tbody tr { border-bottom:1px solid #eee; transition:0.3s; }
        tbody tr:hover { background:#f0f8ff; }

        /* Footer */
        .footer { background: linear-gradient(135deg, #2a68d4, #5a9dfc); color:white; padding:40px 20px 25px; text-align:center; margin-top:auto; border-radius:12px 12px 0 0; }
        .footer-content { display:flex; flex-wrap:wrap; justify-content:space-around; margin-bottom:20px; }
        .footer-box { max-width:300px; margin:20px; text-align:left; }
        .footer-box h3 { font-size:18px; margin-bottom:8px; }
        .footer-bottom { font-size:12px; opacity:0.8; }

        /* Fade Animation */
        .fade-section { opacity:0; transform:translateY(20px); transition:0.6s ease-out; }
        .fade-section.visible { opacity:1; transform:translateY(0); }
      `}</style>
    </div>
  );
}
