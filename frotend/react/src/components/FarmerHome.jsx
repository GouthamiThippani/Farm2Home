import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FarmerHome = ({ farmerName = "Farmer", farmerEmail = "farmer@example.com", onLogout }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleNav = (path) => navigate(path);

  const btnStyle = {
    background: "linear-gradient(90deg, #4caf50, #81c784)",
    border: "none",
    color: "white",
    padding: "12px 20px",
    borderRadius: "25px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    transition: "0.3s",
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #a8edea, #fed6e3)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "white",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          fontSize: "28px",
          fontWeight: "bold",
          color: "#2e7d32",
        }}
      >
        Farm2Home 🌾

        {/* Profile Icon */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowProfile(!showProfile)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#4caf50",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {farmerName[0].toUpperCase()}
          </div>

          {showProfile && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                padding: "15px",
                width: "220px",
                zIndex: 10,
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{farmerName}</p>
              <p style={{ fontSize: "14px", color: "#555", marginBottom: "10px" }}>{farmerEmail}</p>
              <button
                onClick={() => handleNav("/profile")}
                style={{
                  ...btnStyle,
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  borderRadius: "12px",
                  marginBottom: "5px",
                }}
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  onLogout();
                  navigate("/");
                }}
                style={{
                  ...btnStyle,
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  borderRadius: "12px",
                  marginTop: "5px",
                  background: "#e53935",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Welcome Section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#2e7d32",
            marginBottom: "15px",
          }}
        >
          Welcome, <span style={{ color: "#388e3c" }}>{farmerName}</span> 👋
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#333",
            maxWidth: "600px",
            marginBottom: "40px",
          }}
        >
          Empower your farming journey with smart market access, fair pricing, and real-time analytics. 🌱
        </p>

        {/* Navigation Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          {[
            { name: "Market Prices", path: "/market-prices" },
            { name: "Sell Products", path: "/sell-products" },
            { name: "Analytics", path: "/analytics" },
            { name: "Payments", path: "/payments" },
            { name: "Help", path: "/help" },
          ].map((btn) => (
            <button key={btn.name} onClick={() => handleNav(btn.path)} style={btnStyle}>
              {btn.name}
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "white",
          width: "100%",
          textAlign: "center",
          padding: "10px 0",
          boxShadow: "0 -4px 8px rgba(0,0,0,0.1)",
          fontSize: "14px",
          color: "#555",
        }}
      >
        © 2025 Invisible Bridge. Empowering Farmers 🌾
      </footer>
    </div>
  );
};

export default FarmerHome;
