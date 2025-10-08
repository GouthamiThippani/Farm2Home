import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Help({ farmerName = "Farmer", onLogout }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleNav = (path) => navigate(path);

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="help-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">Farm2Home 🌾</div>
        <div className="nav-right">
          <a onClick={() => handleNav("/farmer-home")}>Home</a>
          <a onClick={() => handleNav("/market-prices")}>Market Prices</a>
          <a onClick={() => handleNav("/sell-products")}>Sell</a>
          <a onClick={() => handleNav("/analytics")}>Analytics</a>
          <a onClick={() => handleNav("/payments")}>Payments</a>
          <a onClick={() => handleNav("/help")} className="active">Help</a>

          {/* Profile Circle */}
          <div className="profile-container">
            <div
              className="profile-icon"
              onClick={() => setShowProfile(!showProfile)}
            >
              {farmerName[0].toUpperCase()}
            </div>
            {showProfile && (
              <div className="profile-dropdown">
                <button onClick={() => handleNav("/profile")}>View Profile</button>
                <button
                  onClick={() => {
                    localStorage.removeItem("ib_user"); // Clear user session
                    if (onLogout) onLogout();          // Call parent logout if exists
                    navigate("/");                     // Go to login page
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Help Section */}
      <section className="fade-section content-section">
        <h2 className="section-title">How can we help you?</h2>
        <p style={{ textAlign: "center", marginBottom: 24, color: "#333" }}>
          If you face any issues or queries, reach out via the options below. Our
          team is ready to assist in multiple languages.
        </p>

        <div className="help-grid">
          <div className="help-card">
            <h3>Our Main Office</h3>
            <p>3400 5th Avenue St. New York, NY 101</p>
          </div>
          <div className="help-card">
            <h3>Phone Number</h3>
            <p>+1 234 567 8900</p>
            <p>(Toll-Free)</p>
          </div>
          <div className="help-card">
            <h3>Facebook</h3>
            <p>facebook.com/Farm2Home</p>
          </div>
          <div className="help-card">
            <h3>Email</h3>
            <p>support@farm2home.com</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer fade-section">
        <div className="footer-content">
          <div className="footer-box">
            <h3>Farm2Home</h3>
            <p>
              Empowering small and marginal farmers with AI-powered market
              insights and digital access.
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
            <p>
              <a href="https://facebook.com/Farm2Home" target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>Facebook</a> | 
              <a href="#" style={{ color: "white" }}> Twitter</a> | 
              <a href="#" style={{ color: "white" }}> Instagram</a> | 
              <a href="mailto:support@farm2home.com" style={{ color: "white" }}> Email</a>
            </p>
          </div>
        </div>
        <p className="footer-bottom">© 2025 Farm2Home — All rights reserved.</p>
      </footer>

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; margin:0; padding:0; }
        .help-page { font-family: 'Poppins', sans-serif; background: #f7f9fc; min-height:100vh; display:flex; flex-direction:column; }

        .navbar { display:flex; justify-content:space-between; align-items:center; padding:10px 40px; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.05); position:sticky; top:0; z-index:1000; }
        .nav-left { font-size:24px; font-weight:700; color:#3b82f6; }
        .nav-right { display:flex; align-items:center; gap:12px; }
        .nav-right a { cursor:pointer; text-decoration:none; color:#3b82f6; font-weight:500; padding:6px 8px; border-radius:6px; transition:0.2s; }
        .nav-right a:hover, .nav-right a.active { background:#dbe9ff; }

        .profile-container { position:relative; }
        .profile-icon { width:36px; height:36px; border-radius:50%; background:#3b82f6; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; cursor:pointer; }
        .profile-dropdown { position:absolute; right:0; top:45px; background:white; border-radius:12px; padding:8px; box-shadow:0 6px 20px rgba(0,0,0,0.1); display:flex; flex-direction:column; min-width:120px; }
        .profile-dropdown button { border:none; background:none; padding:8px; cursor:pointer; text-align:left; transition:0.2s; }
        .profile-dropdown button:hover { background:#f0f4ff; }

        .content-section { padding:40px 20px; max-width:900px; margin:0 auto; flex:1; }
        .section-title { font-size:28px; color:#3b82f6; margin-bottom:24px; text-align:center; }

        .help-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); gap:16px; margin-top:24px; }
        .help-card { background:white; padding:20px; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); text-align:center; transition:0.3s; }
        .help-card:hover { transform:translateY(-4px); box-shadow:0 8px 20px rgba(0,0,0,0.12); }
        .help-card h3 { color:#2563eb; margin-bottom:8px; }
        .help-card p { font-size:14px; color:#1e40af; }

        .footer { background: linear-gradient(135deg, #3b82f6, #60a5fa); color:white; padding:40px 20px 25px; text-align:center; margin-top:auto; border-radius:12px 12px 0 0; }
        .footer-content { display:flex; flex-wrap:wrap; justify-content:space-around; margin-bottom:20px; }
        .footer-box { max-width:300px; margin:20px; text-align:left; }
        .footer-box h3 { font-size:18px; margin-bottom:8px; }
        .footer-bottom { font-size:12px; opacity:0.8; }

        .fade-section { opacity:0; transform:translateY(20px); transition:0.6s ease-out; }
        .fade-section.visible { opacity:1; transform:translateY(0); }
      `}</style>
    </div>
  );
}
