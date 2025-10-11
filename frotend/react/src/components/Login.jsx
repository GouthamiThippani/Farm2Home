import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("farmer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://127.0.0.1:5000/api/auth"; // Flask server

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = isSignup ? { name, email, password, role } : { email, password, role };

    try {
      const res = await fetch(`${API_BASE}/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Authentication failed");
        return;
      }

      const user = data.user;
      localStorage.setItem("ib_user", JSON.stringify(user));
      onLogin && onLogin(user);

      user.role === "farmer" ? navigate("/farmer-home") : navigate("/buyer-home");
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="login-outer">
      {/* Login Card */}
      <div className="card fade-in">
        <h2>Farm2Home</h2>
        <p className="sub-title">Login or Signup as Farmer / Buyer</p>

        {/* Tabs */}
        <div className="tab-row">
          <button className={`tab-btn ${!isSignup ? "active" : ""}`} onClick={() => setIsSignup(false)}>
            Login
          </button>
          <button className={`tab-btn ${isSignup ? "active" : ""}`} onClick={() => setIsSignup(true)}>
            Signup
          </button>
        </div>

        {/* Role Selector */}
        <div className="role-row">
          <button className={`role-btn ${role === "farmer" ? "active" : ""}`} onClick={() => setRole("farmer")}>
            Farmer
          </button>
          <button className={`role-btn ${role === "buyer" ? "active" : ""}`} onClick={() => setRole("buyer")}>
            Buyer
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleAuth}>
          {isSignup && (
            <input
              type="text"
              className="input-field"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Processing..." : isSignup ? `Signup as ${role}` : `Login as ${role}`}
          </button>
        </form>
        <p className="terms">By continuing, you accept demo terms. Connected to Flask backend.</p>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .login-outer {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          font-family: 'Poppins', sans-serif;
          padding: 20px;
        }

        .fade-in {
          animation: fadeInUp 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          0% { opacity:0; transform: translateY(20px);}
          100% { opacity:1; transform: translateY(0);}
        }

        .card {
          background: white;
          padding: 30px 25px;
          border-radius: 20px;
          max-width: 380px;
          width: 100%;
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          text-align: center;
          position: relative;
        }

        h2 {
          font-size: 32px;
          color: #2563eb;
          margin-bottom: 8px;
        }

        .sub-title {
          font-size: 14px;
          color: #111;
          margin-bottom: 20px;
        }

        .tab-row {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .tab-btn {
          flex: 1;
          padding: 8px 0;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: 0.3s;
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }

        .tab-btn.active {
          background: #2563eb;
          color: #fff;
        }

        .role-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .role-btn {
          flex: 1;
          padding: 6px 0;
          border-radius: 12px;
          border: 1px solid #2563eb;
          font-weight: 500;
          cursor: pointer;
          transition: 0.3s;
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }

        .role-btn.active {
          background: #2563eb;
          color: #fff;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-field {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #ccc;
          font-size: 14px;
          transition: 0.3s;
        }

        .input-field:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 10px rgba(37,99,235,0.3);
        }

        .submit-btn {
          padding: 12px;
          border: none;
          border-radius: 12px;
          background: #2563eb;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #1e40af;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .terms {
          font-size: 12px;
          color: #555;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
