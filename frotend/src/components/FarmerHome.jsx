import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroImg from "../assets/farmer.jpeg"; // your farmer image

const features = [
  { name: "Market Prices", desc: "Check the latest crop prices in your area and make informed selling decisions.", path: "/market-prices", icon: "📈" },
  { name: "Sell Products", desc: "List your crops, manage inventory, and sell directly to buyers with ease.", path: "/sell-products", icon: "🛒" },
  { name: "Analytics", desc: "Gain insights into top-selling crops, revenue, and market trends.", path: "/analytics", icon: "📊" },
  { name: "Payments", desc: "Track and manage payments from buyers securely and efficiently.", path: "/payments", icon: "💰" },
  { name: "Help & Tips", desc: "Get expert advice, tips for farming, and assistance whenever you need it.", path: "/help", icon: "🧑‍🌾" },
];

export default function FarmerHome({ farmerName = "Farmer", onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Animate sections on scroll
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
    <div className="farmer-home">
      {/* Hero Section */}
      <section className="hero fade-section">
        <div className="hero-left">
          <h1>Empowering Farmers, Connecting Communities</h1>
          <p>Fresh, local produce delivered directly from farms to your doorstep. Track, sell, and grow with Farm2Home. 🌱</p>
          <button className="hero-btn" onClick={() => navigate("/sell-products")}>Start Selling</button>
        </div>
        <div className="hero-right">
          <img src={heroImg} alt="Farmer" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features fade-section">
        <h2 className="features-heading">Your Tools & Features</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={f.name} className="feature-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.name}</h3>
              <p>{f.desc}</p>
              <button onClick={() => navigate(f.path)}>Go</button>
            </div>
          ))}
        </div>
      </section>
      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; margin:0; padding:0; }
        .farmer-home { font-family: 'Poppins', sans-serif; background: #e6f2ff; min-height:100vh; display:flex; flex-direction:column; }

        /* Hero */
        .hero { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; padding:80px 40px; min-height:75vh; background:#dbe9ff; border-radius:12px; margin:20px; overflow:hidden; }
        .hero-left { flex:1; min-width:280px; animation: slideLeft 1s ease forwards; opacity:0; }
        .hero-left h1 { font-size:48px; color:#2563eb; margin-bottom:16px; }
        .hero-left p { font-size:18px; color:#1e40af; max-width:500px; margin-bottom:20px; }
        .hero-btn { padding:12px 24px; border:none; border-radius:12px; background:#2563eb; color:white; font-weight:600; cursor:pointer; box-shadow:0 6px 18px rgba(37,99,235,0.3); transition:0.3s; }
        .hero-btn:hover { transform: translateY(-3px) scale(1.05); background:#1e40af; box-shadow:0 10px 25px rgba(37,99,235,0.4); }

        .hero-right { flex:1; min-width:280px; display:flex; justify-content:center; align-items:center; animation: slideRight 1s ease forwards; opacity:0; }
        .hero-right img { width:100%; max-width:450px; border-radius:16px; box-shadow:0 12px 25px rgba(0,0,0,0.1); }

        /* Features */
        .features { padding:60px 20px; }
        .features-heading { font-size:36px; color:#2563eb; text-align:center; margin-bottom:40px; font-weight:700; }
        .features-grid {
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap:30px;
          justify-items:center;
        }
        .feature-card {
          background: linear-gradient(145deg, #ffffff, #f0f8ff);
          padding:30px;
          border-radius:20px;
          box-shadow:0 12px 25px rgba(0,0,0,0.08);
          text-align:center;
          transition: transform 0.5s ease, box-shadow 0.5s ease, background 0.5s ease;
          opacity:0;
          transform: translateY(40px);
          animation: fadeUp 0.8s forwards;
        }
        .feature-card:hover {
          transform: translateY(-15px) scale(1.06) rotate(-1deg);
          box-shadow:0 20px 35px rgba(0,0,0,0.15);
          background: linear-gradient(145deg, #e0f0ff, #dbeeff);
        }
        .feature-card h3 { margin:16px 0 12px; color:#2563eb; font-size:22px; }
        .feature-card p { font-size:15px; color:#1e40af; margin-bottom:18px; line-height:1.5; }
        .feature-card button {
          padding:10px 22px; border:none; border-radius:14px; background:#2563eb; color:white; font-weight:600;
          cursor:pointer; transition:0.3s; box-shadow:0 6px 18px rgba(37,99,235,0.3);
        }
        .feature-card button:hover { transform: translateY(-3px) scale(1.07); background:#1e40af; box-shadow:0 10px 25px rgba(37,99,235,0.35); }

        .feature-icon {
          font-size:40px;
          animation: bounce 2s infinite;
        }

        /* Animations */
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-6px); }
        }
        @keyframes fadeUp { 0% { opacity:0; transform: translateY(40px); } 100% { opacity:1; transform: translateY(0); } }
        @keyframes slideLeft { 0% { opacity:0; transform: translateX(-50px); } 100% { opacity:1; transform: translateX(0); } }
        @keyframes slideRight { 0% { opacity:0; transform: translateX(50px); } 100% { opacity:1; transform: translateX(0); } }

        /* Fade-section */
        .fade-section.visible { opacity:1; transform: translateY(0); transition: 0.6s ease-out; }
      `}</style>
    </div>
  );
}
