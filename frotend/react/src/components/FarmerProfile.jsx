import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSave, FaPhone, FaMapMarker, FaSeedling, FaChartArea, FaCalendarAlt, FaEdit } from "react-icons/fa";

// API configuration
const API_BASE_URL = 'http://localhost:5000';

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
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);

    axios
      .get(`${API_BASE_URL}/api/farmer/${user.email}`)
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
        setProfile((p) => ({ ...p, email: user.email }));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.name.trim()) newErrors.name = "Name is required";
    
    if (!profile.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(profile.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    if (profile.experience_years && isNaN(profile.experience_years)) {
      newErrors.experience_years = "Please enter a valid number";
    }
    
    if (profile.farm_size && isNaN(profile.farm_size)) {
      newErrors.farm_size = "Please enter a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      const formatted = formatPhone(value);
      setProfile({ ...profile, [field]: formatted });
    } else {
      setProfile({ ...profile, [field]: value });
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const saveProfile = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const cropsArray = profile.crops
        ? profile.crops.split(",").map((c) => c.trim()).filter(c => c)
        : [];

      await axios.post(`${API_BASE_URL}/api/farmer`, {
        ...profile,
        crops: cropsArray
      });

      const res = await axios.get(`${API_BASE_URL}/api/farmer/${user.email}`);
      const updatedData = res.data;
      setProfile({
        name: updatedData.name || "",
        email: updatedData.email || user.email,
        phone: updatedData.phone || "",
        crops: (updatedData.crops || []).join(", "),
        location: updatedData.location || "",
        farm_size: updatedData.farm_size || "",
        experience_years: updatedData.experience_years || ""
      });

      setIsEditing(false);
      showNotification("✅ Profile saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("❌ Error saving profile. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (message, type = "info") => {
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'success' ? '#0b7a3f' : '#ef4444',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'slideIn 0.3s ease'
    });

    notification.querySelector('button').style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h3>Loading your profile...</h3>
      </div>
    );

  const ProfileView = () => (
    <div className="profile-view">
      <div className="profile-header">
        <div className="header-content">
          <div className="avatar">👨‍🌾</div>
          <div className="user-info">
            <h1 className="user-name">{profile.name || "Farmer"}</h1>
            <p className="user-email">{profile.email}</p>
            <p className="user-role">Agricultural Professional</p>
          </div>
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit className="edit-icon" />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="sections-container">
          <div className="info-section">
            <h2 className="section-title">Contact Information</h2>
            <div className="info-cards">
              <div className="info-card">
                <div className="card-icon">
                  <FaPhone />
                </div>
                <div className="card-content">
                  <h3>Phone Number</h3>
                  <p>{profile.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="card-icon">
                  <FaMapMarker />
                </div>
                <div className="card-content">
                  <h3>Location</h3>
                  <p>{profile.location || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2 className="section-title">Farming Details</h2>
            <div className="info-cards">
              <div className="info-card">
                <div className="card-icon">
                  <FaSeedling />
                </div>
                <div className="card-content">
                  <h3>Crops Grown</h3>
                  <p>{profile.crops || "Not specified"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="card-icon">
                  <FaChartArea />
                </div>
                <div className="card-content">
                  <h3>Farm Size</h3>
                  <p>{profile.farm_size ? `${profile.farm_size} acres` : "Not specified"}</p>
                </div>
              </div>
              <div className="info-card">
                <div className="card-icon">
                  <FaCalendarAlt />
                </div>
                <div className="card-content">
                  <h3>Experience</h3>
                  <p>{profile.experience_years ? `${profile.experience_years} years` : "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileEdit = () => (
    <div className="profile-edit">
      <div className="edit-header">
        <h2>Edit Profile</h2>
        <button 
          className="cancel-btn"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
      </div>

      <div className="form-sections">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="disabled"
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(123) 456-7890"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, State"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Farming Details</h3>
          <div className="form-group">
            <label>Crops (comma separated)</label>
            <input
              type="text"
              value={profile.crops}
              onChange={(e) => handleInputChange('crops', e.target.value)}
              placeholder="e.g., Wheat, Corn, Soybeans"
            />
          </div>

          <div className="form-group">
            <label>Farm Size (acres)</label>
            <input
              type="number"
              value={profile.farm_size}
              onChange={(e) => handleInputChange('farm_size', e.target.value)}
              placeholder="Enter farm size"
              className={errors.farm_size ? 'error' : ''}
            />
            {errors.farm_size && <span className="error-message">{errors.farm_size}</span>}
          </div>

          <div className="form-group">
            <label>Experience (years)</label>
            <input
              type="number"
              value={profile.experience_years}
              onChange={(e) => handleInputChange('experience_years', e.target.value)}
              placeholder="Years of experience"
              className={errors.experience_years ? 'error' : ''}
            />
            {errors.experience_years && <span className="error-message">{errors.experience_years}</span>}
          </div>
        </div>
      </div>

      <button 
        className={`save-btn ${isSaving ? 'saving' : ''}`} 
        onClick={saveProfile}
        disabled={isSaving}
      >
        <FaSave style={{ marginRight: 8 }} />
        {isSaving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );

  return (
    <div className="profile-page">
      <main className="profile-container">
        <div className="profile-card">
          {isEditing ? <ProfileEdit /> : <ProfileView />}
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
          background: #f8fafc;
        }
        .profile-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 30px 20px;
        }
        .profile-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          width: 100%;
          max-width: 1200px;
          overflow: hidden;
        }

        /* View Mode Styles */
        .profile-view {
          padding: 0;
        }

        .profile-header {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          color: white;
          padding: 40px;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
        }

        .avatar {
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          backdrop-filter: blur(10px);
          border: 3px solid rgba(255,255,255,0.3);
        }

        .user-info {
          flex: 1;
          margin-left: 30px;
        }

        .user-name {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: white;
        }

        .user-email {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0 0 4px 0;
        }

        .user-role {
          font-size: 1rem;
          opacity: 0.8;
          margin: 0;
        }

        .edit-profile-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid rgba(255,255,255,0.4);
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .edit-profile-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .edit-icon {
          font-size: 1rem;
        }

        .profile-content {
          padding: 40px;
        }

        .sections-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .info-section {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }

        .info-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border-color: #60a5fa;
        }

        .card-icon {
          width: 50px;
          height: 50px;
          background: #bfdbfe;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e40af;
          font-size: 1.2rem;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .info-card:hover .card-icon {
          background: #93c5fd;
          transform: scale(1.05);
        }

        .card-content h3 {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .card-content p {
          margin: 0;
          color: #64748b;
          font-size: 1rem;
          line-height: 1.5;
        }

        /* Edit Mode Styles */
        .profile-edit {
          padding: 40px;
        }

        .edit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }

        .edit-header h2 {
          color: #1e293b;
          margin: 0;
          font-size: 1.8rem;
        }

        .cancel-btn {
          background: #64748b;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: #475569;
          transform: translateY(-1px);
        }

        .form-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
        }

        .form-section h3 {
          color: #1e293b;
          margin-bottom: 20px;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 1rem;
          outline: none;
          transition: 0.3s;
          box-sizing: border-box;
        }

        .form-group input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 6px rgba(96,165,250,0.3);
        }

        .form-group input.error {
          border-color: #ef4444;
          box-shadow: 0 0 6px rgba(239,68,68,0.3);
        }

        .form-group input.disabled {
          background-color: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 4px;
          display: block;
        }

        .save-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #60a5fa;
          color: white;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 200px;
          margin: 0 auto;
        }

        .save-btn:hover:not(:disabled) {
          background: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .save-btn.saving {
          background: #6b7280;
        }

        .footer {
          background: #60a5fa;
          color: white;
          text-align: center;
          padding: 20px 10px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .sections-container {
            grid-template-columns: 1fr;
          }
          .form-sections {
            grid-template-columns: 1fr;
          }
          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
          .user-info {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}