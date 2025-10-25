import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  LineElement, 
  BarElement, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Tooltip, 
  Legend 
} from "chart.js";

ChartJS.register(LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all"); // all, monthly, weekly
  const [lastUpdated, setLastUpdated] = useState(null);

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
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        console.error("Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates - refresh every 30 seconds
  useEffect(() => {
    const userEmail = getUserEmail();
    if (userEmail) {
      fetchAnalyticsData(userEmail);
      
      // Set up interval for real-time updates
      const interval = setInterval(() => {
        fetchAnalyticsData(userEmail);
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, []);

  // Prepare chart data from API response
  const salesTrendData = {
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
      },
      {
        label: "Revenue (₹)",
        data: analyticsData?.monthly_sales?.revenues || [0,0,0,0,0,0],
        fill: true,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y1',
      }
    ]
  };

  const revenueData = {
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

  const stockDistributionData = {
    labels: ["Sold This Month", "In Stock"],
    datasets: [
      {
        label: "Stock Distribution",
        data: [
          analyticsData?.total_quantity_sold || 0,
          analyticsData?.current_stock || 0
        ],
        backgroundColor: ["#f59e0b", "#1e293b"],
        borderWidth: 2
      }
    ]
  };

  const productPerformanceData = {
    labels: analyticsData?.product_performance?.map(p => p.name) || [],
    datasets: [
      {
        label: "Revenue by Product (₹)",
        data: analyticsData?.product_performance?.map(p => p.revenue) || [],
        backgroundColor: [
          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
          '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
        ],
        borderWidth: 2
      }
    ]
  };

  const stockStatusData = {
    labels: analyticsData?.stock_distribution?.map(p => p.name) || [],
    datasets: [
      {
        label: "Current Stock",
        data: analyticsData?.stock_distribution?.map(p => p.quantity) || [],
        backgroundColor: analyticsData?.stock_distribution?.map(p => 
          p.status === "Out of Stock" ? "#ef4444" : 
          p.status === "Low Stock" ? "#f59e0b" : "#10b981"
        ) || [],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#60a5fa',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case "Out of Stock": return "#ef4444";
      case "Low Stock": return "#f59e0b";
      case "Good Stock": return "#10b981";
      default: return "#6b7280";
    }
  };

  if (loading && !analyticsData) {
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

      {/* Header */}
      <div className="analytics-header">
        <h1 className="page-title">Farm Analytics Dashboard</h1>
        <div className="header-controls">
          <div className="last-updated">
            Last updated: {lastUpdated}
          </div>
          <div className="time-range-selector">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-select"
            >
              <option value="all">All Time</option>
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="info-cards">
        <div className="card total-sales">
          <div className="card-icon">📦</div>
          <h3>Total Products Sold</h3>
          <p>{analyticsData.total_sales || 0}</p>
          <span className="card-subtitle">{analyticsData.total_quantity_sold || 0} kg total</span>
        </div>
        
        <div className="card revenue">
          <div className="card-icon">💰</div>
          <h3>Total Revenue</h3>
          <p>₹{(analyticsData.total_revenue || 0).toLocaleString()}</p>
          <span className="card-subtitle">Lifetime earnings</span>
        </div>
        
        <div className="card stock">
          <div className="card-icon">📊</div>
          <h3>Current Stock</h3>
          <p>{analyticsData.current_stock || 0} kg</p>
          <span className="card-subtitle">Across all products</span>
        </div>
        
        <div className="card products">
          <div className="card-icon">🏷️</div>
          <h3>Products Listed</h3>
          <p>{analyticsData.total_products_listed || 0}</p>
          <span className="card-subtitle">Active listings</span>
        </div>

        <div className="card recent-orders">
          <div className="card-icon">🔄</div>
          <h3>Recent Orders</h3>
          <p>{analyticsData.recent_orders_7days || 0}</p>
          <span className="card-subtitle">Last 7 days</span>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="charts-section">
        <div className="chart-card full-width">
          <h3>Sales Trend & Revenue</h3>
          <Line 
            data={salesTrendData} 
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y1: {
                  beginAtZero: true,
                  position: 'right',
                  grid: {
                    drawOnChartArea: false,
                  },
                  ticks: {
                    color: '#10b981'
                  }
                }
              }
            }} 
          />
        </div>

        <div className="chart-card">
          <h3>Monthly Revenue</h3>
          <Bar data={revenueData} options={chartOptions} />
        </div>

        <div className="chart-card">
          <h3>Stock Distribution</h3>
          <Doughnut data={stockDistributionData} options={chartOptions} />
        </div>

        <div className="chart-card">
          <h3>Product Performance</h3>
          <Pie data={productPerformanceData} options={chartOptions} />
        </div>
      </div>

      {/* Product Performance Table */}
      {analyticsData.product_performance && analyticsData.product_performance.length > 0 && (
        <div className="table-section">
          <h3>Product Performance Details</h3>
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                  <th>Avg Price/kg</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.product_performance.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className="product-name">{product.name}</div>
                    </td>
                    <td>
                      <span className="quantity-badge">{product.quantity} kg</span>
                    </td>
                    <td>
                      <span className="revenue-amount">₹{product.revenue.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="price-per-kg">
                        ₹{product.quantity > 0 ? (product.revenue / product.quantity).toFixed(2) : '0.00'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Status Section */}
      {analyticsData.stock_distribution && analyticsData.stock_distribution.length > 0 && (
        <div className="table-section">
          <h3>Current Stock Status</h3>
          <div className="stock-status-grid">
            {analyticsData.stock_distribution.map((product, index) => (
              <div key={index} className="stock-item">
                <div className="stock-product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="stock-quantity">{product.quantity} kg</span>
                </div>
                <div className="stock-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStockStatusColor(product.status) }}
                  >
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; font-family:'Poppins', sans-serif; }
        .analytics-page {
          position:relative; min-height:100vh; background:linear-gradient(135deg, #0f172a, #1e293b); color:white; display:flex; flex-direction:column; align-items:center; padding:40px 20px; overflow-x:hidden;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1400px;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .page-title {
          font-size:36px; font-weight:700; text-shadow:0 4px 20px rgba(0,0,0,0.5); animation: fadeInDown 1.2s;
        }

        .header-controls {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .last-updated {
          color: #94a3b8;
          font-size: 14px;
        }

        .time-select {
          background: rgba(15,23,42,0.8);
          border: 1px solid #334155;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          backdrop-filter: blur(15px);
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

        /* Enhanced Info cards */
        .info-cards { 
          display:grid; 
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap:25px; 
          width:100%; 
          max-width:1400px;
          z-index:1; 
          margin-bottom: 40px;
        }
        .card {
          background:rgba(15,23,42,0.8); padding:25px; border-radius:20px; text-align:center;
          backdrop-filter:blur(15px); box-shadow:0 8px 35px rgba(0,0,0,0.3);
          transition: transform 0.4s, box-shadow 0.4s, background 0.4s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .card:hover {
          transform:translateY(-8px) scale(1.07);
          box-shadow:0 15px 45px rgba(0,0,0,0.5);
          background: rgba(34,40,62,0.9);
        }
        .card-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        .card h3 { 
          font-size:16px; 
          margin-bottom:8px; 
          color:#60a5fa; 
          text-transform:uppercase; 
          letter-spacing:1px; 
        }
        .card p { 
          font-size:28px; 
          font-weight:700; 
          color:#22d3ee; 
          animation: pulse 2s infinite; 
          margin-bottom: 5px;
        }
        .card-subtitle {
          font-size: 12px;
          color: #94a3b8;
        }

        @keyframes pulse { 0%,100% {transform:scale(1);} 50% {transform:scale(1.05);} }

        /* Enhanced Charts section */
        .charts-section { 
          display:grid; 
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap:30px; 
          width:100%; 
          max-width:1400px;
          margin-bottom:50px; 
          z-index:1; 
        }
        .chart-card {
          background:rgba(15,23,42,0.8); padding:25px; border-radius:20px;
          backdrop-filter:blur(15px); box-shadow:0 10px 35px rgba(0,0,0,0.35);
          transition: transform 0.4s, box-shadow 0.4s, background 0.4s;
        }
        .chart-card.full-width {
          grid-column: 1 / -1;
        }
        .chart-card:hover { 
          transform:translateY(-8px) scale(1.02); 
          box-shadow:0 15px 45px rgba(0,0,0,0.5); 
          background:rgba(34,40,62,0.9); 
        }
        .chart-card h3 { 
          text-align:center; 
          margin-bottom:20px; 
          color:#60a5fa; 
          font-size: 18px;
        }

        /* Table section */
        .table-section {
          background:rgba(15,23,42,0.8); padding:25px; border-radius:20px; margin-bottom:30px; width:100%; max-width:1400px;
          backdrop-filter:blur(15px); box-shadow:0 10px 35px rgba(0,0,0,0.35); z-index:1;
        }
        .table-section h3 { text-align:center; margin-bottom:20px; color:#60a5fa; font-size:24px; }
        .performance-table { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; }
        th, td { padding:12px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.1); }
        th { background:rgba(30,41,59,0.8); color:#60a5fa; font-weight:600; }
        tr:hover { background:rgba(30,41,59,0.5); }

        /* Stock Status Grid */
        .stock-status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .stock-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: rgba(30,41,59,0.5);
          border-radius: 10px;
          border-left: 4px solid #3b82f6;
        }

        .stock-product-info {
          display: flex;
          flex-direction: column;
        }

        .product-name {
          font-weight: 600;
          margin-bottom: 5px;
        }

        .stock-quantity {
          color: #94a3b8;
          font-size: 14px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }

        .quantity-badge, .revenue-amount, .price-per-kg {
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(59,130,246,0.2);
          color: #60a5fa;
          font-weight: 600;
        }

        .revenue-amount {
          background: rgba(16,185,129,0.2);
          color: #10b981;
        }

        .price-per-kg {
          background: rgba(245,158,11,0.2);
          color: #f59e0b;
        }

        /* Loading and error states */
        .loading, .error {
          text-align:center; padding:100px; font-size:1.2rem; color:white;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          min-height:60vh;
        }
        .loading { color:#22d3ee; }
        .error { color:#f87171; }

        /* Responsive */
        @media (max-width: 768px) {
          .analytics-header {
            flex-direction: column;
            text-align: center;
          }
          
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .chart-card.full-width {
            grid-column: 1;
          }
          
          .info-cards {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}