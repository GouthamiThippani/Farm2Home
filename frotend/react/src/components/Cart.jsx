import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Cart({ buyerName = "Buyer", onLogout }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("ib_cart") || "[]"));
  const [showProfile, setShowProfile] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const consolidatedCart = useMemo(() => {
    return cart.reduce((acc, item) => {
      const existing = acc.find(p => p._id === item._id);
      if (existing) {
        existing.qty += item.qty || 1;
        existing.totalPrice += item.price;
      } else {
        acc.push({ ...item, qty: item.qty || 1, totalPrice: item.price });
      }
      return acc;
    }, []);
  }, [cart]);

  const total = consolidatedCart.reduce((acc, p) => acc + p.totalPrice, 0);

  const removeFromCart = (id) => {
    const nextCart = cart.filter(p => p._id !== id);
    setCart(nextCart);
    localStorage.setItem("ib_cart", JSON.stringify(nextCart));
  };

  const generateBill = () => {
    if (!cart.length) return alert("Cart is empty!");
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
    const tableRows = consolidatedCart.map(p => [p.name, p.qty, p.totalPrice.toString()]);
    tableRows.push(["Total", "", total.toString()]);

    autoTable(doc, { startY: 40, head: [tableColumn], body: tableRows, theme: "grid" });
    doc.save("Farm2Home_Bill.pdf");
  };

  return (
    <div className="cart-page">
     
      {/* Cart Content */}
      <main className="cart-main">
        <h2>Your Cart</h2>
        {consolidatedCart.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          <>
            <div className="cart-items">
              {consolidatedCart.map((p, idx) => (
                <div key={p._id} className="cart-item">
                  <img src={p.image} alt={p.name} />
                  <div className="item-info">
                    <div className="item-name">{p.name}</div>
                    <div>₹{p.price} x {p.qty} kg = ₹{p.totalPrice}</div>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(p._id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="cart-total">Total: ₹{total}</div>
            <button className="generate-bill-btn" onClick={generateBill}>Generate Bill</button>
          </>
        )}

        {billGenerated && (
          <div className="bill-section">
            <h3>Bill</h3>
            {consolidatedCart.map((p, idx) => (
              <div key={p._id}>{idx + 1}. {p.name} - {p.qty} kg - ₹{p.totalPrice}</div>
            ))}
            <div className="cart-total">Total: ₹{total}</div>
            <button className="download-btn" onClick={downloadPDF}>Download PDF</button>
          </div>
        )}
      </main>

      {/* Styles */}
      <style>{`
        /* General */
        .cart-page { font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #f0f4ff, #dbe9ff); min-height: 100vh; display: flex; flex-direction: column; }

      
        /* Cart Main */
        .cart-main { max-width: 900px; margin: 20px auto; padding: 20px; }
        .cart-main h2 { text-align: center; font-size: 28px; margin-bottom: 20px; color: #1e3a8a; }

        /* Cart Items */
        .cart-items { display: flex; flex-direction: column; gap: 16px; margin-top: 10px; }
        .cart-item { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 16px; background: linear-gradient(135deg, #ffffff, #e0f7fa); transition: all 0.3s ease; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
        .cart-item:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
        .cart-item img { width: 100px; height: 100px; object-fit: cover; border-radius: 12px; }
        .item-info { flex: 1; }
        .item-name { font-weight: 700; margin-bottom: 6px; color: #1e40af; font-size: 18px; }

        /* Buttons */
        .remove-btn { padding: 8px 14px; background: #ef4444; border: none; color: white; border-radius: 12px; cursor: pointer; font-weight: 600; transition: all 0.3s; }
        .remove-btn:hover { background: #c62828; transform: scale(1.1); }

        .cart-total { font-weight: 700; font-size: 20px; margin-top: 14px; color: #1e40af; text-align: right; }
        .generate-bill-btn, .download-btn { margin-top: 14px; padding: 12px 18px; border: none; border-radius: 14px; background: linear-gradient(135deg, #2563eb, #60a5fa); color: white; cursor: pointer; font-weight: 600; font-size: 16px; transition: all 0.3s; }
        .generate-bill-btn:hover, .download-btn:hover { background: linear-gradient(135deg, #1e40af, #3b82f6); transform: scale(1.05); }

        /* Bill Section */
        .bill-section { margin-top: 24px; padding: 20px; background: linear-gradient(135deg, #e0f7fa, #dbe9ff); border-radius: 16px; animation: fadeIn 0.5s ease-in-out; }

        .empty-cart { margin-top: 20px; font-weight: 500; color: #1e40af; text-align: center; font-size: 18px; }

        /* Animations */
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(-8px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
