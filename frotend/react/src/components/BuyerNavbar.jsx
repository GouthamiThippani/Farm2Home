import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BuyerNavbar({ buyerName = "Buyer", onLogout }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleNav = (path) => navigate(path);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="buyer-navbar">
      <div className="nav-left" onClick={() => handleNav("/buyer-home")}>
        Farm2Home 🛒
      </div>

      <div className="nav-center">
        <a onClick={() => handleNav("/buyer-home")}>Home</a>
        <a onClick={() => handleNav("/products")}>Products</a>
        <a onClick={() => handleNav("/categories")}>Categories</a>
        <a onClick={() => handleNav("/buyer-help")}>Help</a>
      </div>

      <div className="nav-right profile-container">
        <div className="profile-icon" onClick={() => setShowProfile(!showProfile)}>
          {buyerName[0].toUpperCase()}
        </div>
        {showProfile && (
          <div className="profile-dropdown">
            <p className="profile-name">{buyerName}</p>
            <button onClick={() => handleNav("/profile")}>View Profile</button>
            <button
              onClick={() => {
                localStorage.removeItem("buyer_user");
                if (onLogout) onLogout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* CSS */}
      <style>{`
        .buyer-navbar {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:12px 30px;
          background: #f0f7ff;
          box-shadow:0 4px 12px rgba(0,0,0,0.05);
          position:sticky;
          top:0;
          z-index:1000;
          border-radius:0 0 12px 12px;
          animation: slideDown 0.5s ease-out;
        }

        .nav-left {
          font-size:22px;
          font-weight:700;
          color:#2563eb;
          cursor:pointer;
          transition:0.3s;
        }
        .nav-left:hover { color:#1e40af; }

        .nav-center a {
          margin:0 12px;
          cursor:pointer;
          text-decoration:none;
          font-weight:500;
          color:#1e3a8a;
          padding:6px 10px;
          border-radius:6px;
          transition:0.3s;
        }
        .nav-center a:hover { background:#dbe9ff; }

        .nav-right { position:relative; }

        .profile-icon {
          width:36px;
          height:36px;
          border-radius:50%;
          background:#2563eb;
          color:white;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:bold;
          cursor:pointer;
          transition:0.3s;
        }
        .profile-icon:hover { background:#1e40af; }

        .profile-dropdown {
          position:absolute;
          right:0;
          top:45px;
          background:white;
          border-radius:12px;
          padding:10px;
          box-shadow:0 6px 20px rgba(0,0,0,0.1);
          display:flex;
          flex-direction:column;
          min-width:140px;
          animation: fadeIn 0.4s;
        }
        .profile-dropdown p { font-size:14px; font-weight:600; margin-bottom:8px; color:#1e3a8a; }
        .profile-dropdown button {
          border:none;
          background:none;
          padding:8px;
          text-align:left;
          cursor:pointer;
          border-radius:6px;
          transition:0.2s;
          color:#1e40af;
        }
        .profile-dropdown button:hover { background:#dbe9ff; }

        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
        @keyframes slideDown { from {transform:translateY(-50px); opacity:0;} to {transform:translateY(0); opacity:1;} }
      `}</style>
    </nav>
  );
}
