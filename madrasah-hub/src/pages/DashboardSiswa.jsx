import React, { useState, useEffect } from 'react';
import {
  Calendar, BookOpen, Award, CheckCircle2, Trophy, Star, Flame,
  FileText, AlertCircle, HeartHandshake, Clock, TrendingUp, ChevronRight,
  BookMarked, Zap, Activity, BarChart2, Bell, Download, User,
  ChevronLeft, GraduationCap, ClipboardCheck, Heart
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllData, saveData } from '../utils/storage';
import { toast } from 'react-hot-toast';
import './DashboardSiswa.css';

const DashboardSiswa = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data, setData] = useState({ students: [], org: {}, subjects: [], schedule: [] });
  const [counselingTopic, setCounselingTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Tugas Eksponensial', subject: 'Matematika', deadline: 'Besok, 23:59', status: 'urgent' },
    { id: 2, title: 'Laporan Praktikum Lensa', subject: 'Fisika', deadline: '15 Jun, 12:00', status: 'pending' },
    { id: 3, title: 'Hafalan Surah Ar-Rahman', subject: 'Tahfidz', deadline: 'Selesai', status: 'completed' },
  ]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const d = getAllData();
    setData(d);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Real student data
  const realStudent = data.students?.find(s => s.name === user?.name) || {};
  const student = {
    name: realStudent.name || user?.name || 'Abdullah Hakim',
    class: realStudent.class || 'XII-A',
    nisn: realStudent.nisn || '0012345678',
    photo: realStudent.photo || user?.photo || null,
    gender: realStudent.gender || 'L',
  };

  // Wali kelas of this student's class
  const waliKelas = data.org?.homerooms?.[student.class] || 'Belum Ditentukan';

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

  // Academic period
  const academicYear = data.org?.academicYear || '2024/2025';
  const semester = data.org?.semester || 'Ganjil';

  // Mock stats — augmented with real data where available
  const attendancePercent = 97;
  const attendanceWeekly = [
    { day: 'Sen', status: 'hadir' }, { day: 'Sel', status: 'hadir' },
    { day: 'Rab', status: 'izin' }, { day: 'Kam', status: 'hadir' },
    { day: 'Jum', status: 'hadir' }, { day: 'Sab', status: 'hadir' },
  ];

  const gradeData = (data.subjects || []).slice(0, 6).map((sub, i) => ({
    subject: sub.length > 14 ? sub.slice(0, 14) + '…' : sub,
    fullName: sub,
    nilai: 72 + i * 4 + Math.round(Math.random() * 10),
    kkm: 75,
  }));

  const attendanceTrend = [
    { week: 'Mgg 1', pct: 100 }, { week: 'Mgg 2', pct: 85 },
    { week: 'Mgg 3', pct: 100 }, { week: 'Mgg 4', pct: 90 },
    { week: 'Mgg 5', pct: 100 }, { week: 'Mgg 6', pct: 95 },
  ];

  const hafalanData = {
    current: 3,
    target: 5,
    pct: 60,
    lastUpdate: '18 Jun 2026',
    lastSurah: 'Al-Mulk',
  };

  const scheduleToday = [
    { time: '07.30', endTime: '09.00', subject: data.subjects?.[0] || 'Matematika', teacher: waliKelas, room: 'R. 12', status: 'completed' },
    { time: '09.00', endTime: '10.30', subject: data.subjects?.[1] || 'Fisika', teacher: 'Budi Santoso, M.Si', room: 'Lab. Fisika', status: 'ongoing' },
    { time: '10.45', endTime: '12.15', subject: data.subjects?.[2] || 'PAI', teacher: 'Ustadz Ridwan, S.Ag', room: 'R. 12', status: 'upcoming' },
    { time: '13.00', endTime: '14.30', subject: data.subjects?.[3] || 'Bahasa Indonesia', teacher: 'Hj. Siti Aminah', room: 'R. 12', status: 'upcoming' },
  ];

  const badges = [
    { id: 1, name: '100% Kehadiran', icon: <Flame size={14} />, color: '#f97316' },
    { id: 2, name: 'Hafizh Teladan', icon: <Star size={14} />, color: '#eab308' },
    { id: 3, name: 'Juara Kelas', icon: <Trophy size={14} />, color: '#3b82f6' },
  ];

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  const handleCounselingRequest = (e) => {
    e.preventDefault();
    if (!counselingTopic.trim()) return toast.error('Isi topik konseling terlebih dahulu!');
    setIsSubmitting(true);
    setTimeout(() => {
      const d = getAllData();
      saveData('bkCounselingSchedules', [{
        id: Date.now(),
        requestDate: new Date().toISOString(),
        studentId: realStudent.id || 999,
        studentName: student.name,
        studentClass: student.class,
        topic: counselingTopic,
        status: 'Menunggu Konfirmasi'
      }, ...(d.bkCounselingSchedules || [])]);
      setIsSubmitting(false);
      setCounselingTopic('');
      toast.success('Permintaan konseling berhasil dikirim!');
    }, 600);
  };

  const getCalendarDays = () => {
    const y = calendarDate.getFullYear(), m = calendarDate.getMonth();
    const fd = new Date(y, m, 1).getDay();
    const dim = new Date(y, m + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < fd; i++) days.push(null);
    for (let i = 1; i <= dim; i++) days.push(i);
    return days;
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskProgress = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div className="sdx-page">

      {/* ── Hero Banner ── */}
      <div className="sdx-hero">
        <div className="sdx-hero-bg" />
        <div className="sdx-hero-inner">
          <div className="sdx-hero-left">
            <div className="sdx-avatar">
              {student.photo ? (
                <img src={student.photo} alt={student.name} />
              ) : (
                <span>{student.name.slice(0, 2).toUpperCase()}</span>
              )}
              <div className="sdx-avatar-ring" />
            </div>
            <div className="sdx-hero-info">
              <div className="sdx-greeting-chip">
                <Zap size={13} /> {getGreeting()}
              </div>
              <h1>{student.name}</h1>
              <p className="sdx-hero-meta">
                Kelas <strong>{student.class}</strong> &nbsp;·&nbsp; NISN <strong>{student.nisn}</strong> &nbsp;·&nbsp; TA {academicYear}
              </p>
              <div className="sdx-badge-row">
                {badges.map(b => (
                  <span key={b.id} className="sdx-badge" style={{ borderColor: b.color + '40', color: b.color, background: b.color + '15' }}>
                    {b.icon} {b.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="sdx-hero-right">
            <div className="sdx-clock-display">
              <div className="sdx-time">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              <div className="sdx-session-tag" style={{ background: session.color }}>{session.label}</div>
            </div>
            <div className="sdx-period-info">
              <div className="sdx-pi-item">
                <span>Semester</span>
                <strong>{semester.toUpperCase()}</strong>
              </div>
              <div className="sdx-pi-divider" />
              <div className="sdx-pi-item">
                <span>Wali Kelas</span>
                <strong>{waliKelas.split(',')[0].split(' ').slice(-1)[0]}</strong>
              </div>
              <div className="sdx-pi-divider" />
              <div className="sdx-pi-item">
                <span>Kehadiran</span>
                <strong style={{ color: '#6ee7b7' }}>{attendancePercent}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Running Text ── */}
      <div className="sdx-announce">
        <Bell size={13} />
        <div className="sdx-announce-track">
          <p>{data.org?.runningText || 'Selamat Datang • Tetap semangat belajar hari ini! • جَاهِدُوا فِي اللَّهِ حَقَّ جِهَادِهِ •'}</p>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="sdx-quick-actions">
        <button className="sdx-qa qa-green" onClick={() => navigate('/riwayat-presensi')}>
          <ClipboardCheck size={18} /> <span>Presensi Saya</span>
        </button>
          <button className="sdx-qa qa-blue" onClick={() => navigate('/nilai-siswa')}>
          <BookOpen size={18} /> <span>Nilai & Rapor</span>
        </button>
        <button className="sdx-qa qa-amber" onClick={() => navigate('/quran')}>
          <BookMarked size={18} /> <span>Tahfidz</span>
        </button>
        <button className="sdx-qa qa-purple" onClick={() => navigate('/ujian-sumatif')}>
          <FileText size={18} /> <span>Jadwal Ujian</span>
        </button>
        <button className="sdx-qa qa-pink" onClick={() => navigate('/religious')}>
          <Heart size={18} /> <span>Keagamaan</span>
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="sdx-grid">

        {/* ══ LEFT COLUMN ══ */}
        <div className="sdx-col-main">

          {/* Jadwal Hari Ini */}
          <div className="sdx-card">
            <div className="sdx-card-header">
              <Calendar size={18} />
              <h3>Jadwal Pelajaran</h3>
              <span className="sdx-header-badge">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="sdx-timeline">
              {scheduleToday.map((item, i) => (
                <div key={i} className={`sdx-tl-item ${item.status}`}>
                  <div className="sdx-tl-time">
                    <span className="sdx-tl-start">{item.time}</span>
                    <span className="sdx-tl-end">{item.endTime}</span>
                  </div>
                  <div className="sdx-tl-node">
                    <div className="sdx-tl-dot" />
                    {i < scheduleToday.length - 1 && <div className="sdx-tl-line" />}
                  </div>
                  <div className={`sdx-tl-card ${item.status}`}>
                    <div className="sdx-tl-card-top">
                      <span className="sdx-tl-subject">{item.subject}</span>
                      {item.status === 'ongoing' && (
                        <span className="sdx-live-pill"><span className="sdx-live-dot" /> LIVE</span>
                      )}
                      {item.status === 'completed' && (
                        <span className="sdx-done-pill"><CheckCircle2 size={12} /> Selesai</span>
                      )}
                    </div>
                    <div className="sdx-tl-card-meta">
                      <span>👤 {item.teacher}</span>
                      <span>📍 {item.room}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tren Kehadiran */}
          <div className="sdx-card">
            <div className="sdx-card-header">
              <TrendingUp size={18} />
              <h3>Tren Kehadiran</h3>
              <span className="sdx-header-badge green">{attendancePercent}% Bulan Ini</span>
            </div>
            {/* Weekly dots */}
            <div className="sdx-weekly-dots">
              {attendanceWeekly.map((d, i) => (
                <div key={i} className="sdx-dot-item">
                  <div className={`sdx-dot ${d.status}`} title={d.status} />
                  <span>{d.day}</span>
                </div>
              ))}
            </div>
            {/* Area chart */}
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={attendanceTrend} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="sdxAttGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(v) => [`${v}%`, 'Kehadiran']} />
                <Area type="monotone" dataKey="pct" stroke="#10b981" fill="url(#sdxAttGrad)" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Nilai per Mapel */}
          <div className="sdx-card">
            <div className="sdx-card-header">
              <BarChart2 size={18} />
              <h3>Rekap Nilai Mata Pelajaran</h3>
              <button className="sdx-card-link" onClick={() => navigate('/nilai-siswa')}>Lihat Rapor <ChevronRight size={14} /></button>
            </div>
            <div className="sdx-grade-list">
              {gradeData.map((g, i) => (
                <div key={i} className="sdx-grade-item">
                  <span className="sdx-grade-subject" title={g.fullName}>{g.subject}</span>
                  <div className="sdx-grade-bar-wrap">
                    <div className="sdx-grade-bar">
                      <div
                        className={`sdx-grade-fill ${g.nilai >= g.kkm ? 'pass' : 'fail'}`}
                        style={{ width: `${g.nilai}%` }}
                      />
                      <div className="sdx-kkm-line" style={{ left: `${g.kkm}%` }} title={`KKM: ${g.kkm}`} />
                    </div>
                  </div>
                  <span className={`sdx-grade-val ${g.nilai >= g.kkm ? 'pass' : 'fail'}`}>{g.nilai}</span>
                </div>
              ))}
            </div>
            <p className="sdx-grade-note">
              <span className="sdx-kkm-legend" /> Garis KKM (75)
            </p>
          </div>

        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="sdx-col-side">

          {/* Progress Hafalan Card */}
          <div className="sdx-hafalan-card">
            <div className="sdx-hafalan-header">
              <BookMarked size={20} />
              <div>
                <h3>Progress Hafalan</h3>
                <p>Target {hafalanData.target} Juz</p>
              </div>
            </div>
            <div className="sdx-hafalan-body">
              <div className="sdx-radial-wrap">
                <ResponsiveContainer width={120} height={120}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={90} endAngle={-270} data={[{ value: hafalanData.pct, fill: '#6ee7b7' }]}>
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.15)' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="sdx-radial-center">
                  <span className="sdx-radial-pct">{hafalanData.current}</span>
                  <span className="sdx-radial-sub">Juz</span>
                </div>
              </div>
              <div className="sdx-hafalan-stats">
                <div className="sdx-haf-stat">
                  <span>Terakhir</span>
                  <strong>{hafalanData.lastSurah}</strong>
                </div>
                <div className="sdx-haf-stat">
                  <span>Update</span>
                  <strong>{hafalanData.lastUpdate}</strong>
                </div>
                <div className="sdx-haf-stat">
                  <span>Progress</span>
                  <strong>{hafalanData.pct}%</strong>
                </div>
              </div>
            </div>
            <button className="sdx-hafalan-btn" onClick={() => navigate('/quran')}>
              Lihat Detail Tahfidz <ChevronRight size={14} />
            </button>
          </div>

          {/* Task Tracker */}
          <div className="sdx-card">
            <div className="sdx-card-header">
              <AlertCircle size={18} />
              <h3>Tugas & Deadline</h3>
              <span className="sdx-task-progress-chip">{completedTasks}/{tasks.length}</span>
            </div>
            {/* Progress bar */}
            <div className="sdx-task-prog-bar">
              <div className="sdx-task-prog-fill" style={{ width: `${taskProgress}%` }} />
            </div>
            <div className="sdx-tasks">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`sdx-task ${task.status}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="sdx-task-check">
                    {task.status === 'completed'
                      ? <CheckCircle2 size={20} className="sdx-check-done" />
                      : <div className={`sdx-check-empty ${task.status === 'urgent' ? 'urgent' : ''}`} />}
                  </div>
                  <div className="sdx-task-body">
                    <span className="sdx-task-title">{task.title}</span>
                    <div className="sdx-task-meta">
                      <span className="sdx-task-subject">{task.subject}</span>
                      <span className={`sdx-task-deadline ${task.status}`}>
                        <Clock size={11} /> {task.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="sdx-card">
            <div className="sdx-card-header">
              <Calendar size={18} />
              <h3>Kalender</h3>
              <div className="sdx-cal-nav">
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>
                  <ChevronLeft size={15} />
                </button>
                <span>{calendarDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' })}</span>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <div className="sdx-mini-cal">
              {['M','S','S','R','K','J','S'].map((d, i) => <div key={i} className="sdx-cal-head">{d}</div>)}
              {getCalendarDays().map((day, i) => {
                const isToday = day === currentTime.getDate() &&
                  calendarDate.getMonth() === currentTime.getMonth() &&
                  calendarDate.getFullYear() === currentTime.getFullYear();
                const hasEvent = day && (data.org?.agendas || []).some(a =>
                  a.date === `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                );
                return (
                  <div key={i} className={`sdx-cal-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}`}>
                    {day}
                    {hasEvent && <span className="sdx-event-dot" />}
                  </div>
                );
              })}
            </div>
            {/* Agenda */}
            <div className="sdx-agenda-mini">
              {(data.org?.agendas || []).slice(0, 2).map((a, i) => (
                <div key={i} className="sdx-agenda-item">
                  <div className={`sdx-agenda-dot cat-${a.category?.toLowerCase()}`} />
                  <div>
                    <span className="sdx-agenda-title">{a.title}</span>
                    <span className="sdx-agenda-date">
                      {new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · {a.category}
                    </span>
                  </div>
                </div>
              ))}
              {!(data.org?.agendas?.length) && <p className="sdx-no-agenda">Tidak ada agenda terdekat.</p>}
            </div>
          </div>

          {/* BK Counseling Request */}
          <div className="sdx-bk-card">
            <div className="sdx-card-header" style={{ color: '#be185d' }}>
              <HeartHandshake size={18} />
              <h3>Layanan BK</h3>
            </div>
            <p className="sdx-bk-desc">Ada yang ingin dibicarakan? Ajukan jadwal konseling dengan Guru BK.</p>
            <form onSubmit={handleCounselingRequest} className="sdx-bk-form">
              <textarea
                rows={2}
                placeholder="Topik: (Contoh: Bingung milih jurusan, perlu teman cerita...)"
                value={counselingTopic}
                onChange={e => setCounselingTopic(e.target.value)}
                className="sdx-bk-textarea"
              />
              <button type="submit" disabled={isSubmitting} className="sdx-bk-btn">
                <HeartHandshake size={16} />
                {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
              </button>
            </form>
          </div>

          {/* Motivasi */}
          <div className="sdx-quote-card">
            <Star size={18} />
            <blockquote>
              "{data.org?.quotes?.[0]?.text || 'Barangsiapa bersungguh-sungguh dalam menuntut ilmu, Allah akan membuka jalan baginya.'}"
            </blockquote>
            <cite>— {data.org?.quotes?.[0]?.author || 'Hadits'}</cite>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardSiswa;
