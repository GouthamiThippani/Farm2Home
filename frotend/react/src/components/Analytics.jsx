import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import axios from "axios";

ChartJS.register(LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const API_BASE_URL = 'http://localhost:5000';

export default function Analytics({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/analytics/farmer/${user.email}`);
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Fallback to empty data if API fails
        setAnalytics({
          total_sales: 0,
          total_revenue: 0,
          monthly_sales: {
            labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            data: [0,0,0,0,0,0,0,0,0,0,0,0]
          },
          product_performance: {},
          recent_orders: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="particles"></div>
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h2>Loading your analytics...</h2>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-page">
        <div className="particles"></div>
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h2>No analytics data available</h2>
        </div>
      </div>
    );
  }

  const { total_sales, total_revenue, monthly_sales, product_performance } = analytics;

  // Prepare chart data
  const lineChartData = {
    labels: monthly_sales.labels,
    datasets: [
      {
        label: "Products Sold",
        data: monthly_sales.data,
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
    labels: monthly_sales.labels,
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: monthly_sales.data.map(v => v * 120), // Assuming average price of ₹120
        backgroundColor: "#3b82f6",
        borderRadius: 8,
      }
    ]
  };

  const doughnutData = {
    labels: Object.keys(product_performance),
    datasets: [
      {
        label: "Products Sold",
        data: Object.values(product_performance),
        backgroundColor: ["#facc15", "#3b82f6", "#22d3ee", "#10b981", "#f97316", "#8b5cf6"],
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
          <p>{total_sales}</p>
        </div>
        <div className="card revenue">
          <h3>Total Revenue</h3>
          <p>₹{total_revenue}</p>
        </div>
        <div className="card stock">
          <h3>Recent Orders</h3>
          <p>{analytics.recent_orders}</p>
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
          <h3>Product Performance</h3>
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