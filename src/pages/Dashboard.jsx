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
  CheckCircle2,
  Bell,
  Edit2,
  Save,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
  Award,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import CustomSelect from '../components/CustomSelect';
import { getAllData, saveData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Widget Configuration State
  const [widgetConfig, setWidgetConfig] = useState(() => {
    const saved = localStorage.getItem('dashboardWidgetConfig');
    return saved ? { guruTeladan: true, ...JSON.parse(saved) } : {
      ringkasan: true,
      statistik: true,
      log: true,
      ketidakhadiran: true,
      kalender: true,
      tren: true,
      populasi: true,
      trenGuru: true,
      topAlpa: true,
      guruTeladan: true,
      pemantauanKelas: true
    };
  });
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem('dashboardWidgetConfig', JSON.stringify(widgetConfig));
  }, [widgetConfig]);

  // Quick Edit States
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [tempQuoteText, setTempQuoteText] = useState('');
  const [tempQuoteAuthor, setTempQuoteAuthor] = useState('');
  const [showGuruTeladanInfo, setShowGuruTeladanInfo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 12) return { status: 'Kegiatan Belajar Mengajar Sedang Berlangsung', badge: 'LIVE', color: 'var(--primary)' };
    if (hour >= 12 && hour < 13) return { status: 'Masa Istirahat / Sholat Dzuhur', badge: 'BREAK', color: 'var(--warning)' };
    return { status: 'Masa Istirahat / Selesai KBM', badge: 'OFFLINE', color: '#94a3b8' };
  };

  const currentSessionInfo = getCurrentSession();

  // Derived Data
  const displaySlides = masterData.slides && masterData.slides.length > 0
    ? masterData.slides
    : [
      { id: 1, url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop', title: 'Madrasah Hub', desc: 'Sistem Administrasi Terpadu' },
      { id: 2, url: 'https://images.unsplash.com/photo-1577891728595-06474c5818f7?q=80&w=800&auto=format&fit=crop', title: 'Pendidikan Berkualitas', desc: 'Mencetak Generasi Rabbani' }
    ];

  const currentQuote = (masterData.org?.quotes && masterData.org.quotes[currentQuoteIdx]) || { text: 'Ilmu tanpa amal bagaikan pohon tanpa buah.', author: 'Pepatah Arab' };

  const students = masterData.students || [];
  const maleCount = students.filter(s => s.gender === 'L').length;
  const femaleCount = students.filter(s => s.gender === 'P').length;

  const classBreakdown = (masterData.classes || []).map(clsName => {
    const classStudents = students.filter(s => s.class === clsName);
    return {
      name: clsName,
      count: classStudents.length,
      attendance: 90 + Math.floor(Math.random() * 10), // Mock attendance
      students: classStudents.map((s, i) => ({ ...s, status: i % 7 === 0 ? 'Izin' : i % 5 === 0 ? 'Alpa' : 'Hadir' }))
    };
  });

  const currentSession = (masterData.schedule || []).find(s => {
    if (s.type !== 'Belajar') return false;
    const [start, end] = s.time.split(' - ');
    const nowStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return nowStr >= start && nowStr <= end;
  });

  const getCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const calendarDays = getCalendarDays();

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (masterData.org?.agendas || []).filter(a => a.date === dateStr);
  };

  const teacherAttendanceTrends = [
    { day: 'Sen', value: 95 },
    { day: 'Sel', value: 90 },
    { day: 'Rab', value: 93 },
    { day: 'Kam', value: 85 },
    { day: 'Jum', value: 98 },
    { day: 'Sab', value: 80 }
  ];

  const topAbsentTeachers = [
    { name: 'Ahmad Fauzi, S.Pd', absentCount: 6, role: 'Guru Matematika' },
    { name: 'Ustadz Ridwan, S.Ag', absentCount: 5, role: 'Guru PAI' },
    { name: 'Drs. H. M. Yasin', absentCount: 4, role: 'Guru Fiqih' },
    { name: 'Laila Husna, S.Si', absentCount: 4, role: 'Guru Biologi' },
    { name: 'Hj. Siti Aminah, M.Pd', absentCount: 3, role: 'Guru B. Indonesia' },
    { name: 'Budi Santoso, S.Kom', absentCount: 3, role: 'Guru TIK' },
    { name: 'Rini Astuti, S.Pd', absentCount: 2, role: 'Guru B. Inggris' },
    { name: 'Herman Pelani, S.Or', absentCount: 2, role: 'Guru PJOK' },
    { name: 'Siti Nurhaliza, S.Ag', absentCount: 1, role: 'Guru Sejarah' },
    { name: 'Jamaluddin, M.A.', absentCount: 1, role: 'Guru Aqidah' }
  ];

  const topTeachers = [
    { name: 'Siti Khadijah, S.Pd', category: 'Inovasi Belajar', role: 'Guru Kimia' },
    { name: 'Bambang Irawan, M.Si', category: 'Disiplin Waktu', role: 'Guru Fisika' },
    { name: 'Nisa Sabyan, S.Ag', category: 'Interaksi Siswa', role: 'Guru SKI' },
  ];

  const allDashboardStudents = [...(masterData.students || [])]
    .sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
    .map((s, i) => ({ ...s, status: i % 7 === 0 ? 'Izin' : i % 5 === 0 ? 'Alpa' : 'Hadir' }));

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
            {masterData.org?.runningText || 'Selamat Datang di Madrasah Hub • Sistem Presensi Terpadu Aktif • Tingkatkan Kedisiplinan Demi Masa Depan Gemilang •'}
          </p>
        </div>
      </div>

      {/* Royal Hero Section - Premium Madrasah Identity */}
      <section className="royal-hero animate-fade-in">
        <div className="guardian-portrait chairman">
          <div className="portrait-frame">
            <img src={masterData.org?.chairmanPhoto || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&auto=format&fit=crop"} alt="Ketua Yayasan" />
          </div>
          <div className="guardian-info">
            <span className="guardian-role">Ketua Yayasan</span>
            <h4 className="guardian-name">{masterData.org?.chairmanName || 'K.H. Muhammad Taslim Basri Daud, Lc'}</h4>
          </div>
        </div>

        <div className="slideshow-center">
          <div className="slideshow-header">
            <h1 className="premium-title">{masterData.org?.appName || 'MAS PP YASRIB SOPPENG'}</h1>
            <p className="premium-tagline">{masterData.org?.tagline || 'Mencetak Generasi Cerdas, Berakhlak, dan Berkemandirian.'}</p>
          </div>
          <div className="slideshow-container">
            <img
              src={displaySlides[currentSlide]?.url}
              alt={displaySlides[currentSlide]?.title}
              className="slide-image"
            />
            <div className="slide-indicators">
              {displaySlides.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
          </div>
          <div className="hero-quote-footer">
            <p className="quote-text-mini">
              {currentQuote.text}
            </p>
            <span className="quote-author-mini">— {currentQuote.author}</span>
          </div>
        </div>

        <div className="guardian-portrait principal">
          <div className="portrait-frame">
            <img src={masterData.org?.principalPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"} alt="Kepala Madrasah" />
          </div>
          <div className="guardian-info">
            <span className="guardian-role">Kepala Madrasah</span>
            <h4 className="guardian-name">{masterData.org?.principalName || 'Drs. Muhammad Hilmi, M.Pd'}</h4>
          </div>
        </div>
      </section>

      {/* Premium Live Session Section - CENTERED & GLOWING */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="premium-hero-widget-container animate-fade-in"
      >
        <div className="glass-card main-live-widget">
          <div className="widget-inner-glow"></div>

          <div className="clock-session-row">
            <div className="left-clock-col">
              <div className="live-status-header">
                <div className="live-badge-premium-glow">
                  <span className="pulse-ring"></span>
                  <span className="badge-text">{currentSessionInfo.badge} SESSION</span>
                </div>
              </div>

              <div className="main-clock-display">
                <div className="clock-wrapper">
                  <h1 className="digital-time-mega">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </h1>
                  <div className="time-metadata">
                    <span className="timezone-label">WITA</span>
                    <span className="date-label">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="session-detail-card">
              <div className="session-icon-circle" style={{ background: currentSessionInfo.color }}>
                <Zap size={28} fill="white" />
              </div>
              <div className="session-text-info">
                <span className="label-standby">STATUS SAAT INI</span>
                <h2 className="status-main-text">{currentSessionInfo.status}</h2>
                <p className="status-sub-text">Sistem otomatis mendeteksi jadwal KBM secara real-time.</p>
              </div>
            </div>
          </div>

          <div className="widget-decorative-elements">
            <div className="circle-grad-1"></div>
            <div className="circle-grad-2"></div>
          </div>
        </div>
      </motion.section>


      {/* Main Stats Content */}
      <div className="dashboard-settings-container" style={{ marginBottom: '1.5rem' }}>
        <div className="dashboard-settings-toggle" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              setShowWidgetSettings(!showWidgetSettings);
            }}
            onClick={() => setShowWidgetSettings(!showWidgetSettings)}
            className="btn-atur-widget"
          >
            <Settings size={18} color="white" />
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>Atur Widget</span>
          </button>
        </div>

        <AnimatePresence>
          {showWidgetSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="glass-card widget-settings-menu mb-6 p-6"
              style={{ overflow: 'hidden', width: '100%' }}
            >

              <div className="widget-toggles" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px 24px' }}>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.ringkasan} onChange={(e) => setWidgetConfig({ ...widgetConfig, ringkasan: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Ringkasan Hari Ini
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.statistik} onChange={(e) => setWidgetConfig({ ...widgetConfig, statistik: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Statistik Kehadiran
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.log} onChange={(e) => setWidgetConfig({ ...widgetConfig, log: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Log Aktivitas Terbaru
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.ketidakhadiran} onChange={(e) => setWidgetConfig({ ...widgetConfig, ketidakhadiran: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Ketidakhadiran Hari Ini
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.pemantauanKelas} onChange={(e) => setWidgetConfig({ ...widgetConfig, pemantauanKelas: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Pemantauan Kelas
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.kalender} onChange={(e) => setWidgetConfig({ ...widgetConfig, kalender: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Kalender Akademik
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.tren} onChange={(e) => setWidgetConfig({ ...widgetConfig, tren: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Tren Kehadiran
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.populasi} onChange={(e) => setWidgetConfig({ ...widgetConfig, populasi: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Populasi Santri
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.trenGuru} onChange={(e) => setWidgetConfig({ ...widgetConfig, trenGuru: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  Tren Kehadiran Guru
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={widgetConfig.topAlpa} onChange={(e) => setWidgetConfig({ ...widgetConfig, topAlpa: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                  10 Besar Guru Sering Alpa
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="dashboard-content-grid" style={{ gridTemplateColumns: widgetConfig.pemantauanKelas ? undefined : '1fr' }}>
        {widgetConfig.pemantauanKelas && (
          <div className="stats-main">
            <div className="section-header">
              <h2 className="section-title">Pemantauan Kelas</h2>
            </div>

            <div className="class-chart-container glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Grafik Populasi & Kehadiran per Kelas</h3>
                </div>
                {activeClass && (
                  <button
                    onClick={() => setActiveClass(null)}
                    style={{
                      fontSize: '0.85rem',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      color: '#3b82f6',
                      border: '1px solid #3b82f6',
                      background: 'rgba(59, 130, 246, 0.1)',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Tampilkan Semua Kelas
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#3b82f6' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Total Siswa</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#10b981' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>Kehadiran (%)</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={classBreakdown} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" orientation="left" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Total Siswa"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    onClick={(data, index) => setActiveClass(classBreakdown[index])}
                    style={{ cursor: 'pointer' }}
                    animationDuration={1500}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="attendance"
                    name="Kehadiran (%)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    onClick={(data, index) => setActiveClass(classBreakdown[index])}
                    style={{ cursor: 'pointer' }}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Individual Student List */}
            <div className="glass-card class-detail-panel animate-slide-up">
              <div className="panel-header">
                <div className="header-info">
                  <h3 className="panel-title">
                    {activeClass ? `Detail Kehadiran: Kelas ${activeClass.name}` : 'Daftar Semua Siswa'}
                  </h3>
                  <p className="panel-subtitle">
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
                      : allDashboardStudents
                    )
                      .filter(s =>
                        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (!activeClass && s.class?.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((student, idx) => (
                        <tr
                          key={idx}
                          className={!activeClass ? 'row-all-classes clickable-row' : 'clickable-row'}
                          onClick={() => navigate(`/student/${student.id}`)}
                          style={{ cursor: 'pointer' }}
                        >
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

            {/* Vertical Widgets in Main Column */}
            <div className="dashboard-main-column-widgets" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
              {/* Attendance Trend Widget */}
              {widgetConfig.tren && (
                <div className="glass-card trend-card animate-fade-in" style={{ padding: '20px' }}>
                  <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <TrendingUp size={18} className="text-success" />
                    <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Tren Kehadiran</h3>
                  </div>
                  <div className="trend-content" style={{ height: '180px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={masterData.org?.attendanceTrends || [
                        { day: 'Sen', value: 85 },
                        { day: 'Sel', value: 88 },
                        { day: 'Rab', value: 92 },
                        { day: 'Kam', value: 90 },
                        { day: 'Jum', value: 95 },
                        { day: 'Sab', value: 89 }
                      ]}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <RechartsTooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="trend-note" style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>* Rata-rata tingkat kehadiran pekan ini.</p>
                </div>
              )}

              {widgetConfig.populasi && (
                <div className="glass-card gender-summary animate-fade-in" style={{ padding: '20px' }}>
                  <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Users size={18} className="text-primary" />
                    <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Populasi Santri</h3>
                  </div>
                  <div style={{ height: '160px', width: '100%', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Putra', value: maleCount },
                            { name: 'Putri', value: femaleCount }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#065f46" />
                          <Cell fill="#10b981" />
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)', textAlign: 'center',
                      pointerEvents: 'none'
                    }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'block', color: '#0f172a' }}>{maleCount + femaleCount}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Total</span>
                    </div>
                  </div>
                  <div className="gender-legend" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#065f46' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>Putra: {maleCount}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>Putri: {femaleCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Attendance Trend Widget */}
              {widgetConfig.trenGuru && (
                <div className="glass-card trend-card animate-fade-in" style={{ padding: '20px' }}>
                  <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <TrendingUp size={18} className="text-primary" />
                    <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>Tren Kehadiran Guru</h3>
                  </div>
                  <div className="trend-content" style={{ height: '180px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teacherAttendanceTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="trend-note" style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>* Persentase kehadiran guru mengajar pekan ini.</p>
                </div>
              )}

              {/* Interactive Calendar of Events */}
              {widgetConfig.kalender && (
                <div className="glass-card calendar-premium-card animate-fade-in" style={{ padding: '20px' }}>
                  <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={20} style={{ color: '#3b82f6' }} />
                    </div>
                    <div>
                      <h3 className="card-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Kalender Akademik</h3>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                    <div>
                      <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#f8fafc', padding: '6px 12px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                        <button
                          onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                          style={{ padding: '4px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <div className="calendar-month-label" style={{ fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                          {calendarDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                          onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                          style={{ padding: '4px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <div className="mini-calendar-grid">
                        {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
                          <div key={`${d}-${i}`} className="calendar-day-head">{d}</div>
                        ))}
                        {calendarDays.map((day, idx) => {
                          const events = getEventsForDay(day);
                          const isToday = day === currentTime.getDate() && calendarDate.getMonth() === currentTime.getMonth() && calendarDate.getFullYear() === currentTime.getFullYear();
                          return (
                            <div key={idx} className={`calendar-day-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${events.length > 0 ? 'has-event' : ''}`}>
                              {day}
                              {events.length > 0 && <span className="event-dot"></span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="upcoming-events-list">
                      <h4 className="upcoming-title" style={{ marginTop: 0, marginBottom: '16px' }}>Agenda Terdekat</h4>
                      {(masterData.org?.agendas || []).length > 0 ? (
                        (masterData.org?.agendas || []).map((item, i) => (
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
                </div>
              )}
            </div>

          </div>
        )}

        <div className="stats-sidebar">
          {/* Ringkasan Hari Ini */}
          {widgetConfig.ringkasan && (
            <div className="glass-card sidebar-card overview-today-card animate-fade-in">
              <div className="card-header">
                <Sparkles size={20} className="text-accent" />
                <h3 className="card-title">Ringkasan Hari Ini</h3>
              </div>
              <div className="today-stats-mini">
                <div className="today-stat-item">
                  <div className="stat-label">Kehadiran Santri</div>
                  <div className="stat-value-group">
                    <span className="v-main">92%</span>
                    <span className="v-sub">+2% dari kemarin</span>
                  </div>
                  <div className="mini-bar"><div className="fill" style={{ width: '92%' }}></div></div>
                </div>
                <div className="today-stat-item">
                  <div className="stat-label">Jurnal Terisi</div>
                  <div className="stat-value-group">
                    <span className="v-main">14/18</span>
                    <span className="v-sub">Guru Mengajar</span>
                  </div>
                  <div className="mini-bar"><div className="fill" style={{ width: '77%', background: '#3b82f6' }}></div></div>
                </div>
              </div>
            </div>
          )}

          {/* Statistik Kehadiran */}
          {widgetConfig.statistik && (
            <div className="glass-card sidebar-card overview-attendance-trends animate-fade-in">
              <div className="card-header">
                <ClipboardCheck size={20} className="text-success" />
                <h3 className="card-title">Statistik Kehadiran</h3>
              </div>
              <div className="premium-trends-horizontal" style={{ marginTop: '1.25rem' }}>
                {[
                  { day: 'Sen', val: 85 },
                  { day: 'Sel', val: 92 },
                  { day: 'Rab', val: 78 },
                  { day: 'Kam', val: 95 },
                  { day: 'Jum', val: 88 }
                ].map((d, i) => (
                  <div key={i} className="trend-row">
                    <span className="trend-day">{d.day}</span>
                    <div className="trend-bar-container">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.val}%` }}
                        className="trend-bar-fill"
                      ></motion.div>
                    </div>
                    <span className="trend-perc">{d.val}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Aktivitas Terbaru */}
          {widgetConfig.log && (
            <div className="glass-card sidebar-card log-panel-premium animate-fade-in">
              <div className="card-header">
                <Clock size={20} className="text-primary" />
                <h3 className="card-title">Log Aktivitas Terbaru</h3>
              </div>
              <div className="premium-log-list" style={{ marginTop: '1.25rem' }}>
                {allDashboardStudents.filter(s => s.status !== 'Hadir').slice(0, 4).map((s, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={s.id}
                    className="premium-log-item"
                  >
                    <div className={`log-indicator ${s.status.toLowerCase()}`}></div>
                    <div className="log-content">
                      <div className="log-main">
                        <span className="log-name">{s.name}</span>
                        <span className={`log-badge ${s.status.toLowerCase()}`}>{s.status}</span>
                      </div>
                      <span className="log-time">Baru saja • Kelas {s.class}</span>
                    </div>
                  </motion.div>
                ))}
                {allDashboardStudents.filter(s => s.status !== 'Hadir').length === 0 && (
                  <div className="log-empty">Belum ada aktivitas hari ini</div>
                )}
              </div>
            </div>
          )}

          {/* Ketidakhadiran Hari Ini */}
          {widgetConfig.ketidakhadiran && (
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
          )}




          {/* Top Absent Teachers Widget */}
          {widgetConfig.topAlpa && (
            <div className="glass-card sidebar-card top-absent-card animate-fade-in">
              <div className="card-header">
                <AlertCircle size={18} className="text-danger" />
                <h3 className="card-title">10 Besar Guru Sering Alpa</h3>
              </div>
              <div className="top-absent-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topAbsentTeachers.map((t, i) => (
                  <div key={i} className="absent-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dark)' }}>{i + 1}. {t.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.role}</span>
                    </div>
                    <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {t.absentCount} Alpa
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Teachers Widget */}
          {widgetConfig.guruTeladan && (
            <div className="glass-card sidebar-card top-teachers-card animate-fade-in" style={{ marginTop: '16px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} className="text-warning" style={{ color: '#eab308' }} />
                  <h3 className="card-title">Guru Teladan Bulan Ini</h3>
                </div>
                <button
                  onClick={() => setShowGuruTeladanInfo(true)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title="Info Penilaian Guru Teladan"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="top-teachers-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topTeachers.map((t, i) => (
                  <div key={i} className="teacher-award-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(234, 179, 8, 0.05)', borderRadius: '8px', borderLeft: '3px solid #eab308' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dark)' }}>{t.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.role}</span>
                    </div>
                    <div style={{ background: '#fef08a', color: '#ca8a04', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {t.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Guru Teladan Info Modal */}
      <AnimatePresence>
        {showGuruTeladanInfo && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGuruTeladanInfo(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              className="modal-content glass-card"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}
            >
              <button
                onClick={() => setShowGuruTeladanInfo(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              >
                <X size={16} color="#64748b" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#fef08a', padding: '10px', borderRadius: '12px', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={24} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Tolak Ukur Penilaian</h2>
              </div>

              <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '16px' }}>Penentuan Guru Teladan bulan ini didasarkan pada perhitungan otomatis dari sistem Madrasah Hub dengan kriteria sebagai berikut:</p>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li><strong>Kedisiplinan Waktu (25%):</strong> Tingkat kehadiran tepat waktu, rasio alpa/izin, dan ketepatan memulai jam pelajaran.</li>
                  <li><strong>Kelengkapan Administrasi (25%):</strong> Kepatuhan mengisi Jurnal Mengajar harian, RPP, dan input nilai tepat waktu.</li>
                  <li><strong>Inovasi Belajar (30%):</strong> Peningkatan rata-rata nilai kelas, penggunaan media interaktif, dan evaluasi positif dari siswa.</li>
                  <li><strong>Interaksi & Ekstrakurikuler (20%):</strong> Keaktifan dalam pembinaan siswa di luar jam kelas wajib dan partisipasi kegiatan madrasah.</li>
                </ul>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowGuruTeladanInfo(false)}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                >
                  Mengerti
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
