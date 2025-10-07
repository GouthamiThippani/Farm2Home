import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function saveUserToLocal(user) {
  localStorage.setItem('ib_user', JSON.stringify(user));
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('ib_users') || '[]');
  } catch { return []; }
}

function saveUsers(users) { localStorage.setItem('ib_users', JSON.stringify(users)); }

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('farmer'); // farmer | buyer
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
    if (found.role === 'farmer') navigate('/farmer-home');
    else navigate('/buyer-home');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) { alert('Fill all fields'); return; }
    const users = getUsers();
    if (users.find(u => u.email === email && u.role === role)) { alert('User exists'); return; }
    const user = { id: Date.now(), name, email, password, role };
    users.push(user); saveUsers(users);
    saveUserToLocal(user);
    onLogin && onLogin(user);
    role === 'farmer' ? navigate('/farmer-home') : navigate('/buyer-home');
  };

  return (
    <>
      <style>{`
        .login-outer { min-height: calc(100vh - 64px); display:flex; align-items:center; justify-content:center;
          background: linear-gradient(135deg,#ff7ab6 0%,#ffd36b 50%,#5fd39a 100%); padding-top:24px;
        }
        .card {
          width: 420px; border-radius: 18px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          background: linear-gradient(90deg, rgba(120,85,255,0.95), rgba(255,125,190,0.95));
          color: #fff; font-family: Arial, sans-serif;
        }
        .tab-row { display:flex; gap:10px; justify-content:center; margin-bottom:18px; }
        .role-btn { padding:10px 14px; border-radius:12px; cursor:pointer; border:none; font-weight:600 }
        .input { width:100%; padding:10px 12px; margin-bottom:12px; border-radius:12px; border:none; font-size:14px }
        .white-input { background: #fff; color:#222; }
        .action-btn { width:100%; padding:12px; border-radius:12px; border:none; font-weight:700; cursor:pointer; }
        .muted { opacity:0.9; font-size:13px; text-align:center; margin-top:10px }
      `}</style>

      <div className="login-outer">
        <div className="card">
          <h2 style={{ textAlign:'center', marginBottom: 10, fontSize: 28 }}>Farm2Home</h2>

          <div style={{ textAlign:'center', marginBottom: 12, fontSize:14 }}>Login or Signup as Farmer / Buyer</div>

          <div className="tab-row">
            <button className="role-btn" style={{ background: isSignup ? 'rgba(255,255,255,0.15)' : '#fff', color: isSignup ? '#fff' : '#6b21a8' }} onClick={() => setIsSignup(false)}>Login</button>
            <button className="role-btn" style={{ background: isSignup ? '#fff' : 'rgba(255,255,255,0.15)', color: isSignup ? '#6b21a8' : '#fff' }} onClick={() => setIsSignup(true)}>Signup</button>
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom: 14 }}>
            <button className="role-btn" onClick={()=>setRole('farmer')} style={{ background: role==='farmer' ? '#fff' : 'rgba(255,255,255,0.12)', color: role==='farmer' ? '#5a2fb0' : '#fff' }}>Farmer</button>
            <button className="role-btn" onClick={()=>setRole('buyer')} style={{ background: role==='buyer' ? '#fff' : 'rgba(255,255,255,0.12)', color: role==='buyer' ? '#d63384' : '#fff' }}>Buyer</button>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            {isSignup && <input className="input white-input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />}
            <input className="input white-input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="input white-input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button type="submit" className="action-btn" style={{ background: 'linear-gradient(90deg,#ffd54a,#ff6b6b)', color:'#111' }}>
              {isSignup ? `Signup as ${role}` : `Login as ${role}`}
            </button>
          </form>

          <div className="muted">By continuing you accept demo terms. This is local-demo only.</div>
        </div>
      </div>
    </>
  );
}
