import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Analytics({ farmerName = "Farmer", farmerEmail = "farmer@example.com", onLogout }) {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    try { 
      setSales(JSON.parse(localStorage.getItem('ib_sales') || '[]')); 
    } catch { 
      setSales([]); 
    }
  }, []);

  // Aggregate sales by month (demo)
  const labels = [];
  const dataPoints = [];
  if (sales.length === 0) {
    labels.push('Jan','Feb','Mar','Apr','May','Jun');
    dataPoints.push(5,8,6,12,9,15);
  } else {
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

  const handleNav = (path) => navigate(path);

  const handleLogout = () => {
    if (onLogout) onLogout(); // call logout action
    navigate("/");            // go to login page
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Fade animation on scroll
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-section").forEach((section) => {
        if (section.getBoundingClientRect().top < window.innerHeight - 100) section.classList.add("visible");
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="analytics-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">Farm2Home 🌾</div>
        <div className="nav-right">
          <a onClick={() => handleNav("/farmer-home")}>Home</a>
          <a onClick={() => handleNav("/market-prices")}>Market Prices</a>
          <a onClick={() => handleNav("/sell-products")}>Sell</a>
          <a onClick={() => handleNav("/analytics")} className="active">Analytics</a>
          <a onClick={() => handleNav("/payments")}>Payments</a>
          <a onClick={() => handleNav("/help")}>Help</a>

          {/* Profile Circle */}
          <div className="profile-container">
            <div className="profile-icon" onClick={() => setShowProfile(!showProfile)}>
              {farmerName[0].toUpperCase()}
            </div>
            {showProfile && (
              <div className="profile-dropdown">
                <p className="profile-name">{farmerName}</p>
                <p className="profile-email">{farmerEmail}</p>
                <button onClick={() => handleNav("/profile")}>View Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Analytics Section */}
      <section className="fade-section content-section">
        <h2 className="section-title">Analytics</h2>
        <div className="chart-card">
          <Line data={chartData} />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer fade-section">
        <div className="footer-content">
          <div className="footer-box">
            <h3>Farm2Home</h3>
            <p>Empowering small and marginal farmers with AI-powered market insights and digital access.</p>
          </div>
          <div className="footer-box">
            <h3>Contact</h3>
            <p>Email: support@farm2home.com</p>
            <p>Phone: +91 789xx xxxxx</p>
            <p>Address: Hyderabad, India</p>
          </div>
          <div className="footer-box">
            <h3>Follow Us</h3>
            <p>Facebook | Twitter | Instagram | Email</p>
          </div>
        </div>
        <p className="footer-bottom">© 2025 Farm2Home — All rights reserved.</p>
      </footer>

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; margin:0; padding:0; }
        .analytics-page { font-family: 'Poppins', sans-serif; background: #e6f2ff; min-height:100vh; display:flex; flex-direction:column; }

        .navbar { display:flex; justify-content:space-between; align-items:center; padding:10px 40px; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.05); position:sticky; top:0; z-index:1000; }
        .nav-left { font-size:24px; font-weight:700; color:#3b82f6; }
        .nav-right { display:flex; align-items:center; gap:12px; }
        .nav-right a { cursor:pointer; text-decoration:none; color:#3b82f6; font-weight:500; padding:6px 8px; border-radius:6px; transition:0.2s; }
        .nav-right a:hover, .nav-right a.active { background:#dbe9ff; }

        .profile-container { position:relative; }
        .profile-icon { width:36px; height:36px; border-radius:50%; background:#3b82f6; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; cursor:pointer; }
        .profile-dropdown { position:absolute; right:0; top:45px; background:white; border-radius:12px; padding:8px; box-shadow:0 6px 20px rgba(0,0,0,0.1); display:flex; flex-direction:column; min-width:140px; }
        .profile-dropdown p { font-size:13px; margin:2px 0; }
        .profile-dropdown button { border:none; background:none; padding:8px; cursor:pointer; text-align:left; transition:0.2s; }
        .profile-dropdown button:hover { background:#f0f4ff; }

        .content-section { padding:40px 20px; max-width:1100px; margin:0 auto; flex:1; }
        .section-title { font-size:28px; color:#3b82f6; margin-bottom:24px; text-align:center; }

        .chart-card { background:white; padding:20px; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); transition:0.3s; }
        .chart-card:hover { transform:translateY(-4px); box-shadow:0 8px 20px rgba(0,0,0,0.12); }

        .footer { background: linear-gradient(135deg, #3b82f6, #60a5fa); color:white; padding:40px 20px 25px; text-align:center; margin-top:auto; border-radius:12px 12px 0 0; }
        .footer-content { display:flex; flex-wrap:wrap; justify-content:space-around; margin-bottom:20px; }
        .footer-box { max-width:300px; margin:20px; text-align:left; }
        .footer-box h3 { font-size:18px; margin-bottom:8px; }
        .footer-bottom { font-size:12px; opacity:0.8; }

        .fade-section { opacity:0; transform:translateY(20px); transition:0.6s ease-out; }
        .fade-section.visible { opacity:1; transform:translateY(0); }
      `}</style>
    </div>
  );
}
