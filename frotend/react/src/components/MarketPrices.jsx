import React, { useEffect, useState } from 'react';

export default function MarketPrices(){
  // Demo: fetch from local store if present else sample
  const [prices, setPrices] = useState([]);

  useEffect(()=> {
    // if there's an API, replace this axios get
    const sample = [
      { name:'Wheat', price: 25 },
      { name:'Rice', price: 40 },
      { name:'Corn', price: 30 }
    ];
    setPrices(sample);
  },[]);

  return (
    <div style={{ paddingTop:84, minHeight:'calc(100vh - 84px)', background:'#f7fff7', fontFamily:'Arial, sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:20 }}>
        <h2>Market Prices</h2>
        <div style={{ background:'#fff', padding:14, borderRadius:8, boxShadow:'0 6px 18px rgba(0,0,0,0.04)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:15 }}>
            <thead style={{ background:'#0b7a3f', color:'#fff' }}>
              <tr><th style={{ textAlign:'left', padding:10 }}>Crop</th><th style={{ textAlign:'left', padding:10 }}>Price (₹/kg)</th></tr>
            </thead>
            <tbody>
              {prices.map((c,i)=>(
                <tr key={i} style={{ borderBottom:'1px solid #eee' }}>
                  <td style={{ padding:10 }}>{c.name}</td>
                  <td style={{ padding:10 }}>₹{c.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
