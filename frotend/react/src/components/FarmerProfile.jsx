import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaSave } from "react-icons/fa";

export default function FarmerProfile({ user, onLogout, notifications }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    crops: "",
    location: "",
    farm_size: "",
    experience_years: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);

    axios
      .get(`http://127.0.0.1:5000/api/farmer/${user.email}`)
      .then((res) => {
        const data = res.data;
        setProfile({
          name: data.name || "",
          email: data.email || user.email,
          phone: data.phone || "",
          crops: (data.crops || []).join(", "),
          location: data.location || "",
          farm_size: data.farm_size || "",
          experience_years: data.experience_years || ""
        });
      })
      .catch((err) => {
        console.error("Error fetching farmer profile:", err);
        // still show empty form if not found
        setProfile((p) => ({ ...p, email: user.email }));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async () => {
    try {
      const cropsArray = profile.crops
        ? profile.crops.split(",").map((c) => c.trim())
        : [];

      await axios.post("http://127.0.0.1:5000/api/farmer", {
        ...profile,
        crops: cropsArray
      });

      alert("✅ Profile saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error saving profile.");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h3>Loading your profile...</h3>
      </div>
    );

  return (
    <div className="profile-page">
      <Navbar user={user} onLogout={onLogout} notifications={notifications} />

      <main className="profile-container">
        <div className="profile-card">
          <h2>👨‍🌾 Farmer Profile</h2>

          {[
            { label: "Full Name", field: "name" },
            { label: "Email", field: "email", disabled: true },
            { label: "Phone Number", field: "phone" },
            { label: "Crops (comma separated)", field: "crops" },
            { label: "Location", field: "location" },
            { label: "Farm Size", field: "farm_size" },
            { label: "Experience (years)", field: "experience_years" }
          ].map(({ label, field, disabled }) => (
            <div className="form-group" key={field}>
              <label>{label}</label>
              <input
                value={profile[field]}
                onChange={(e) =>
                  setProfile({ ...profile, [field]: e.target.value })
                }
                disabled={disabled}
                placeholder={label}
              />
            </div>
          ))}

          <button className="save-btn" onClick={saveProfile}>
            <FaSave style={{ marginRight: 8 }} /> Save Profile
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Farm2Home. All rights reserved.</p>
      </footer>

      <style>{`
        .profile-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f7f9fc;
        }
        .profile-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
        }
        .profile-card {
          background: #fff;
          padding: 40px 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 700px;
          animation: fadeIn 0.6s ease forwards;
        }
        .profile-card h2 {
          margin-bottom: 25px;
          color: #1e3a8a;
          font-size: 1.8rem;
          text-align: center;
        }
        .form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          margin-bottom: 6px;
          font-weight: 500;
          color: #334155;
        }
        .form-group input {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 1rem;
          outline: none;
          transition: 0.3s;
        }
        .form-group input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 6px rgba(59,130,246,0.3);
        }
        .save-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #0b7a3f;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
          width: 100%;
        }
        .save-btn:hover {
          background: #095e31;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .footer {
          background: #2563eb;
          color: white;
          text-align: center;
          padding: 20px 10px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
