import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Analytics(){
  const [sales, setSales] = useState([]);

  useEffect(()=> {
    try { setSales(JSON.parse(localStorage.getItem('ib_sales')||'[]')); } catch { setSales([]); }
  },[]);

  // Aggregate sales by month (demo)
  const labels = [];
  const dataPoints = [];
  if (sales.length === 0) {
    // sample data
    labels.push('Jan','Feb','Mar','Apr','May','Jun');
    dataPoints.push(5,8,6,12,9,15);
  } else {
    // simple daily counts
    const counts = {};
    sales.forEach(s => {
      const d = new Date(s.date).toLocaleDateString();
      counts[d] = (counts[d] || 0) + 1;
    });
    Object.keys(counts).slice(-12).forEach(k => { labels.push(k); dataPoints.push(counts[k]); });
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Products Sold',
        data: dataPoints,
        fill: true,
        borderColor: '#0b7a3f',
        backgroundColor: 'rgba(11,122,63,0.15)',
        tension: 0.25
      }
    ]
  };

  return (
    <div style={{ paddingTop:84, minHeight:'calc(100vh - 84px)', background:'#f7fff7', fontFamily:'Arial, sans-serif' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:20 }}>
        <h2>Analytics</h2>
        <div style={{ background:'#fff', padding:18, borderRadius:10, boxShadow:'0 6px 18px rgba(0,0,0,0.04)' }}>
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
}
