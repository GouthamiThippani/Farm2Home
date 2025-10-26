import React, { useEffect } from "react";
import heroImg from "../assets/buyer.jpeg"; // buyer hero image
import BuyerNavbar from "./BuyerNavbar";
const buyerFeatures = [
  { name: "Products", desc: "Browse products from trusted farmers.", path: "/products" },
  { name: "Cart", desc: "View your cart and checkout easily.", path: "/cart" },
  { name: "Help", desc: "Get assistance and tips for smooth shopping.", path: "/help" },
];

export default function BuyerHome({ buyerName = "Buyer", onNavigate }) {

  // Scroll fade animation
  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-section").forEach(section => {
        if (section.getBoundingClientRect().top < window.innerHeight - 100) {
          section.classList.add("visible");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="buyer-home">
      {/* Hero Section */}
      <section className="hero fade-section">
        <div className="hero-left">
          <h1>Welcome, {buyerName} 👋</h1>
          <p>Explore fresh products, add to your cart, and shop with ease!</p>
        </div>
        <div className="hero-right">
          <img src={heroImg} alt="Buyer" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="features fade-section">
        <h2 className="features-heading">Your Dashboard</h2>
        <div className="features-grid">
          {buyerFeatures.map((f) => (
            <div key={f.name} className="feature-card" onClick={() => onNavigate(f.path)}>
              <h3>{f.name}</h3>
              <p>{f.desc}</p>
              <button>Go</button>
            </div>
          ))}
        </div>
      </section>

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; margin:0; padding:0; }
        .buyer-home { font-family: 'Poppins', sans-serif; background: #f0f7ff; min-height:100vh; display:flex; flex-direction:column; }

        /* Hero */
        .hero { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; padding:80px 40px; min-height:60vh; background:#d9eaff; border-radius:16px; margin:20px 40px; box-shadow:0 10px 25px rgba(0,0,0,0.05); }
        .hero-left { flex:1; min-width:300px; }
        .hero-left h1 { font-size:42px; color:#1e40af; margin-bottom:16px; animation: fadeInDown 1s ease forwards; }
        .hero-left p { font-size:18px; color:#334155; max-width:500px; line-height:1.6; animation: fadeInDown 1.2s ease forwards; }
        .hero-right { flex:1; min-width:300px; display:flex; justify-content:center; align-items:center; animation: float 6s ease-in-out infinite; }
        .hero-right img { width:100%; max-width:450px; border-radius:16px; }

        @keyframes fadeInDown { from { opacity:0; transform:translateY(-30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }

        /* Features */
        .features { padding:60px 40px; }
        .features-heading { font-size:32px; color:#1e40af; text-align:center; margin-bottom:32px; animation: fadeIn 1s ease forwards; }
        .features-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); gap:24px; }
        .feature-card { background:white; padding:24px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.08); text-align:center; cursor:pointer; transition:0.3s; animation: fadeInUp 1s ease forwards; }
        .feature-card:hover { transform:translateY(-6px) scale(1.03); box-shadow:0 12px 30px rgba(0,0,0,0.12); }
        .feature-card h3 { margin-bottom:12px; color:#1e40af; font-size:20px; }
        .feature-card p { font-size:14px; margin-bottom:16px; color:#334155; }
        .feature-card button { padding:10px 18px; border:none; border-radius:10px; background:#1e3a8a; color:white; font-weight:600; cursor:pointer; transition:0.3s; }
        .feature-card button:hover { opacity:0.9; transform:translateY(-2px); }

        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        /* Fade sections */
        .fade-section { opacity:0; transform:translateY(20px); transition:0.8s ease-out; }
        .fade-section.visible { opacity:1; transform:translateY(0); }
      `}</style>
    </div>
  );
}
