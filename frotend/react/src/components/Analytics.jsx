import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";

ChartJS.register(LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user email from localStorage
  const getUserEmail = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("ib_user"));
      return userData?.email;
    } catch (error) {
      console.error("Error getting user email:", error);
      return null;
    }
  };

  const fetchAnalyticsData = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/analytics/farmer/${email}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error("Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userEmail = getUserEmail();
    if (userEmail) {
      fetchAnalyticsData(userEmail);
    } else {
      setLoading(false);
    }
  }, []);

  // Prepare chart data from API response
  const lineChartData = {
    labels: analyticsData?.monthly_sales?.labels || ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [
      {
        label: "Products Sold",
        data: analyticsData?.monthly_sales?.quantities || [0,0,0,0,0,0],
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
    labels: analyticsData?.monthly_sales?.labels || ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [
      {
        label: "Monthly Revenue (₹)",
        data: analyticsData?.monthly_sales?.revenues || [0,0,0,0,0,0],
        backgroundColor: "#3b82f6",
        borderRadius: 8,
      }
    ]
  };

  const doughnutData = {
    labels: ["Sold", "In Stock"],
    datasets: [
      {
        label: "Stock Distribution",
        data: [
          analyticsData?.total_quantity_sold || 0,
          analyticsData?.current_stock || 0
        ],
        backgroundColor: ["#facc15", "#1e293b"],
        borderWidth: 2
      }
    ]
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading analytics...</h2>
        <p>Please wait while we fetch your data</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="error">
        <h2>No analytics data available</h2>
        <p>Unable to load your analytics data. Please try again later.</p>
      </div>
    );
  }

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
          <p>{analyticsData.total_sales || 0}</p>
        </div>
        <div className="card revenue">
          <h3>Total Revenue</h3>
          <p>₹{analyticsData.total_revenue || 0}</p>
        </div>
        <div className="card stock">
          <h3>Current Stock</h3>
          <p>{analyticsData.current_stock || 0} kg</p>
        </div>
        <div className="card products">
          <h3>Products Listed</h3>
          <p>{analyticsData.total_products_listed || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Monthly Products Sold</h3>
          <Line data={lineChartData} options={{ responsive: true }} />
        </div>
        <div className="chart-card">
          <h3>Monthly Revenue (₹)</h3>
          <Bar data={barChartData} options={{ responsive: true }} />
        </div>
        <div className="chart-card doughnut-card">
          <h3>Stock Distribution</h3>
          <Doughnut data={doughnutData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Product Performance Table */}
      {analyticsData.product_performance && analyticsData.product_performance.length > 0 && (
        <div className="table-section">
          <h3>Product Performance</h3>
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.product_performance.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.quantity} kg</td>
                    <td>₹{product.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

        /* Table section */
        .table-section {
          background:rgba(15,23,42,0.8); padding:25px; border-radius:20px; margin-top:50px; width:90%; max-width:800px;
          backdrop-filter:blur(15px); box-shadow:0 10px 35px rgba(0,0,0,0.35); z-index:1;
        }
        .table-section h3 { text-align:center; margin-bottom:20px; color:#60a5fa; font-size:24px; }
        .performance-table { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; }
        th, td { padding:12px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.1); }
        th { background:rgba(30,41,59,0.8); color:#60a5fa; font-weight:600; }
        tr:hover { background:rgba(30,41,59,0.5); }

        /* Loading and error states */
        .loading, .error {
          text-align:center; padding:100px; font-size:1.2rem; color:white;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          min-height:60vh;
        }
        .loading { color:#22d3ee; }
        .error { color:#f87171; }
      `}</style>
    </div>
  );
}