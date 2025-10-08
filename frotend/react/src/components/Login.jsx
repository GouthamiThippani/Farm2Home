import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function saveUserToLocal(user) {
  localStorage.setItem('ib_user', JSON.stringify(user));
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('ib_users') || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem('ib_users', JSON.stringify(users));
}

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password && u.role === role);
    if (!found) {
      alert('Invalid credentials (or not signed up).');
      return;
    }
    saveUserToLocal(found);
    onLogin && onLogin(found);
    found.role === 'farmer' ? navigate('/farmer-home') : navigate('/buyer-home');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Fill all fields');
      return;
    }
    const users = getUsers();
    if (users.find(u => u.email === email && u.role === role)) {
      alert('User exists');
      return;
    }
    const user = { id: Date.now(), name, email, password, role };
    users.push(user);
    saveUsers(users);
    saveUserToLocal(user);
    onLogin && onLogin(user);
    role === 'farmer' ? navigate('/farmer-home') : navigate('/buyer-home');
  };

  return (
    <>
      <style>{`
        .login-outer {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ccefff 0%, #99ddff 50%, #66ccff 100%);
          padding-top: 24px;
        }
        .card {
          width: 420px;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          background: linear-gradient(90deg, #99ddff, #ccefff);
          color: #111;
          font-family: Arial, sans-serif;
          transform: translateY(-30px);
          opacity: 0;
          animation: slideFadeIn 0.8s ease forwards;
        }
        @keyframes slideFadeIn {
          to { transform: translateY(0); opacity: 1; }
        }

        .tab-row { display:flex; gap:10px; justify-content:center; margin-bottom:18px; }
        .role-btn {
          padding:10px 14px;
          border-radius:12px;
          cursor:pointer;
          border:none;
          font-weight:600;
          transition: transform 0.2s ease, background 0.3s ease;
        }
        .role-btn:hover { transform: scale(1.05); }

        .input {
          width:100%;
          padding:10px 12px;
          margin-bottom:12px;
          border-radius:12px;
          border:none;
          font-size:14px;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .input:focus {
          transform: scale(1.02);
          box-shadow: 0 0 12px rgba(0,0,0,0.2);
          outline:none;
        }

        .white-input { background: #fff; color:#222; }

        .action-btn {
          width:100%;
          padding:12px;
          border-radius:12px;
          border:none;
          font-weight:700;
          cursor:pointer;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
          background: linear-gradient(90deg,#66ccff,#99ddff);
          color:#111;
        }
        .action-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }

        .muted { opacity:0.85; font-size:13px; text-align:center; margin-top:10px; }
      `}</style>

      <div className="login-outer">
        <div className="card">
          <h2 style={{ textAlign:'center', marginBottom: 10, fontSize: 28 }}>Farm2Home</h2>
          <div style={{ textAlign:'center', marginBottom: 12, fontSize:14 }}>Login or Signup as Farmer / Buyer</div>

          <div className="tab-row">
            <button
              className="role-btn"
              style={{ background: isSignup ? 'rgba(255,255,255,0.25)' : '#fff', color: isSignup ? '#111' : '#005f99' }}
              onClick={() => setIsSignup(false)}
            >
              Login
            </button>
            <button
              className="role-btn"
              style={{ background: isSignup ? '#fff' : 'rgba(255,255,255,0.25)', color: isSignup ? '#005f99' : '#111' }}
              onClick={() => setIsSignup(true)}
            >
              Signup
            </button>
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom: 14 }}>
            <button
              className="role-btn"
              onClick={() => setRole('farmer')}
              style={{ background: role==='farmer' ? '#fff' : 'rgba(255,255,255,0.12)', color: role==='farmer' ? '#005f99' : '#111' }}
            >
              Farmer
            </button>
            <button
              className="role-btn"
              onClick={() => setRole('buyer')}
              style={{ background: role==='buyer' ? '#fff' : 'rgba(255,255,255,0.12)', color: role==='buyer' ? '#005f99' : '#111' }}
            >
              Buyer
            </button>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            {isSignup && (
              <input className="input white-input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
            )}
            <input className="input white-input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="input white-input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button type="submit" className="action-btn">
              {isSignup ? `Signup as ${role}` : `Login as ${role}`}
            </button>
          </form>

          <div className="muted">By continuing you accept demo terms. This is local-demo only.</div>
        </div>
      </div>
    </>
  );
}
