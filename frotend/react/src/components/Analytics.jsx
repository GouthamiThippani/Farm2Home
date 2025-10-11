import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";

ChartJS.register(LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Analytics({ farmerName = "Farmer" }) {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    try {
      setSales(JSON.parse(localStorage.getItem('ib_sales') || '[]'));
    } catch {
      setSales([]);
    }
  }, []);

  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const salesData = sales.length === 0 ? [5,8,6,12,9,15,10,14,7,11,13,8] : labels.map(m => sales.filter(s => new Date(s.date).toLocaleString('default', { month: 'short' }) === m).length);
  const totalProducts = sales.length;

  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Products Sold",
        data: salesData,
        fill: true,
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: salesData.map(v => v * 120),
        backgroundColor: "#3b82f6",
        borderRadius: 8,
      }
    ]
  };

  const doughnutData = {
    labels: ["Sold", "Unsold"],
    datasets: [
      {
        label: "Stock",
        data: [totalProducts, 50 - totalProducts],
        backgroundColor: ["#facc15", "#1e293b"],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="analytics-page">
      {/* Particle background */}
      <div className="particles"></div>

      {/* Title */}
      <h1 className="page-title">Farm Analytics Dashboard</h1>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="card total-sales">
          <h3>Total Products Sold</h3>
          <p>{totalProducts}</p>
        </div>
        <div className="card revenue">
          <h3>Estimated Revenue</h3>
          <p>₹{totalProducts * 120}</p>
        </div>
        <div className="card stock">
          <h3>Stock Left</h3>
          <p>{50 - totalProducts}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Monthly Products Sold</h3>
          <Line data={lineChartData} />
        </div>
        <div className="chart-card">
          <h3>Monthly Revenue (₹)</h3>
          <Bar data={barChartData} />
        </div>
        <div className="chart-card doughnut-card">
          <h3>Stock Distribution</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; font-family:'Poppins', sans-serif; }
        .analytics-page {
          position:relative; min-height:100vh; background:linear-gradient(135deg, #0f172a, #1e293b); color:white; display:flex; flex-direction:column; align-items:center; padding:40px 20px; overflow:hidden;
        }

        .page-title {
          font-size:36px; font-weight:700; margin-bottom:40px; text-shadow:0 4px 20px rgba(0,0,0,0.5); animation: fadeInDown 1.2s;
        }

        @keyframes fadeInDown { from {opacity:0; transform:translateY(-30px);} to {opacity:1; transform:translateY(0);} }

        /* Particles animation */
        .particles {
          position:absolute; width:200%; height:200%; top:-50%; left:-50%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 2px, transparent 2px);
          background-size:40px 40px;
          animation: moveParticles 15s linear infinite;
          z-index:0;
        }
        @keyframes moveParticles { from {background-position:0 0;} to {background-position:200px 200px;} }

        /* Info cards */
        .info-cards { display:flex; flex-wrap:wrap; gap:25px; justify-content:center; z-index:1; }
        .card {
          background:rgba(15,23,42,0.8); padding:25px; border-radius:20px; width:220px; text-align:center;
          backdrop-filter:blur(15px); box-shadow:0 8px 35px rgba(0,0,0,0.3);
          transition: transform 0.4s, box-shadow 0.4s, background 0.4s;
        }
        .card:hover {
          transform:translateY(-8px) scale(1.07);
          box-shadow:0 15px 45px rgba(0,0,0,0.5);
          background: rgba(34,40,62,0.9);
        }
        .card h3 { font-size:18px; margin-bottom:10px; color:#60a5fa; text-transform:uppercase; letter-spacing:1px; }
        .card p { font-size:24px; font-weight:700; color:#22d3ee; animation: pulse 2s infinite; }

        @keyframes pulse { 0%,100% {transform:scale(1);} 50% {transform:scale(1.05);} }

        /* Charts section */
        .charts-section { display:flex; flex-wrap:wrap; gap:30px; justify-content:center; margin-top:50px; z-index:1; }
        .chart-card {
          background:rgba(15,23,42,0.8); padding:25px; border-radius:20px; width:380px;
          backdrop-filter:blur(15px); box-shadow:0 10px 35px rgba(0,0,0,0.35);
          transition: transform 0.4s, box-shadow 0.4s, background 0.4s;
        }
        .chart-card:hover { transform:translateY(-8px) scale(1.02); box-shadow:0 15px 45px rgba(0,0,0,0.5); background:rgba(34,40,62,0.9); }
        .chart-card h3 { text-align:center; margin-bottom:15px; color:#60a5fa; }

        /* Doughnut chart card */
        .doughnut-card { display:flex; flex-direction:column; align-items:center; }

      `}</style>
    </div>
  );
}
