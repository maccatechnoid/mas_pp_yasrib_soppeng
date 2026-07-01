import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  History, 
  TrendingUp, 
  CheckCircle2, 
  Star,
  Users,
  Award,
  ChevronRight,
  Bookmark,
  Trophy,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import { getAllData, supabase } from '../utils/storage';
import './Quran.css';

const Quran = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState([]); // List of all depositions
  const [studentProgress, setStudentProgress] = useState({}); // { studentId: { totalJuz, lastSurah, ... } }
  const [masterData, setMasterData] = useState({ classes: [], students: [] });
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [formData, setFormData] = useState({
    surah: '',
    from_verse: '',
    to_verse: '',
    type: 'Ziyadah', // Ziyadah, Murojaah
    quality: 'A',
    notes: ''
  });

  const surahs = [
    "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara'", "An-Naml", "Al-Qasas", "Al-'Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takathur", "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraish", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
  ];


  useEffect(() => {
    const data = getAllData();
    setMasterData(data);
    if (data.classes.length > 0) {
      setSelectedClass(data.classes[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchRecords();
    }
  }, [selectedClass]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let data = [];
      if (supabase) {
        const { data: sbData, error } = await supabase
          .from('student_quran')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        data = sbData || [];
      } else {
        const localData = localStorage.getItem('student_quran');
        if (localData) {
          data = JSON.parse(localData);
          data.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
        }
      }
      
      setRecords(data);
      
      const progress = {};
      data.forEach(rec => {
        if (!progress[rec.student_id]) {
          progress[rec.student_id] = {
            lastSurah: rec.surah,
            lastVerse: rec.to_verse,
            totalZiyadah: 0,
            quality: rec.quality,
            completedJuz: [30],
            badges: []
          };
        }
        if (rec.type === 'Ziyadah') {
          progress[rec.student_id].totalZiyadah += 1;
        }
      });
      setStudentProgress(progress);
    } catch (err) {
      console.warn('Fetch Quran records failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    const prog = studentProgress[student.id];
    setFormData({
      surah: prog?.lastSurah || 'An-Naba\'',
      from_verse: (parseInt(prog?.lastVerse) + 1) || 1,
      to_verse: '',
      type: 'Ziyadah',
      quality: 'A',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !formData.surah) return alert('Pilih santri dan surah!');
    
    setSaving(true);
    try {
      const payload = {
        id: Date.now().toString(),
        student_id: selectedStudent.id,
        academic_year: masterData.org?.academicYear || '2023/2024',
        semester: masterData.org?.semester || 'Ganjil',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        ...formData
      };

      if (supabase) {
        const { error } = await supabase.from('student_quran').insert(payload);
        if (error) throw error;
      } else {
        const existing = localStorage.getItem('student_quran');
        const records = existing ? JSON.parse(existing) : [];
        records.push(payload);
        localStorage.setItem('student_quran', JSON.stringify(records));
      }

      alert(`Setoran ${selectedStudent.name} berhasil disimpan!`);
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };


  const filteredStudents = masterData.students.filter(s => 
    s.class === selectedClass && 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.nisn && s.nisn.toString().includes(searchTerm)))
  );

  const leaderboard = filteredStudents
    .map(s => ({
      ...s,
      count: 2 + Math.floor(Math.random() * 5), // Mock data for demo
      latest: "Surah Al-Mulk"
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (

    <div className="quran-container">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-amber">
            <BookOpen size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Tahfidz & Murojaah</h1>
            <p className="page-subtitle">Manajemen setoran hafalan Al-Qur'an santri Madrasah.</p>
          </div>
        </div>
        <div className="q-header-stats">
          <div className="q-stat-card">
            <span className="q-stat-label">Setoran Hari Ini</span>
            <span className="q-stat-value">24</span>
          </div>
          <div className="q-stat-card">
            <span className="q-stat-label">Rata-rata Kualitas</span>
            <span className="q-stat-value">A-</span>
          </div>
        </div>
      </div>

      <div className="q-controls glass-card">
        <div className="control-group">
          <Users size={18} className="text-primary" />
          <CustomSelect 
            options={masterData.classes.map(c => `Kelas ${c}`)}
            value={`Kelas ${selectedClass}`}
            onChange={(val) => setSelectedClass(val.replace('Kelas ', ''))}
            className="q-class-select"
          />
        </div>
        <div className="q-search-box">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Cari santri..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="q-main-layout">
        <div className="q-content-area">
          {loading ? (
            <div className="q-loading">
              <RefreshCw className="animate-spin" size={32} />
              <p>Memuat data hafalan...</p>
            </div>
          ) : (
            <div className="q-student-grid">
              {filteredStudents.map((student, idx) => {
                const prog = studentProgress[student.id] || { lastSurah: '-', lastVerse: '-', quality: 'A', totalZiyadah: 0 };
                const progressPercent = Math.min(100, (prog.totalZiyadah / 30) * 100);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={student.id} 
                    className="q-student-card glass-card"
                  >
                    <div className="q-card-main">
                      <div className="q-avatar-wrapper">
                        <div className="q-avatar">{student.name.charAt(0)}</div>
                        <div className="q-rank-mini">#{idx + 1}</div>
                      </div>
                      <div className="q-info">
                        <div className="q-name-row">
                          <h3 className="q-name">{student.name}</h3>
                          <span className={`q-badge-quality q-q-${prog.quality?.toLowerCase() || 'a'}`}>
                            {prog.quality || 'A'}
                          </span>
                        </div>
                        <div className="q-current-progress">
                          <Bookmark size={14} className="text-primary" />
                          <span>Terakhir: <strong>QS. {prog.lastSurah} [{prog.lastVerse}]</strong></span>
                        </div>
                        
                        <div className="q-juz-grid-visual">
                          {[...Array(30)].map((_, i) => {
                            const juzNum = i + 1;
                            const isCompleted = (prog.completedJuz || []).includes(juzNum);
                            return (
                              <div 
                                key={i} 
                                className={`juz-dot-premium ${isCompleted ? 'completed' : ''}`}
                                title={`Juz ${juzNum}`}
                              >
                                {juzNum}
                              </div>
                            );
                          })}
                        </div>

                        <div className="q-achievements">
                          {(prog.badges || []).length > 0 ? (
                            prog.badges.map((b, i) => <span key={i} className="badge-achieve">{b}</span>)
                          ) : (
                            <span className="badge-achieve-empty">Belum ada lencana</span>
                          )}
                          {prog.totalZiyadah > 10 && <span className="badge-achieve gold">Istiqomah</span>}
                        </div>

                        <div className="q-stats-mini">
                          <div className="q-mini-item">
                            <span className="l">Target Bulanan</span>
                            <div className="p-bar">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                className="f" 
                              />
                            </div>
                            <span className="v">{Math.round(progressPercent)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="q-card-actions">
                      <button className="btn-q-history" title="Riwayat"><History size={18} /></button>
                      <button className="btn-q-add" onClick={() => handleOpenModal(student)}>
                        <Plus size={18} /> <span>Setor Baru</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>


        <div className="q-sidebar">
          <div className="glass-card q-widget">
            <div className="q-widget-header">
              <Trophy size={18} className="text-yellow" />
              <h3>Bintang Tahfidz</h3>
            </div>
            <div className="q-leaderboard">
              {leaderboard.map((s, i) => (
                <div key={s.id} className="q-leader-item">
                  <div className={`q-rank rank-${i+1}`}>{i+1}</div>
                  <div className="q-leader-info">
                    <span className="name">{s.name}</span>
                    <span className="sub">{s.latest}</span>
                  </div>
                  <div className="q-leader-stat">
                    <span className="val">{s.count}</span>
                    <span className="lab">Hal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card q-widget">
            <div className="q-widget-header">
              <TrendingUp size={18} className="text-primary" />
              <h3>Statistik Tahfidz</h3>
            </div>
            <div className="q-analytics-mini">
              <div className="q-ana-card-item">
                <div className="icon-wrap bg-soft-green">
                  <BookOpen size={16} className="text-green" />
                </div>
                <div className="info">
                  <span className="l">Setoran Bulan Ini</span>
                  <div className="v-row">
                    <span className="v">+145</span>
                    <span className="u">Halaman</span>
                  </div>
                </div>
              </div>

              <div className="q-ana-card-item">
                <div className="icon-wrap bg-soft-blue">
                  <TrendingUp size={16} className="text-blue" />
                </div>
                <div className="info">
                  <span className="l">Kenaikan Progres</span>
                  <div className="v-row">
                    <span className="v text-green">+12.5%</span>
                    <span className="u">Dari bln lalu</span>
                  </div>
                </div>
              </div>

              <div className="q-ana-card-item">
                <div className="icon-wrap bg-soft-purple">
                  <Award size={16} className="text-purple" />
                </div>
                <div className="info">
                  <span className="l">Target Tercapai</span>
                  <div className="v-row">
                    <span className="v">8/12</span>
                    <span className="u">Santri</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Setoran */}
      <AnimatePresence>
        {showModal && (
          <div className="q-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="q-modal glass-card"
            >
              <div className="modal-header">
                <h2>Setoran Baru: {selectedStudent?.name}</h2>
                <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="q-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Jenis Setoran</label>
                    <div className="q-type-toggle">
                      <button 
                        type="button" 
                        className={formData.type === 'Ziyadah' ? 'active' : ''}
                        onClick={() => setFormData({...formData, type: 'Ziyadah'})}
                      >Ziyadah</button>
                      <button 
                        type="button" 
                        className={formData.type === 'Murojaah' ? 'active' : ''}
                        onClick={() => setFormData({...formData, type: 'Murojaah'})}
                      >Murojaah</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Surah</label>
                    <CustomSelect 
                      options={surahs}
                      value={formData.surah}
                      onChange={(val) => setFormData({...formData, surah: val})}
                      placeholder="Pilih Surah"
                    />
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label>Ayat Mulai</label>
                    <input type="number" value={formData.from_verse} onChange={(e) => setFormData({...formData, from_verse: e.target.value})} placeholder="1" required />
                  </div>
                  <div className="form-group">
                    <label>Ayat Akhir</label>
                    <input type="number" value={formData.to_verse} onChange={(e) => setFormData({...formData, to_verse: e.target.value})} placeholder="10" required />
                  </div>
                  <div className="form-group">
                    <label>Kualitas</label>
                    <CustomSelect 
                      options={['A', 'B+', 'B', 'C']}
                      value={formData.quality}
                      onChange={(val) => setFormData({...formData, quality: val})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Catatan Guru (Tajwid/Makhroj)</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Contoh: Perbaiki panjang pendek di ayat 5..."></textarea>
                </div>

                <button type="submit" className="btn-q-save" disabled={saving}>
                  {saving ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  <span>{saving ? 'Menyimpan...' : 'Simpan Setoran'}</span>
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Quran;
