import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Search, 
  UserCheck, 
  UserX, 
  MapPin, 
  Camera,
  RefreshCw,
  LayoutGrid,
  CheckCircle2,
  Users,
  BookOpenText,
  BellRing,
  Send,
  AlertCircle,
  MessageCircle,
  Clock,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import { getAllData } from '../utils/storage';
import './Presence.css';

const Presence = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [manualSearch, setManualSearch] = useState('');
  const [masterData, setMasterData] = useState({
    subjects: [],
    classes: [],
    teachers: [],
    roles: []
  });
  
  const [selectedClass, setSelectedClass] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [sessionStudents, setSessionStudents] = useState([]);
  
  const [locationStatus, setLocationStatus] = useState('checking'); // checking, ok, out, error
  const [distance, setDistance] = useState(0);

  const [journal, setJournal] = useState({
    subject: '',
    teacher: '',
    role: '',
    topic: '',
    notes: '',
    schedule: ''
  });
  
  const [showToast, setShowToast] = useState(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    const data = getAllData();
    setMasterData(data);
    
    // Check Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        if (data.org?.lat && data.org?.lng) {
          const d = calculateDistance(
            pos.coords.latitude, 
            pos.coords.longitude, 
            parseFloat(data.org.lat), 
            parseFloat(data.org.lng)
          );
          setDistance(Math.round(d));
          const maxRadius = parseFloat(data.org.radius || 100);
          setLocationStatus(d <= maxRadius ? 'ok' : 'out');
        } else {
          setLocationStatus('ok'); // If no school location set, allow for now
        }
      }, (err) => {
        setLocationStatus('error');
      });
    }

    const studentList = data.students || [];
    setAllStudents(studentList);
    
    if (data?.subjects?.length > 0) {
      setJournal(prev => ({ 
        ...prev, 
        subject: data.subjects[0] || '',
        teacher: data.teachers?.[0] || '',
        role: data.roles?.[0] || '',
        schedule: data.schedule?.[0]?.label || ''
      }));
    }
    if (data?.classes?.length > 0) {
      setSelectedClass(data.classes[0]);
    }
  }, []);

  useEffect(() => {
    const classStudents = allStudents
      .filter(s => s.class === selectedClass)
      .map(s => ({
        id: s.id,
        name: s.name,
        parentPhone: s.parentPhone,
        gender: s.gender,
        status: 'Hadir'
      }));
    setSessionStudents(classStudents);
  }, [selectedClass, allStudents]);

  const toggleStatus = (id) => {
    setSessionStudents(prev => prev.map(s => {
      if (s.id === id) {
        const statusOrder = ['Hadir', 'Izin', 'Sakit', 'Alpa', 'Terlambat'];
        const nextStatus = statusOrder[(statusOrder.indexOf(s.status) + 1) % statusOrder.length];
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const markAllPresent = () => {
    setSessionStudents(prev => prev.map(s => ({ ...s, status: 'Hadir' })));
  };

  const openWhatsApp = (student) => {
    const teacherName = journal.teacher || 'Ustadz Ridwan';
    const subjectName = journal.subject || 'Fiqih';
    const genderTerm = student.gender === 'P' ? 'putri' : 'putra';
    const statusText = student.status === 'Alpa' ? `Tidak Hadir (Alpa) pada jam pelajaran ${journal.schedule || ''}` : `Sedang ${student.status} pada jam pelajaran ${journal.schedule || ''}`;
    
    const message = `Assalamu'alaikum Bapak/Ibu Wali Murid dari ${student.name}.\n\nSaya *${teacherName}*, Guru Mapel *${subjectName}* di Madrasah. Menginfokan bahwa ${genderTerm} Bapak/Ibu hari ini *${statusText}* pelajaran saya.\n\nPesan ini otomatis terkirim, menjadi pemberitahuan untuk evaluasi bersama. Terima kasih.`;

    let numbersOnly = student.parentPhone ? student.parentPhone.toString().replace(/\D/g, '') : '';
    if (numbersOnly.startsWith('0')) {
      numbersOnly = '62' + numbersOnly.slice(1);
    } else if (numbersOnly.startsWith('8')) {
      numbersOnly = '62' + numbersOnly;
    }

    const encodedMessage = encodeURIComponent(message);
    
    const link = document.createElement('a');
    link.href = `https://wa.me/${numbersOnly}?text=${encodedMessage}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScanned({
        name: 'Siswa Terdeteksi',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Hadir'
      });
    }, 2000);
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const absents = sessionStudents.filter(s => ['Alpa'].includes(s.status));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="presence-container"
    >
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="premium-toast"
          >
            <div className="toast-content">
              <CheckCircle2 size={20} />
              <span>Data Berhasil Disimpan!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="presence-premium-header">
        <div className="header-main-info">
          <div className="title-area">
            <h1 className="premium-page-title">Presensi & Jurnal</h1>
            <p className="premium-page-subtitle">Pencatatan kehadiran siswa dan agenda harian guru secara real-time.</p>
          </div>
          
          <div className={`location-badge-premium ${locationStatus}`}>
            {locationStatus === 'checking' && <><RefreshCw className="animate-spin" size={14} /> <span>Verifikasi GPS...</span></>}
            {locationStatus === 'ok' && <><MapPin size={14} /> <span>Dalam Radius Sekolah</span></>}
            {locationStatus === 'out' && <><AlertCircle size={14} /> <span>Luar Radius ({distance}m)</span></>}
            {locationStatus === 'error' && <><AlertCircle size={14} /> <span>GPS Nonaktif</span></>}
          </div>
        </div>

        <div className="premium-nav-tabs">
          <button className={`p-tab ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
            <LayoutGrid size={18} /> <span>Grid</span>
          </button>
          <button className={`p-tab ${viewMode === 'seating' ? 'active' : ''}`} onClick={() => setViewMode('seating')}>
            <MapPin size={18} /> <span>Denah</span>
          </button>
          <button className={`p-tab ${viewMode === 'scanner' ? 'active' : ''}`} onClick={() => setViewMode('scanner')}>
            <QrCode size={18} /> <span>Scan</span>
          </button>
          <button className={`p-tab ${viewMode === 'manual' ? 'active' : ''}`} onClick={() => setViewMode('manual')}>
            <Search size={18} /> <span>Cari</span>
          </button>
        </div>
      </div>

      <div className="presence-content">
        <div className="main-presence-area">
          <div className="glass-card main-presence-card">
            {viewMode === 'grid' && (
              <div className="express-attendance">
                <div className="express-controls">
                  <CustomSelect 
                    options={masterData.classes.map(c => `Kelas ${c}`)}
                    value={`Kelas ${selectedClass}`}
                    onChange={(val) => setSelectedClass(val.replace('Kelas ', ''))}
                    icon={Users}
                    className="presence-class-selector"
                  />
                  <button className="btn-mark-all-premium" onClick={markAllPresent}>
                    <CheckCircle2 size={16} /> Tandai Semua Hadir
                  </button>
                </div>

                <div className="attendance-grid">
                  {sessionStudents.map((student, idx) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      key={student.id} 
                      className={`premium-student-card ${student.status.toLowerCase()}`} 
                      onClick={() => toggleStatus(student.id)}
                    >
                      <div className="p-card-header">
                        <div className="p-avatar">{student.name.charAt(0)}</div>
                        <div className={`p-status-dot ${student.status.toLowerCase()}`}></div>
                      </div>
                      <div className="p-card-body">
                        <span className="p-student-name">{student.name}</span>
                        <div className={`p-status-pill ${student.status.toLowerCase()}`}>
                          {student.status}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {sessionStudents.length === 0 && (
                    <div className="premium-empty-state">
                      <div className="empty-icon-wrap">
                        <Users size={48} />
                      </div>
                      <h3>Belum Ada Data Siswa</h3>
                      <p>Silakan pilih kelas lain atau tambahkan data siswa di menu Pengaturan.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'seating' && (
              <div className="seating-chart-container">
                <div className="teacher-desk">MEJA GURU / PAPAN TULIS</div>
                <div className="seating-grid">
                  {sessionStudents.map((student, index) => (
                    <div key={student.id} className={`desk-item ${student.status.toLowerCase()}`} onClick={() => toggleStatus(student.id)}>
                      <span className="desk-number">{index + 1}</span>
                      <span className="desk-student-name">{student.name.split(' ')[0]}</span>
                      <div className="desk-status-indicator"></div>
                    </div>
                  ))}
                  {[...Array(Math.max(0, 16 - sessionStudents.length))].map((_, i) => (
                    <div key={`empty-${i}`} className="desk-item empty">
                      <span className="desk-number">{sessionStudents.length + i + 1}</span>
                      <span className="desk-student-name">KOSONG</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'manual' && (
              <div className="manual-section">
                <div className="search-box">
                  <Search size={20} className="search-icon" />
                  <input type="text" placeholder="Masukkan Nama atau NISN..." value={manualSearch} onChange={(e) => setManualSearch(e.target.value)} />
                </div>
                <div className="manual-results">
                  {manualSearch.trim() !== '' ? (
                    <div className="results-list">
                      {sessionStudents.filter(s => s.name.toLowerCase().includes(manualSearch.toLowerCase())).map(student => (
                        <div key={student.id} className="manual-result-item">
                          <div className="res-info">
                            <span className="res-name">{student.name}</span>
                            <span className="res-sub">Kelas {selectedClass}</span>
                          </div>
                          <div className="res-actions">
                            <button className={`status-btn-sm ${student.status.toLowerCase()}`} onClick={() => toggleStatus(student.id)}>
                              {student.status}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="results-empty">
                      <Users size={48} className="text-muted" />
                      <p>Ketik nama siswa untuk melakukan presensi manual</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {viewMode === 'scanner' && (
              <div className="scanner-section">
                <div className="scanner-viewport">
                  <div className={`scanner-overlay ${isScanning ? 'scanning' : ''}`}>
                    <div className="scanner-line"></div>
                  </div>
                  {!isScanning && !lastScanned && (
                    <div className="scanner-placeholder-premium">
                      <div className="s-icon-wrap">
                        <Camera size={48} />
                      </div>
                      <h3>Mode Scanner Aktif</h3>
                      <p>Silakan tekan tombol di bawah untuk mulai memindai kartu siswa.</p>
                      <button className="btn-start-scanner" onClick={handleScan}>Mulai Scanner</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {viewMode === 'grid' && (
            <div className="glass-card premium-journal-card">
              <div className="p-journal-header">
                <div className="p-header-icon"><BookOpenText size={20} /></div>
                <div className="p-header-text">
                  <h3>Jurnal Harian Guru</h3>
                  <p>Lengkapi agenda mengajar Anda</p>
                </div>
              </div>

              <div className="p-journal-grid">
                <div className="p-form-section">
                  <div className="p-section-title"><Users size={14} /> Info Kelas</div>
                  <div className="p-form-group">
                    <CustomSelect 
                      options={masterData.classes.map(c => `Kelas ${c}`)}
                      value={`Kelas ${selectedClass}`}
                      onChange={(val) => setSelectedClass(val.replace('Kelas ', ''))}
                      icon={Users}
                    />
                  </div>
                  <div className="p-form-group">
                    <CustomSelect 
                      options={masterData.roles}
                      value={journal.role}
                      onChange={(val) => setJournal({...journal, role: val})}
                      icon={UserCheck}
                      placeholder="Pilih Jabatan"
                    />
                  </div>
                </div>

                <div className="p-form-section">
                  <div className="p-section-title"><BookOpenText size={14} /> Info Pelajaran</div>
                  <div className="p-form-group">
                    <CustomSelect 
                      options={masterData.subjects}
                      value={journal.subject}
                      onChange={(val) => setJournal({...journal, subject: val})}
                      icon={BookOpenText}
                      placeholder="Pilih Mapel"
                    />
                  </div>
                  <div className="p-form-group">
                    <CustomSelect 
                      options={masterData.schedule?.map(s => s.label) || []}
                      value={journal.schedule}
                      onChange={(val) => setJournal({...journal, schedule: val})}
                      icon={Clock}
                      placeholder="Pilih Jam"
                    />
                  </div>
                </div>

                <div className="p-form-section full-width">
                  <div className="p-section-title"><Clock size={14} /> Periode Akademik</div>
                  <div className="form-grid-2">
                    <div className="p-readonly-badge premium-badge-style">
                      <div className="badge-icon-wrap"><BookOpenText size={18} /></div>
                      <div className="badge-text-wrap">
                        <span>Tahun Pelajaran</span>
                        <strong>{masterData.org?.academicYear || '2023/2024'}</strong>
                      </div>
                    </div>
                    <div className="p-readonly-badge premium-badge-style">
                      <div className="badge-icon-wrap"><CheckCircle2 size={18} /></div>
                      <div className="badge-text-wrap">
                        <span>Semester</span>
                        <strong>{masterData.org?.semester || 'Ganjil'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-form-section full-width">
                  <div className="p-section-title"><CheckCircle2 size={14} /> Detail Materi & Bukti</div>
                  <input 
                    className="p-input-topic"
                    type="text" 
                    value={journal.topic} 
                    onChange={(e) => setJournal({...journal, topic: e.target.value})} 
                    placeholder="Apa topik yang dibahas hari ini?" 
                  />
                  <div className="evidence-capture-wrapper">
                    <textarea 
                      className="p-textarea-notes"
                      value={journal.notes} 
                      onChange={(e) => setJournal({...journal, notes: e.target.value})} 
                      placeholder="Catatan tambahan kejadian di kelas..."
                    />
                    <div className="evidence-upload-box">
                      <label htmlFor="evidence-upload" className="evidence-label">
                        <Camera size={24} />
                        <span>Foto Bukti</span>
                      </label>
                      <input type="file" id="evidence-upload" hidden accept="image/*" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-journal-footer">
                <button 
                  className={`btn-save-premium ${locationStatus !== 'ok' ? 'disabled' : ''}`}
                  disabled={locationStatus !== 'ok'}
                  onClick={handleSave}
                >
                  <Send size={18} /> Simpan Data Presensi & Jurnal
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="side-presence-panel">
          <div className="glass-card info-panel">
            <h3 className="panel-title">Statistik Kehadiran</h3>
            <div className="premium-trends-horizontal">
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

            <div className="glass-card log-panel-premium" style={{ marginTop: '2rem' }}>
              <h3 className="panel-title">Log Aktivitas Terbaru</h3>
              <div className="premium-log-list">
                {sessionStudents.filter(s => s.status !== 'Hadir').slice(0, 4).map((s, i) => (
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
                      <span className="log-time">Baru saja • Kelas {selectedClass}</span>
                    </div>
                  </motion.div>
                ))}
                {sessionStudents.filter(s => s.status !== 'Hadir').length === 0 && (
                  <div className="log-empty">Belum ada aktivitas hari ini</div>
                )}
              </div>
            </div>

            {absents.length > 0 && (
              <div className="alert-panel">
                <div className="alert-header"><AlertCircle size={16} /><span>{absents.length} Siswa Perlu Tindakan</span></div>
                <div className="absent-action-list">
                  {absents.map(student => (
                    <div key={student.id} className="absent-action-item">
                      <div className="absent-info"><span className="absent-name">{student.name}</span></div>
                      <button className="btn-wa-circle" onClick={() => openWhatsApp(student)} title="Kirim WhatsApp"><MessageCircle size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card log-panel">
            <h3 className="panel-title">Log Terakhir</h3>
            <div className="log-list">
              {sessionStudents.filter(s => s.status !== 'Hadir').slice(0, 5).map(s => (
                <div key={s.id} className="log-item">
                  <div className="log-time">Baru saja</div>
                  <div className="log-details"><span className="name">{s.name}</span><span className="class">{selectedClass}</span></div>
                  <div className={`log-status ${s.status.toLowerCase()}`}>{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Presence;
