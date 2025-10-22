import React, { useState, useEffect } from "react";
import axios from "axios";

export default function BuyerDashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [purchaseQuantity, setPurchaseQuantity] = useState({});

  const API_URL = "http://localhost:5000/api/products";
  const ORDERS_API_URL = "http://localhost:5000/api/orders";

  // Fetch ALL products (from all farmers)
  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      alert("Failed to fetch products");
    }
  };

  // Fetch buyer's orders
  const fetchMyOrders = async () => {
    try {
      if (user && user.email) {
        const res = await axios.get(`${ORDERS_API_URL}/buyer/${user.email}`);
        setOrders(res.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    if (user && user.email) {
      fetchMyOrders();
    }
  }, [user]);

  const handlePurchase = async (productId) => {
    const quantity = purchaseQuantity[productId] || 1;
    
    if (!quantity || quantity < 1) {
      alert("Please enter a valid quantity");
      return;
    }

    try {
      const payload = {
        product_id: productId,
        buyer_email: user.email,
        buyer_name: user.name || user.email,
        quantity: parseInt(quantity)
      };

      await axios.post(ORDERS_API_URL, payload);
      alert("Order placed successfully!");
      
      // Refresh data
      fetchAllProducts();
      fetchMyOrders();
      setPurchaseQuantity({...purchaseQuantity, [productId]: ""});
    } catch (err) {
      console.error("Error placing order:", err);
      alert(err.response?.data?.error || "Failed to place order");
    }
  };

  return (
    <div className="buyer-dashboard">
      <h2>Available Products</h2>
      <p>Welcome, {user?.name || user?.email}! Browse products from all farmers.</p>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <h3>{product.name}</h3>
            {product.image && (
              <img src={product.image} alt={product.name} className="product-image" />
            )}
            <p className="price">₹{product.price}/kg</p>
            <p className="quantity">Available: {product.quantity} kg</p>
            <p className="farmer">By: {product.farmer_name}</p>
            
            {product.quantity > 0 ? (
              <div className="purchase-section">
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  placeholder="Qty"
                  value={purchaseQuantity[product._id] || ""}
                  onChange={(e) => setPurchaseQuantity({
                    ...purchaseQuantity,
                    [product._id]: e.target.value
                  })}
                  className="quantity-input"
                />
                <button 
                  onClick={() => handlePurchase(product._id)}
                  className="buy-btn"
                >
                  Buy Now
                </button>
              </div>
            ) : (
              <p className="out-of-stock">Out of Stock</p>
            )}
          </div>
        ))}
      </div>

      <div className="my-orders">
        <h3>My Orders ({orders.length})</h3>
        {orders.length === 0 ? (
          <p>No orders yet. Start shopping!</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-item">
                <h4>{order.product_name}</h4>
                <p>From: {order.farmer_name}</p>
                <p>Quantity: {order.quantity} kg</p>
                <p>Total: ₹{order.total_price}</p>
                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .buyer-dashboard {
          max-width: 1200px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: 'Poppins', sans-serif;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
          margin: 30px 0;
        }

        .product-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          text-align: center;
        }

        .product-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          margin: 10px 0;
        }

        .price {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1e40af;
          margin: 10px 0;
        }

        .farmer {
          color: #666;
          font-style: italic;
          margin: 5px 0;
        }

        .purchase-section {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .quantity-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          text-align: center;
        }

        .buy-btn {
          flex: 2;
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .buy-btn:hover {
          background: #218838;
        }

        .out-of-stock {
          color: #dc3545;
          font-weight: bold;
          margin-top: 15px;
        }

        .my-orders {
          margin-top: 40px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .orders-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .order-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }
      `}</style>
    </div>
  );
}