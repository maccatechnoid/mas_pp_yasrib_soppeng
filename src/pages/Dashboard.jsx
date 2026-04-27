import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutGrid, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Calendar,
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  BellRing,
  Sparkles,
  Quote,
  Zap,
  ClipboardCheck,
  FileText,
  CheckCircle,
  Bell,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import { getAllData, saveData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [masterData, setMasterData] = useState({
    org: {
      quotes: [],
      agendas: [],
      attendanceTrends: []
    },
    students: [],
    teachers: [],
    classes: [],
    subjects: [],
    slides: [],
    schedule: []
  });

  const [activeClass, setActiveClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Edit States
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [tempQuoteText, setTempQuoteText] = useState('');
  const [tempQuoteAuthor, setTempQuoteAuthor] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = () => {
      const data = getAllData();
      setMasterData(data);
    };

    loadData();
    
    const slideCount = masterData.slides?.length || 0;
    let slideTimer;
    if (slideCount > 0) {
      slideTimer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slideCount);
      }, 5000);
    }

    const quoteCount = masterData.org?.quotes?.length || 0;
    let quoteTimer;
    if (quoteCount > 0) {
      quoteTimer = setInterval(() => {
        setCurrentQuoteIdx((prev) => (prev + 1) % quoteCount);
      }, 8000);
    }

    window.addEventListener('user-data-updated', loadData);
    window.addEventListener('storage', loadData);

    return () => {
      if (slideTimer) clearInterval(slideTimer);
      if (quoteTimer) clearInterval(quoteTimer);
      window.removeEventListener('user-data-updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [masterData.slides?.length, masterData.org?.quotes?.length]);

  const getCurrentSession = () => {
    if (!masterData.schedule || masterData.schedule.length === 0) return null;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    
    return masterData.schedule.find(s => {
      const [start, end] = s.time.replace(/:/g, '.').split(' - ');
      const [sH, sM] = start.split('.').map(Number);
      const [eH, eM] = end.split('.').map(Number);
      
      const startMin = sH * 60 + sM;
      const endMin = eH * 60 + eM;
      
      return nowMin >= startMin && nowMin <= endMin;
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const currentSession = getCurrentSession();

  const displaySlides = masterData.slides?.length > 0 
    ? masterData.slides 
    : [
        { url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200&h=400&auto=format&fit=crop' },
        { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&h=400&auto=format&fit=crop' }
      ];

  const currentQuote = masterData.org?.quotes?.[currentQuoteIdx] || { text: "Menuntut ilmu adalah kewajiban bagi setiap muslim.", author: "Hadits" };

  const classBreakdown = (masterData.classes || []).map(cls => {
    const studentsInClass = (masterData.students || []).filter(s => s.class === cls);
    // Simulate real attendance from a hypothetical session
    const presentCount = studentsInClass.filter((_, i) => i % 5 !== 0).length; 
    return {
      name: cls,
      count: studentsInClass.length,
      attendance: studentsInClass.length > 0 ? Math.floor((presentCount / studentsInClass.length) * 100) : 100,
      students: studentsInClass.map((s, i) => ({
        ...s,
        status: i % 5 === 0 ? 'Alpa' : 'Hadir' // Mock status for preview
      }))
    };
  });

  const maleCount = (masterData.students || []).filter(s => s.gender === 'L').length;
  const femaleCount = (masterData.students || []).filter(s => s.gender === 'P').length;

  // Calendar Helper Functions
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const currentYear = currentTime.getFullYear();
  const currentMonth = currentTime.getMonth();
  
  const calendarDays = [];
  const totalDays = daysInMonth(currentYear, currentMonth);
  const startOffset = firstDayOfMonth(currentYear, currentMonth);
  
  // Empty cells for previous month
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  
  // Days of current month
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(i);
  }

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return (masterData.org?.agendas || []).filter(a => a.date === dateStr);
  };

  return (
    <div className="dashboard-container">
      {/* Premium Running Announcement */}
      <div className="running-announcement">
        <div className="announcement-label">
          <BellRing size={16} />
          <span>INFO TERBARU</span>
        </div>
        <div className="announcement-track">
          <p>
            {masterData.org?.runningText || 'Selamat Datang di Madrasah Hub • Sistem Presensi Terpadu Aktif •'}
          </p>
        </div>
      </div>


      {/* Royal Hero Section */}
      <section className="royal-hero">
        <div className="guardian-portrait chairman">
          <div className="portrait-frame">
            <img src={masterData.org?.chairmanPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"} alt="Ketua Yayasan" />
          </div>
          <div className="guardian-info">
            <span className="guardian-role">Ketua Yayasan</span>
            <h4 className="guardian-name">{masterData.org?.chairmanName || 'Dr. H. Ahmad Fauzi'}</h4>
          </div>
        </div>

        <div className="slideshow-center">
          <div className="slideshow-header">
            <h1 className="premium-title">{masterData.org?.dashboardTitle || 'Madrasah Hub Dashboard'}</h1>
            <p className="premium-tagline">{masterData.org?.dashboardTagline || 'Sistem Administrasi Terpadu & Presensi Cerdas'}</p>
          </div>
          <div className="slideshow-container">
            <img src={displaySlides[currentSlide].url} alt="Activity" className="slide-image" />
            <div className="slide-indicators">
              {displaySlides.map((_, i) => (
                <div key={i} className={`dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></div>
              ))}
            </div>
          </div>

          <div className="quote-widget-hero">
            {isEditingQuote ? (
              <div className="quote-edit-form">
                <textarea 
                  value={tempQuoteText}
                  onChange={(e) => setTempQuoteText(e.target.value)}
                  className="edit-quote-textarea"
                  placeholder="Isi Mutiara Hikmah..."
                />
                <div className="edit-quote-footer">
                  <input 
                    type="text"
                    value={tempQuoteAuthor}
                    onChange={(e) => setTempQuoteAuthor(e.target.value)}
                    className="edit-quote-author-input"
                    placeholder="Sumber/Penulis..."
                  />
                  <div className="edit-actions">
                    <button className="btn-save-quote" onClick={() => {
                      const newQuotes = [...(masterData.org.quotes || [])];
                      if (newQuotes[currentQuoteIdx]) {
                        newQuotes[currentQuoteIdx] = { text: tempQuoteText, author: tempQuoteAuthor };
                      } else {
                        newQuotes.push({ text: tempQuoteText, author: tempQuoteAuthor });
                      }
                      const updatedOrg = { ...masterData.org, quotes: newQuotes };
                      const updatedData = { ...masterData, org: updatedOrg };
                      setMasterData(updatedData);
                      localStorage.setItem('madrasah_org', JSON.stringify(updatedOrg));
                      setIsEditingQuote(false);
                    }}>
                      <Save size={14} /> Simpan
                    </button>
                    <button className="btn-cancel-quote" onClick={() => setIsEditingQuote(false)}>
                      <X size={14} /> Batal
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="quote-view-wrapper">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentQuoteIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="quote-content"
                  >
                    <p className="quote-text">{currentQuote.text}</p>
                    <span className="quote-author">— {currentQuote.author}</span>
                  </motion.div>
                </AnimatePresence>
                {user?.role === 'Admin' && (
                  <button className="quote-edit-btn" onClick={() => {
                    setTempQuoteText(currentQuote.text);
                    setTempQuoteAuthor(currentQuote.author);
                    setIsEditingQuote(true);
                  }}>
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="guardian-portrait principal">
          <div className="portrait-frame">
            <img src={masterData.org?.principalPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"} alt="Kepala Madrasah" />
          </div>
          <div className="guardian-info">
            <span className="guardian-role">Kepala Madrasah</span>
            <h4 className="guardian-name">{masterData.org?.principalName || 'K.H. Mustofa, M.Pd'}</h4>
          </div>
        </div>
      </section>

      {/* Main Stats Content */}
      <div className="dashboard-content-grid">
        <div className="stats-main">
          <div className="section-header">
            <h2 className="section-title">Pemantauan Kelas</h2>
            <p className="section-subtitle">Snapshot populasi dan kehadiran per rombel hari ini.</p>
          </div>

          <div className="mobile-class-selector mobile-only mb-6">
            <label className="config-label mb-2 block">Pilih Kelas untuk Dipantau</label>
            <CustomSelect 
              options={['Lihat Semua', ...classBreakdown.map(c => `Kelas ${c.name}`)]}
              value={activeClass ? `Kelas ${activeClass.name}` : 'Lihat Semua'}
              onChange={(val) => {
                if (val === 'Lihat Semua') setActiveClass(null);
                else {
                  const selected = classBreakdown.find(c => `Kelas ${c.name}` === val);
                  setActiveClass(selected);
                }
              }}
              icon={LayoutGrid}
            />
          </div>
          
          <div className="class-cards-grid desktop-only">
            <div 
              className={`glass-card class-stat-card all-classes-card ${activeClass === null ? 'active' : ''}`}
              onClick={() => setActiveClass(null)}
              style={{ cursor: 'pointer' }}
            >
              <div className="class-stat-header">
                <div className="class-icon q-absen"><Users size={20} /></div>
                <span className="class-name">Semua Kelas</span>
              </div>
              <div className="class-stat-body">
                <div className="big-number">{(masterData.students || []).length} <span className="unit">Total Siswa</span></div>
                <div className="all-classes-badge">Lihat Seluruh Database</div>
              </div>
            </div>
            {classBreakdown.map((cls, i) => (
              <div 
                key={i} 
                className={`glass-card class-stat-card ${activeClass?.name === cls.name ? 'active' : ''}`}
                onClick={() => setActiveClass(cls)}
                style={{ cursor: 'pointer' }}
              >
                <div className="class-stat-header">
                  <div className="class-icon"><LayoutGrid size={20} /></div>
                  <span className="class-name">Kelas {cls.name}</span>
                </div>
                <div className="class-stat-body">
                  <div className="big-number">{cls.count} <span className="unit">Siswa</span></div>
                  <div className="attendance-indicator">
                    <div className="attendance-bar">
                      <div className="fill" style={{ width: `${cls.attendance}%` }}></div>
                    </div>
                    <span className="percent">{cls.attendance}% Hadir</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Individual Student List */}
          <div className="glass-card class-detail-panel animate-slide-up">
            <div className="panel-header">
              <div className="header-info">
                <h3 className="panel-title">
                  {activeClass ? `Detail Kehadiran: Kelas ${activeClass.name}` : 'Daftar Semua Siswa'}
                </h3>
                <p className="panel-subtitle">
                  {activeClass ? 'Klik kartu kelas lain untuk berpindah data.' : 'Menampilkan seluruh database santri madrasah.'}
                </p>
              </div>
              <div className="panel-search">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Cari nama atau kelas..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="individual-status-list">
              <table className="dashboard-detail-table">
                <thead>
                  <tr>
                    <th>Nama Siswa</th>
                    <th>NISN</th>
                    {!activeClass && <th>Kelas</th>}
                    <th>Gender</th>
                    <th>Status Hari Ini</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeClass 
                    ? activeClass.students 
                    : [...(masterData.students || [])]
                        .sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
                        .map((s, i) => ({ ...s, status: i % 7 === 0 ? 'Izin' : i % 5 === 0 ? 'Alpa' : 'Hadir' }))
                  )
                    .filter(s => 
                      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (!activeClass && s.class?.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((student, idx) => (
                    <tr key={idx} className={!activeClass ? 'row-all-classes' : ''}>
                      <td className="st-name">{student.name}</td>
                      <td className="st-nisn">{student.nisn}</td>
                      {!activeClass && <td className="st-class">Kelas {student.class}</td>}
                      <td className="st-gender">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                      <td>
                        <span className={`status-pill ${student.status.toLowerCase()}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(activeClass ? (activeClass.students || []) : (masterData.students || [])).length === 0 && (
                <div className="empty-table-note">Belum ada data siswa untuk ditampilkan.</div>
              )}
            </div>
          </div>
        </div>

        <div className="stats-sidebar">
          {/* Live Session Widget */}
          <div className="glass-card sidebar-card live-session-card">
            <div className="live-header">
              <div className="live-badge">
                <span className="pulse-dot"></span>
                LIVE SESSION
              </div>
              <Clock size={18} className="text-muted" />
            </div>
            {currentSession ? (
              <div className="session-info">
                <div className="session-main">
                  <span className="session-label">Sedang Berlangsung:</span>
                  <h3 className="session-name">Jam Ke-{currentSession.label}</h3>
                  <p className="session-time">{currentSession.time} WITA</p>
                </div>
                <div className="session-footer">
                  <Sparkles size={16} className="text-primary" />
                  <span>Sistem Presensi Aktif</span>
                </div>
              </div>
            ) : (
              <div className="session-info standby">
                <div className="standby-visual">
                  <div className="standby-icon">
                    <Sparkles size={24} />
                  </div>
                  <div className="standby-text">
                    <span className="standby-label">Waktu Standby</span>
                    <h4 className="standby-status">Masa Istirahat / Selesai KBM</h4>
                  </div>
                </div>
                <div className="big-time-display">
                  <span className="current-hour">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="time-zone">WITA</span>
                </div>
                <p className="standby-note">Sistem akan otomatis mendeteksi jam pelajaran berikutnya.</p>
              </div>
            )}
          </div>

          <div className="glass-card sidebar-card alert-card">
            <div className="card-header">
              <AlertCircle size={20} className="text-danger" />
              <h3 className="card-title">Ketidakhadiran Hari Ini</h3>
            </div>
            <div className="alert-list">
              <div className="alert-item empty">
                <p>Seluruh kelas telah hadir atau belum melakukan absen.</p>
              </div>
            </div>
          </div>

          {/* Interactive Calendar of Events */}
          <div className="glass-card sidebar-card calendar-premium-card">
            <div className="card-header">
              <Calendar size={18} className="text-primary" />
              <h3 className="card-title">Kalender Akademik</h3>
              <div className="calendar-month-label">
                {currentTime.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <div className="mini-calendar-grid">
              {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map(d => (
                <div key={d} className="calendar-day-head">{d}</div>
              ))}
              {calendarDays.map((day, idx) => {
                const events = getEventsForDay(day);
                const isToday = day === currentTime.getDate();
                return (
                  <div key={idx} className={`calendar-day-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${events.length > 0 ? 'has-event' : ''}`}>
                    {day}
                    {events.length > 0 && <span className="event-dot"></span>}
                  </div>
                );
              })}
            </div>

            <div className="upcoming-events-list">
              <h4 className="upcoming-title">Agenda Terdekat</h4>
              {(masterData.org?.agendas || []).length > 0 ? (
                (masterData.org?.agendas || []).slice(0, 3).map((item, i) => (
                  <div key={i} className="agenda-item-premium">
                    <div className={`agenda-status-indicator ${item.category.toLowerCase()}`}></div>
                    <div className="agenda-details">
                      <h5 className="agenda-name">{item.title}</h5>
                      <div className="agenda-meta">
                        <span className="agenda-date-text">
                          {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className={`agenda-category-badge ${item.category.toLowerCase()}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-agenda">Tidak ada agenda terdekat</div>
              )}
            </div>
          </div>

          {/* Attendance Trend Widget */}
          <div className="glass-card sidebar-card trend-card">
            <div className="card-header">
              <TrendingUp size={18} className="text-success" />
              <h3 className="card-title">Tren Kehadiran</h3>
            </div>
            <div className="trend-content">
              <div className="trend-chart-mini">
                {(masterData.org?.attendanceTrends || []).map((t, i) => (
                  <div key={i} className="chart-bar-wrap">
                    <div className="chart-bar" style={{ height: `${t.value}%` }}>
                      <span className="bar-tooltip">{t.value}%</span>
                    </div>
                    <span className="bar-label">{t.day}</span>
                  </div>
                ))}
              </div>
              <p className="trend-note">* Rata-rata tingkat kehadiran pekan ini.</p>
            </div>
          </div>

          <div className="glass-card sidebar-card gender-summary">
            <h3 className="card-title">Populasi Santri</h3>
            <div className="gender-bars">
              <div className="gender-row">
                <div className="row-label">Putra (L)</div>
                <div className="row-bar-container">
                  <div className="row-bar male" style={{ width: `${(maleCount / (maleCount + femaleCount || 1)) * 100}%` }}></div>
                </div>
                <div className="row-value">{maleCount}</div>
              </div>
              <div className="gender-row">
                <div className="row-label">Putri (P)</div>
                <div className="row-bar-container">
                  <div className="row-bar female" style={{ width: `${(femaleCount / (maleCount + femaleCount || 1)) * 100}%` }}></div>
                </div>
                <div className="row-value">{femaleCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
