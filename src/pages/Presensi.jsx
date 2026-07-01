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
  Check,
  ClipboardCheck,
  LogIn,
  LogOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import { getAllData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import './Presensi.css';

const Presensi = () => {
  const { user } = useAuth();
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
    schedule: '',
    timeIn: new Date().toTimeString().slice(0, 5),
    timeOut: ''
  });

  const [showToast, setShowToast] = useState(false);
  const [evidencePhoto, setEvidencePhoto] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEvidencePhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
        teacher: user && user.role !== 'Admin' ? user.name : (data.teachers?.[0] || ''),
        role: user && user.role !== 'Admin' ? user.role : (data.roles?.[0] || ''),
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
        photo: s.photo,
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
    // Save to teaching logs for payroll calculation
    try {
      const existingLogsStr = localStorage.getItem('teacher_teaching_logs');
      const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];

      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        teacher: user && user.role !== 'Admin' ? user.name : journal.teacher,
        subject: journal.subject,
        class: selectedClass,
        schedule: journal.schedule,
        topic: journal.topic,
        timeIn: journal.timeIn,
        timeOut: journal.timeOut
      };

      localStorage.setItem('teacher_teaching_logs', JSON.stringify([...existingLogs, newLog]));

      // Save student presence logs
      const existingPresenceStr = localStorage.getItem('student_presence_logs');
      const existingPresence = existingPresenceStr ? JSON.parse(existingPresenceStr) : [];

      const today = new Date().toISOString().split('T')[0];
      const newPresenceLogs = sessionStudents.map(student => ({
        id: Date.now() + Math.random(),
        date: today,
        studentName: student.name,
        subject: journal.subject || 'Mata Pelajaran',
        schedule: journal.schedule || '1',
        type: 'Masuk Kelas',
        status: student.status ? student.status.toLowerCase() : 'hadir',
        timeIn: journal.timeIn || '-',
        timeOut: journal.timeOut || '-',
        note: journal.topic || ''
      }));

      localStorage.setItem('student_presence_logs', JSON.stringify([...existingPresence, ...newPresenceLogs]));
    } catch (e) {
      console.warn('Failed to save teaching log', e);
    }

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
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <ClipboardCheck size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Presensi & Jurnal</h1>
            <p className="page-subtitle">Pencatatan kehadiran siswa dan agenda harian guru secara real-time.</p>
          </div>
        </div>

        <div className="header-actions-premium">
          <div className={`location-badge-premium ${locationStatus}`}>
            {locationStatus === 'checking' && <><RefreshCw className="animate-spin" size={14} /> <span>Verifikasi GPS...</span></>}
            {locationStatus === 'ok' && <><MapPin size={14} /> <span>Dalam Radius Sekolah</span></>}
            {locationStatus === 'out' && <><AlertCircle size={14} /> <span>Luar Radius ({distance > 1000 ? (distance / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + 'km' : distance + 'm'})</span></>}
            {locationStatus === 'error' && <><AlertCircle size={14} /> <span>GPS Nonaktif</span></>}
          </div>
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

      <div className={`presence-content ${absents.length > 0 ? 'has-sidebar' : 'no-sidebar'}`}>
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
                    <CheckCircle2 size={16} /> Tandai Semua
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
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-card-header">
                        <div className="p-avatar">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} style={{width:'100%', height:'100%', borderRadius:'inherit', objectFit:'cover'}} />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
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
                </div>
              </div>

              <div className="p-journal-grid">
                <div className="p-form-section full-width">
                  <div className="journal-selectors-grid">
                    <div className="p-form-group">
                      <label className="p-field-label">Kelas</label>
                      <CustomSelect
                        options={masterData.classes.map(c => `Kelas ${c}`)}
                        value={`Kelas ${selectedClass}`}
                        onChange={(val) => setSelectedClass(val.replace('Kelas ', ''))}
                        icon={Users}
                      />
                    </div>
                    <div className="p-form-group">
                      <label className="p-field-label">Mata Pelajaran</label>
                      <CustomSelect
                        options={masterData.subjects}
                        value={journal.subject}
                        onChange={(val) => setJournal({ ...journal, subject: val })}
                        icon={BookOpenText}
                        placeholder="Pilih Mapel"
                      />
                    </div>
                    <div className="p-form-group">
                      <label className="p-field-label">Jam Pelajaran</label>
                      <CustomSelect
                        options={masterData.schedule?.map(s => s.label) || []}
                        value={journal.schedule}
                        onChange={(val) => setJournal({ ...journal, schedule: val })}
                        icon={Clock}
                        placeholder="Pilih Jam"
                      />
                    </div>
                    <div className="p-form-group">
                      <label className="p-field-label">Nama Guru</label>
                      {user && user.role !== 'Admin' ? (
                        <div className="premium-selector-container">
                          <div className="premium-selector" style={{ background: '#f8fafc', borderColor: '#e2e8f0', cursor: 'default' }}>
                            <div className="selector-trigger" style={{ cursor: 'default' }}>
                              <UserCheck size={18} className="text-primary" />
                              <span className="selected-value" style={{ color: '#475569' }}>{user.name}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <CustomSelect
                          options={masterData.teachers}
                          value={journal.teacher}
                          onChange={(val) => setJournal({ ...journal, teacher: val })}
                          icon={UserCheck}
                          placeholder="Pilih Nama Guru"
                        />
                      )}
                    </div>
                    <div className="p-form-group">
                      <label className="p-field-label">Jabatan</label>
                      {user && user.role !== 'Admin' ? (
                        <div className="premium-selector-container">
                          <div className="premium-selector" style={{ background: '#f8fafc', borderColor: '#e2e8f0', cursor: 'default' }}>
                            <div className="selector-trigger" style={{ cursor: 'default' }}>
                              <LayoutGrid size={18} className="text-primary" />
                              <span className="selected-value" style={{ color: '#475569' }}>{user.role}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <CustomSelect
                          options={masterData.roles}
                          value={journal.role}
                          onChange={(val) => setJournal({ ...journal, role: val })}
                          icon={LayoutGrid}
                          placeholder="Pilih Jabatan"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-form-section full-width">
                  <div className="p-section-title"><Clock size={14} /> Waktu Mengajar</div>
                  <div className="form-grid-2">
                    <div className="teaching-time-card check-in">
                      <label className="time-card-label">
                        <LogIn size={16} /> Jam Masuk
                      </label>
                      <div className="time-input-group">
                        <input
                          type="time"
                          value={journal.timeIn || ''}
                          onChange={(e) => setJournal({ ...journal, timeIn: e.target.value })}
                          className="p-input-topic time-field"
                        />
                        <button
                          type="button"
                          className="btn-time-check in"
                          onClick={() => setJournal({ ...journal, timeIn: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) })}
                        >
                          Check In
                        </button>
                      </div>
                    </div>

                    <div className="teaching-time-card check-out">
                      <label className="time-card-label">
                        <LogOut size={16} /> Jam Keluar
                      </label>
                      <div className="time-input-group">
                        <input
                          type="time"
                          value={journal.timeOut || ''}
                          onChange={(e) => setJournal({ ...journal, timeOut: e.target.value })}
                          className="p-input-topic time-field"
                        />
                        <button
                          type="button"
                          className="btn-time-check out"
                          onClick={() => setJournal({ ...journal, timeOut: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) })}
                        >
                          Check Out
                        </button>
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
                    onChange={(e) => setJournal({ ...journal, topic: e.target.value })}
                    placeholder="Apa topik yang dibahas hari ini?"
                  />
                  <div className="evidence-capture-wrapper">
                    <textarea
                      className="p-textarea-notes"
                      value={journal.notes}
                      onChange={(e) => setJournal({ ...journal, notes: e.target.value })}
                      placeholder="Catatan tambahan kejadian di kelas..."
                    />
                    <div className="evidence-upload-box">
                      <input
                        type="file"
                        id="evidence-upload"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {evidencePhoto ? (
                        <div className="evidence-preview-container">
                          <img src={evidencePhoto} alt="Bukti Kegiatan" className="evidence-preview-img" />
                          <button
                            type="button"
                            className="btn-remove-evidence"
                            onClick={() => setEvidencePhoto(null)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="evidence-upload" className="evidence-label">
                          <Camera size={24} />
                          <span>Foto Bukti</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-journal-footer">
                <button
                  className={`btn-save-premium ${locationStatus === 'out' ? 'warning' : locationStatus === 'error' ? 'disabled' : ''}`}
                  onClick={handleSave}
                >
                  <Send size={18} />
                  <span>{locationStatus === 'out' ? 'Simpan (Luar Radius)' : 'Simpan Data Presensi & Jurnal'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {absents.length > 0 && (
          <div className="side-presence-panel">
            <div className="glass-card info-panel">
              <div className="alert-panel" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                <div className="alert-header">
                  <AlertCircle size={16} />
                  <span>{absents.length} Siswa Perlu Tindakan</span>
                </div>
                <div className="absent-action-list">
                  {absents.map(student => (
                    <div key={student.id} className="absent-action-item">
                      <div className="absent-info">
                        <span className="absent-name">{student.name}</span>
                      </div>
                      <button
                        className="btn-wa-circle"
                        onClick={() => openWhatsApp(student)}
                        title="Kirim WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Presensi;
