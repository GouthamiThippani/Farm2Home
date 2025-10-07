import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("ib_cart") || "[]"));
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      setProducts(JSON.parse(localStorage.getItem("ib_products") || "[]"));
    } catch {}
  }, []);

  const addToCart = (product) => {
    const nextCart = [...cart, product];
    setCart(nextCart);
    localStorage.setItem("ib_cart", JSON.stringify(nextCart));
    alert(`${product.name} added to cart`);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: 84, minHeight: "calc(100vh - 84px)", fontFamily: "Arial, sans-serif", background: "#fbfffb", position: "relative" }}>
      
      {/* Back Button - fixed top-left */}
      <button
        onClick={() => navigate("/buyer-home")}
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
        ← Back to Home
      </button>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
        <h2>Available Products</h2>

        {/* Search Bar */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* Products Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          {filteredProducts.length === 0 && <div style={{ color: "#666" }}>No products found</div>}
          {filteredProducts.map((p) => (
            <div key={p.id} style={{ background: "#fff", padding: 10, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", textAlign: "center" }}>
              <img
                src={p.image}
                alt={p.name}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  margin: "0 auto",
                  display: "block",
                }}
              />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ color: "#666" }}>₹{p.price} / kg</div>
                <button
                  onClick={() => addToCart(p)}
                  style={{
                    marginTop: 6,
                    padding: "6px 10px",
                    border: "none",
                    borderRadius: 8,
                    background: "#4caf50",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Go to Cart Button */}
        {filteredProducts.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={() => navigate("/cart")}
              style={{
                padding: "10px 16px",
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              Go to Cart ({cart.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}