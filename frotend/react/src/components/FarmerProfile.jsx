import React, { useState, useEffect } from 'react';

export default function FarmerProfile(){
  const [user, setUser] = useState({});
  useEffect(()=> {
    setUser(JSON.parse(localStorage.getItem('ib_user')||'{}'));
  },[]);
  const save = () => { localStorage.setItem('ib_user', JSON.stringify(user)); alert('Saved'); };
  return (
    <div style={{ paddingTop:84, minHeight:'calc(100vh - 84px)', fontFamily:'Arial, sans-serif', background:'#fff8f3' }}>
      <div style={{ maxWidth:700, margin:'0 auto', padding:20 }}>
        <h2>Farmer Profile</h2>
        <div style={{ background:'#fff', padding:18, borderRadius:8, boxShadow:'0 6px 18px rgba(0,0,0,0.04)' }}>
          <label style={{display:'block', marginBottom:6}}>Name</label>
          <input value={user.name||''} onChange={e=>setUser({...user, name:e.target.value})} style={{ width:'100%', padding:10, borderRadius:8, marginBottom:12 }} />
          <label style={{display:'block', marginBottom:6}}>Crops (comma separated)</label>
          <input value={user.crops || ''} onChange={e=>setUser({...user, crops: e.target.value})} placeholder="Wheat,Rice" style={{ width:'100%', padding:10, borderRadius:8, marginBottom:12 }} />
          <button onClick={save} style={{ padding:'10px 12px', background:'#0b7a3f', color:'#fff', borderRadius:8, border:'none' }}>Save Profile</button>
        </div>
      </div>
    </div>
  );
}