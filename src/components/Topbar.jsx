import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Menu, Check, Trash2, Clock } from 'lucide-react';
import { getAllData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';

const Topbar = ({ toggleMenu }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [userData, setUserData] = useState({});
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'presence', title: 'Presensi Masuk', message: 'Guru Ahmad baru saja melakukan presensi.', time: '2 menit yang lalu', unread: true },
    { id: 2, type: 'religious', title: 'Monitoring Ibadah', message: 'Rekap ibadah harian Kelas XI-A sudah tersedia.', time: '1 jam yang lalu', unread: true },
    { id: 3, type: 'system', title: 'Update Sistem', message: 'Fitur laporan otomatis kini sudah aktif.', time: '3 jam yang lalu', unread: false },
  ]);

  const { user: authUser } = useAuth();
  
  useEffect(() => {
    if (authUser) {
      setUserData(authUser);
    }
  }, [authUser]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleViewAll = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  return (
    <header className="topbar">
      <div className="mobile-menu-toggle">
        <button className="icon-btn hamburger-btn" onClick={toggleMenu}>
          <Menu size={24} />
        </button>
      </div>

      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Cari siswa atau data..." className="search-input" />
      </div>

      <div className="topbar-actions">
        <div className="notification-wrapper">
          <button 
            className={`icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.some(n => n.unread) && <span className="notification-badge"></span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown glass-card">
              <div className="notif-header">
                <h3>Notifikasi</h3>
                <button onClick={markAllAsRead}>Tandai dibaca</button>
              </div>
              <div className="notif-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                    <div className="notif-icon">
                      {notif.type === 'presence' ? <User size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="notif-content">
                      <div className="notif-title-row">
                        <span className="notif-title">{notif.title}</span>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                      <p className="notif-message">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notif-footer">
                <button onClick={handleViewAll}>Lihat Semua Notifikasi</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{userData.name || 'Administrator'}</span>
            <span className="user-role">{userData.role || 'Kepala Madrasah'}</span>
          </div>
          <div className="user-avatar">
            {userData.photo ? (
              <img src={userData.photo} alt="Avatar" className="avatar-img" />
            ) : (
              <User size={24} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
