import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";

export default function SellProducts({ user, onLogout }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000/api/products";

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !quantity) {
      alert("Please fill all fields");
      return;
    }

    let imageBase64 = file ? await toBase64(file) : null;

    const payload = {
      name,
      price: Number(price),
      quantity: Number(quantity),
      image: imageBase64,
    };

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post(API_URL, payload);
      }

      setName("");
      setPrice("");
      setQuantity("");
      setFile(null);

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setPrice(product.price);
    setQuantity(product.quantity);
    setFile(null);
  };

  return (
    <>

      <div className="sell-page">
        <h2 className="title">Sell Your Products</h2>

        <form className="sell-form" onSubmit={handleSubmit}>
          <label>Product Name</label>
          <input
            type="text"
            value={name}
            placeholder="e.g., Onion"
            onChange={(e) => setName(e.target.value)}
          />

          <label>Price (₹ / kg)</label>
          <input
            type="number"
            value={price}
            min="1"
            onChange={(e) => setPrice(e.target.value)}
          />

          <label>Quantity (kg)</label>
          <input
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(e.target.value)}
          />

          <label>Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>
        </form>

        <div className="product-list">
          <h3>Your Products</h3>
          {products.length === 0 && <p>No products yet</p>}
          <div className="product-grid">
            {products.map((p) => (
              <div key={p._id} className="product-card">
                <h4 className="product-name">{p.name}</h4>
                {p.image && <img src={p.image} alt={p.name} className="product-image" />}
                <p className="price"><strong>Price/kg:</strong> ₹{p.price}</p>
                <p className="quantity">Quantity: {p.quantity} kg</p>
                <div className="actions">
                  <button className="edit" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="delete" onClick={() => handleDelete(p._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <style>{`
        .sell-page { max-width: 1000px; margin: 40px auto; font-family: 'Poppins', sans-serif; padding: 0 15px; }
        .title { text-align: center; font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 30px; }

        .sell-form { display: flex; flex-direction: column; gap: 12px; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); margin-bottom: 40px; }
        .sell-form input { padding: 10px; border-radius: 8px; border: 1px solid #ccc; transition: 0.3s; }
        .sell-form input:focus { border-color: #1e40af; box-shadow: 0 0 8px rgba(30,64,175,0.3); outline: none; }
        .sell-form button { padding: 12px; background: #1e40af; color: #fff; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; transition: transform 0.2s, box-shadow 0.2s; }
        .sell-form button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.2); }

        .product-list h3 { color: #1e40af; margin-bottom: 15px; }
        .product-grid { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
        .product-card {
          width: 220px;
          background: #f5faff;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          transition: transform 0.2s;
        }
        .product-card:hover { transform: translateY(-5px); }
        .product-name { font-weight: 700; text-align: center; margin-bottom: 10px; color: #1e3a8a; }
        .product-image { width: 150px; height: 150px; object-fit: cover; border-radius: 10px; margin-bottom: 10px; }
        .price, .quantity { margin: 4px 0; }
        .actions { display: flex; gap: 10px; margin-top: 10px; }
        .edit { background: #0288d1; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
        .edit:hover { background: #0277bd; }
        .delete { background: #d32f2f; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
        .delete:hover { background: #b71c1c; }
      `}</style>
    </>
  );
}
