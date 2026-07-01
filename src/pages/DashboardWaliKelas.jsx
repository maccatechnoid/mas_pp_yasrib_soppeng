import React, { useState, useEffect } from 'react';
import {
  Users, ClipboardCheck, BookOpen, TrendingUp, Heart, Calendar,
  ChevronRight, ChevronLeft, BellRing, Activity, Star, AlertCircle,
  CheckCircle2, MessageSquare, Award, GraduationCap, Zap, Phone,
  BarChart2, FileText
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

  useEffect(() => {
    setData(getAllData());
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

  // Find homeroom teacher's class from homerooms data
  const homerooms = data.org?.homerooms || {};
  const myClass = Object.entries(homerooms).find(([, teacher]) =>
    teacher === user?.name
  )?.[0] || (data.classes?.[0] || null);

  const classStudents = (data.students || []).filter(s => s.class === myClass);
  const totalStudents = classStudents.length;
  const maleCount = classStudents.filter(s => s.gender === 'L').length;
  const femaleCount = classStudents.filter(s => s.gender === 'P').length;

  // Mock attendance data for class
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
    { day: 'Sen', hadir: 90, alpa: 3, sakit: 4, izin: 3 },
    { day: 'Sel', hadir: 93, alpa: 2, sakit: 3, izin: 2 },
    { day: 'Rab', hadir: 88, alpa: 5, sakit: 4, izin: 3 },
    { day: 'Kam', hadir: 95, alpa: 1, sakit: 2, izin: 2 },
    { day: 'Jum', hadir: 97, alpa: 1, sakit: 1, izin: 1 },
    { day: 'Sab', hadir: 85, alpa: 6, sakit: 5, izin: 4 },
  ];

  // Mock nilai rekap
  const nilaiSiswa = (data.subjects || []).slice(0, 5).map(sub => ({
    mapel: sub.length > 12 ? sub.slice(0, 12) + '...' : sub,
    rata: 70 + Math.round(Math.random() * 25),
    tertinggi: 90 + Math.round(Math.random() * 10),
    terendah: 55 + Math.round(Math.random() * 15),
  }));

  // Mock BK/Counseling data
  const bkCases = [
    { student: classStudents[0]?.name || 'Ahmad Hakim', type: 'Keterlambatan', point: -5, date: '2026-06-18' },
    { student: classStudents[1]?.name || 'Siti Maryam', type: 'Aktif di kegiatan', point: +10, date: '2026-06-17' },
    { student: classStudents[2]?.name || 'Budi Santoso', type: 'Tidak mengerjakan tugas', point: -10, date: '2026-06-16' },
  ];

  // Mock keuangan siswa
  const financeData = [
    { student: classStudents[0]?.name || 'Ahmad Hakim', status: 'Lunas', amount: 450000 },
    { student: classStudents[1]?.name || 'Siti Maryam', status: 'Lunas', amount: 450000 },
    { student: classStudents[2]?.name || 'Budi Santoso', status: 'Belum', amount: 0 },
    { student: classStudents[3]?.name || 'Citra Kirana', status: 'Sebagian', amount: 225000 },
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

      {/* Header */}
      <div className="hd-header">
        <div className="hd-header-left">
          <h1 className="hd-title">{getGreeting()}, {user?.name || 'Ustadz/ah'}!</h1>
          <p className="hd-subtitle">
            Wali Kelas: <strong className="hd-class-name">{myClass || '—'}</strong>
          </p>
        </div>
        <div className="hd-clock-card">
          <span className="hd-clock-date">
            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="hd-clock-divider">•</span>
          <div className="hd-clock-time">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
          <div className="hd-session-badge" style={{ background: session.color }}>
            {session.label}
          </div>
        </div>
      </div>

      {/* Announcement */}
      <div className="hd-announcement">
        <BellRing size={14} />
        <div className="hd-announcement-track">
          <p>{data.org?.runningText || 'Selamat Datang di Dashboard Wali Kelas • Pantau perkembangan siswa Anda •'}</p>
        </div>
      </div>

      {/* Top Stats: Class Summary */}
      <div className="hd-stats-row">
        <div className="hd-stat accent-blue">
          <div className="hd-stat-icon"><Users size={22} /></div>
          <div className="hd-stat-body">
            <span className="hd-stat-val">{totalStudents}</span>
            <span className="hd-stat-label">Total Siswa</span>
          </div>
        </div>
        <div className="hd-stat accent-green" onClick={() => setActiveTab('kehadiran')}>
          <div className="hd-stat-icon"><CheckCircle2 size={22} /></div>
          <div className="hd-stat-body">
            <span className="hd-stat-val">{attendancePercent}%</span>
            <span className="hd-stat-label">Kehadiran Hari Ini</span>
          </div>
        </div>
        <div className="hd-stat accent-amber" onClick={() => setActiveTab('bk')}>
          <div className="hd-stat-icon"><AlertCircle size={22} /></div>
          <div className="hd-stat-body">
            <span className="hd-stat-val">{alpaCount}</span>
            <span className="hd-stat-label">Siswa Alpa Hari Ini</span>
          </div>
        </div>
        <div className="hd-stat accent-purple" onClick={() => setActiveTab('keuangan')}>
          <div className="hd-stat-icon"><Zap size={22} /></div>
          <div className="hd-stat-body">
            <span className="hd-stat-val">{paidCount}/{financeData.length}</span>
            <span className="hd-stat-label">SPP Lunas</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hd-quick-actions">
        <button className="hd-qa-btn qa-green" onClick={() => navigate('/presensi')}>
          <ClipboardCheck size={18} /> <span>Absen Kelas</span>
        </button>
        <button className="hd-qa-btn qa-blue" onClick={() => navigate('/homeroom')}>
          <MessageSquare size={18} /> <span>Portal Akademik</span>
        </button>
        <button className="hd-qa-btn qa-amber" onClick={() => navigate('/konseling')}>
          <Heart size={18} /> <span>Catatan BK</span>
        </button>
        <button className="hd-qa-btn qa-purple" onClick={() => navigate('/finance')}>
          <FileText size={18} /> <span>Cek Keuangan</span>
        </button>
        <button className="hd-qa-btn qa-teal" onClick={() => navigate('/teacher-leaves')}>
          <Calendar size={18} /> <span>Ajukan Izin</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="hd-main-grid">

        {/* Left: Tabs Panel */}
        <div className="hd-col-main">

          {/* Tab Navigation */}
          <div className="hd-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`hd-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Kehadiran */}
          {activeTab === 'kehadiran' && (
            <div className="hd-tab-content">
              {/* Pie + Stats */}
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
                      <span>{d.name}</span>
                      <strong>{d.value} siswa</strong>
                    </div>
                  ))}
                  <div className="hd-gender-row">
                    <span>Putra: <strong>{maleCount}</strong></span>
                    <span>Putri: <strong>{femaleCount}</strong></span>
                  </div>
                </div>
              </div>

              {/* Weekly trend */}
              <div className="hd-card">
                <div className="hd-card-header">
                  <TrendingUp size={16} />
                  <h4>Tren Kehadiran Minggu Ini</h4>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hdHadir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="hadir" name="Hadir (%)" stroke="#10b981" fill="url(#hdHadir)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="alpa" name="Alpa" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Student attendance table */}
              <div className="hd-card">
                <div className="hd-card-header">
                  <Users size={16} />
                  <h4>Rekap Kehadiran Siswa — {myClass || '—'}</h4>
                </div>
                <div className="hd-table-wrap">
                  <table className="hd-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Siswa</th>
                        <th>Gender</th>
                        <th>Status Hari Ini</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Belum ada siswa di kelas ini.</td></tr>
                      ) : attendanceData.map((s, i) => (
                        <tr key={i} onClick={() => navigate(`/student/${s.id}`)} style={{ cursor: 'pointer' }}>
                          <td>{i + 1}</td>
                          <td className="hd-td-name">{s.name}</td>
                          <td>{s.gender === 'L' ? 'Putra' : 'Putri'}</td>
                          <td><span className={`hd-status-pill ${s.status.toLowerCase()}`}>{s.status}</span></td>
                          <td>
                            <button className="hd-action-btn" onClick={e => { e.stopPropagation(); navigate(`/student/${s.id}`); }}>
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Nilai */}
          {activeTab === 'nilai' && (
            <div className="hd-tab-content">
              <div className="hd-card">
                <div className="hd-card-header">
                  <BarChart2 size={16} />
                  <h4>Rata-rata Nilai Per Mata Pelajaran — Kelas {myClass}</h4>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={nilaiSiswa} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="mapel" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="rata" name="Rata-rata" radius={[6, 6, 0, 0]} barSize={32}>
                      {nilaiSiswa.map((_, i) => (
                        <Cell key={i} fill={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="hd-card">
                <div className="hd-card-header">
                  <Award size={16} />
                  <h4>Detail Rekap Nilai Per Mapel</h4>
                </div>
                <div className="hd-table-wrap">
                  <table className="hd-table">
                    <thead>
                      <tr><th>Mata Pelajaran</th><th>Rata-rata</th><th>Tertinggi</th><th>Terendah</th><th>Ket</th></tr>
                    </thead>
                    <tbody>
                      {nilaiSiswa.map((n, i) => (
                        <tr key={i}>
                          <td>{data.subjects?.[i] || n.mapel}</td>
                          <td><strong style={{ color: n.rata >= 75 ? '#10b981' : '#f59e0b' }}>{n.rata}</strong></td>
                          <td style={{ color: '#3b82f6' }}>{n.tertinggi}</td>
                          <td style={{ color: '#ef4444' }}>{n.terendah}</td>
                          <td><span className={`hd-status-pill ${n.rata >= 75 ? 'hadir' : 'izin'}`}>{n.rata >= 75 ? 'Baik' : 'Perlu Perhatian'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab: BK */}
          {activeTab === 'bk' && (
            <div className="hd-tab-content">
              <div className="hd-bk-summary">
                <div className="hd-bk-stat hd-bk-pos">
                  <Award size={20} />
                  <span>Poin Positif</span>
                  <strong>+{bkCases.filter(b => b.point > 0).reduce((a, b) => a + b.point, 0)}</strong>
                </div>
                <div className="hd-bk-stat hd-bk-neg">
                  <AlertCircle size={20} />
                  <span>Poin Negatif</span>
                  <strong>{bkCases.filter(b => b.point < 0).reduce((a, b) => a + b.point, 0)}</strong>
                </div>
                <div className="hd-bk-stat hd-bk-total">
                  <CheckCircle2 size={20} />
                  <span>Total Kasus</span>
                  <strong>{bkCases.length}</strong>
                </div>
              </div>
              <div className="hd-card">
                <div className="hd-card-header">
                  <Heart size={16} />
                  <h4>Catatan BK Terbaru — Kelas {myClass}</h4>
                </div>
                <div className="hd-bk-list">
                  {bkCases.map((b, i) => (
                    <div key={i} className={`hd-bk-item ${b.point > 0 ? 'positive' : 'negative'}`}>
                      <div className="hd-bk-point">{b.point > 0 ? `+${b.point}` : b.point}</div>
                      <div className="hd-bk-body">
                        <span className="hd-bk-student">{b.student}</span>
                        <span className="hd-bk-type">{b.type}</span>
                      </div>
                      <span className="hd-bk-date">{new Date(b.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  ))}
                </div>
                <button className="hd-more-btn" onClick={() => navigate('/konseling')}>
                  Kelola catatan BK lengkap <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Tab: Keuangan */}
          {activeTab === 'keuangan' && (
            <div className="hd-tab-content">
              <div className="hd-finance-summary">
                <div className="hd-fin-stat fin-green">
                  <CheckCircle2 size={20} />
                  <span>Lunas</span>
                  <strong>{financeData.filter(f => f.status === 'Lunas').length}</strong>
                </div>
                <div className="hd-fin-stat fin-amber">
                  <AlertCircle size={20} />
                  <span>Sebagian</span>
                  <strong>{financeData.filter(f => f.status === 'Sebagian').length}</strong>
                </div>
                <div className="hd-fin-stat fin-red">
                  <AlertCircle size={20} />
                  <span>Belum Bayar</span>
                  <strong>{financeData.filter(f => f.status === 'Belum').length}</strong>
                </div>
              </div>
              <div className="hd-card">
                <div className="hd-card-header">
                  <Zap size={16} />
                  <h4>Status Pembayaran SPP — Kelas {myClass}</h4>
                </div>
                <div className="hd-table-wrap">
                  <table className="hd-table">
                    <thead>
                      <tr><th>Nama Siswa</th><th>Status SPP</th><th>Terbayar</th><th>Aksi</th></tr>
                    </thead>
                    <tbody>
                      {financeData.map((f, i) => (
                        <tr key={i}>
                          <td className="hd-td-name">{f.student}</td>
                          <td><span className={`hd-status-pill ${f.status === 'Lunas' ? 'hadir' : f.status === 'Sebagian' ? 'izin' : 'alpa'}`}>{f.status}</span></td>
                          <td>Rp {f.amount.toLocaleString('id-ID')}</td>
                          <td>
                            <button className="hd-action-btn" onClick={() => navigate('/finance')}>
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="hd-more-btn" onClick={() => navigate('/finance')}>
                  Kelola keuangan lengkap <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hd-col-side">

          {/* Class info card */}
          <div className="hd-class-card">
            <div className="hd-class-card-header">
              <GraduationCap size={24} />
              <div>
                <h3>Kelas {myClass || '—'}</h3>
                <p>Wali Kelas: {user?.name || '—'}</p>
              </div>
            </div>
            <div className="hd-class-stats">
              <div><span>{totalStudents}</span><label>Siswa</label></div>
              <div><span>{maleCount}</span><label>Putra</label></div>
              <div><span>{femaleCount}</span><label>Putri</label></div>
              <div><span>{attendancePercent}%</span><label>Kehadiran</label></div>
            </div>
          </div>

          {/* Siswa yang perlu perhatian */}
          <div className="hd-card">
            <div className="hd-card-header">
              <AlertCircle size={16} />
              <h4>Siswa Perlu Perhatian</h4>
            </div>
            <div className="hd-attention-list">
              {attendanceData.filter(s => s.status !== 'Hadir').slice(0, 5).map((s, i) => (
                <div key={i} className="hd-attention-item" onClick={() => navigate(`/student/${s.id}`)}>
                  <div className="hd-att-avatar" style={{ background: s.status === 'Alpa' ? '#fee2e2' : s.status === 'Sakit' ? '#dbeafe' : '#fef3c7' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div className="hd-att-info">
                    <span className="hd-att-name">{s.name}</span>
                    <span className="hd-att-reason">{s.status} hari ini</span>
                  </div>
                  <span className={`hd-status-pill ${s.status.toLowerCase()}`}>{s.status}</span>
                </div>
              ))}
              {attendanceData.filter(s => s.status !== 'Hadir').length === 0 && (
                <div className="hd-all-good">
                  <CheckCircle2 size={24} />
                  <p>Semua siswa hadir hari ini!</p>
                </div>
              )}
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="hd-card">
            <div className="hd-card-header">
              <Calendar size={16} />
              <h4>Kalender</h4>
              <div className="hd-cal-nav">
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>
                  <ChevronLeft size={15} />
                </button>
                <span>{calendarDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}</span>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <div className="hd-mini-cal">
              {['M','S','S','R','K','J','S'].map((d, i) => <div key={i} className="hd-cal-head">{d}</div>)}
              {getCalendarDays().map((day, i) => {
                const isToday = day === currentTime.getDate() &&
                  calendarDate.getMonth() === currentTime.getMonth() &&
                  calendarDate.getFullYear() === currentTime.getFullYear();
                const hasEvent = day && (data.org?.agendas || []).some(a =>
                  a.date === `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                );
                return (
                  <div key={i} className={`hd-cal-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`}>
                    {day}
                    {hasEvent && <span className="hd-event-dot" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivasi */}
          <div className="hd-quote-card">
            <Star size={18} />
            <blockquote>"{data.org?.quotes?.[1]?.text || 'Wali kelas terbaik adalah yang menjadi orang tua kedua bagi siswanya.'}"</blockquote>
            <cite>— {data.org?.quotes?.[1]?.author || 'Pepatah Guru'}</cite>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardWaliKelas;
