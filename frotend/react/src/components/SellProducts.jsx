import React, { useState, useEffect } from 'react';

export default function SellProducts(){
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(()=> {
    try { setProducts(JSON.parse(localStorage.getItem('ib_products')||'[]')); } catch {}
  },[]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if(!name || !price || (!file && editingId===null)) { alert('Fill all fields'); return; }

    let base64 = file ? await toBase64(file) : null;

    if(editingId){ // Edit product
      const updated = products.map(p => {
        if(p.id === editingId){
          return { ...p, name, price:Number(price), image: base64 || p.image };
        }
        return p;
      });
      setProducts(updated);
      localStorage.setItem('ib_products', JSON.stringify(updated));
      setEditingId(null);
    } else { // Add new product
      const p = { id: Date.now(), name, price: Number(price), image: base64, seller: JSON.parse(localStorage.getItem('ib_user')||'{}') };
      const next = [p, ...products];
      setProducts(next);
      localStorage.setItem('ib_products', JSON.stringify(next));
    }

    setName(''); setPrice(''); setFile(null);
  };

  const toBase64 = f => new Promise((res, rej) => {
    const reader = new FileReader(); 
    reader.onload = ()=> res(reader.result); 
    reader.onerror = rej; 
    reader.readAsDataURL(f);
  });

  const handleDelete = (id) => {
    if(!window.confirm("Are you sure to delete this product?")) return;
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('ib_products', JSON.stringify(updated));
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(p.price);
    setFile(null);
  };

  return (
    <div style={{ paddingTop:84, minHeight:'calc(100vh - 84px)', background:'#fbfffb', fontFamily:'Arial, sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:20 }}>
        <h2>Sell Products</h2>
        <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
          <form onSubmit={handleAdd} style={{ background:'#fff', padding:18, borderRadius:10, boxShadow:'0 6px 18px rgba(0,0,0,0.06)', width:360 }}>
            <label style={{fontSize:13, color:'#333'}}>Product Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} style={inputStyle} />
            <label style={{fontSize:13, color:'#333'}}>Price (₹ / kg)</label>
            <input value={price} onChange={e=>setPrice(e.target.value)} style={inputStyle} type="number" />
            <label style={{fontSize:13, color:'#333'}}>Image</label>
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} style={{marginBottom:12}} />
            <button style={{ padding:'10px 14px', background:'#0b7a3f', color:'#fff', border:'none', borderRadius:10, cursor:'pointer' }}>
              {editingId ? "Update Product" : "Submit Product"}
            </button>
          </form>

          <div style={{ flex:1 }}>
            <h3>Your Products</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
              {products.map(p=>(
                <div key={p.id} style={{ background:'#fff', padding:10, borderRadius:8, boxShadow:'0 6px 18px rgba(0,0,0,0.04)', position:'relative' }}>
                  <img src={p.image} alt={p.name} style={{ width:'100%', height:140, objectFit:'cover', borderRadius:6 }} />
                  <div style={{ marginTop:8 }}>
                    <div style={{ fontWeight:700 }}>{p.name}</div>
                    <div style={{ color:'#666' }}>₹{p.price} / kg</div>
                  </div>
                  <div style={{ marginTop:8, display:'flex', justifyContent:'space-between' }}>
                    <button onClick={()=>handleEdit(p)} style={{ padding:'4px 8px', background:'#0288d1', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12 }}>Edit</button>
                    <button onClick={()=>handleDelete(p.id)} style={{ padding:'4px 8px', background:'#d32f2f', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:12 }}>Delete</button>
                  </div>
                </div>
              ))}
              {products.length===0 && <div style={{ color:'#666' }}>No products yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width:'100%', padding:'10px 12px', marginBottom:12, borderRadius:8, border:'1px solid #ddd' };
