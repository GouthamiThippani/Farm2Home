import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("ib_cart") || "[]"));
  const [billGenerated, setBillGenerated] = useState(false);

  const removeFromCart = (id) => {
    const nextCart = cart.filter((p) => p.id !== id);
    setCart(nextCart);
    localStorage.setItem("ib_cart", JSON.stringify(nextCart));
  };

  const generateBill = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    setBillGenerated(true);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString();
    const timeStr = currentDate.toLocaleTimeString();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Farm2Home", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Time: ${timeStr}`, 10, 10);
    doc.text(`Date: ${dateStr}`, pageWidth - 10, 10, { align: "right" });

    // Prepare table data
    const tableColumn = ["Product", "Price (₹)"];
    const tableRows = cart.map((p) => [p.name, p.price.toString()]);

    // Add total as last row
    const total = cart.reduce((acc, p) => acc + p.price, 0);
    tableRows.push(["Total", total.toString()]);

    // Table
    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [76, 175, 80], textColor: 255, fontStyle: "bold" },
      styles: { font: "helvetica" },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { halign: "right" },
      },
      footStyles: { fillColor: [240, 240, 240], fontStyle: "bold" }, // optional styling for total row
    });

    doc.save("Farm2Home_Bill.pdf");
  };

  const total = cart.reduce((acc, p) => acc + p.price, 0);

  return (
    <div
      style={{
        paddingTop: 84,
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#fbfffb",
        position: "relative",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/products")}
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          padding: "8px 12px",
          border: "none",
          borderRadius: 6,
          background: "#4caf50",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "bold",
          zIndex: 1000,
        }}
      >
        ← Back to Products
      </button>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h2>Your Cart</h2>

        {cart.length === 0 && <div style={{ color: "#666" }}>Your cart is empty</div>}

        {cart.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 12,
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, marginRight: 10 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ color: "#666" }}>₹{p.price} / kg</div>
            </div>
            <button
              onClick={() => removeFromCart(p.id)}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: 6,
                background: "#e53935",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}

        {cart.length > 0 && (
          <>
            <div style={{ marginTop: 20, fontWeight: 700, fontSize: 18 }}>Total: ₹{total}</div>
            <button
              onClick={generateBill}
              style={{
                marginTop: 10,
                padding: "10px 16px",
                border: "none",
                borderRadius: 8,
                background: "#4caf50",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Generate Bill
            </button>
          </>
        )}

        {billGenerated && (
          <div style={{ marginTop: 20, padding: 15, background: "#e0f7fa", borderRadius: 8 }}>
            <h3>Bill</h3>
            {cart.map((p, index) => (
              <div key={p.id}>
                {index + 1}. {p.name} - ₹{p.price}
              </div>
            ))}
            <div style={{ fontWeight: 700, marginTop: 10 }}>Total: ₹{total}</div>
            <button
              onClick={downloadPDF}
              style={{
                marginTop: 10,
                padding: "8px 12px",
                border: "none",
                borderRadius: 8,
                background: "#1976d2",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
