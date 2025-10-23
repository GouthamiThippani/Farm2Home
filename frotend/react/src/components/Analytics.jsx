import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
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
        // Fallback to empty data
        setAnalytics({
          total_sales: 0,
          total_revenue: 0,
          total_quantity_sold: 0,
          current_stock: 0,
          total_products_listed: 0,
          recent_orders_7days: 0,
          monthly_sales: { labels: [], quantities: [], revenues: [] },
          product_performance: [],
          stock_distribution: []
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
          <p>Start selling products to see your analytics!</p>
        </div>
      </div>
    );
  }

  const { 
    total_sales, 
    total_revenue, 
    total_quantity_sold, 
    current_stock,
    total_products_listed,
    recent_orders_7days,
    monthly_sales, 
    product_performance,
    stock_distribution 
  } = analytics;

  // Prepare chart data
  const salesTrendData = {
    labels: monthly_sales.labels,
    datasets: [
      {
        label: "Products Sold (kg)",
        data: monthly_sales.quantities,
        fill: true,
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const revenueData = {
    labels: monthly_sales.labels,
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: monthly_sales.revenues,
        backgroundColor: "#3b82f6",
        borderRadius: 8,
      }
    ]
  };

  const productPerformanceData = {
    labels: product_performance.map(p => p.name),
    datasets: [
      {
        label: "Revenue (₹)",
        data: product_performance.map(p => p.revenue),
        backgroundColor: [
          "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe",
          "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"
        ],
        borderWidth: 2
      }
    ]
  };

  const stockDistributionData = {
    labels: stock_distribution.map(s => s.name),
    datasets: [
      {
        label: "Current Stock (kg)",
        data: stock_distribution.map(s => s.quantity),
        backgroundColor: stock_distribution.map(s => 
          s.status === "Out of Stock" ? "#ef4444" :
          s.status === "Low Stock" ? "#f59e0b" : "#10b981"
        ),
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="analytics-page">
      {/* Particle background */}
      <div className="particles"></div>

      {/* Header */}
      <div className="analytics-header">
        <h1 className="page-title">Farm Analytics Dashboard</h1>
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="card total-sales">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Total Sales</h3>
            <p>{total_sales}</p>
            <span>Orders</span>
          </div>
        </div>
        
        <div className="card revenue">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p>₹{total_revenue}</p>
            <span>Earnings</span>
          </div>
        </div>
        
        <div className="card quantity">
          <div className="card-icon">⚖️</div>
          <div className="card-content">
            <h3>Quantity Sold</h3>
            <p>{total_quantity_sold} kg</p>
            <span>Total Weight</span>
          </div>
        </div>
        
        <div className="card stock">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Current Stock</h3>
            <p>{current_stock} kg</p>
            <span>Available</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card full-width">
          <h3>Sales Trend</h3>
          <Line data={salesTrendData} options={{ maintainAspectRatio: false }} />
        </div>
        
        <div className="chart-card">
          <h3>Monthly Revenue</h3>
          <Bar data={revenueData} />
        </div>
        
        <div className="chart-card">
          <h3>Product Performance</h3>
          <Doughnut data={productPerformanceData} />
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; font-family:'Poppins', sans-serif; }
        .analytics-page {
          position:relative; min-height:100vh; background:linear-gradient(135deg, #0f172a, #1e293b); color:white; 
          display:flex; flex-direction:column; align-items:center; padding:40px 20px; overflow:hidden;
        }

        .analytics-header {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin-bottom: 40px;
        }

        .page-title {
          font-size:36px; font-weight:700; text-shadow:0 4px 20px rgba(0,0,0,0.5); animation: fadeInDown 1.2s;
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
        .info-cards { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 20px; 
          width: 100%;
          max-width: 1200px;
          margin-bottom: 40px;
          z-index: 1;
        }

        .card {
          background: rgba(15,23,42,0.8); 
          padding: 25px; 
          border-radius: 16px; 
          display: flex;
          align-items: center;
          gap: 15px;
          backdrop-filter: blur(15px); 
          box-shadow: 0 8px 35px rgba(0,0,0,0.3);
          transition: all 0.4s;
          border: 1px solid #374151;
        }

        .card:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 15px 45px rgba(0,0,0,0.5);
          border-color: #2563eb;
        }

        .card-icon {
          font-size: 2.5rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(37, 99, 235, 0.2);
          border-radius: 12px;
        }

        .card-content h3 {
          font-size: 16px;
          color: #9ca3af;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .card-content p {
          font-size: 28px;
          font-weight: 700;
          color: #22d3ee;
          margin-bottom: 4px;
          animation: pulse 2s infinite;
        }

        .card-content span {
          font-size: 12px;
          color: #6b7280;
        }

        @keyframes pulse { 0%,100% {transform:scale(1);} 50% {transform:scale(1.05);} }

        /* Charts section */
        .charts-section { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
          gap: 25px; 
          width: 100%;
          max-width: 1200px;
          margin-bottom: 40px;
          z-index: 1;
        }

        .chart-card {
          background: rgba(15,23,42,0.8); 
          padding: 25px; 
          border-radius: 16px;
          backdrop-filter: blur(15px); 
          box-shadow: 0 10px 35px rgba(0,0,0,0.35);
          transition: all 0.4s;
          border: 1px solid #374151;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .chart-card.full-width {
          grid-column: 1 / -1;
        }

        .chart-card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 15px 45px rgba(0,0,0,0.5); 
          border-color: #2563eb;
        }

        .chart-card h3 { 
          text-align:center; 
          margin-bottom: 20px; 
          color: #60a5fa; 
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .info-cards {
            grid-template-columns: 1fr;
          }
          
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .chart-card.full-width {
            grid-column: 1;
          }
        }
      `}</style>
    </div>
  );
}