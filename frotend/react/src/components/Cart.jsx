import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Cart({ buyerName = "Buyer", onLogout }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("ib_cart") || "[]"));
  const [billGenerated, setBillGenerated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Consolidate cart: group by product id
  const consolidatedCart = cart.reduce((acc, item) => {
    const existing = acc.find((p) => p.id === item.id);
    if (existing) {
      existing.quantity += 1;
      existing.totalPrice += item.price;
    } else {
      acc.push({ ...item, quantity: 1, totalPrice: item.price });
    }
    return acc;
  }, []);

  const removeFromCart = (id) => {
    const nextCart = cart.filter((p) => p.id !== id);
    setCart(nextCart);
    localStorage.setItem("ib_cart", JSON.stringify(nextCart));
  };

  const generateBill = () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setBillGenerated(true);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();

    doc.setFontSize(20);
    doc.text("Farm2Home", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Time: ${timeStr}`, 10, 10);
    doc.text(`Date: ${dateStr}`, pageWidth - 10, 10, { align: "right" });

    const tableColumn = ["Product", "Qty (kg)", "Price (₹)"];
    const tableRows = consolidatedCart.map((p) => [p.name, p.quantity, p.totalPrice.toString()]);
    const total = consolidatedCart.reduce((acc, p) => acc + p.totalPrice, 0);
    tableRows.push(["Total", "", total.toString()]);

    autoTable(doc, { startY: 40, head: [tableColumn], body: tableRows, theme: "grid" });
    doc.save("Farm2Home_Bill.pdf");
  };

  const total = consolidatedCart.reduce((acc, p) => acc + p.totalPrice, 0);

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", background: "#dbe9ff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav className="navbar" style={{ display: "flex", justifyContent: "space-between", padding: "10px 40px", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 1000 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2563eb" }}>Farm2Home 🛒</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a onClick={() => navigate("/buyer-home")} style={{ cursor: "pointer", color: "#2563eb", padding: "6px 10px" }}>Home</a>
          <a onClick={() => navigate("/products")} style={{ cursor: "pointer", color: "#2563eb", padding: "6px 10px" }}>Products</a>
          <a onClick={() => navigate("/cart")} style={{ cursor: "pointer", color: "#2563eb", padding: "6px 10px" }}>Cart</a>
          <a onClick={() => navigate("/help")} style={{ cursor: "pointer", color: "#2563eb", padding: "6px 10px" }}>Help</a>

          <div className="profile-container" style={{ position: "relative" }}>
            <div
              onClick={() => setShowProfile(!showProfile)}
              style={{ width: 40, height: 40, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, cursor: "pointer" }}
            >
              {buyerName[0].toUpperCase()}
            </div>
            {showProfile && (
              <div style={{ position: "absolute", top: 50, right: 0, background: "white", borderRadius: 10, padding: 8, display: "flex", flexDirection: "column", gap: 6, boxShadow: "0 8px 20px rgba(0,0,0,0.15)", zIndex: 100 }}>
                <button onClick={() => navigate("/buyer-profile")} style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 600, color: "#2563eb" }}>View Profile</button>
                <button onClick={() => { onLogout && onLogout(); navigate("/"); }} style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 600, color: "#ef4444" }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Cart */}
      <main style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
        <h2>Your Cart</h2>
        {consolidatedCart.length === 0 ? (
          <div>Your cart is empty</div>
        ) : (
          <>
            {consolidatedCart.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", marginBottom: 12, background: "#e0f7fa", padding: 10, borderRadius: 8 }}>
                <img src={p.image} alt={p.name} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, marginRight: 10 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div>₹{p.price} x {p.quantity} kg = ₹{p.totalPrice}</div>
                </div>
                <button onClick={() => removeFromCart(p.id)} style={{ padding: "6px 10px", border: "none", borderRadius: 6, background: "#e53935", color: "#fff", cursor: "pointer" }}>Remove</button>
              </div>
            ))}
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>Total: ₹{total}</div>
            <button onClick={generateBill} style={{ marginTop: 10, padding: "10px 16px", border: "none", borderRadius: 8, background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>Generate Bill</button>
          </>
        )}

        {billGenerated && (
          <div style={{ marginTop: 20, padding: 15, background: "#e0f7fa", borderRadius: 8 }}>
            <h3>Bill</h3>
            {consolidatedCart.map((p, idx) => (
              <div key={p.id}>{idx + 1}. {p.name} - {p.quantity} kg - ₹{p.totalPrice}</div>
            ))}
            <div style={{ fontWeight: 700, marginTop: 10 }}>Total: ₹{total}</div>
            <button onClick={downloadPDF} style={{ marginTop: 10, padding: "8px 12px", border: "none", borderRadius: 8, background: "#1976d2", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>Download PDF</button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)", color: "white", padding: "40px 20px 25px", textAlign: "center", borderRadius: "12px 12px 0 0", marginTop: "auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", marginBottom: 20 }}>
          <div style={{ maxWidth: 300, margin: 20, textAlign: "left" }}>
            <h3>Farm2Home</h3>
            <p>Helping buyers shop easily and securely from trusted farmers.</p>
          </div>
          <div style={{ maxWidth: 300, margin: 20, textAlign: "left" }}>
            <h3>Contact</h3>
            <p>Email: support@farm2home.com</p>
            <p>Phone: +91 789xx xxxxx</p>
            <p>Address: Hyderabad, India</p>
          </div>
          <div style={{ maxWidth: 300, margin: 20, textAlign: "left" }}>
            <h3>Follow Us</h3>
            <p>Facebook | Twitter | Instagram</p>
          </div>
        </div>
        <p style={{ fontSize: 12, opacity: 0.8 }}>© 2025 Farm2Home — All rights reserved.</p>
      </footer>
    </div>
  );
}
