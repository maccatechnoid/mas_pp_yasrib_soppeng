import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  FileText,
  Clock,
  MapPin,
  TrendingUp,
  Download,
  MoreVertical,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFromStorage, saveToStorage } from '../utils/storage';
import './TeacherStudy.css';

const TeacherStudy = () => {
  const [activeTab, setActiveTab] = useState('jadwal');
  const [sessions, setSessions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    topic: '',
    speaker: '',
    date: '',
    time: '',
    location: '',
    material: ''
  });

  useEffect(() => {
    const loadSessions = () => {
      const stored = getFromStorage('teacher_sessions');
      if (stored) {
        setSessions(stored);
      } else {
        const defaults = [
          {
            id: 1,
            topic: 'Kitab Riyadhus Shalihin',
            speaker: 'KH. Ahmad Fauzi',
            date: '2024-05-05',
            time: '08:00 - 09:30',
            location: 'Masjid Utama',
            status: 'Upcoming',
            material: 'Bab Ikhlas dan Niat',
            attendees: 0
          },
          {
            id: 2,
            topic: 'Tafsir Jalalain',
            speaker: 'Ust. Hamdan Syukri',
            date: '2024-05-01',
            time: '13:00 - 14:30',
            location: 'Aula Guru',
            status: 'Completed',
            material: 'Surah Al-Baqarah 1-5',
            attendees: 24
          }
        ];
        setSessions(defaults);
        saveToStorage('teacher_sessions', defaults);
      }
      setLoading(false);
    };

    setTimeout(loadSessions, 500);
  }, []);

  const handleAddSession = (e) => {
    e.preventDefault();
    const newSession = {
      id: Date.now(),
      topic: formData.topic,
      speaker: formData.speaker,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      material: formData.material || 'Belum Ditentukan',
      status: 'Upcoming',
      attendees: 0
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    saveToStorage('teacher_sessions', updated);
    setShowAddModal(false);
    setFormData({
      topic: '',
      speaker: '',
      date: '',
      time: '',
      location: '',
      material: ''
    });
  };

  const handlePresensi = (id) => {
    const attendeesCount = prompt("Masukkan jumlah guru yang hadir:", "25");
    if (attendeesCount === null) return;
    const count = parseInt(attendeesCount) || 0;
    
    const updated = sessions.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'Completed',
          attendees: count
        };
      }
      return s;
    });
    setSessions(updated);
    saveToStorage('teacher_sessions', updated);
  };

  const stats = [
    { label: 'Total Sesi', value: sessions.length, icon: <Calendar className="text-emerald-400" />, trend: '+2 bulan ini' },
    { label: 'Rata-rata Kehadiran', value: '92%', icon: <TrendingUp className="text-blue-400" />, trend: 'Sangat Baik' },
    { label: 'Materi Tersimpan', value: '12', icon: <BookOpen className="text-amber-400" />, trend: 'PDF/Catatan' },
  ];

  return (
    <div className="teacher-study-container">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <Users size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Kajian Keagamaan</h1>
            <p className="page-subtitle">Pusat pengembangan spiritual dan keilmuan Asatidz</p>
          </div>
        </div>
        <div className="header-actions-premium">
          <button className="btn-premium btn-primary-premium" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Sesi Baru</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="stat-icon-wrapper">
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-trend">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs Section */}
      <div className="tabs-wrapper">
        <div className="tabs-header">
          <button 
            className={`tab-item ${activeTab === 'jadwal' ? 'active' : ''}`}
            onClick={() => setActiveTab('jadwal')}
          >
            Jadwal Kajian
          </button>
          <button 
            className={`tab-item ${activeTab === 'materi' ? 'active' : ''}`}
            onClick={() => setActiveTab('materi')}
          >
            Materi & Kitab
          </button>
          <button 
            className={`tab-item ${activeTab === 'riwayat' ? 'active' : ''}`}
            onClick={() => setActiveTab('riwayat')}
          >
            Riwayat
          </button>
        </div>

        <div className="tab-content">
          <AnimatePresence mode="wait">
            {activeTab === 'jadwal' && (
              <motion.div 
                key="jadwal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="session-list"
              >
                {sessions.filter(s => s.status === 'Upcoming').map(session => (
                  <div key={session.id} className="session-card">
                    <div className="session-date-box">
                      <span className="day">{new Date(session.date).getDate()}</span>
                      <span className="month">{new Date(session.date).toLocaleString('id-ID', { month: 'short' })}</span>
                    </div>
                    <div className="session-main">
                      <div className="session-info">
                        <h3>{session.topic}</h3>
                        <div className="meta-items">
                          <span><Users size={14} /> {session.speaker}</span>
                          <span><Clock size={14} /> {session.time}</span>
                          <span><MapPin size={14} /> {session.location}</span>
                        </div>
                        <div className="material-tag">
                          <BookOpen size={14} />
                          <span>Materi: {session.material}</span>
                        </div>
                      </div>
                      <div className="session-actions">
                        <button className="presensi-btn" onClick={() => handlePresensi(session.id)}>Presensi</button>
                        <button className="icon-btn-secondary"><MoreVertical size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {sessions.filter(s => s.status === 'Upcoming').length === 0 && (
                  <div className="text-center text-muted py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Tidak ada jadwal kajian terdekat.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'materi' && (
              <motion.div 
                key="materi"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="material-grid"
              >
                {/* Mock Materials */}
                {[1, 2, 3].map(m => (
                  <div key={m} className="material-card">
                    <div className="file-icon">
                      <FileText size={32} />
                    </div>
                    <div className="material-info">
                      <h4>Ringkasan Kajian #{m}</h4>
                      <p>Diunggah pada 24 April 2024</p>
                    </div>
                    <button className="download-btn-small">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'riwayat' && (
              <motion.div 
                key="riwayat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="session-list"
              >
                {sessions.filter(s => s.status === 'Completed').map(session => (
                  <div key={session.id} className="session-card completed-session">
                    <div className="session-date-box completed">
                      <span className="day">{new Date(session.date).getDate()}</span>
                      <span className="month">{new Date(session.date).toLocaleString('id-ID', { month: 'short' })}</span>
                    </div>
                    <div className="session-main">
                      <div className="session-info">
                        <h3>{session.topic}</h3>
                        <div className="meta-items">
                          <span><Users size={14} /> {session.speaker}</span>
                          <span><Clock size={14} /> {session.time}</span>
                          <span><MapPin size={14} /> {session.location}</span>
                        </div>
                        <div className="material-tag">
                          <BookOpen size={14} />
                          <span>Materi: {session.material}</span>
                        </div>
                      </div>
                      <div className="session-actions">
                        <span className="attendees-badge">
                          <CheckCircle size={14} className="mr-1 text-emerald-600" />
                          {session.attendees || 0} Hadir
                        </span>
                        <button className="icon-btn-secondary"><MoreVertical size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {sessions.filter(s => s.status === 'Completed').length === 0 && (
                  <div className="text-center text-muted py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Belum ada riwayat kajian yang diselesaikan.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Session Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="modal-header">
                <h2>Tambah Sesi Baru</h2>
                <button className="close-modal" onClick={() => setShowAddModal(false)}><X size={20} /></button>
              </div>
              <form className="add-session-form" onSubmit={handleAddSession}>
                <div className="form-group-premium">
                  <label>Topik / Nama Kitab</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Tafsir Al-Mishbah" 
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group-premium mt-3">
                  <label>Materi / Pembahasan</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Pengantar Kitab / Bab 1" 
                    value={formData.material}
                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-row mt-3">
                  <div className="form-group-premium">
                    <label>Pemateri</label>
                    <input 
                      type="text" 
                      placeholder="Nama Ustaz/Kiai" 
                      value={formData.speaker}
                      onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Tanggal</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="form-row mt-3">
                  <div className="form-group-premium">
                    <label>Waktu</label>
                    <input 
                      type="text" 
                      placeholder="08:00 - 09:30" 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Lokasi</label>
                    <input 
                      type="text" 
                      placeholder="Masjid/Aula" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="form-actions mt-4">
                  <button type="button" className="btn btn-secondary-premium flex-1" onClick={() => setShowAddModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary-premium flex-1">Simpan Sesi</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherStudy;
