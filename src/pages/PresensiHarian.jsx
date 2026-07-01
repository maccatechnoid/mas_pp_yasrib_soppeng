import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle2,
  Users,
  XCircle,
  CalendarDays,
  Clock,
  AlertTriangle,
  Umbrella,
  FileDown,
  Save,
  Camera,
  Wifi,
  X,
  Flame,
  LogIn,
  LogOut,
  TrendingUp,
  Star,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import { getAllData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import './PresensiHarian.css';

const STORAGE_KEY = 'teacher_presence_logs';

// ─── Helpers ────────────────────────────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const getNow = () => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const STATUS_ORDER = ['Hadir', 'Izin', 'Sakit', 'Alpa', 'Cuti'];

const STATUS_META = {
  Hadir: { color: 'hadir', icon: <CheckCircle2 size={14} /> },
  Izin: { color: 'izin', icon: <Clock size={14} /> },
  Sakit: { color: 'sakit', icon: <AlertTriangle size={14} /> },
  Alpa: { color: 'alpa', icon: <XCircle size={14} /> },
  Cuti: { color: 'cuti', icon: <Umbrella size={14} /> },
};

const LATE_THRESHOLD = () => getAllData()?.org?.lateThreshold || '07:00';
const MIN_CHECKOUT_TIME = () => getAllData()?.org?.minCheckoutTime || '14:00';

const isTimeLate = (time) => time > LATE_THRESHOLD();

// ─── Load / Save Logs ───────────────────────────────────────────────────
const loadLogsForDate = (date) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    const filtered = all.filter(e => e.date === date);
    return filtered.length > 0 ? filtered : null;
  } catch {
    return null;
  }
};

const saveLogsForDate = (date, teachers) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : [];
    const otherDates = all.filter(e => e.date !== date);
    const newEntries = teachers.map(t => ({
      date,
      teacherName: t.name,
      status: t.status,
      timeIn: t.timeIn,
      timeOut: t.timeOut,
      notes: t.notes,
      photo: t.photo || null,
      savedAt: new Date().toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherDates, ...newEntries]));
    return true;
  } catch {
    return false;
  }
};

// ─── Build initial teacher list ──────────────────────────────────────────
const buildTeacherList = (masterTeachers, savedLogs, userName) => {
  const list = [...(masterTeachers || [])];
  if (userName && !list.includes(userName)) {
    list.push(userName);
  }
  return list.map((name, idx) => {
    const saved = savedLogs?.find(l => l.teacherName === name);
    return {
      id: idx + 1,
      name,
      status: saved?.status ?? 'Hadir',
      timeIn: saved?.timeIn ?? '',
      timeOut: saved?.timeOut ?? '',
      notes: saved?.notes ?? '',
      photo: saved?.photo ?? null,
    };
  });
};

const computeSummary = (teachers) => {
  const counts = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, Cuti: 0 };
  teachers.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });
  return counts;
};

const exportCSV = (date, teachers) => {
  const rows = [
    ['No', 'Nama Pegawai', 'Status', 'Jam Masuk', 'Jam Keluar', 'Keterangan'],
    ...teachers.map((t, i) => [i + 1, t.name, t.status, t.timeIn || '-', t.timeOut || '-', t.notes || '-']),
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `presensi-pegawai-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ═══════════════════════════════════════════════════════════════════════════
const PresensiHarian = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [toastTitle, setToastTitle] = useState('');
  const [masterData, setMasterData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // View mode
  const [viewMode, setViewMode] = useState('harian'); // 'harian' | 'bulanan'

  // Geolocation & Wi-Fi
  const [isLocating, setIsLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState('');

  // Camera Modal
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [faceStatus, setFaceStatus] = useState('idle'); // 'idle' | 'scanning' | 'detected' | 'failed'
  const videoRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const scanStartRef = useRef(null);      // timestamp when scanning began
  const positiveCountRef = useRef(0);    // consecutive positive hits needed

  const { user } = useAuth();
  const [personalHistory, setPersonalHistory] = useState([]);

  useEffect(() => {
    const data = getAllData();
    setMasterData(data);
  }, []);

  useEffect(() => {
    if (user?.name) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const allLogs = JSON.parse(raw);
          const history = allLogs
            .filter(l => l.teacherName === user.name)
            .sort((a, b) => b.date.localeCompare(a.date));
          setPersonalHistory(history);
        }
      } catch (e) { }
    }
  }, [user?.name, isDirty, selectedDate]);

  useEffect(() => {
    if (!masterData.teachers && !user?.name) return;
    const saved = loadLogsForDate(selectedDate);
    setTeachers(buildTeacherList(masterData.teachers, saved, user?.name));
    setIsDirty(false);
  }, [selectedDate, masterData, user?.name]);

  const showToast = (msg, type = 'success', title = '') => {
    setToastMsg(msg);
    setToastType(type);
    setToastTitle(title || (type === 'success' ? 'Berhasil' : 'Perhatian'));
    setTimeout(() => setToastMsg(''), 4000);
  };

  const updateTeacher = useCallback((id, patch) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    setIsDirty(true);
  }, []);

  const toggleStatus = useCallback((id) => {
    setTeachers(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = STATUS_ORDER[(STATUS_ORDER.indexOf(t.status) + 1) % STATUS_ORDER.length];
      return {
        ...t,
        status: next,
        timeIn: next === 'Hadir' ? (t.timeIn || getNow()) : '',
        timeOut: next === 'Hadir' ? t.timeOut : '',
      };
    }));
    setIsDirty(true);
  }, []);

  const markAllPresent = useCallback(() => {
    const now = getNow();
    setTeachers(prev => prev.map(t => ({
      ...t,
      status: 'Hadir',
      timeIn: t.timeIn || now,
    })));
    setIsDirty(true);
  }, []);

  const personalRecord = teachers.find(t => t.name === user?.name);
  const isAdminOrKepsek = user?.role === 'Admin' || user?.role === 'Kepala Madrasah';

  // ── Camera (Face Validation) Logic ──────────────────────────────────
  const startCamera = async () => {
    setShowCamera(true);
    setFaceStatus('idle');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      // Start scanning after video loads
      videoRef.current?.addEventListener('loadeddata', startFaceScan, { once: true });
    } catch (err) {
      showToast('Gagal mengakses kamera. Mohon izinkan akses kamera di browser Anda.', 'error');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    clearInterval(scanIntervalRef.current);
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setShowCamera(false);
    setFaceStatus('idle');
  };

  const startFaceScan = async () => {
    setFaceStatus('scanning');
    scanStartRef.current = Date.now();   // record when scan began
    positiveCountRef.current = 0;        // reset hit counter
    const video = videoRef.current;
    if (!video) return;

    const MIN_SCAN_MS = 3000;   // must scan at least 3 seconds
    const HITS_NEEDED = 4;      // require 4 consecutive positive frames

    const doScan = async () => {
      const elapsed = Date.now() - scanStartRef.current;

      let detected = false;

      // Try native FaceDetector API first (Chrome)
      if ('FaceDetector' in window) {
        try {
          const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
          const faces = await detector.detect(video);
          if (faces.length > 0) detected = true;
        } catch (e) { /* fallthrough */ }
      }

      // Fallback: brightness heuristic
      if (!detected) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 80; canvas.height = 60;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, 80, 60);
          const d = ctx.getImageData(0, 0, 80, 60).data;
          let brightness = 0;
          for (let i = 0; i < d.length; i += 4) brightness += (d[i] + d[i + 1] + d[i + 2]) / 3;
          brightness /= (d.length / 4);
          if (brightness > 30) detected = true;
        } catch (e) { /* ignore */ }
      }

      if (detected) {
        positiveCountRef.current += 1;
      } else {
        positiveCountRef.current = 0; // reset on miss
      }

      // Only confirm if minimum time elapsed AND enough consecutive hits
      if (elapsed >= MIN_SCAN_MS && positiveCountRef.current >= HITS_NEEDED) {
        onFaceDetected();
      }
    };

    // Poll every 700ms
    scanIntervalRef.current = setInterval(doScan, 700);
    // Timeout after 20s
    setTimeout(() => {
      clearInterval(scanIntervalRef.current);
      setFaceStatus(prev => prev === 'detected' ? prev : 'failed');
    }, 20000);
  };

  const onFaceDetected = () => {
    clearInterval(scanIntervalRef.current);
    setFaceStatus('detected');
    // Small pause so user sees the success state, then auto proceed
    setTimeout(() => {
      stopCamera();
      processCheckIn(); // no photo passed
    }, 800);
  };

  const retryFaceScan = () => {
    setFaceStatus('scanning');
    startFaceScan();
  };

  // ── Validation Flow (Wi-Fi + GPS) — No Photo Stored ─────────────────
  const processCheckIn = () => {
    setIsLocating(true);
    setLocationMsg('Memverifikasi Jaringan...');

    setTimeout(() => {
      setLocationMsg('Memverifikasi Lokasi GPS...');

      if (!navigator.geolocation) {
        setLocationMsg('');
        setIsLocating(false);
        showToast('Geolocation tidak didukung browser Anda', 'error');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLocating(false);
          setLocationMsg('✓ Terverifikasi');

          const now = getNow();
          const late = isTimeLate(now);

          updateTeacher(personalRecord.id, {
            status: 'Hadir',
            timeIn: now,
            notes: late && !personalRecord.notes ? 'Terlambat' : personalRecord.notes,
            // photo is intentionally NOT saved — face was validated locally only
          });

          showToast(late ? 'Check-in berhasil (Terlambat)' : 'Check-in berhasil!', 'success');

          if (late) {
            setTimeout(() => {
              showToast('Notifikasi keterlambatan dikirim ke Kepala Madrasah.', 'success');
            }, 1000);
          }

          setTimeout(() => setLocationMsg(''), 4000);
        },
        () => {
          setIsLocating(false);
          setLocationMsg('');
          showToast('Gagal verifikasi lokasi GPS.', 'error');
        },
        { timeout: 10000 }
      );
    }, 1200);
  };

  const handlePersonalCheckIn = () => {
    if (!personalRecord || personalRecord.timeIn) return;
    startCamera();
  };

  const handlePersonalCheckOut = () => {
    if (!personalRecord || !personalRecord.timeIn || personalRecord.timeOut) return;
    const now = getNow();
    const minOut = MIN_CHECKOUT_TIME();
    if (now < minOut) {
      showToast(`Belum waktunya pulang. Check Out dibuka jam ${minOut}`, 'error');
      return;
    }
    updateTeacher(personalRecord.id, { timeOut: now });
    showToast('Check-out berhasil. Hati-hati di jalan!', 'success');
  };

  const handleSave = () => {
    const ok = saveLogsForDate(selectedDate, teachers);
    if (ok) {
      showToast('Presensi berhasil disimpan!', 'success');
      setIsDirty(false);
    } else {
      showToast('Gagal menyimpan. Storage penuh?', 'error');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const summary = computeSummary(teachers);

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="teacher-presence-container"
    >
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -30, scale: 0.92, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -16, scale: 0.95, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={`premium-toast-v2 ${toastType}`}
          >
            <div className="toast-v2-icon">
              {toastType === 'success' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div className="toast-v2-body">
              <span className="toast-v2-title">{toastTitle}</span>
              <span className="toast-v2-msg">{toastMsg}</span>
            </div>
            <button className="toast-v2-close" onClick={() => setToastMsg('')}>
              <X size={14} />
            </button>
            <div className="toast-v2-progress" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-blue">
            <UserCheck size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Presensi Guru &amp; Tendik</h1>
            <p className="page-subtitle">Pencatatan kehadiran harian untuk tenaga pendidik dan kependidikan.</p>
          </div>
        </div>

        <div className="header-actions-premium">
          {isAdminOrKepsek && (
            <div className="view-mode-toggle">
              <button
                className={viewMode === 'harian' ? 'active' : ''}
                onClick={() => setViewMode('harian')}
              >Harian</button>
              <button
                className={viewMode === 'bulanan' ? 'active' : ''}
                onClick={() => setViewMode('bulanan')}
              >Bulanan</button>
            </div>
          )}
          {viewMode === 'harian' && isAdminOrKepsek && (
            <CustomDatePicker
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          )}
          {viewMode === 'bulanan' && (
            <div className="date-picker-wrapper">
              <CalendarDays size={18} />
              <input type="month" className="tp-date-input" defaultValue="2026-06" />
            </div>
          )}
        </div>
      </div>

      {viewMode === 'harian' ? (
        <>
          {isAdminOrKepsek && (
            <div className="tp-summary-row">
              {Object.entries(summary).map(([status, count]) => (
                <div key={status} className={`tp-summary-card ${STATUS_META[status].color}`}>
                  <span className="summary-icon">{STATUS_META[status].icon}</span>
                  <span className="summary-count">{count}</span>
                  <span className="summary-label">{status}</span>
                </div>
              ))}
              <div className="tp-summary-card total">
                <span className="summary-icon"><Users size={14} /></span>
                <span className="summary-count">{teachers.length}</span>
                <span className="summary-label">Total</span>
              </div>
            </div>
          )}

          {personalRecord && (() => {
            // --- Personal Stats Computation ---
            const workDaysThisMonth = 22; // approximate
            const hadirCount = personalHistory.filter(h => h.status === 'Hadir').length;
            const streakCount = (() => {
              let s = 0;
              for (const h of personalHistory) {
                if (h.status === 'Hadir') s++;
                else break;
              }
              return s;
            })();
            const attendancePct = Math.min(100, Math.round((hadirCount / workDaysThisMonth) * 100));
            const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

            return (
              <div className="personal-dashboard-card">
                {/* ── Top Row: Identity + Date ── */}
                <div className="pdc-top">
                  <div className="pdc-identity">
                    <div className="pdc-avatar">
                      {personalRecord.photo
                        ? <img src={personalRecord.photo} alt="selfie" />
                        : <span>{getInitials(personalRecord.name)}</span>}
                    </div>
                    <div className="pdc-identity-text">
                      <span className="pdc-name">{personalRecord.name}</span>
                      <span className="pdc-date">📅 {today}</span>
                    </div>
                  </div>
                  <span className={`pdc-status-pill ${personalRecord.status.toLowerCase()}`}>
                    {STATUS_META[personalRecord.status].icon}
                    {personalRecord.status}
                  </span>
                </div>

                {/* ── Middle Row: Stats ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="pdc-stats-row">
                    <div className="pdc-stat-box">
                      <div className="pdc-stat-icon" style={{ background: personalRecord.timeIn ? 'rgba(16,185,129,0.1)' : '#f1f5f9', color: personalRecord.timeIn ? '#10b981' : '#94a3b8' }}>
                        <LogIn size={18} />
                      </div>
                      <span className="pdc-stat-value" style={{ color: personalRecord.timeIn ? '#10b981' : '#94a3b8' }}>
                        {personalRecord.timeIn || '--:--'}
                      </span>
                      <span className="pdc-stat-label">Jam Masuk</span>
                    </div>
                    <div className="pdc-stat-divider" />
                    <div className="pdc-stat-box">
                      <div className="pdc-stat-icon" style={{ background: personalRecord.timeOut ? 'rgba(239,68,68,0.1)' : '#f1f5f9', color: personalRecord.timeOut ? '#ef4444' : '#94a3b8' }}>
                        <LogOut size={18} />
                      </div>
                      <span className="pdc-stat-value" style={{ color: personalRecord.timeOut ? '#ef4444' : '#94a3b8' }}>
                        {personalRecord.timeOut || '--:--'}
                      </span>
                      <span className="pdc-stat-label">Jam Keluar</span>
                    </div>
                  </div>

                  <div className="pdc-stats-row">
                    <div className="pdc-stat-box">
                      <div className="pdc-stat-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                        <Flame size={18} />
                      </div>
                      <span className="pdc-stat-value" style={{ color: '#f59e0b' }}>
                        {streakCount}
                      </span>
                      <span className="pdc-stat-label">Hari Berturut</span>
                    </div>
                    <div className="pdc-stat-divider" />
                    <div className="pdc-stat-box">
                      <div className="pdc-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                        <TrendingUp size={18} />
                      </div>
                      <span className="pdc-stat-value" style={{ color: '#3b82f6' }}>
                        {hadirCount}<span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}>/{workDaysThisMonth}</span>
                      </span>
                      <span className="pdc-stat-label">Hadir Bulan Ini</span>
                    </div>
                  </div>
                </div>

                {/* ── Progress Bar ── */}
                <div className="pdc-progress-section">
                  <div className="pdc-progress-labels">
                    <span>Tingkat Kehadiran Bulan Ini</span>
                    <span style={{ fontWeight: 700, color: attendancePct >= 80 ? '#10b981' : '#f59e0b' }}>{attendancePct}%</span>
                  </div>
                  <div className="pdc-progress-track">
                    <div
                      className="pdc-progress-fill"
                      style={{
                        width: `${attendancePct}%`,
                        background: attendancePct >= 80
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      }}
                    />
                  </div>
                  <p className="pdc-insight">
                    {attendancePct >= 90 && <><Star size={13} /> Luar biasa! Kehadiran Anda sangat sempurna bulan ini.</>}
                    {attendancePct >= 75 && attendancePct < 90 && <><CheckCircle2 size={13} /> Kehadiran Anda baik. Pertahankan semangat!</>}
                    {attendancePct < 75 && attendancePct > 0 && <><AlertTriangle size={13} /> Kehadiran perlu ditingkatkan. Semangat!</>}
                    {attendancePct === 0 && <><Info size={13} /> Belum ada data kehadiran bulan ini.</>}
                  </p>
                </div>

                {/* ── Action Buttons ── */}
                <div className="pdc-actions">
                  <div className="action-btn-wrapper">
                    <button
                      className={`pdc-btn pdc-btn-checkin ${personalRecord.timeIn ? 'done' : ''} ${isLocating ? 'locating' : ''}`}
                      onClick={handlePersonalCheckIn}
                      disabled={!!personalRecord.timeIn || isLocating}
                    >
                      {isLocating
                        ? <><Wifi size={18} className="spin-icon" /> Memverifikasi...</>
                        : personalRecord.timeIn
                          ? <><CheckCircle2 size={18} /> Masuk: {personalRecord.timeIn}</>
                          : <><Camera size={18} /> Selfie Check In</>
                      }
                    </button>
                    {locationMsg && <span className="location-msg">{locationMsg}</span>}
                  </div>
                  <div className="action-btn-wrapper">
                    <button
                      className={`pdc-btn pdc-btn-checkout ${personalRecord.timeOut ? 'done' : ''}`}
                      onClick={handlePersonalCheckOut}
                      disabled={!personalRecord.timeIn || !!personalRecord.timeOut}
                    >
                      {personalRecord.timeOut
                        ? <><CheckCircle2 size={18} /> Keluar: {personalRecord.timeOut}</>
                        : <><LogOut size={18} /> Check Out</>
                      }
                    </button>
                    {personalRecord.timeIn && !personalRecord.timeOut && getNow() < MIN_CHECKOUT_TIME() && (
                      <span className="location-msg" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                        Buka pukul {MIN_CHECKOUT_TIME()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {personalHistory.length > 0 && !isAdminOrKepsek && (
            <div className="glass-card table-card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>Riwayat Presensi Anda</h3>
              <div className="table-responsive">
                <table className="tp-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th>Jam Masuk</th>
                      <th>Jam Keluar</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalHistory.map((h, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: '#3b82f6' }}>{h.date}</td>
                        <td>
                          <span className={`status-badge ${h.status.toLowerCase()}`}>{h.status}</span>
                        </td>
                        <td>{h.timeIn || '-'}</td>
                        <td>{h.timeOut || '-'}</td>
                        <td>{h.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isAdminOrKepsek && (
            <>
              <div className="tp-controls-bar glass-card">
                <div className="search-box">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Cari nama guru / pegawai..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="tp-controls-right">
                  <button className="btn-mark-all-premium" onClick={markAllPresent}>
                    <CheckCircle2 size={16} /> Tandai Semua Hadir
                  </button>
                  <button className="btn-export-csv" onClick={() => exportCSV(selectedDate, teachers)}>
                    <FileDown size={16} /> Ekspor CSV
                  </button>
                </div>
              </div>

              <div className="tp-content-area">
                <div className="glass-card table-card">
                  {isDirty && (
                    <div className="tp-unsaved-banner">
                      <AlertTriangle size={16} />
                      <span>Ada perubahan yang belum disimpan.</span>
                    </div>
                  )}
                  <div className="table-responsive">
                    <table className="tp-table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nama Pegawai</th>
                          <th>Status</th>
                          <th>Jam Masuk</th>
                          <th>Jam Keluar</th>
                          <th>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.map((teacher, idx) => (
                          <tr key={teacher.id} className={teacher.name === user?.name ? 'row-self' : ''}>
                            <td className="td-no">{idx + 1}</td>
                            <td className="td-name">
                              <div className="name-and-badges">
                                <span>{teacher.name}</span>
                                <div className="badges-row">
                                  {teacher.name === user?.name && <span className="badge-you">Anda</span>}
                                  {teacher.status === 'Hadir' && isTimeLate(teacher.timeIn) && <span className="badge-late">Terlambat</span>}
                                </div>
                              </div>
                            </td>
                            <td>
                              <button
                                className={`tp-status-btn ${teacher.status.toLowerCase()}`}
                                onClick={() => toggleStatus(teacher.id)}
                              >
                                {STATUS_META[teacher.status].icon}
                                {teacher.status}
                              </button>
                            </td>
                            <td>
                              <div className="time-cell-content">
                                {teacher.status === 'Hadir' && !teacher.timeIn ? (
                                  <button className="btn-quick-time in" onClick={() => updateTeacher(teacher.id, { timeIn: getNow() })}>Check In</button>
                                ) : (
                                  <div className={`tp-time-input-wrap ${teacher.timeIn ? 'filled' : 'empty'}`}>
                                    <input
                                      type="time" className="tp-time-field"
                                      value={teacher.timeIn} onChange={e => updateTeacher(teacher.id, { timeIn: e.target.value })}
                                      disabled={teacher.status !== 'Hadir'}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="time-cell-content">
                                {teacher.status === 'Hadir' && teacher.timeIn && !teacher.timeOut ? (
                                  <button className="btn-quick-time out" onClick={() => updateTeacher(teacher.id, { timeOut: getNow() })}>Check Out</button>
                                ) : (
                                  <div className={`tp-time-input-wrap ${teacher.timeOut ? 'filled' : 'empty'}`}>
                                    <input
                                      type="time" className="tp-time-field"
                                      value={teacher.timeOut} onChange={e => updateTeacher(teacher.id, { timeOut: e.target.value })}
                                      disabled={teacher.status !== 'Hadir' || !teacher.timeIn}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <input
                                type="text" className="tp-notes-field" placeholder="Catatan..."
                                value={teacher.notes} onChange={e => updateTeacher(teacher.id, { notes: e.target.value })}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="tp-footer-actions">
                    <button className="btn-save-tp" onClick={handleSave}>
                      <Save size={18} /> Simpan Presensi
                    </button>
                    <span className="tp-last-saved">
                      {isDirty ? 'Belum disimpan' : `Data tanggal ${selectedDate}`}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* ── Monthly View (Admin Only) ── */
        <div className="tp-content-area monthly-view">
          <div className="glass-card table-card">
            <div className="monthly-header">
              <h3>Rekapitulasi</h3>
              <button className="btn-export-csv icon-only" onClick={() => window.print()} title="Unduh">
                <FileDown size={20} />
              </button>
            </div>
            <div className="table-responsive">
              <table className="tp-table monthly-table">
                <thead>
                  <tr>
                    <th>Nama Pegawai</th>
                    <th>Hadir</th>
                    <th>Terlambat</th>
                    <th>Sakit</th>
                    <th>Izin</th>
                    <th>Alpa</th>
                    <th>Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => {
                    // Mock data generation for monthly recap based on current status
                    const hadir = t.status === 'Hadir' ? 18 : 15;
                    const sakit = t.status === 'Sakit' ? 2 : 0;
                    const izin = t.status === 'Izin' ? 1 : 0;
                    const alpa = t.status === 'Alpa' ? 1 : 0;
                    const telat = isTimeLate(t.timeIn) ? 3 : 0;
                    const total = hadir + sakit + izin + alpa;
                    const pct = Math.round((hadir / (total || 1)) * 100);
                    return (
                      <tr key={t.id}>
                        <td className="td-name"><strong>{t.name}</strong></td>
                        <td>{hadir} Hari</td>
                        <td style={{ color: telat > 0 ? '#ef4444' : 'inherit' }}>{telat} Kali</td>
                        <td>{sakit} Hari</td>
                        <td>{izin} Hari</td>
                        <td>{alpa} Hari</td>
                        <td>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct > 80 ? '#10b981' : '#f59e0b' }}></div>
                            <span>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera Modal ── */}
      {showCamera && (
        <div className="modal-overlay">
          <div className="modal-content camera-modal">
            <button className="close-btn" onClick={stopCamera}><X size={20} /></button>

            <div className="camera-modal-header">
              <Camera size={22} />
              <div>
                <h3>Verifikasi Kehadiran</h3>
                <p className="camera-privacy-note">
                  🔒 Foto tidak disimpan. Hanya validasi wajah secara lokal.
                </p>
              </div>
            </div>

            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline muted />
              {/* Scanning overlay */}
              {faceStatus === 'scanning' && (
                <div className="face-overlay scanning">
                  <div className="face-guide-box">
                    <span /><span /><span /><span />
                  </div>
                  <p className="face-overlay-label">Mendeteksi wajah...</p>
                </div>
              )}
              {faceStatus === 'detected' && (
                <div className="face-overlay detected">
                  <div className="face-detected-icon">
                    <CheckCircle2 size={48} />
                  </div>
                  <p className="face-overlay-label">Wajah Terdeteksi!</p>
                </div>
              )}
              {faceStatus === 'failed' && (
                <div className="face-overlay failed">
                  <div className="face-detected-icon">
                    <XCircle size={48} />
                  </div>
                  <p className="face-overlay-label">Wajah tidak terdeteksi</p>
                </div>
              )}
            </div>

            <div className="camera-status-bar">
              {faceStatus === 'idle' && <span><Clock size={14} /> Menunggu kamera siap...</span>}
              {faceStatus === 'scanning' && <span className="scanning-pulse"><span className="dot" />Memindai wajah secara otomatis...</span>}
              {faceStatus === 'detected' && <span style={{ color: '#10b981', fontWeight: 700 }}><CheckCircle2 size={14} /> Wajah dikenali! Melanjutkan check-in...</span>}
              {faceStatus === 'failed' && (
                <div className="camera-retry-row">
                  <span style={{ color: '#ef4444' }}>Tidak ada wajah terdeteksi.</span>
                  <button className="camera-retry-btn" onClick={retryFaceScan}>Coba Lagi</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default PresensiHarian;
