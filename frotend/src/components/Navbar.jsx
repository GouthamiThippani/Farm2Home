import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaShoppingCart,
  FaLeaf,
  FaChartBar,
  FaHeart,
  FaQuestionCircle,
  FaBell,
  FaChevronDown,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Navbar = ({ user, onLogout, notifications }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links =
    user?.role === "farmer"
      ? [
          { to: "/farmer-home", label: "Home", icon: <FaHome /> },
          { to: "/market-prices", label: "Market Prices", icon: <FaLeaf /> },
          { to: "/sell-products", label: "Sell Products", icon: <FaShoppingCart /> },
          { to: "/analytics", label: "Analytics", icon: <FaChartBar /> },
          { to: "/help", label: "Help", icon: <FaQuestionCircle /> },
        ]
      : [
          { to: "/buyer-home", label: "Home", icon: <FaHome /> },
          { to: "/products", label: "Products", icon: <FaLeaf /> },
          { to: "/cart", label: "Cart", icon: <FaShoppingCart /> },
          { to: "/favorites", label: "Favorites", icon: <FaHeart /> },
          { to: "/help", label: "Help", icon: <FaQuestionCircle /> },
        ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-container")) setShowProfile(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar">
        {/* LEFT SIDE */}
        <div className="left-section">
          <div
            className="logo"
            onClick={() =>
              navigate(user?.role === "farmer" ? "/farmer-home" : "/buyer-home")
            }
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2907/2907467.png"
              alt="logo"
              className="logo-icon"
            />
            <span>Farm2Home</span>
          </div>
        </div>

        {/* CENTER LINKS */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {links.map((link) => (
            <li
              key={link.to}
              className={location.pathname === link.to ? "active-link" : ""}
            >
              <Link to={link.to} className="nav-link" onClick={() => setMenuOpen(false)}>
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT SECTION */}
        <div className="right-section">
          {user?.role === "buyer" && (
            <div className="notifications" onClick={() => navigate("/watchlist")}>
              <FaBell />
              {notifications?.length > 0 && (
                <span className="badge">{notifications.length}</span>
              )}
            </div>
          )}

          {user && (
            <div
              className="profile-container"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="profile-circle">
                {user.name[0].toUpperCase()} <FaChevronDown className="chevron" />
              </div>
              {showProfile && (
                <div className="profile-dropdown">
                  <Link
                    to={user.role === "farmer" ? "/profile" : "/buyer-profile"}
                    className="dropdown-item"
                  >
                    <FaUserCircle /> Profile
                  </Link>
                  <button
                    onClick={() => {
                      onLogout();
                      navigate("/");
                    }}
                    className="dropdown-item logout"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      <style>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 25px;
          height: 70px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          color: white;
          font-family: 'Poppins', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }

        .logo {
          display: flex;
          align-items: center;
          font-size: 1.7rem;
          font-weight: 700;
          gap: 8px;
          cursor: pointer;
        }

        .logo-icon {
          width: 28px;
          height: 28px;
        }

        .nav-links {
          display: flex;
          justify-content: center;
          flex: 1;
          list-style: none;
          gap: 20px;
          margin: 0;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #e0f2fe;
          text-decoration: none;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 8px;
          transition: background 0.2s, transform 0.2s;
        }

        .nav-link:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }

        .active-link .nav-link {
          background: rgba(255,255,255,0.25);
          font-weight: 600;
        }

        .right-section {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .notifications {
          position: relative;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .notifications:hover {
          transform: scale(1.1);
        }

        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 0.7rem;
        }

        .profile-container {
          position: relative;
          cursor: pointer;
        }

        .profile-circle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 25px;
          background: #60a5fa;
          font-weight: 600;
          transition: background 0.2s;
        }

        .profile-circle:hover {
          background: #60a5fa;
        }

        .profile-dropdown {
          position: absolute;
          top: 48px;
          right: 0;
          background: #1d4ed8;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          min-width: 150px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(245, 241, 241, 0.3);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          color: white;
          text-decoration: none;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-item:hover {
          background: rgba(255,255,255,0.2);
        }

        .logout {
          color: #f87171;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: white;
          cursor: pointer;
        }

        @media (max-width: 950px) {
          .nav-links {
            position: absolute;
            top: 70px;
            left: 0;
            width: 100%;
            flex-direction: column;
            align-items: center;
            background: rgba(59,130,246,0.95);
            backdrop-filter: blur(10px);
            padding: 20px 0;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
          }

          .nav-links.open {
            transform: translateY(0);
          }

          .menu-toggle {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;