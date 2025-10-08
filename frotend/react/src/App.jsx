import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import FarmerHome from "./components/FarmerHome";
import BuyerHome from "./components/BuyerHome";
import MarketPrices from "./components/MarketPrices";
import SellProducts from "./components/SellProducts";
import FarmerProfile from "./components/FarmerProfile";
import Analytics from "./components/Analytics";
import Help from "./components/Help";
import BuyerProfile from "./components/BuyerProfile";
import Cart from "./components/Cart";
import Products from "./components/Products"; // <-- Add this

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("ib_user") || "null");
    setUser(loggedUser);
  }, []);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    localStorage.setItem("ib_user", JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem("ib_user");
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route path="/" element={<Login onLogin={handleLogin} />} />

        {/* Farmer Routes */}
        {user?.role === "farmer" && (
          <>
            <Route
              path="/farmer-home"
              element={<FarmerHome farmerName={user.name} farmerEmail={user.email} onLogout={handleLogout} />}
            />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/sell-products" element={<SellProducts />} />
            <Route path="/profile" element={<FarmerProfile />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/help" element={<Help />} />
          </>
        )}

        {/* Buyer Routes */}
        {user?.role === "buyer" && (
          <>
            <Route
              path="/buyer-home"
              element={<BuyerHome buyerName={user.name} buyerEmail={user.email} onLogout={handleLogout} />}
            />
            <Route path="/products" element={<Products />} /> {/* <-- Added */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/buyer-profile" element={<BuyerProfile />} />
            <Route path="/help" element={<Help />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
