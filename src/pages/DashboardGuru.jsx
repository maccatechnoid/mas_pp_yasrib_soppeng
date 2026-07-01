import React, { useState, useEffect } from 'react';
import {
  BookOpen, ClipboardCheck, Users, Clock, Calendar, TrendingUp,
  CheckCircle2, AlertCircle, Zap, ChevronRight, Star, BookMarked,
  BarChart2, Award, BellRing, UserCheck, FileText, GraduationCap,
  ChevronLeft, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getAllData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import './DashboardGuru.css';

const DashboardGuru = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], classes: [], subjects: [], org: {}, schedule: [] });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const d = getAllData();
    setData(d);
    if (d.classes?.length > 0) setSelectedClass(d.classes[0]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    if (h >= 7 && h < 12) return { label: 'KBM BERLANGSUNG', color: '#10b981', glow: 'rgba(16,185,129,0.3)' };
    if (h >= 12 && h < 13) return { label: 'ISTIRAHAT', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' };
    return { label: 'DI LUAR JAM KBM', color: '#94a3b8', glow: 'transparent' };
  };

  const session = getSessionStatus();

  // Mock teacher-specific data
  const mySubjects = (data.subjects || []).slice(0, 3);
  const myClasses = (data.classes || []).slice(0, 4);

  const attendanceTrend = [
    { day: 'Sen', hadir: 88, alpa: 4, izin: 8 },
    { day: 'Sel', hadir: 92, alpa: 2, izin: 6 },
    { day: 'Rab', hadir: 85, alpa: 5, izin: 10 },
    { day: 'Kam', hadir: 94, alpa: 1, izin: 5 },
    { day: 'Jum', hadir: 97, alpa: 2, izin: 1 },
    { day: 'Sab', hadir: 80, alpa: 8, izin: 12 },
  ];

  const nilaiPerKelas = (data.classes || []).slice(0, 5).map((cls, i) => ({
    kelas: cls,
    rata: 72 + i * 4 + Math.round(Math.random() * 6),
  }));

  const recentActivities = [
    { time: '08.15', label: 'Presensi kelas XII-A telah dicatat', type: 'success' },
    { time: '09.30', label: 'Nilai UH Matematika XII-B diperbarui', type: 'info' },
    { time: '10.00', label: '2 siswa kelas XI-A belum hadir', type: 'warning' },
    { time: '11.10', label: 'Jurnal mengajar sesi 3 tersimpan', type: 'success' },
  ];

  const todaySchedule = [
    { period: 'I–II', time: '07.30–08.40', class: myClasses[0] || 'XII-A', subject: mySubjects[0] || 'Matematika', done: true },
    { period: 'III–IV', time: '08.40–09.50', class: myClasses[1] || 'XI-A', subject: mySubjects[1] || 'Matematika', done: true },
    { period: 'VI–VII', time: '10.10–11.20', class: myClasses[2] || 'X-B', subject: mySubjects[0] || 'Matematika', done: false },
    { period: 'VIII', time: '11.20–11.55', class: myClasses[3] || 'XII-B', subject: mySubjects[2] || 'Matematika', done: false },
  ];

  const classStudents = (data.students || []).filter(s => s.class === selectedClass);

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
    <div className="teacher-dashboard">
      {/* Header */}
      <div className="td-header">
        <div className="td-header-left">
          <h1 className="td-title">{getGreeting()}, {user?.name || 'Ustadz'}!</h1>
        </div>
        <div className="td-header-right">
          <div className="td-clock-card">
            <span className="td-clock-date">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="td-clock-divider">•</span>
            <div className="td-clock-time">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
            <div className="td-session-badge" style={{ background: session.color, boxShadow: `0 0 12px ${session.glow}` }}>
              {session.label}
            </div>
          </div>
        </div>
      </div>

      {/* Running text */}
      <div className="td-announcement">
        <BellRing size={14} />
        <div className="td-announcement-track">
          <p>{data.org?.runningText || 'Selamat Datang di Dashboard Guru • Catat presensi & nilai siswa Anda •'}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="td-stats-row">
        <div className="td-stat-card accent-green" onClick={() => navigate('/presensi')}>
          <div className="td-stat-icon"><ClipboardCheck size={22} /></div>
          <div className="td-stat-body">
            <span className="td-stat-val">{myClasses.length}</span>
            <span className="td-stat-label">Kelas Diajar</span>
          </div>
          <ChevronRight size={16} className="td-stat-arrow" />
        </div>
        <div className="td-stat-card accent-blue" onClick={() => navigate('/students')}>
          <div className="td-stat-icon"><Users size={22} /></div>
          <div className="td-stat-body">
            <span className="td-stat-val">{data.students?.length || 0}</span>
            <span className="td-stat-label">Total Siswa</span>
          </div>
          <ChevronRight size={16} className="td-stat-arrow" />
        </div>
        <div className="td-stat-card accent-amber" onClick={() => navigate('/ujian-sumatif')}>
          <div className="td-stat-icon"><BookMarked size={22} /></div>
          <div className="td-stat-body">
            <span className="td-stat-val">{mySubjects.length}</span>
            <span className="td-stat-label">Mata Pelajaran</span>
          </div>
          <ChevronRight size={16} className="td-stat-arrow" />
        </div>
        <div className="td-stat-card accent-purple" onClick={() => navigate('/manajemen-kelas')}>
          <div className="td-stat-icon"><GraduationCap size={22} /></div>
          <div className="td-stat-body">
            <span className="td-stat-val">87%</span>
            <span className="td-stat-label">Rata Kehadiran</span>
          </div>
          <ChevronRight size={16} className="td-stat-arrow" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="td-quick-actions">
        <button className="td-qa-btn qa-green" onClick={() => navigate('/presensi')}>
          <CheckCircle2 size={20} /> <span>Absen Siswa</span>
        </button>
        <button className="td-qa-btn qa-blue" onClick={() => navigate('/ujian-sumatif')}>
          <FileText size={20} /> <span>Input Nilai</span>
        </button>
        <button className="td-qa-btn qa-amber" onClick={() => navigate('/manajemen-kelas')}>
          <BookOpen size={20} /> <span>Isi Jurnal</span>
        </button>
        <button className="td-qa-btn qa-teal" onClick={() => navigate('/teacher-leaves')}>
          <Calendar size={20} /> <span>Ajukan Cuti</span>
        </button>
      </div>

      {/* Main content 2-column */}
      <div className="td-main-grid">

        {/* Left column */}
        <div className="td-col-main">

          {/* Today's Schedule */}
          <div className="td-card">
            <div className="td-card-header">
              <Clock size={18} />
              <h3>Jadwal Mengajar Hari Ini</h3>
              <span className="td-badge-today">{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</span>
            </div>
            <div className="td-schedule-list">
              {todaySchedule.map((item, i) => (
                <div key={i} className={`td-schedule-item ${item.done ? 'done' : ''}`}>
                  <div className="td-sch-period">
                    <span className="td-sch-num">{item.period}</span>
                    <span className="td-sch-time">{item.time}</span>
                  </div>
                  <div className="td-sch-info">
                    <span className="td-sch-subject">{item.subject}</span>
                    <span className="td-sch-class">Kelas {item.class}</span>
                  </div>
                  <div className={`td-sch-status ${item.done ? 'status-done' : 'status-next'}`}>
                    {item.done ? <><CheckCircle2 size={14} /> Selesai</> : <><Activity size={14} /> Akan Datang</>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Trend */}
          <div className="td-card">
            <div className="td-card-header">
              <TrendingUp size={18} />
              <h3>Tren Kehadiran Siswa (Minggu Ini)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hadirGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="hadir" name="Hadir (%)" stroke="#10b981" fill="url(#hadirGrad)" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
                <Area type="monotone" dataKey="alpa" name="Alpa" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Nilai per kelas */}
          <div className="td-card">
            <div className="td-card-header">
              <BarChart2 size={18} />
              <h3>Rata-rata Nilai per Kelas</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={nilaiPerKelas} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="kelas" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="rata" name="Nilai Rata-rata" radius={[6, 6, 0, 0]} barSize={36}>
                  {nilaiPerKelas.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="td-nilai-legend">
              {nilaiPerKelas.map((k, i) => (
                <div key={i} className="td-nilai-item">
                  <div className="td-nilai-dot" style={{ background: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'][i % 5] }} />
                  <span>{k.kelas}: <strong>{k.rata}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="td-col-side">

          {/* Daftar Siswa by Kelas */}
          <div className="td-card">
            <div className="td-card-header">
              <Users size={18} />
              <h3>Daftar Siswa</h3>
            </div>
            <div className="td-class-tabs">
              {myClasses.map(cls => (
                <button
                  key={cls}
                  className={`td-class-tab ${selectedClass === cls ? 'active' : ''}`}
                  onClick={() => setSelectedClass(cls)}
                >{cls}</button>
              ))}
            </div>
            <div className="td-student-list">
              {classStudents.length === 0 ? (
                <div className="td-empty">Belum ada siswa di kelas ini.</div>
              ) : (
                classStudents.slice(0, 8).map((s, i) => (
                  <div key={i} className="td-student-row" onClick={() => navigate(`/student/${s.id}`)}>
                    <div className="td-stu-avatar" style={{ background: s.gender === 'L' ? '#dbeafe' : '#fce7f3' }}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="td-stu-info">
                      <span className="td-stu-name">{s.name}</span>
                      <span className="td-stu-nisn">{s.nisn}</span>
                    </div>
                    <span className={`td-stu-status ${i % 5 === 0 ? 'alpa' : i % 7 === 0 ? 'izin' : 'hadir'}`}>
                      {i % 5 === 0 ? 'Alpa' : i % 7 === 0 ? 'Izin' : 'Hadir'}
                    </span>
                  </div>
                ))
              )}
              {classStudents.length > 8 && (
                <button className="td-see-more" onClick={() => navigate('/students')}>
                  Lihat semua {classStudents.length} siswa <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="td-card">
            <div className="td-card-header">
              <Activity size={18} />
              <h3>Aktivitas Terkini</h3>
            </div>
            <div className="td-activity-list">
              {recentActivities.map((a, i) => (
                <div key={i} className={`td-activity-item type-${a.type}`}>
                  <div className="td-act-indicator" />
                  <div className="td-act-body">
                    <span className="td-act-label">{a.label}</span>
                    <span className="td-act-time">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="td-card">
            <div className="td-card-header">
              <Calendar size={18} />
              <h3>Kalender</h3>
              <div className="td-cal-nav">
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>
                  <ChevronLeft size={16} />
                </button>
                <span>{calendarDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}</span>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="td-mini-cal">
              {['M','S','S','R','K','J','S'].map((d, i) => (
                <div key={i} className="td-cal-head">{d}</div>
              ))}
              {getCalendarDays().map((day, i) => {
                const isToday = day === currentTime.getDate() &&
                  calendarDate.getMonth() === currentTime.getMonth() &&
                  calendarDate.getFullYear() === currentTime.getFullYear();
                const hasEvent = day && (data.org?.agendas || []).some(a =>
                  a.date === `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                );
                return (
                  <div key={i} className={`td-cal-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`}>
                    {day}
                    {hasEvent && <span className="td-event-dot" />}
                  </div>
                );
              })}
            </div>
            {/* Agenda list */}
            <div className="td-agenda-mini">
              {(data.org?.agendas || []).slice(0, 3).map((a, i) => (
                <div key={i} className="td-agenda-item">
                  <div className={`td-agenda-dot cat-${a.category?.toLowerCase()}`} />
                  <div>
                    <span className="td-agenda-title">{a.title}</span>
                    <span className="td-agenda-date">{new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
              {(data.org?.agendas || []).length === 0 && (
                <p className="td-empty" style={{ margin: '0.5rem 0' }}>Tidak ada agenda.</p>
              )}
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="td-quote-card">
            <div className="td-quote-icon"><Star size={20} /></div>
            <blockquote>"{data.org?.quotes?.[0]?.text || 'Guru terbaik adalah yang tidak pernah berhenti belajar.'}"</blockquote>
            <cite>— {data.org?.quotes?.[0]?.author || 'Pepatah'}</cite>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardGuru;
