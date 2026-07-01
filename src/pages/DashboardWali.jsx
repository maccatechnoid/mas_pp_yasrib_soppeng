import React, { useState, useEffect } from 'react';
import {
  User, Calendar, AlertCircle, BellRing, CheckCircle2, BookOpen,
  ChevronRight, ChevronLeft, Zap, Star, GraduationCap, Heart,
  TrendingUp, BookMarked, Clock, Wallet, BarChart2, Award,
  MessageSquare, Phone, Shield, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllData } from '../utils/storage';
import './DashboardWali.css';

const DashboardWali = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], org: {}, subjects: [], allowances: [] });
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

  // Link wali to their child (first student in data, or find by parentName)
  const child = data.students?.find(s => s.parentName === user?.name)
    || data.students?.[0]
    || { name: 'Abdullah Hakim', class: 'XII-A', nisn: '0012345678', gender: 'L' };

  const waliKelas = data.org?.homerooms?.[child.class] || 'Belum Ditentukan';
  const academicYear = data.org?.academicYear || '2024/2025';
  const semester = data.org?.semester || 'Ganjil';

  // Attendance stats (mock, would come from real data)
  const attendanceStats = { hadir: 18, sakit: 1, izin: 1, alpa: 0, total: 20 };
  const attendancePct = Math.round((attendanceStats.hadir / attendanceStats.total) * 100);

  const attendanceTrend = [
    { week: 'Mgg 1', pct: 100 }, { week: 'Mgg 2', pct: 80 },
    { week: 'Mgg 3', pct: 100 }, { week: 'Mgg 4', pct: 100 },
    { week: 'Mgg 5', pct: 100 }, { week: 'Mgg 6', pct: 90 },
  ];

  const pieData = [
    { name: 'Hadir', value: attendanceStats.hadir, color: '#10b981' },
    { name: 'Sakit', value: attendanceStats.sakit, color: '#3b82f6' },
    { name: 'Izin', value: attendanceStats.izin, color: '#f59e0b' },
    { name: 'Alpa', value: attendanceStats.alpa, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Grades mock
  const gradeData = (data.subjects || []).slice(0, 6).map((sub, i) => ({
    subject: sub.length > 16 ? sub.slice(0, 16) + '…' : sub,
    nilai: 72 + i * 4 + Math.round(Math.random() * 8),
    kkm: 75,
  }));

  // Finance mock
  const financeData = [
    { month: 'April', status: 'Lunas', amount: 450000, date: '2 Apr 2026' },
    { month: 'Mei', status: 'Lunas', amount: 450000, date: '5 Mei 2026' },
    { month: 'Juni', status: 'Belum', amount: 450000, date: '-' },
  ];

  // Hafalan
  const hafalan = { current: 3, target: 5, lastSurah: 'Al-Mulk', pct: 60 };

  // BK notes
  const bkNotes = [
    { type: 'positive', text: 'Aktif dalam kegiatan ekstrakurikuler', poin: +10, date: '17 Jun' },
    { type: 'positive', text: 'Juara lomba tahfidz tingkat kecamatan', poin: +20, date: '10 Jun' },
    { type: 'negative', text: 'Terlambat masuk kelas 1x', poin: -5, date: '3 Jun' },
  ];

  const tabs = [
    { id: 'kehadiran', label: 'Kehadiran', icon: <CheckCircle2 size={15} /> },
    { id: 'nilai', label: 'Nilai', icon: <BookOpen size={15} /> },
    { id: 'keuangan', label: 'Keuangan', icon: <Wallet size={15} /> },
    { id: 'bk', label: 'Catatan BK', icon: <Heart size={15} /> },
  ];

  const getCalendarDays = () => {
    const y = calendarDate.getFullYear(), m = calendarDate.getMonth();
    const fd = new Date(y, m, 1).getDay();
    const dim = new Date(y, m + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < fd; i++) days.push(null);
    for (let i = 1; i <= dim; i++) days.push(i);
    return days;
  };

  return (
    <div className="pd-page">

      {/* ── Hero ── */}
      <div className="pd-hero">
        <div className="pd-hero-bg" />
        <div className="pd-hero-inner">
          <div className="pd-hero-left">
            <h1 className="pd-hero-title">{getGreeting()}, {user?.name?.split(' ')[0] || 'Bapak/Ibu'}!</h1>
            <p className="pd-hero-sub">
              Pantau perkembangan putra/putri Anda di {data.org?.appName || 'Madrasah Hub'}
            </p>
          </div>
          <div className="pd-hero-right">
            <div className="pd-clock-capsule">
              <span className="pd-capsule-time">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
              <span className="pd-capsule-divider">•</span>
              <span className="pd-capsule-date">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Child Card ── */}
      <div className="pd-child-card">
        <div className="pd-child-header-row">
          <div className="pd-child-avatar">
            {child.photo
              ? <img src={child.photo} alt={child.name} />
              : <span>{child.name?.slice(0, 2).toUpperCase()}</span>
            }
          </div>
          <div className="pd-child-info">
            <h2>{child.name}</h2>
            <p>
              <strong>{child.nisn}</strong> &nbsp;·&nbsp;
              <strong>{academicYear} ({semester})</strong>
            </p>
          </div>
        </div>
        <div className="pd-child-stats">
          <div className="pd-cstat green">
            <span>{attendancePct}%</span>
            <label>Kehadiran</label>
          </div>
          <div className="pd-cstat blue">
            <span>{hafalan.current} Juz</span>
            <label>Hafalan</label>
          </div>
          <div className="pd-cstat purple">
            <span> {child.class}</span>
          </div>
          <div className="pd-cstat amber">
            <span>{waliKelas.split(',')[0].split(' ').slice(-2).join(' ')}</span>
            <label>Wali Kelas</label>
          </div>
        </div>
      </div>

      {/* ── Announcement ── */}
      <div className="pd-announce">
        <BellRing size={14} />
        <div className="pd-announce-track">
          <p>{data.org?.runningText || 'Selamat Datang di Portal Wali Santri • Pantau terus perkembangan putra/putri Anda • Terima kasih atas kepercayaan Anda •'}</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="pd-quick-actions">
        <button className="pd-qa qa-blue" onClick={() => navigate('/parent-academic')}>
          <BookOpen size={18} /> <span>Nilai & Hafalan</span>
        </button>
        <button className="pd-qa qa-green" onClick={() => navigate('/parent-finance')}>
          <Wallet size={18} /> <span>Tagihan SPP</span>
        </button>
        <button className="pd-qa qa-purple" onClick={() => setActiveTab('kehadiran')}>
          <Activity size={18} /> <span>Kehadiran Anak</span>
        </button>
        <button className="pd-qa qa-amber" onClick={() => setActiveTab('bk')}>
          <Heart size={18} /> <span>Catatan BK</span>
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="pd-grid">

        {/* ══ LEFT: Tab Panel ══ */}
        <div className="pd-col-main">

          {/* Tabs */}
          <div className="pd-tabs">
            {tabs.map(t => (
              <button key={t.id} className={`pd-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB: Kehadiran ── */}
          {activeTab === 'kehadiran' && (
            <div className="pd-tab-content">
              {/* Pie + Stat Row */}
              <div className="pd-att-summary">
                <div className="pd-pie-wrap">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pd-pie-center">
                    <span className="pd-pie-pct">{attendancePct}%</span>
                    <span className="pd-pie-sub">Hadir</span>
                  </div>
                </div>
                <div className="pd-att-legend">
                  <p className="pd-att-period">Rekap Bulan Ini — {currentTime.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
                  {[
                    { label: 'Hadir', val: attendanceStats.hadir, color: '#10b981' },
                    { label: 'Sakit', val: attendanceStats.sakit, color: '#3b82f6' },
                    { label: 'Izin', val: attendanceStats.izin, color: '#f59e0b' },
                    { label: 'Alpa', val: attendanceStats.alpa, color: '#ef4444' },
                  ].map((d, i) => (
                    <div key={i} className="pd-legend-row">
                      <div className="pd-legend-dot" style={{ background: d.color }} />
                      <span>{d.label}</span>
                      <strong>{d.val} hari</strong>
                    </div>
                  ))}
                  {attendanceStats.alpa === 0 && (
                    <div className="pd-no-alpa">
                      <CheckCircle2 size={16} /> Tidak ada alpa bulan ini!
                    </div>
                  )}
                </div>
              </div>

              {/* Trend chart */}
              <div className="pd-card">
                <div className="pd-card-header">
                  <TrendingUp size={16} />
                  <h4>Tren Kehadiran Mingguan</h4>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={attendanceTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pdAttGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={v => [`${v}%`, 'Kehadiran']} />
                    <Area type="monotone" dataKey="pct" stroke="#3b82f6" fill="url(#pdAttGrad)" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly calendar attendance */}
              <div className="pd-card">
                <div className="pd-card-header">
                  <Calendar size={16} />
                  <h4>Detail Absensi Bulanan</h4>
                </div>
                <div className="pd-att-days">
                  {Array.from({ length: 26 }, (_, i) => i + 1).map(d => {
                    const type = d === 8 ? 'sakit' : d === 15 ? 'izin' : (d % 6 === 0 || d % 7 === 0) ? 'libur' : 'hadir';
                    return (
                      <div key={d} className={`pd-att-day ${type}`} title={`${d}: ${type}`}>
                        <span className="pd-att-day-num">{d}</span>
                        <span className={`pd-att-day-dot dot-${type}`} />
                      </div>
                    );
                  })}
                </div>
                <div className="pd-att-legend-row">
                  {[['hadir', '#10b981'], ['sakit', '#3b82f6'], ['izin', '#f59e0b'], ['libur', '#e2e8f0']].map(([l, c]) => (
                    <div key={l} className="pd-att-leg-item">
                      <span style={{ background: c }} className="pd-att-leg-dot" />
                      <span className="pd-att-leg-label">{l.charAt(0).toUpperCase() + l.slice(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Nilai ── */}
          {activeTab === 'nilai' && (
            <div className="pd-tab-content">
              <div className="pd-card">
                <div className="pd-card-header">
                  <BarChart2 size={16} />
                  <h4>Rekap Nilai Semester {semester} — {academicYear}</h4>
                  <button className="pd-card-link" onClick={() => navigate('/parent-academic')}>
                    Lihat Lengkap <ChevronRight size={14} />
                  </button>
                </div>
                <div className="pd-grade-list">
                  {gradeData.map((g, i) => (
                    <div key={i} className="pd-grade-item">
                      <span className="pd-grade-sub" title={g.subject}>{g.subject}</span>
                      <div className="pd-grade-bar-wrap">
                        <div className="pd-grade-bar">
                          <div className={`pd-grade-fill ${g.nilai >= g.kkm ? 'pass' : 'fail'}`} style={{ width: `${g.nilai}%` }} />
                          <div className="pd-kkm-line" style={{ left: `${g.kkm}%` }} />
                        </div>
                      </div>
                      <span className={`pd-grade-val ${g.nilai >= g.kkm ? 'pass' : 'fail'}`}>{g.nilai}</span>
                    </div>
                  ))}
                </div>
                <p className="pd-grade-note"><span className="pd-kkm-legend" /> Garis KKM (75)</p>
              </div>

              {/* Hafalan progress */}
              <div className="pd-hafalan-card">
                <div className="pd-hafalan-header">
                  <BookMarked size={20} />
                  <div>
                    <h3>Progress Hafalan Al-Qur'an</h3>
                    <p>Target {hafalan.target} Juz Tahun Ini</p>
                  </div>
                </div>
                <div className="pd-hafalan-body">
                  <div className="pd-radial-wrap">
                    <ResponsiveContainer width={110} height={110}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={90} endAngle={-270} data={[{ value: hafalan.pct, fill: '#6ee7b7' }]}>
                        <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.15)' }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="pd-radial-center">
                      <span className="pd-radial-juz">{hafalan.current}</span>
                      <span className="pd-radial-sub">Juz</span>
                    </div>
                  </div>
                  <div className="pd-hafalan-info">
                    <div className="pd-haf-row"><span>Terakhir Disetorkan</span><strong>{hafalan.lastSurah}</strong></div>
                    <div className="pd-haf-row"><span>Progress</span><strong>{hafalan.pct}% dari target</strong></div>
                    <div className="pd-haf-row"><span>Sisa target</span><strong>{hafalan.target - hafalan.current} Juz lagi</strong></div>
                  </div>
                </div>
                <button className="pd-hafalan-btn" onClick={() => navigate('/parent-academic')}>
                  Lihat Detail Tahfidz <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: Keuangan ── */}
          {activeTab === 'keuangan' && (
            <div className="pd-tab-content">
              <div className="pd-finance-summary">
                <div className="pd-fin-stat fin-green">
                  <CheckCircle2 size={20} />
                  <span>Lunas</span>
                  <strong>{financeData.filter(f => f.status === 'Lunas').length} Bln</strong>
                </div>
                <div className="pd-fin-stat fin-red">
                  <AlertCircle size={20} />
                  <span>Belum Bayar</span>
                  <strong>{financeData.filter(f => f.status === 'Belum').length} Bln</strong>
                </div>
                <div className="pd-fin-stat fin-blue">
                  <Wallet size={20} />
                  <span>Total Tagihan</span>
                  <strong>Rp {(financeData.length * 450000).toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div className="pd-card">
                <div className="pd-card-header">
                  <Wallet size={16} />
                  <h4>Riwayat Pembayaran SPP</h4>
                  <button className="pd-card-link" onClick={() => navigate('/parent-finance')}>Selengkapnya <ChevronRight size={14} /></button>
                </div>
                <div className="pd-finance-table-wrap">
                  <table className="pd-table">
                    <thead>
                      <tr><th>Bulan</th><th>Jumlah</th><th>Tanggal Bayar</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {financeData.map((f, i) => (
                        <tr key={i}>
                          <td className="pd-td-bold">{f.month} 2026</td>
                          <td>Rp {f.amount.toLocaleString('id-ID')}</td>
                          <td>{f.date}</td>
                          <td>
                            <span className={`pd-status-pill ${f.status === 'Lunas' ? 'lunas' : 'belum'}`}>
                              {f.status === 'Lunas' ? <><CheckCircle2 size={12} /> Lunas</> : <><AlertCircle size={12} /> Belum Bayar</>}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {financeData.some(f => f.status !== 'Lunas') && (
                  <div className="pd-unpaid-alert">
                    <AlertCircle size={16} />
                    <p>Terdapat tagihan yang belum dibayar. Segera hubungi pihak madrasah.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: Catatan BK ── */}
          {activeTab === 'bk' && (
            <div className="pd-tab-content">
              <div className="pd-bk-summary">
                <div className="pd-bk-stat bk-pos">
                  <Award size={20} />
                  <span>Total Poin Positif</span>
                  <strong>+{bkNotes.filter(b => b.poin > 0).reduce((a, b) => a + b.poin, 0)}</strong>
                </div>
                <div className="pd-bk-stat bk-neg">
                  <AlertCircle size={20} />
                  <span>Total Poin Negatif</span>
                  <strong>{bkNotes.filter(b => b.poin < 0).reduce((a, b) => a + b.poin, 0)}</strong>
                </div>
              </div>
              <div className="pd-card">
                <div className="pd-card-header">
                  <Heart size={16} />
                  <h4>Catatan Bimbingan Konseling</h4>
                </div>
                <div className="pd-bk-list">
                  {bkNotes.map((b, i) => (
                    <div key={i} className={`pd-bk-item ${b.type}`}>
                      <div className="pd-bk-poin">{b.poin > 0 ? `+${b.poin}` : b.poin}</div>
                      <div className="pd-bk-body">
                        <span className="pd-bk-text">{b.text}</span>
                        <span className="pd-bk-date">{b.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pd-bk-note">
                  <Shield size={14} />
                  <p>Catatan BK bersifat rahasia dan hanya dapat dilihat oleh wali dan pihak madrasah yang berwenang.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT Sidebar ══ */}
        <div className="pd-col-side">

          {/* Info Card */}
          <div className="pd-info-card">
            <div className="pd-info-header">
              <GraduationCap size={20} />
              <h3>Info Madrasah</h3>
            </div>
            <div className="pd-info-row"><span>Nama Madrasah</span><strong>{data.org?.appName || 'MAS PP YASRIB'}</strong></div>
            <div className="pd-info-row"><span>Kepala Madrasah</span><strong>{data.org?.principalName || '—'}</strong></div>
            <div className="pd-info-row"><span>Wali Kelas</span><strong>{waliKelas.split(',')[0]}</strong></div>
            <div className="pd-info-row"><span>Kelas Anak</span><strong>{child.class}</strong></div>
          </div>

          {/* Mini Calendar */}
          <div className="pd-card">
            <div className="pd-card-header">
              <Calendar size={16} />
              <h4>Kalender Akademik</h4>
              <div className="pd-cal-nav">
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>
                  <ChevronLeft size={15} />
                </button>
                <span>{calendarDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}</span>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <div className="pd-mini-cal">
              {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => <div key={i} className="pd-cal-head">{d}</div>)}
              {getCalendarDays().map((day, i) => {
                const isToday = day === currentTime.getDate() &&
                  calendarDate.getMonth() === currentTime.getMonth() &&
                  calendarDate.getFullYear() === currentTime.getFullYear();
                const hasEvent = day && (data.org?.agendas || []).some(a =>
                  a.date === `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                );
                return (
                  <div key={i} className={`pd-cal-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`}>
                    {day}
                    {hasEvent && <span className="pd-event-dot" />}
                  </div>
                );
              })}
            </div>
            {/* Agenda */}
            <div className="pd-agenda-list">
              {(data.org?.agendas || []).slice(0, 3).map((a, i) => (
                <div key={i} className="pd-agenda-item">
                  <div className={`pd-agenda-dot cat-${a.category?.toLowerCase()}`} />
                  <div>
                    <span className="pd-agenda-title">{a.title}</span>
                    <span className="pd-agenda-date">
                      {new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {a.category}
                    </span>
                  </div>
                </div>
              ))}
              {!(data.org?.agendas?.length) && <p className="pd-no-agenda">Tidak ada agenda terdekat.</p>}
            </div>
          </div>

          {/* Contact Madrasah */}
          <div className="pd-contact-card">
            <div className="pd-card-header" style={{ color: '#3b82f6' }}>
              <Phone size={16} />
              <h4>Hubungi Madrasah</h4>
            </div>
            <p className="pd-contact-desc">Butuh informasi lebih lanjut? Hubungi kami melalui:</p>
            <div className="pd-contact-list">
              <div className="pd-contact-item">
                <Phone size={14} />
                <span>{data.org?.phone || '(0485) 123-456'}</span>
              </div>
              <div className="pd-contact-item">
                <MessageSquare size={14} />
                <span>{data.org?.email || 'info@madrasah.sch.id'}</span>
              </div>
            </div>
          </div>

          {/* Motivasi */}
          <div className="pd-quote-card">
            <Star size={18} />
            <blockquote>
              "{data.org?.quotes?.[0]?.text || 'Orang tua terbaik adalah yang menjadi tauladan ilmu dan akhlak bagi anaknya.'}"
            </blockquote>
            <cite>— {data.org?.quotes?.[0]?.author || 'Pepatah'}</cite>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardWali;
