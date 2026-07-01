import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Trophy, LayoutDashboard, ListChecks, FileEdit, Users,
  TrendingDown, ArrowUpRight, Plus, Save, Printer, CalendarClock, Clock, CheckCircle2, X,
  GraduationCap, Mail, PhoneForwarded, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllData, saveData } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import { toast } from 'react-hot-toast';
import './Konseling.css';

const Konseling = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bkRules, setBkRules] = useState([]);
  const [bkRecords, setBkRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [bkLetters, setBkLetters] = useState([]);
  const [presenceLogs, setPresenceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState({});

  // Form states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRule, setSelectedRule] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [recordResolution, setRecordResolution] = useState('');
  const [recordStatus, setRecordStatus] = useState('Belum Selesai');

  // Alumni Form
  const [alumniName, setAlumniName] = useState('');
  const [alumniClass, setAlumniClass] = useState('');
  const [alumniYear, setAlumniYear] = useState('');

  // Surat Form
  const [letterType, setLetterType] = useState('Surat Pemanggilan Orang Tua');
  const [letterStudent, setLetterStudent] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);

  // WA Form
  const [waPeriod, setWaPeriod] = useState('Bulan Ini');
  const [waTarget, setWaTarget] = useState('Orang Tua');

  // Print Modals State
  const [printData, setPrintData] = useState(null); // { type: 'sp' | 'rapor', data: any }

  useEffect(() => {
    const data = getAllData();
    setStudents(data.students || []);
    setClasses(data.classes || []);
    setBkRules(data.bkRules || []);
    setBkRecords(data.bkRecords || []);
    setSchedules(data.bkCounselingSchedules || []);
    setAlumni(data.alumni || []);
    setBkLetters(data.bkLetters || []);
    setOrgData(data.org || {});

    // Load student presence
    const presStr = localStorage.getItem('student_presence_logs');
    if (presStr) {
      try { setPresenceLogs(JSON.parse(presStr)); } catch (e) { }
    }

    if (data.classes && data.classes.length > 0) {
      setSelectedClass(data.classes[0]);
    }
    setLoading(false);
  }, []);

  const availableStudents = students.filter(s => s.class === selectedClass);
  const ruleOptions = bkRules.map(r => `[${r.type}] ${r.name} (${r.point} Poin)`);

  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRule) {
      toast.error('Pilih Siswa dan Jenis Tata Tertib!');
      return;
    }

    const ruleMatch = bkRules.find(r => `[${r.type}] ${r.name} (${r.point} Poin)` === selectedRule);
    const studentMatch = students.find(s => s.name === selectedStudent);

    if (!ruleMatch || !studentMatch) return;

    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      studentId: studentMatch.id,
      studentName: studentMatch.name,
      studentClass: studentMatch.class,
      ruleId: ruleMatch.id,
      ruleType: ruleMatch.type,
      ruleName: ruleMatch.name,
      point: ruleMatch.point,
      notes: recordNotes,
      resolution: recordResolution,
      status: recordStatus
    };

    const updatedRecords = [newRecord, ...bkRecords];
    setBkRecords(updatedRecords);
    saveData('bkRecords', updatedRecords);
    toast.success('Catatan berhasil ditambahkan!');

    setRecordNotes('');
    setRecordResolution('');
    setRecordStatus('Belum Selesai');
    setSelectedStudent('');
  };

  const handleUpdateScheduleStatus = (id, newStatus) => {
    const updated = schedules.map(s => s.id === id ? { ...s, status: newStatus } : s);
    setSchedules(updated);
    saveData('bkCounselingSchedules', updated);
    toast.success(`Status jadwal diubah menjadi ${newStatus}`);
  };

  const handlePrintSP = (studentData) => {
    setPrintData({ type: 'sp', data: studentData });
    setTimeout(() => window.print(), 500);
  };

  const handlePrintRapor = (studentData) => {
    const records = bkRecords.filter(r => r.studentId === studentData.id);
    setPrintData({ type: 'rapor', data: { ...studentData, records } });
    setTimeout(() => window.print(), 500);
  };

  const handleSaveAlumni = (e) => {
    e.preventDefault();
    if (!alumniName || !alumniClass || !alumniYear) return toast.error('Lengkapi form alumni!');
    const newAlumni = { id: Date.now(), name: alumniName, class: alumniClass, year: alumniYear };
    const updated = [newAlumni, ...alumni];
    setAlumni(updated);
    saveData('alumni', updated);
    toast.success('Data alumni tersimpan');
    setAlumniName(''); setAlumniClass(''); setAlumniYear('');
  };

  const handleSaveLetter = (e) => {
    e.preventDefault();
    if (!letterStudent || !letterType) return toast.error('Pilih Siswa dan Jenis Surat!');
    const studentMatch = students.find(s => s.name === letterStudent);
    if (!studentMatch) return;

    const newLetter = {
      id: Date.now(), date: letterDate, type: letterType,
      studentId: studentMatch.id, studentName: studentMatch.name, studentClass: studentMatch.class
    };
    const updated = [newLetter, ...bkLetters];
    setBkLetters(updated);
    saveData('bkLetters', updated);
    toast.success('Arsip surat tersimpan');
    handlePrintSurat(newLetter);
  };

  const handlePrintSurat = (letter) => {
    setPrintData({ type: 'surat', data: letter });
    setTimeout(() => window.print(), 500);
  };

  const sendToWA = (student, stats) => {
    let phone = student.parentPhone || orgData.payment?.confirmWhatsApp || '';

    // In a real system, you'd fetch the specific phone for Wali Kelas/Pembina.
    // For demo, we fallback to placeholder if not parent.
    if (waTarget === 'Wali Kelas') phone = '081234567890';
    if (waTarget === 'Pembina') phone = '080987654321';

    if (!phone) return toast.error(`Nomor WA ${waTarget} tidak ditemukan`);

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.substring(1);

    const text = `Assalamu'alaikum. Berikut rekap absensi ananda *${student.name}* (Kelas ${student.class}) untuk *${waPeriod}*:
- Hadir: ${stats.H}
- Sakit: ${stats.S}
- Izin: ${stats.I}
- Alpa: ${stats.A}

Pesan laporan ini ditujukan kepada ${waTarget}. Demikian pemberitahuan ini. Terima kasih.
_Bimbingan Konseling Madrasah_`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getPresenceStats = (studentId) => {
    const stats = { H: 0, S: 0, I: 0, A: 0 };
    presenceLogs.filter(log => log.studentId === studentId).forEach(log => {
      if (stats[log.status] !== undefined) stats[log.status]++;
    });
    return stats;
  };

  // Calculate points for dashboard
  const studentPoints = {};
  students.forEach(s => {
    studentPoints[s.id] = { id: s.id, name: s.name, class: s.class, totalPoint: 0, violations: 0, achievements: 0 };
  });

  bkRecords.forEach(record => {
    if (studentPoints[record.studentId]) {
      studentPoints[record.studentId].totalPoint += record.point;
      if (record.ruleType === 'Pelanggaran') studentPoints[record.studentId].violations += 1;
      if (record.ruleType === 'Prestasi') studentPoints[record.studentId].achievements += 1;
    }
  });

  const sortedByViolations = Object.values(studentPoints)
    .filter(s => s.totalPoint < 0)
    .sort((a, b) => a.totalPoint - b.totalPoint) // Most negative first
    .slice(0, 5);

  const sortedByAchievements = Object.values(studentPoints)
    .filter(s => s.totalPoint > 0)
    .sort((a, b) => b.totalPoint - a.totalPoint) // Highest positive first
    .slice(0, 5);

  const totalViolations = bkRecords.filter(r => r.ruleType === 'Pelanggaran').length;
  const totalAchievements = bkRecords.filter(r => r.ruleType === 'Prestasi').length;
  const pendingSchedules = schedules.filter(s => s.status === 'Menunggu Konfirmasi').length;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="konseling-page animate-fade-in">
      <div className="page-header-premium no-print">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-amber">
            <ShieldAlert size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Bimbingan & Konseling</h1>
            <p className="page-subtitle">Pusat pemantauan karakter, kedisiplinan, dan penjadwalan.</p>
          </div>
        </div>
      </div>

      <div className="c-tabs-wrapper no-print">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={18} /> <span>Statistik</span>
        </button>
        <button className={`tab-btn ${activeTab === 'jurnal' ? 'active' : ''}`} onClick={() => setActiveTab('jurnal')}>
          <FileEdit size={18} /> <span>Catatan</span>
        </button>
        <button className={`tab-btn ${activeTab === 'absensi' ? 'active' : ''}`} onClick={() => setActiveTab('absensi')}>
          <CheckCircle size={18} /> <span>Absensi</span>
        </button>
        <button className={`tab-btn ${activeTab === 'surat' ? 'active' : ''}`} onClick={() => setActiveTab('surat')}>
          <Mail size={18} /> <span>Persuratan</span>
        </button>
        <button className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => setActiveTab('schedules')}>
          <CalendarClock size={18} /> <span>Jadwal Konseling</span>
        </button>
        <button className={`tab-btn ${activeTab === 'alumni' ? 'active' : ''}`} onClick={() => setActiveTab('alumni')}>
          <GraduationCap size={18} /> <span>Data Alumni</span>
        </button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => setActiveTab('rules')}>
          <ListChecks size={18} /> <span>Master Tata Tertib</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div className="no-print" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="dashboard">
            <div className="c-dashboard-grid">
              <div className="c-stat-card accent-purple">
                <div className="c-stat-icon"><Users size={24} /></div>
                <div className="c-stat-content">
                  <span className="td-stat-val">{students.length}</span>
                  <span className="td-stat-label">Total Santri Binaan</span>
                </div>
              </div>
              <div className="c-stat-card accent-red">
                <div className="c-stat-icon"><ShieldAlert size={24} /></div>
                <div className="c-stat-content">
                  <span className="td-stat-val">{totalViolations}</span>
                  <span className="td-stat-label">Total Kasus (Bulan Ini)</span>
                </div>
              </div>
              <div className="c-stat-card accent-green">
                <div className="c-stat-icon"><Trophy size={24} /></div>
                <div className="c-stat-content">
                  <span className="td-stat-val">{totalAchievements}</span>
                  <span className="td-stat-label">Prestasi Dicatat</span>
                </div>
              </div>
              <div className="c-stat-card accent-amber">
                <div className="c-stat-icon"><CalendarClock size={24} /></div>
                <div className="c-stat-content">
                  <span className="td-stat-val">{pendingSchedules}</span>
                  <span className="td-stat-label">Permintaan Konseling</span>
                </div>
              </div>
            </div>

            <div className="c-zone-container">
              <div className="c-zone-card red">
                <div className="c-zone-header">
                  <div className="c-zone-header-title">
                    <TrendingDown size={20} /> Zona Merah (Perlu Perhatian)
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">Siswa dengan akumulasi poin pelanggaran terbanyak. SP diterbitkan jika melampaui -50 Poin.</p>
                <ul className="c-zone-list">
                  {sortedByViolations.length > 0 ? sortedByViolations.map((s, i) => (
                    <li key={i} className="c-zone-item">
                      <div className="c-student-info">
                        <span className="c-student-name">{s.name}</span>
                        <span className="c-student-class">Kelas {s.class} | {s.violations} Kasus</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="c-point-badge negative">{s.totalPoint} Poin</span>
                        <button className="action-btn-print" onClick={() => handlePrintSP(s)} title="Cetak Surat Peringatan">
                          <Printer size={16} />
                        </button>
                      </div>
                    </li>
                  )) : <li className="c-zone-empty-state">Belum ada data pelanggaran.</li>}
                </ul>
              </div>

              <div className="c-zone-card green">
                <div className="c-zone-header">
                  <div className="c-zone-header-title">
                    <ArrowUpRight size={20} /> Zona Hijau (Apresiasi)
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4">Siswa dengan perolehan poin prestasi tertinggi.</p>
                <ul className="c-zone-list">
                  {sortedByAchievements.length > 0 ? sortedByAchievements.map((s, i) => (
                    <li key={i} className="c-zone-item">
                      <div className="c-student-info">
                        <span className="c-student-name">{s.name}</span>
                        <span className="c-student-class">Kelas {s.class} | {s.achievements} Prestasi</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="c-point-badge positive">+{s.totalPoint} Poin</span>
                        <button className="action-btn-print !bg-emerald-50 !text-emerald-600 !border-emerald-200" onClick={() => handlePrintRapor(s)} title="Cetak Rapor Sikap">
                          <Printer size={16} />
                        </button>
                      </div>
                    </li>
                  )) : <li className="c-zone-empty-state">Belum ada data prestasi.</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'jurnal' && (
          <motion.div className="no-print" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="jurnal">
            <div className="content-card mb-6 p-6">

              <form onSubmit={handleSaveRecord}>
                <div className="c-form-row">
                  <div className="c-form-group">
                    <label>Pilih Kelas</label>
                    <CustomSelect
                      options={classes}
                      value={selectedClass}
                      onChange={setSelectedClass}
                    />
                  </div>
                  <div className="c-form-group">
                    <label>Pilih Siswa</label>
                    <CustomSelect
                      options={availableStudents.map(s => s.name)}
                      value={selectedStudent}
                      onChange={setSelectedStudent}
                      placeholder="-"
                    />
                  </div>
                </div>
                <div className="c-form-row">
                  <div className="c-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Jenis Pelanggaran / Prestasi</label>
                    <CustomSelect
                      options={ruleOptions}
                      value={selectedRule}
                      onChange={setSelectedRule}
                      placeholder="-"
                    />
                  </div>
                </div>
                <div className="c-form-group mb-4">
                  <label>Keterangan Tambahan / Tindak Lanjut</label>
                  <textarea
                    rows="3"
                    placeholder=""
                    value={recordNotes}
                    onChange={(e) => setRecordNotes(e.target.value)}
                  ></textarea>
                </div>
                <div className="c-form-group mb-4">
                  <label>Penyelesaian / Tindak Lanjut</label>
                  <textarea
                    rows="2"
                    placeholder=""
                    value={recordResolution}
                    onChange={(e) => setRecordResolution(e.target.value)}
                  ></textarea>
                </div>
                <div className="c-form-group mb-4">
                  <label>Status Masalah</label>
                  <CustomSelect
                    options={['Belum Selesai', 'Selesai']}
                    value={recordStatus}
                    onChange={setRecordStatus}
                  />
                </div>
                <div className="flex justify-center mt-6">
                  <button type="submit" className="btn-primary-premium px-8">
                    <Save size={18} /> Simpan Catatan
                  </button>
                </div>
              </form>
            </div>

            <div className="content-card p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold bg-slate-50">Riwayat Catatan Jurnal & Masalah</div>
              <div className="overflow-x-auto">
                <table className="c-table w-full">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Nama Siswa</th>
                      <th>Kelas</th>
                      <th>Jenis</th>
                      <th>Keterangan / Masalah</th>
                      <th>Penyelesaian & Status</th>
                      <th>Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bkRecords.map(r => (
                      <tr key={r.id}>
                        <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                        <td className="font-semibold">{r.studentName}</td>
                        <td>{r.studentClass}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${r.ruleType === 'Pelanggaran' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {r.ruleType}
                          </span>
                        </td>
                        <td>
                          <strong>{r.ruleName}</strong>
                          {r.notes && <p className="text-xs text-slate-500 mt-1">{r.notes}</p>}
                        </td>
                        <td>
                          {r.resolution && <p className="text-sm">{r.resolution}</p>}
                          {r.status && (
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'Selesai' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                              {r.status}
                            </span>
                          )}
                        </td>
                        <td className={`font-bold ${r.point < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {r.point > 0 ? '+' : ''}{r.point}
                        </td>
                      </tr>
                    ))}
                    {bkRecords.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-500">Belum ada riwayat catatan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'schedules' && (
          <motion.div className="no-print" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="schedules">
            <div className="content-card p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-bold">Permintaan Reservasi Konseling dari Siswa</span>
              </div>
              <div className="overflow-x-auto">
                <table className="c-table w-full">
                  <thead>
                    <tr>
                      <th>Waktu Diajukan</th>
                      <th>Siswa</th>
                      <th>Kelas</th>
                      <th>Topik Konseling</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(s => (
                      <tr key={s.id}>
                        <td>{new Date(s.requestDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                        <td className="font-semibold">{s.studentName}</td>
                        <td>{s.studentClass}</td>
                        <td>{s.topic}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold 
                            ${s.status === 'Menunggu Konfirmasi' ? 'bg-amber-100 text-amber-700' :
                              s.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' :
                                'bg-slate-100 text-slate-700'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          {s.status === 'Menunggu Konfirmasi' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleUpdateScheduleStatus(s.id, 'Disetujui')} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold hover:bg-emerald-200">Terima</button>
                              <button onClick={() => handleUpdateScheduleStatus(s.id, 'Ditolak')} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold hover:bg-red-200">Tolak</button>
                            </div>
                          )}
                          {s.status === 'Disetujui' && (
                            <button onClick={() => handleUpdateScheduleStatus(s.id, 'Selesai')} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold hover:bg-blue-200">Tandai Selesai</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {schedules.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500">Belum ada permintaan konseling dari siswa.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'absensi' && (
          <motion.div className="no-print" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="absensi">
            <div className="content-card p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-4">
                <div>
                  <span className="font-bold block">Rekap Absensi Santri</span>
                  <p className="text-xs text-slate-500">Kirim rekap absensi secara otomatis via WhatsApp.</p>
                </div>
                <div className="flex gap-2">
                  <CustomSelect
                    options={['Bulan Ini', 'Semester Ini']}
                    value={waPeriod}
                    onChange={setWaPeriod}
                  />
                  <CustomSelect
                    options={['Orang Tua', 'Wali Kelas', 'Pembina']}
                    value={waTarget}
                    onChange={setWaTarget}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="c-table w-full">
                  <thead>
                    <tr>
                      <th>Nama Santri</th>
                      <th>Kelas</th>
                      <th>Hadir</th>
                      <th>Sakit</th>
                      <th>Izin</th>
                      <th>Alpa</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const stats = getPresenceStats(s.id);
                      return (
                        <tr key={s.id}>
                          <td className="font-semibold">{s.name}</td>
                          <td>{s.class}</td>
                          <td className="c-stat-text-h">{stats.H}</td>
                          <td className="c-stat-text-s">{stats.S}</td>
                          <td className="c-stat-text-i">{stats.I}</td>
                          <td className="c-stat-text-a">{stats.A}</td>
                          <td>
                            <button
                              onClick={() => sendToWA(s, stats)}
                              className="btn-wa"
                            >
                              <PhoneForwarded size={16} /> Kirim WA
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'alumni' && (
          <motion.div className="no-print" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="alumni">
            <div className="content-card mb-6 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus size={20} className="text-amber-500" /> Tambah Data Alumni
              </h3>
              <form onSubmit={handleSaveAlumni}>
                <div className="c-form-row">
                  <div className="c-form-group">
                    <label>Nama Alumni</label>
                    <input type="text" value={alumniName} onChange={e => setAlumniName(e.target.value)} placeholder="Nama lengkap..." />
                  </div>
                  <div className="c-form-group">
                    <label>Kelas Terakhir</label>
                    <input type="text" value={alumniClass} onChange={e => setAlumniClass(e.target.value)} placeholder="Contoh: XII-A" />
                  </div>
                  <div className="c-form-group">
                    <label>Tahun Lulus</label>
                    <input type="number" value={alumniYear} onChange={e => setAlumniYear(e.target.value)} placeholder="Contoh: 2024" />
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <button type="submit" className="btn-primary-premium px-8">
                    <Save size={18} /> Simpan Data
                  </button>
                </div>
              </form>
            </div>

            <div className="content-card p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold bg-slate-50">Daftar Alumni</div>
              <div className="overflow-x-auto">
                <table className="c-table w-full">
                  <thead>
                    <tr>
                      <th>Nama Alumni</th>
                      <th>Kelas Terakhir</th>
                      <th>Tahun Lulus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumni.map(a => (
                      <tr key={a.id}>
                        <td className="font-semibold">{a.name}</td>
                        <td>{a.class}</td>
                        <td>{a.year}</td>
                      </tr>
                    ))}
                    {alumni.length === 0 && (
                      <tr><td colSpan="3" className="text-center py-8 text-slate-500">Belum ada data alumni.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'surat' && (
          <motion.div className="no-print" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="surat">
            <div className="content-card mb-6 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              </h3>
              <form onSubmit={handleSaveLetter}>
                <div className="c-form-row">
                  <div className="c-form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Jenis Surat</label>
                    <CustomSelect
                      options={[
                        'Surat Pemanggilan Orang Tua',
                        'Surat Pernyataan Santri',
                        'Surat Pernyataan Orang Tua / Wali',
                        'Surat Perjanjian Terakhir Santri'
                      ]}
                      value={letterType}
                      onChange={setLetterType}
                    />
                  </div>
                </div>
                <div className="c-form-row">
                  <div className="c-form-group">
                    <label>Pilih Siswa</label>
                    <CustomSelect
                      options={students.map(s => s.name)}
                      value={letterStudent}
                      onChange={setLetterStudent}
                      placeholder="-- Pilih Siswa --"
                    />
                  </div>
                  <div className="c-form-group">
                    <label>Tanggal Surat</label>
                    <input type="date" value={letterDate} onChange={e => setLetterDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <button type="submit" className="btn-primary-premium px-8">
                    <Printer size={18} /> Buat dan Cetak Surat
                  </button>
                </div>
              </form>
            </div>

            <div className="content-card p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold bg-slate-50">Riwayat Cetak Surat</div>
              <div className="overflow-x-auto">
                <table className="c-table w-full">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Jenis Surat</th>
                      <th>Siswa</th>
                      <th>Kelas</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bkLetters.map(l => (
                      <tr key={l.id}>
                        <td>{new Date(l.date).toLocaleDateString('id-ID')}</td>
                        <td><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">{l.type}</span></td>
                        <td className="font-semibold">{l.studentName}</td>
                        <td>{l.studentClass}</td>
                        <td>
                          <button onClick={() => handlePrintSurat(l)} className="text-blue-600 hover:text-blue-800">
                            <Printer size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bkLetters.length === 0 && (
                      <tr><td colSpan="5" className="text-center py-8 text-slate-500">Belum ada riwayat surat.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'rules' && (
          <motion.div className="no-print" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="rules">
            <div className="content-card p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <span className="font-bold">Master Data</span>
                <button className="btn-primary-premium py-1.5 px-3 text-sm">
                  <Plus size={16} /> Tambah Aturan
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="c-table w-full">
                  <thead>
                    <tr>
                      <th>Tipe</th>
                      <th>Kategori</th>
                      <th>Nama Aturan (Rule)</th>
                      <th>Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bkRules.map(r => (
                      <tr key={r.id}>
                        <td>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${r.type === 'Pelanggaran' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {r.type}
                          </span>
                        </td>
                        <td>{r.category}</td>
                        <td>{r.name}</td>
                        <td className={`font-bold ${r.point < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {r.point > 0 ? '+' : ''}{r.point}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRINT MODAL: SURAT PERINGATAN (SP) / RAPOR SIKAP */}
      {printData && (
        <div className="c-modal-overlay no-print" onClick={(e) => {
          if (e.target.classList.contains('c-modal-overlay')) setPrintData(null);
        }}>
          <div className="c-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Preview Cetak {printData.type === 'sp' ? 'Surat Peringatan' : 'Rapor Sikap'}
              </h2>
              <button onClick={() => setPrintData(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 p-8 border border-slate-200 rounded-xl mb-6 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                <ShieldAlert size={200} />
              </div>
              <div className="text-center mb-8 border-b-2 border-slate-800 pb-4 relative z-10">
                <h3 className="text-2xl font-bold uppercase tracking-wider">{orgData.kopHeader1 || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA'}</h3>
                <h4 className="text-xl font-bold">{orgData.kopHeader2 || 'MADRASAH ALIYAH NEGERI'}</h4>
                <p className="text-sm">{orgData.kopHeader3 || 'Jl. Pendidikan No. 1, Kota Belajar, Kode Pos 12345'}</p>
              </div>

              {printData.type === 'sp' && (
                <div className="relative z-10">
                  <h4 className="text-center font-bold text-lg underline mb-6">SURAT PERINGATAN (SP)</h4>
                  <p className="mb-4">Nomor: SP-BK/MADRASAH/{new Date().getFullYear()}/{(Math.random() * 1000).toFixed(0).padStart(3, '0')}</p>
                  <p className="mb-4">Diberitahukan dengan hormat, berdasarkan catatan kedisiplinan dan tata tertib madrasah, siswa di bawah ini:</p>

                  <table className="mb-6 w-full">
                    <tbody>
                      <tr><td className="w-48 py-1">Nama</td><td className="py-1">: <strong>{printData.data.name}</strong></td></tr>
                      <tr><td className="py-1">Kelas</td><td className="py-1">: {printData.data.class}</td></tr>
                      <tr><td className="py-1">Total Poin Pelanggaran</td><td className="py-1">: <span className="text-red-600 font-bold">{printData.data.totalPoint} Poin</span></td></tr>
                      <tr><td className="py-1">Jumlah Kasus</td><td className="py-1">: {printData.data.violations} kali pelanggaran</td></tr>
                    </tbody>
                  </table>

                  <p className="mb-6 leading-relaxed">
                    Telah melampaui batas poin pelanggaran yang ditetapkan oleh madrasah. Oleh karena itu, kami mengeluarkan <strong>Surat Peringatan</strong> ini agar siswa yang bersangkutan dapat memperbaiki kedisiplinan dan sikapnya. Kami juga mengharapkan kehadiran Bapak/Ibu Wali Murid untuk berkonsultasi dengan Guru Bimbingan Konseling (BK) pada waktu yang akan ditentukan kemudian.
                  </p>
                </div>
              )}

              {printData.type === 'rapor' && (
                <div className="relative z-10">
                  <h4 className="text-center font-bold text-lg underline mb-6">REKAM JEJAK SIKAP & KEDISIPLINAN (RAPOR SIKAP)</h4>
                  <p className="mb-4">Berikut adalah lampiran catatan kedisiplinan siswa selama semester berjalan:</p>

                  <table className="mb-6 w-full">
                    <tbody>
                      <tr><td className="w-48 py-1">Nama</td><td className="py-1">: <strong>{printData.data.name}</strong></td></tr>
                      <tr><td className="py-1">Kelas</td><td className="py-1">: {printData.data.class}</td></tr>
                      <tr><td className="py-1">Total Poin</td><td className="py-1">: <span className="font-bold text-emerald-600">+{printData.data.totalPoint} Poin</span></td></tr>
                    </tbody>
                  </table>

                  <table className="w-full border-collapse border border-slate-300 text-sm mb-6">
                    <thead>
                      <tr className="bg-slate-200">
                        <th className="border border-slate-300 p-2 text-left">Tanggal</th>
                        <th className="border border-slate-300 p-2 text-left">Jenis</th>
                        <th className="border border-slate-300 p-2 text-left">Keterangan</th>
                        <th className="border border-slate-300 p-2 text-center">Poin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printData.data.records.map(r => (
                        <tr key={r.id}>
                          <td className="border border-slate-300 p-2">{new Date(r.date).toLocaleDateString('id-ID')}</td>
                          <td className="border border-slate-300 p-2">{r.ruleType}</td>
                          <td className="border border-slate-300 p-2">{r.ruleName}</td>
                          <td className="border border-slate-300 p-2 text-center">{r.point}</td>
                        </tr>
                      ))}
                      {printData.data.records.length === 0 && (
                        <tr><td colSpan="4" className="border border-slate-300 p-4 text-center text-slate-500">Belum ada catatan sikap</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {printData.type === 'surat' && (
                <div className="relative z-10">
                  <h4 className="text-center font-bold text-lg underline mb-6 uppercase">{printData.data.type}</h4>

                  {printData.data.type === 'Surat Pemanggilan Orang Tua' && (
                    <div className="text-justify leading-relaxed">
                      <p className="mb-4">Nomor: B-{(Math.random() * 100).toFixed(0).padStart(3, '0')}/BK/MADRASAH/{new Date(printData.data.date).getFullYear()}</p>
                      <p className="mb-4">Yth. Bapak/Ibu Wali Murid dari ananda:</p>
                      <table className="mb-6 w-full ml-4">
                        <tbody>
                          <tr><td className="w-32 py-1">Nama</td><td className="py-1">: <strong>{printData.data.studentName}</strong></td></tr>
                          <tr><td className="py-1">Kelas</td><td className="py-1">: {printData.data.studentClass}</td></tr>
                        </tbody>
                      </table>
                      <p className="mb-4">Bersama surat ini, kami mengharap kehadiran Bapak/Ibu di madrasah untuk membicarakan perkembangan akademik dan sikap ananda pada:</p>
                      <table className="mb-6 w-full ml-4 font-bold">
                        <tbody>
                          <tr><td className="w-32 py-1">Hari, Tanggal</td><td className="py-1">: .......................................</td></tr>
                          <tr><td className="py-1">Waktu</td><td className="py-1">: .......................................</td></tr>
                          <tr><td className="py-1">Tempat</td><td className="py-1">: Ruang Bimbingan Konseling (BK)</td></tr>
                        </tbody>
                      </table>
                      <p className="mb-4">Mengingat pentingnya acara tersebut, kami mohon kehadiran Bapak/Ibu tepat pada waktunya. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.</p>
                    </div>
                  )}

                  {(printData.data.type === 'Surat Pernyataan Santri' || printData.data.type === 'Surat Perjanjian Terakhir Santri') && (
                    <div className="text-justify leading-relaxed">
                      <p className="mb-4">Yang bertanda tangan di bawah ini, saya selaku siswa/santri Madrasah:</p>
                      <table className="mb-6 w-full ml-4">
                        <tbody>
                          <tr><td className="w-48 py-1">Nama Lengkap</td><td className="py-1">: <strong>{printData.data.studentName}</strong></td></tr>
                          <tr><td className="py-1">Kelas</td><td className="py-1">: {printData.data.studentClass}</td></tr>
                        </tbody>
                      </table>
                      <p className="mb-4">Dengan ini menyatakan dengan sebenar-benarnya dan penuh kesadaran bahwa saya:</p>
                      <div className="mb-6 ml-4 space-y-4 border p-4 rounded-lg bg-white min-h-[150px]">
                        <p className="text-slate-400 italic">(Isi detail pelanggaran / pernyataan komitmen yang dibuat oleh siswa di sini)</p>
                      </div>
                      <p className="mb-4">Apabila di kemudian hari saya mengulangi pelanggaran yang sama atau melanggar tata tertib madrasah, saya bersedia menerima sanksi yang lebih berat sesuai ketentuan madrasah.</p>
                      <p className="mb-4">Demikian surat pernyataan ini saya buat dalam keadaan sadar tanpa paksaan dari pihak mana pun.</p>
                    </div>
                  )}

                  {printData.data.type === 'Surat Pernyataan Orang Tua / Wali' && (
                    <div className="text-justify leading-relaxed">
                      <p className="mb-4">Yang bertanda tangan di bawah ini, saya selaku orang tua/wali dari siswa:</p>
                      <table className="mb-6 w-full ml-4">
                        <tbody>
                          <tr><td className="w-48 py-1">Nama Siswa</td><td className="py-1">: <strong>{printData.data.studentName}</strong></td></tr>
                          <tr><td className="py-1">Kelas</td><td className="py-1">: {printData.data.studentClass}</td></tr>
                        </tbody>
                      </table>
                      <p className="mb-4">Menyatakan bahwa saya telah mengetahui pelanggaran tata tertib yang dilakukan oleh ananda, dan saya berkomitmen untuk:</p>
                      <ol className="list-decimal ml-8 mb-6 space-y-2">
                        <li>Lebih meningkatkan pengawasan terhadap ananda di luar jam sekolah.</li>
                        <li>Mendukung penuh pihak madrasah dalam mendidik dan mendisiplinkan ananda.</li>
                        <li>Menerima konsekuensi/sanksi sesuai tata tertib apabila ananda kembali melakukan pelanggaran.</li>
                      </ol>
                      <p className="mb-4">Demikian surat pernyataan ini dibuat sebagai bentuk tanggung jawab saya sebagai orang tua/wali siswa.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-12 relative z-10">
                <div className="text-center">
                  <p>Mengetahui,</p>
                  <p className="mb-16">Kepala Madrasah</p>
                  <p className="font-bold underline">{orgData.principal || 'Ahmad Fulan, S.Pd., M.Pd.'}</p>
                  <p>NIP. {orgData.principalNip || '-'}</p>
                </div>
                <div className="text-center">
                  <p>{orgData.address?.split(',')[0] || 'Jakarta'}, {new Date(printData.data?.date || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="mb-16">Guru Bimbingan Konseling</p>
                  <p className="font-bold underline">{orgData.teacherName || 'Hj. Siti Aminah, S.Psi.'}</p>
                  <p>NIP. {orgData.teacherNip || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setPrintData(null)} className="px-6 py-2 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
                Tutup
              </button>
              <button onClick={() => window.print()} className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Printer size={18} /> Cetak Dokumen Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTUAL PRINT DOCUMENT (Hidden on Screen, Visible on Print) */}
      {printData && (
        <div className="print-document">
          <div className="print-header">
            <h3 className="print-title uppercase">{orgData.kopHeader1 || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA'}</h3>
            <h4 className="print-title">{orgData.kopHeader2 || 'MADRASAH ALIYAH NEGERI'}</h4>
            <p className="print-subtitle">{orgData.kopHeader3 || 'Jl. Pendidikan No. 1, Kota Belajar, Kode Pos 12345'}</p>
          </div>

          {printData.type === 'sp' && (
            <div className="print-body">
              <h4 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'underline', marginBottom: '1rem' }}>SURAT PERINGATAN (SP)</h4>
              <p style={{ marginBottom: '1rem' }}>Nomor: SP-BK/MADRASAH/{new Date().getFullYear()}/{(Math.random() * 1000).toFixed(0).padStart(3, '0')}</p>
              <p style={{ marginBottom: '1rem' }}>Diberitahukan dengan hormat, berdasarkan catatan kedisiplinan dan tata tertib madrasah, siswa di bawah ini:</p>

              <table style={{ marginBottom: '1.5rem', width: '100%', fontSize: '1.1rem' }}>
                <tbody>
                  <tr><td style={{ width: '200px' }}>Nama</td><td>: <strong>{printData.data.name}</strong></td></tr>
                  <tr><td>Kelas</td><td>: {printData.data.class}</td></tr>
                  <tr><td>Total Poin Pelanggaran</td><td>: <span style={{ fontWeight: 'bold' }}>{printData.data.totalPoint} Poin</span></td></tr>
                  <tr><td>Jumlah Kasus</td><td>: {printData.data.violations} kali pelanggaran</td></tr>
                </tbody>
              </table>

              <p style={{ textAlign: 'justify', marginBottom: '2rem' }}>
                Telah melampaui batas poin pelanggaran yang ditetapkan oleh madrasah. Oleh karena itu, kami mengeluarkan <strong>Surat Peringatan</strong> ini agar siswa yang bersangkutan dapat memperbaiki kedisiplinan dan sikapnya. Kami juga mengharapkan kehadiran Bapak/Ibu Wali Murid untuk berkonsultasi dengan Guru Bimbingan Konseling (BK) pada waktu yang akan ditentukan kemudian.
              </p>
            </div>
          )}

          {printData.type === 'rapor' && (
            <div className="print-body">
              <h4 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'underline', marginBottom: '1rem' }}>REKAM JEJAK SIKAP & KEDISIPLINAN (RAPOR SIKAP)</h4>
              <p style={{ marginBottom: '1rem' }}>Berikut adalah lampiran catatan kedisiplinan siswa selama semester berjalan:</p>

              <table style={{ marginBottom: '1.5rem', width: '100%', fontSize: '1.1rem' }}>
                <tbody>
                  <tr><td style={{ width: '200px' }}>Nama</td><td>: <strong>{printData.data.name}</strong></td></tr>
                  <tr><td>Kelas</td><td>: {printData.data.class}</td></tr>
                  <tr><td>Total Poin</td><td>: <span style={{ fontWeight: 'bold' }}>+{printData.data.totalPoint} Poin</span></td></tr>
                </tbody>
              </table>

              <table className="print-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Keterangan</th>
                    <th style={{ textAlign: 'center' }}>Poin</th>
                  </tr>
                </thead>
                <tbody>
                  {printData.data.records.map(r => (
                    <tr key={r.id}>
                      <td>{new Date(r.date).toLocaleDateString('id-ID')}</td>
                      <td>{r.ruleType}</td>
                      <td>{r.ruleName}</td>
                      <td style={{ textAlign: 'center' }}>{r.point}</td>
                    </tr>
                  ))}
                  {printData.data.records.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>Belum ada catatan sikap</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {printData.type === 'surat' && (
            <div className="print-body">
              <h4 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'underline', marginBottom: '1rem', textTransform: 'uppercase' }}>{printData.data.type}</h4>

              {printData.data.type === 'Surat Pemanggilan Orang Tua' && (
                <div style={{ textAlign: 'justify', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '1rem' }}>Nomor: B-{(Math.random() * 100).toFixed(0).padStart(3, '0')}/BK/MADRASAH/{new Date(printData.data.date).getFullYear()}</p>
                  <p style={{ marginBottom: '1rem' }}>Yth. Bapak/Ibu Wali Murid dari ananda:</p>
                  <table style={{ marginBottom: '1.5rem', width: '100%', marginLeft: '1rem' }}>
                    <tbody>
                      <tr><td style={{ width: '150px' }}>Nama</td><td>: <strong>{printData.data.studentName}</strong></td></tr>
                      <tr><td>Kelas</td><td>: {printData.data.studentClass}</td></tr>
                    </tbody>
                  </table>
                  <p style={{ marginBottom: '1rem' }}>Bersama surat ini, kami mengharap kehadiran Bapak/Ibu di madrasah untuk membicarakan perkembangan akademik dan sikap ananda pada:</p>
                  <table style={{ marginBottom: '1.5rem', width: '100%', marginLeft: '1rem', fontWeight: 'bold' }}>
                    <tbody>
                      <tr><td style={{ width: '150px' }}>Hari, Tanggal</td><td>: .......................................</td></tr>
                      <tr><td>Waktu</td><td>: .......................................</td></tr>
                      <tr><td>Tempat</td><td>: Ruang Bimbingan Konseling (BK)</td></tr>
                    </tbody>
                  </table>
                  <p style={{ marginBottom: '1rem' }}>Mengingat pentingnya acara tersebut, kami mohon kehadiran Bapak/Ibu tepat pada waktunya. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.</p>
                </div>
              )}

              {(printData.data.type === 'Surat Pernyataan Santri' || printData.data.type === 'Surat Perjanjian Terakhir Santri') && (
                <div style={{ textAlign: 'justify', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '1rem' }}>Yang bertanda tangan di bawah ini, saya selaku siswa/santri Madrasah:</p>
                  <table style={{ marginBottom: '1.5rem', width: '100%', marginLeft: '1rem' }}>
                    <tbody>
                      <tr><td style={{ width: '150px' }}>Nama Lengkap</td><td>: <strong>{printData.data.studentName}</strong></td></tr>
                      <tr><td>Kelas</td><td>: {printData.data.studentClass}</td></tr>
                    </tbody>
                  </table>
                  <p style={{ marginBottom: '1rem' }}>Dengan ini menyatakan dengan sebenar-benarnya dan penuh kesadaran bahwa saya:</p>
                  <div style={{ minHeight: '150px', border: '1px solid #ccc', marginBottom: '1.5rem', padding: '1rem' }}></div>
                  <p style={{ marginBottom: '1rem' }}>Apabila di kemudian hari saya mengulangi pelanggaran yang sama atau melanggar tata tertib madrasah, saya bersedia menerima sanksi yang lebih berat sesuai ketentuan madrasah.</p>
                  <p style={{ marginBottom: '1rem' }}>Demikian surat pernyataan ini saya buat dalam keadaan sadar tanpa paksaan dari pihak mana pun.</p>
                </div>
              )}

              {printData.data.type === 'Surat Pernyataan Orang Tua / Wali' && (
                <div style={{ textAlign: 'justify', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '1rem' }}>Yang bertanda tangan di bawah ini, saya selaku orang tua/wali dari siswa:</p>
                  <table style={{ marginBottom: '1.5rem', width: '100%', marginLeft: '1rem' }}>
                    <tbody>
                      <tr><td style={{ width: '150px' }}>Nama Siswa</td><td>: <strong>{printData.data.studentName}</strong></td></tr>
                      <tr><td>Kelas</td><td>: {printData.data.studentClass}</td></tr>
                    </tbody>
                  </table>
                  <p style={{ marginBottom: '1rem' }}>Menyatakan bahwa saya telah mengetahui pelanggaran tata tertib yang dilakukan oleh ananda, dan saya berkomitmen untuk:</p>
                  <ol style={{ marginLeft: '2rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    <li>Lebih meningkatkan pengawasan terhadap ananda di luar jam sekolah.</li>
                    <li>Mendukung penuh pihak madrasah dalam mendidik dan mendisiplinkan ananda.</li>
                    <li>Menerima konsekuensi/sanksi sesuai tata tertib apabila ananda kembali melakukan pelanggaran.</li>
                  </ol>
                  <p style={{ marginBottom: '1rem' }}>Demikian surat pernyataan ini dibuat sebagai bentuk tanggung jawab saya sebagai orang tua/wali siswa.</p>
                </div>
              )}
            </div>
          )}

          <div className="print-signatures">
            <div className="print-sig-box">
              <p>Mengetahui,</p>
              <p>Kepala Madrasah</p>
              <p className="print-sig-name">{orgData.principal || 'Ahmad Fulan, S.Pd., M.Pd.'}</p>
              <p>NIP. {orgData.principalNip || '-'}</p>
            </div>
            <div className="print-sig-box">
              <p>{orgData.address?.split(',')[0] || 'Jakarta'}, {new Date(printData.data?.date || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>Guru Bimbingan Konseling</p>
              <p className="print-sig-name">{orgData.teacherName || 'Hj. Siti Aminah, S.Psi.'}</p>
              <p>NIP. {orgData.teacherNip || '-'}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Konseling;
