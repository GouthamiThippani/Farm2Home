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
import Products from "./components/Products"; // <-- renamed Products page

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
        <Route
          path="/"
          element={!user ? <Login onLogin={handleLogin} /> : 
            <Navigate to={user.role === "farmer" ? "/farmer-home" : "/buyer-home"} />}
        />

        {/* Farmer Routes */}
        <Route
          path="/farmer-home"
          element={user?.role === "farmer" ? 
            <FarmerHome farmerName={user.name} farmerEmail={user.email} onLogout={handleLogout} /> : 
            <Navigate to="/" />}
        />
        <Route
          path="/market-prices"
          element={user?.role === "farmer" ? <MarketPrices /> : <Navigate to="/" />}
        />
        <Route
          path="/sell-products"
          element={user?.role === "farmer" ? <SellProducts /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={user?.role === "farmer" ? <FarmerProfile /> : <Navigate to="/" />}
        />
        <Route
          path="/analytics"
          element={user?.role === "farmer" ? <Analytics /> : <Navigate to="/" />}
        />
        <Route
          path="/help"
          element={user ? <Help /> : <Navigate to="/" />}
        />

        {/* Buyer Routes */}
        <Route
          path="/buyer-home"
          element={user?.role === "buyer" ? 
            <BuyerHome buyerName={user.name} buyerEmail={user.email} onLogout={handleLogout} /> : 
            <Navigate to="/" />}
        />
        <Route
          path="/cart"
          element={user?.role === "buyer" ? <Cart /> : <Navigate to="/" />}
        />
        <Route
          path="/buyer-profile"
          element={user?.role === "buyer" ? <BuyerProfile /> : <Navigate to="/" />}
        />
        <Route
          path="/products"
          element={user?.role === "buyer" ? <Products /> : <Navigate to="/" />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
