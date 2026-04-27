import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { getAllData } from '../utils/storage';
import './Notifications.css';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'presence', title: 'Presensi Masuk', message: 'Guru Ahmad baru saja melakukan presensi di MA Yasrib.', time: '2 menit yang lalu', date: '27 April 2026', unread: true },
    { id: 2, type: 'religious', title: 'Monitoring Ibadah', message: 'Rekap ibadah harian Kelas XI-A sudah tersedia untuk ditinjau.', time: '1 jam yang lalu', date: '27 April 2026', unread: true },
    { id: 3, type: 'system', title: 'Update Sistem', message: 'Sistem telah diperbarui ke versi 2.1. Laporan otomatis kini sudah aktif.', time: '3 jam yang lalu', date: '27 April 2026', unread: false },
    { id: 4, type: 'presence', title: 'Keterlambatan', message: 'Guru Siti terdeteksi terlambat 15 menit dari jadwal.', time: '5 jam yang lalu', date: '27 April 2026', unread: false },
    { id: 5, type: 'student', title: 'Siswa Baru', message: 'Data siswa baru "M. Ridwan" telah berhasil diverifikasi.', time: 'Yesterday', date: '26 April 2026', unread: false },
  ]);

  const filteredNotifs = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const clearAll = () => {
    if (window.confirm('Hapus semua riwayat notifikasi?')) {
      setNotifications([]);
    }
  };

  return (
    <div className="notifications-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Riwayat Notifikasi</h1>
          <p className="page-subtitle">Pantau seluruh aktivitas dan pemberitahuan sistem Madrasah.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost text-danger" onClick={clearAll}>
            <Trash2 size={18} /> Bersihkan Semua
          </button>
        </div>
      </div>

      <div className="notifications-layout">
        <div className="glass-card notif-main-card">
          <div className="notif-tabs">
            <button className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Semua</button>
            <button className={`notif-tab ${activeTab === 'presence' ? 'active' : ''}`} onClick={() => setActiveTab('presence')}>Presensi</button>
            <button className={`notif-tab ${activeTab === 'religious' ? 'active' : ''}`} onClick={() => setActiveTab('religious')}>Ibadah</button>
            <button className={`notif-tab ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>Sistem</button>
          </div>

          <div className="notif-full-list">
            {filteredNotifs.length > 0 ? (
              filteredNotifs.map((notif) => (
                <div key={notif.id} className={`notif-row ${notif.unread ? 'unread' : ''}`} onClick={() => markAsRead(notif.id)}>
                  <div className={`notif-status-icon ${notif.type}`}>
                    {notif.type === 'presence' ? <User size={20} /> : 
                     notif.type === 'religious' ? <CheckCircle2 size={20} /> : 
                     <AlertCircle size={20} />}
                  </div>
                  <div className="notif-row-content">
                    <div className="notif-row-header">
                      <h3 className="notif-row-title">{notif.title}</h3>
                      <span className="notif-row-date">{notif.date} • {notif.time}</span>
                    </div>
                    <p className="notif-row-message">{notif.message}</p>
                  </div>
                  {notif.unread && <div className="unread-dot"></div>}
                  <button className="notif-more-btn">
                    <MoreVertical size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-notif">
                <Bell size={48} className="empty-icon" />
                <h3>Tidak ada notifikasi</h3>
                <p>Seluruh pemberitahuan baru akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>

        <div className="notif-sidebar-info">
          <div className="glass-card info-stat-card">
            <h4>Ringkasan</h4>
            <div className="stat-row-mini">
              <span>Belum Dibaca</span>
              <span className="badge-notif-count">{notifications.filter(n => n.unread).length}</span>
            </div>
            <div className="stat-row-mini">
              <span>Total Notifikasi</span>
              <span>{notifications.length}</span>
            </div>
          </div>

          <div className="premium-info-box mt-4">
            <AlertCircle size={20} className="info-icon" />
            <div className="info-content">
              <h4>Tips Notifikasi</h4>
              <p>Anda dapat mengatur jenis notifikasi yang ingin diterima melalui menu Pengaturan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
