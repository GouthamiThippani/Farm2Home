import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const navStyle = {
    background: '#0b7a3f',
    color: 'white',
    padding: '12px 20px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50
  };

  const container = {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const links = { display: 'flex', gap: 18, alignItems: 'center' };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('ib_user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav style={navStyle}>
      <div style={container}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>Invisible Bridge</div>
        <div style={links}>
          <Link style={{ color: 'white', textDecoration: 'none' }} to="/market-prices">Market Prices</Link>
          {user?.role === 'farmer' && <Link style={{ color: 'white', textDecoration: 'none' }} to="/farmer/sell">Sell Products</Link>}
          {user?.role === 'farmer' && <Link style={{ color: 'white', textDecoration: 'none' }} to="/farmer/analytics">Analytics</Link>}
          {user?.role === 'farmer' && <Link style={{ color: 'white', textDecoration: 'none' }} to="/farmer/profile">Profile</Link>}
          {user?.role === 'buyer' && <Link style={{ color: 'white', textDecoration: 'none' }} to="/buyer/home">Browse</Link>}
          {user?.role === 'buyer' && <Link style={{ color: 'white', textDecoration: 'none' }} to="/buyer/cart">Cart</Link>}
          <Link style={{ color: 'white', textDecoration: 'none' }} to="/help">Help</Link>
          {user ? (
            <button onClick={handleLogout} style={{ background: '#fff', color: '#0b7a3f', padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              Logout
            </button>
          ) : (
            <Link style={{ color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: 8 }} to="/">Login / Signup</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
