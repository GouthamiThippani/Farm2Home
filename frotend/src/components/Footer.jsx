import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section about">
          <h3>Farm2Home</h3>
          <p>Empowering small and marginal farmers with AI-driven market insights and digital access.</p>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact">
          <h4>Contact</h4>
          <p>Email: <a href="mailto:support@farm2home.com">support@farm2home.com</a></p>
          <p>Phone: +91 789xx xxxxx</p>
          <p>Address: Hyderabad, India</p>
        </div>

        {/* Social Section */}
        <div className="footer-section social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="mailto:support@farm2home.com"><FaEnvelope /></a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>© 2025 Farm2Home — All rights reserved.</p>
      </div>

      <style>{`
        .footer {
          background: #1e3a8a; /* professional dark blue */
          color: #f1f5f9; /* soft text color */
          padding: 60px 20px 25px;
          font-family: 'Poppins', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .footer-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 40px;
          margin-bottom: 25px;
        }

        .footer-section h3, .footer-section h4 {
          margin-bottom: 12px;
          color: #f1f5f9;
        }

        .footer-section p, .footer-section a {
          margin-bottom: 8px;
          color: #cbd5e1;
          font-size: 0.95rem;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-section a:hover {
          color: #60a5fa; /* subtle hover */
        }

        .social-icons {
          display: flex;
          gap: 15px;
        }

        .social-icons a {
          color: #f1f5f9;
          font-size: 1.3rem;
          transition: transform 0.3s, color 0.3s;
        }

        .social-icons a:hover {
          color: #60a5fa;
          transform: scale(1.2);
        }

        .footer-bottom {
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 20px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        @media (max-width: 768px) {
          .footer-container {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
