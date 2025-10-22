import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import Products from "./components/Products";
import Favorites from "./components/Favorites";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BuyerNavbar from "./components/BuyerNavbar";
import BuyerHelp from "./components/BuyerHelp";
import BuyerDashboard from "./components/BuyerDashboard";
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
      {/* Render Navbar only if user is logged in */}
      {user && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        {/* Login Page */}
        {!user && <Route path="/" element={<Login onLogin={handleLogin} />} />}
        {!user && <Route path="*" element={<Navigate to="/" />} />}

        {/* Farmer Routes */}
        {user?.role === "farmer" && (
          <>
            <Route path="/farmer-home" element={<FarmerHome farmerName={user.name} farmerEmail={user.email} />} />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/sell-products" element={<SellProducts />} />
            <Route path="/profile" element={<FarmerProfile user={user} onLogout={handleLogout} />} /> {/* ✅ FIXED */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/farmer-home" />} />
          </>
        )}

        {/* Buyer Routes */}
        {user?.role === "buyer" && (
          <>
            <Route path="/buyer-home" element={<BuyerHome buyerName={user.name} buyerEmail={user.email} />} />
            <Route path="/products" element={<Products />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/buyer-profile" element={<BuyerProfile />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/buyer-home" />} />
            <Route path="/buyer-help" element={<BuyerHelp />} />
            <Route path="/buyer-navbar" element={<BuyerNavbar buyerName={user.name} onLogout={handleLogout} />} />
          </>
        )}
      </Routes>

      {/* Footer */}
      {user && <Footer />}
    </Router>
  );
}

export default App;