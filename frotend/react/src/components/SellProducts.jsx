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
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeImage = () => {
    setFile(null);
    setImagePreview(null);
  };

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
      farmer_email: "rat@gmail.com", // Add farmer email
      farmer_name: "ratna" // Add farmer name
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
      setImagePreview(null);

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
    setImagePreview(product.image || null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setQuantity("");
    setFile(null);
    setImagePreview(null);
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
            placeholder="e.g., 50"
            onChange={(e) => setPrice(e.target.value)}
          />

          <label>Quantity (kg)</label>
          <input
            type="number"
            value={quantity}
            min="1"
            placeholder="e.g., 100"
            onChange={(e) => setQuantity(e.target.value)}
          />

          <label>Product Image</label>
          <div className="file-input-container">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              id="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              {file ? file.name : "Choose File"}
            </label>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" className="preview-image" />
              <button type="button" onClick={removeImage} className="remove-image-btn">
                Remove Image
              </button>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="cancel-btn">
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="product-list">
          <h3>Your Products ({products.length})</h3>
          {products.length === 0 && <p>No products yet. Add your first product!</p>}
          <div className="product-grid">
            {products.map((p) => (
              <div key={p._id} className="product-card">
                <h4 className="product-name">{p.name}</h4>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="product-image" />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <p className="price"><strong>Price/kg:</strong> ₹{p.price}</p>
                <p className="quantity">Quantity: {p.quantity} kg</p>
                <p className="farmer">By: {p.farmer_name || "You"}</p>
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
        .sell-page { 
          max-width: 1000px; 
          margin: 40px auto; 
          font-family: 'Poppins', sans-serif; 
          padding: 0 15px; 
        }
        
        .title { 
          text-align: center; 
          font-size: 32px; 
          font-weight: 700; 
          color: #1e40af; 
          margin-bottom: 30px; 
        }

        .sell-form { 
          display: flex; 
          flex-direction: column; 
          gap: 12px; 
          padding: 20px; 
          background: #fff; 
          border-radius: 12px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.08); 
          margin-bottom: 40px; 
        }
        
        .sell-form label { 
          font-weight: 600; 
          color: #333;
          margin-bottom: -8px;
        }
        
        .sell-form input { 
          padding: 10px; 
          border-radius: 8px; 
          border: 1px solid #ccc; 
          transition: 0.3s; 
          font-size: 16px;
        }
        
        .sell-form input:focus { 
          border-color: #1e40af; 
          box-shadow: 0 0 8px rgba(30,64,175,0.3); 
          outline: none; 
        }

        /* File Input Styling */
        .file-input-container {
          position: relative;
          margin-bottom: 10px;
        }

        .file-input {
          position: absolute;
          left: -9999px;
          opacity: 0;
        }

        .file-input-label {
          display: inline-block;
          padding: 10px 20px;
          background: #fff;
          border: 2px dashed #ccc;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s ease;
          width: 100%;
          box-sizing: border-box;
          color: #666;
          font-weight: normal;
        }

        .file-input-label:hover {
          border-color: #1e40af;
          background: #f8f9fa;
        }

        .image-preview {
          text-align: center;
          margin-top: 10px;
        }

        .preview-image {
          max-width: 200px;
          max-height: 150px;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
          margin-bottom: 10px;
        }

        .remove-image-btn {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .remove-image-btn:hover {
          background: #b71c1c;
          transform: translateY(-1px);
        }

        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }

        .sell-form button { 
          padding: 12px; 
          background: #1e40af; 
          color: #fff; 
          border: none; 
          border-radius: 10px; 
          cursor: pointer; 
          font-weight: 600; 
          transition: transform 0.2s, box-shadow 0.2s; 
          flex: 1;
        }
        
        .sell-form button:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 12px rgba(0,0,0,0.2); 
        }

        .sell-form button:disabled {
          background: #cccccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .cancel-btn {
          background: #6c757d !important;
        }

        .cancel-btn:hover {
          background: #545b62 !important;
        }

        .product-list h3 { 
          color: #1e40af; 
          margin-bottom: 15px; 
          font-size: 24px;
        }
        
        .product-grid { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 20px; 
          justify-content: center; 
        }
        
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
        
        .product-card:hover { 
          transform: translateY(-5px); 
        }
        
        .product-name { 
          font-weight: 700; 
          text-align: center; 
          margin-bottom: 10px; 
          color: #1e3a8a; 
          font-size: 18px;
        }
        
        .product-image { 
          width: 150px; 
          height: 150px; 
          object-fit: cover; 
          border-radius: 10px; 
          margin-bottom: 10px; 
        }

        .no-image {
          width: 150px;
          height: 150px;
          background: #f0f0f0;
          border-radius: 10px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-style: italic;
          border: 1px dashed #ccc;
        }
        
        .price, .quantity, .farmer { 
          margin: 4px 0; 
          text-align: center;
          width: 100%;
        }

        .farmer {
          color: #666;
          font-style: italic;
          font-size: 0.9rem;
        }
        
        .actions { 
          display: flex; 
          gap: 10px; 
          margin-top: 10px; 
          width: 100%;
        }
        
        .edit { 
          background: #0288d1; 
          color: white; 
          border: none; 
          padding: 8px 12px; 
          border-radius: 6px; 
          cursor: pointer; 
          flex: 1;
          transition: all 0.3s ease;
        }
        
        .edit:hover { 
          background: #0277bd; 
          transform: translateY(-1px);
        }
        
        .delete { 
          background: #d32f2f; 
          color: white; 
          border: none; 
          padding: 8px 12px; 
          border-radius: 6px; 
          cursor: pointer; 
          flex: 1;
          transition: all 0.3s ease;
        }
        
        .delete:hover { 
          background: #b71c1c; 
          transform: translateY(-1px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .product-grid {
            justify-content: center;
          }
          
          .product-card {
            width: 100%;
            max-width: 280px;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}