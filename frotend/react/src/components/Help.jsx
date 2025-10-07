import React from 'react';

export default function Help(){
  return (
    <div style={{ paddingTop:84, minHeight:'calc(100vh - 84px)', background:'#fffaf3', fontFamily:'Arial, sans-serif' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:24 }}>
        <h2>Help & Contact</h2>
        <div style={{ background:'#fff', padding:18, borderRadius:10, boxShadow:'0 6px 18px rgba(0,0,0,0.04)' }}>
          <p>If you face any issues, contact:</p>
          <p><strong>Support:</strong> +91 98765 43210</p>
          <p><strong>Email:</strong> support@invisible-bridge.example</p>
          <p style={{marginTop:12}}>Local-language assistance available — add chatbot integration later.</p>
        </div>
      </div>
    </div>
  );
}
