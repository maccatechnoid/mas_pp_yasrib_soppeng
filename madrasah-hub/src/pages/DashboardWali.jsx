import React, { useState, useEffect } from 'react';
import {
  Users, ClipboardCheck, BookOpen, TrendingUp, Heart, Calendar,
  ChevronRight, ChevronLeft, BellRing, AlertCircle,
  CheckCircle2, MessageSquare, Award, GraduationCap, Zap, FileText
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getAllData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import './DashboardWaliKelas.css';

const DashboardWaliKelas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], classes: [], subjects: [], org: {}, allowances: [] });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('kehadiran');

  // Kunci data lokal agar tidak memicu infinite re-render loop saat chart mobile berubah ukuran
  useEffect(() => {
    const localData = getAllData();
    if (localData) setData(localData);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getSessionStatus = () => {
    const h = currentTime.getHours();
    if (h >= 7 && h < 12) return { label: 'KBM BERLANGSUNG', color: '#10b981' };
    if (h >= 12 && h < 13) return { label: 'ISTIRAHAT', color: '#f59e0b' };
    return { label: 'DI LUAR JAM KBM', color: '#94a3b8' };
  };
  const session = getSessionStatus();

  const homerooms = data.org?.homerooms || {};
  const myClass = Object.entries(homerooms).find(([, teacher]) =>
    teacher === user?.name
  )?.[0] || (data.classes?.[0] || null);

  const classStudents = (data.students || []).filter(s => s.class === myClass);
  const totalStudents = classStudents.length;
  const maleCount = classStudents.filter(s => s.gender === 'L').length;
  const femaleCount = classStudents.filter(s => s.gender === 'P').length;

  const attendanceData = classStudents.map((s, i) => ({
    ...s,
    status: i % 9 === 0 ? 'Alpa' : i % 6 === 0 ? 'Izin' : i % 11 === 0 ? 'Sakit' : 'Hadir',
  }));

  const hadirCount = attendanceData.filter(s => s.status === 'Hadir').length;
  const izinCount = attendanceData.filter(s => s.status === 'Izin').length;
  const sakitCount = attendanceData.filter(s => s.status === 'Sakit').length;
  const alpaCount = attendanceData.filter(s => s.status === 'Alpa').length;

  const attendancePercent = totalStudents > 0 ? Math.round((hadirCount / totalStudents) * 100) : 0;

  const weeklyTrend = [
    { day: 'Sen', hadir: 90 }, { day: 'Sel', hadir: 93 },
    { day: 'Rab', hadir: 88 }, { day: 'Kam', hadir: 95 },
    { day: 'Jum', hadir: 97 }, { day: 'Sab', hadir: 85 }
  ];

  const nilaiSiswa = (data.subjects || []).slice(0, 5).map(sub => ({
    mapel: sub.length > 12 ? sub.slice(0, 12) + '...' : sub,
    rata: 78
  }));

  const bkCases = [
    { student: classStudents[0]?.name || 'Ahmad Hakim', type: 'Keterlambatan', point: -5, date: '2026-06-18' }
  ];

  const financeData = [
    { student: classStudents[0]?.name || 'Ahmad Hakim', status: 'Lunas', amount: 450000 }
  ];

  const paidCount = financeData.filter(f => f.status === 'Lunas').length;

  const getCalendarDays = () => {
    const y = calendarDate.getFullYear(), m = calendarDate.getMonth();
    const fd = new Date(y, m, 1).getDay();
    const dim = new Date(y, m + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < fd; i++) days.push(null);
    for (let i = 1; i <= dim; i++) days.push(i);
    return days;
  };

  const pieData = [
    { name: 'Hadir', value: hadirCount, color: '#10b981' },
    { name: 'Sakit', value: sakitCount, color: '#3b82f6' },
    { name: 'Izin', value: izinCount, color: '#f59e0b' },
    { name: 'Alpa', value: alpaCount, color: '#ef4444' },
  ];

  const tabs = [
    { id: 'kehadiran', label: 'Kehadiran', icon: <ClipboardCheck size={15} /> },
    { id: 'nilai', label: 'Nilai', icon: <BookOpen size={15} /> },
    { id: 'bk', label: 'Poin BK', icon: <Heart size={15} /> },
    { id: 'keuangan', label: 'Keuangan', icon: <Zap size={15} /> },
  ];

  return (
    <div className="homeroom-dashboard">
      <div className="hd-header">
        <div className="hd-header-left">
          <h1 className="hd-title">{getGreeting()}, {user?.name || 'Ustadz/ah'}!</h1>
          <p className="hd-subtitle">Wali Kelas: <strong className="hd-class-name">{myClass || '—'}</strong></p>
        </div>
        <div className="hd-clock-card">
          <span className="hd-clock-date">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <span className="hd-clock-divider">•</span>
          <div className="hd-clock-time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
          <div className="hd-session-badge" style={{ background: session.color }}>{session.label}</div>
        </div>
      </div>

      <div className="hd-announcement">
        <BellRing size={14} />
        <div className="hd-announcement-track">
          <p>{data.org?.runningText || 'Selamat Datang di Dashboard Wali Kelas • Pantau perkembangan siswa Anda •'}</p>
        </div>
      </div>

      <div className="hd-stats-row">
        <div className="hd-stat accent-blue">
          <div className="hd-stat-icon"><Users size={22} /></div>
          <div className="hd-stat-body"><span className="hd-stat-val">{totalStudents}</span><span className="hd-stat-label">Total Siswa</span></div>
        </div>
        <div className="hd-stat accent-green" onClick={() => setActiveTab('kehadiran')}>
          <div className="hd-stat-icon"><CheckCircle2 size={22} /></div>
          <div className="hd-stat-body"><span className="hd-stat-val">{attendancePercent}%</span><span className="hd-stat-label">Kehadiran</span></div>
        </div>
        <div className="hd-stat accent-amber" onClick={() => setActiveTab('bk')}>
          <div className="hd-stat-icon"><AlertCircle size={22} /></div>
          <div className="hd-stat-body"><span className="hd-stat-val">{alpaCount}</span><span className="hd-stat-label">Siswa Alpa</span></div>
        </div>
        <div className="hd-stat accent-purple" onClick={() => setActiveTab('keuangan')}>
          <div className="hd-stat-icon"><Zap size={22} /></div>
          <div className="hd-stat-body"><span className="hd-stat-val">{paidCount}</span><span className="hd-stat-label">SPP Lunas</span></div>
        </div>
      </div>

      <div className="hd-quick-actions">
        <button className="hd-qa-btn qa-green" onClick={() => navigate('/presensi')}><ClipboardCheck size={18} /> <span>Absen Kelas</span></button>
        <button className="hd-qa-btn qa-blue" onClick={() => navigate('/portal-akademik')}><MessageSquare size={18} /> <span>Portal Akademik</span></button>
        <button className="hd-qa-btn qa-amber" onClick={() => navigate('/konseling')}><Heart size={18} /> <span>Catatan BK</span></button>
        <button className="hd-qa-btn qa-purple" onClick={() => navigate('/finance')}><FileText size={18} /> <span>Cek Keuangan</span></button>
      </div>

      <div className="hd-main-grid">
        <div className="hd-col-main">
          <div className="hd-tabs">
            {tabs.map(t => (
              <button key={t.id} className={`hd-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'kehadiran' && (
            <div className="hd-tab-content">
              <div className="hd-attendance-summary">
                <div className="hd-pie-wrapper">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="hd-pie-center">
                    <span className="hd-pie-pct">{attendancePercent}%</span>
                    <span className="hd-pie-sub">Hadir</span>
                  </div>
                </div>
                <div className="hd-att-legend">
                  {pieData.map((d, i) => (
                    <div key={i} className="hd-att-legend-item">
                      <div className="hd-att-dot" style={{ background: d.color }} />
                      <span>{d.name}: <strong>{d.value} siswa</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Tambahkan render Tab Lain (nilai, bk, keuangan) secara terisolasi aman seperti di atas */}
        </div>

        <div className="hd-col-side">
          <div className="hd-class-card">
            <div className="hd-class-card-header">
              <GraduationCap size={24} />
              <div><h3>Kelas {myClass || '—'}</h3><p>Wali Kelas: {user?.name || '—'}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWaliKelas;
