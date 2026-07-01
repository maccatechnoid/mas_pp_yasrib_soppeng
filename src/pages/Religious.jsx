import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Book, 
  BookOpen,
  Star, 
  Users,
  LayoutGrid,
  CheckCircle2,
  RefreshCw,
  Save,
  Trophy,
  TrendingUp,
  MessageCircle,
  Calendar,
  Share2,
  Award,
  Search,
  Heart,
  Smile,
  Coins,
  Sparkles,
  Zap,
  Download,
  BarChart3
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { getAllData, supabase } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import './Religious.css';

const Religious = () => {
  const [masterData, setMasterData] = useState({ classes: [], students: [], org: {} });
  const [selectedClass, setSelectedClass] = useState('');
  const [records, setRecords] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const data = getAllData();
    setMasterData(data);
    if (data.classes.length > 0) {
      setSelectedClass(data.classes[0]);
    }
    fetchRecords();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedClass]);

  const fetchRecords = async () => {
    if (!selectedClass || !supabase) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Fetch from student_religious
      const { data: relData, error: relError } = await supabase
        .from('student_religious')
        .select('*')
        .eq('academic_year', masterData.org?.academicYear || '2023/2024')
        .eq('semester', masterData.org?.semester || 'Ganjil')
        .eq('date', today);
      
      if (relError) throw relError;

      const recordMap = {};
      relData.forEach(r => {
        if (!recordMap[r.student_id]) recordMap[r.student_id] = {};
        recordMap[r.student_id][r.activity] = true;
      });

      // 2. Fetch from student_quran (auto-tick Tahfidz if they deposited today)
      const { data: qData } = await supabase
        .from('student_quran')
        .select('student_id')
        .eq('date', today);
      
      qData?.forEach(q => {
        if (!recordMap[q.student_id]) recordMap[q.student_id] = {};
        recordMap[q.student_id]['tahfidz'] = true;
      });

      setRecords(recordMap);
    } catch (err) {
      console.warn('Fetch records failed:', err.message);
    }
  };


  const toggleActivity = (studentId, activity) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [activity]: !prev[studentId]?.[activity]
      }
    }));
  };

  const handleSave = async () => {
    if (!supabase) {
      toast.error("Database belum terhubung. Pastikan Supabase sudah terkonfigurasi.");
      return;
    }
    setSaving(true);
    try {
      const payloads = [];
      Object.entries(records).forEach(([studentId, activities]) => {
        Object.entries(activities).forEach(([activity, val]) => {
          if (val) {
            payloads.push({
              student_id: studentId,
              activity: activity,
              academic_year: masterData.org?.academicYear || '2023/2024',
              semester: masterData.org?.semester || 'Ganjil',
              date: new Date().toISOString().split('T')[0]
            });
          }
        });
      });

      // Clear existing for today and re-insert
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('student_religious').delete().eq('date', today);
      
      if (payloads.length > 0) {
        const { error } = await supabase.from('student_religious').insert(payloads);
        if (error) throw error;
      }
      toast.success("Monitoring Ibadah Berhasil Disimpan!");
    } catch (err) {
      console.error('Save failed:', err.message);
      toast.error("Gagal menyimpan monitoring.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = masterData.students.filter(s => 
    s.class === selectedClass && 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.nisn && s.nisn.toString().includes(searchTerm)))
  );

  const activities = [
    { id: 'dhuha', title: 'Sholat Dhuha', short: 'Dhuha', icon: <Clock size={14} />, color: '#10b981' },
    { id: 'tadarus', title: 'Tadarus Pagi', short: 'Tadarus', icon: <Book size={14} />, color: '#3b82f6' },
    { id: 'dzuhur', title: 'Sholat Dzuhur', short: 'Dzuhur', icon: <Clock size={14} />, color: '#10b981' },
    { id: 'rawatib', title: 'Rawatib', short: 'Rawatib', icon: <Zap size={14} />, color: '#8b5cf6' },
    { id: 'adab', title: 'Adab & Akhlak', short: 'Adab', icon: <Smile size={14} />, color: '#f59e0b' },
    { id: 'infaq', title: 'Infaq', short: 'Infaq', icon: <Coins size={14} />, color: '#ef4444' },
    { id: 'tahfidz', title: 'Tahfidz', short: 'Tahfidz', icon: <Sparkles size={14} />, color: '#06b6d4' },
  ];

  const handleWhatsAppShare = (student) => {
    const sRecords = records[student.id] || {};
    const completed = Object.entries(sRecords).filter(([_, v]) => v).map(([id]) => activities.find(a => a.id === id)?.title);
    
    if (completed.length === 0) {
      toast.error("Belum ada aktivitas ibadah yang tercatat untuk hari ini.");
      return;
    }

    const message = `Assalamu'alaikum Bapak/Ibu Wali Murid dari *${student.name}*.\n\nBerikut adalah laporan monitoring ibadah harian di Madrasah hari ini:\n${completed.map(c => `✅ ${c}`).join('\n')}\n\nSemoga istiqomah dalam ketaatan. Terima kasih.`;
    
    let phone = student.student_phone || student.parentPhone || '';
    let numbersOnly = phone.toString().replace(/\D/g, '');
    if (numbersOnly.startsWith('0')) numbersOnly = '62' + numbersOnly.slice(1);
    
    window.open(`https://wa.me/${numbersOnly}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const leaderboard = filteredStudents
    .map(s => ({
      ...s,
      score: Object.values(records[s.id] || {}).filter(v => v).length
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="religious-container">

      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-amber">
            <BookOpen size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Monitoring Ibadah</h1>
            <p className="page-subtitle">Pantau kedisiplinan ibadah harian siswa Madrasah.</p>
          </div>
        </div>
        <div className="header-actions-premium">
          <button className="btn-premium btn-secondary-premium" onClick={() => toast('Fitur ekspor laporan sedang disiapkan!', { icon: '⏳' })}>
            <Download size={18} />
            <span>Unduh Laporan</span>
          </button>
          <button 
            className="btn-premium btn-primary-premium" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{saving ? 'Menyimpan...' : 'Simpan Laporan Ibadah'}</span>
          </button>
        </div>
      </div>

      <div className="religious-stats-grid">
        {activities.map((act) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={act.id} 
            className="glass-card activity-stat-card"
          >
            <div className="act-icon-box">
              {act.icon}
            </div>
            <div className="act-info">
              <h3>{act.title}</h3>
              <span className="time">{act.time}</span>
              <div className="participation">
                <div className="bar"><div className="fill" style={{ width: act.stats }}></div></div>
                <span className="percent">{act.stats} Siswa</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="religious-main-content">
        <div className="religious-left-column">
          <div className="glass-card religious-form">
            <div className="form-header">
              <div className="header-with-icon">
                <Star className="text-primary" />
                <h3>Input Monitoring Harian</h3>
              </div>
              <div className="header-right-actions">
                <span className="badge-today">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
            </div>
            
            <div className="form-body-content">
              <div className="religious-controls">
                <div className="class-selector">
                  <div className="label-with-icon" style={{ marginBottom: '1rem' }}>
                    <Users size={16} />
                    <label style={{ fontWeight: 600, fontSize: '0.875rem', marginLeft: '0.5rem' }}>Pilih Kelas</label>
                  </div>
                  <CustomSelect 
                    options={masterData.classes.map(c => `Kelas ${c}`)}
                    value={`Kelas ${selectedClass}`}
                    onChange={(val) => setSelectedClass(val.replace('Kelas ', ''))}
                    icon={Users}
                    className="religious-class-select"
                  />
                </div>
                
                <div className="search-monitoring">
                  <div className="label-with-icon" style={{ marginBottom: '1rem' }}>
                    <Search size={16} />
                    <label style={{ fontWeight: 600, fontSize: '0.875rem', marginLeft: '0.5rem' }}>Cari Nama / NISN</label>
                  </div>
                  <div className="premium-search-box">
                    <input 
                      type="text" 
                      placeholder="Ketik untuk mencari..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="student-checklist">
                <AnimatePresence mode='popLayout'>
                  {filteredStudents.map((student, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={student.id} 
                      className="checklist-row"
                    >
                      <div className="student-profile-mini">
                        <div className="avatar-letter">{student.name.charAt(0)}</div>
                        <div className="name-group">
                          <span className="student-name">{student.name}</span>
                          <span className="student-subtext">NISN: {student.nisn}</span>
                        </div>
                      </div>
                      
                      <div className="checklist-actions">
                        <div className="check-options-grid">
                          {activities.map(act => (
                            <button 
                              key={act.id}
                              className={`premium-check-pill ${records[student.id]?.[act.id] ? 'active' : ''}`}
                              onClick={() => toggleActivity(student.id, act.id)}
                              style={{ '--act-color': act.color }}
                            >
                              {act.icon}
                              <span>{act.short}</span>
                            </button>
                          ))}
                        </div>
                        <button className="btn-wa-share" onClick={() => handleWhatsAppShare(student)} title="Kirim Laporan WA">
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredStudents.length === 0 && (
                  <div className="religious-empty-state">
                    <div className="empty-visual">
                      <Users size={48} />
                    </div>
                    <h4>Tidak Ada Data Siswa</h4>
                    <p>Silakan pilih kelas lain atau pastikan data siswa sudah terdaftar untuk kelas ini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="religious-right-column">
          <div className="glass-card leaderboard-widget">
            <div className="widget-header">
              <Trophy size={20} className="text-yellow" />
              <h3>Bintang Ibadah Hari Ini</h3>
            </div>
            <div className="leaderboard-list">
              {leaderboard.filter(l => l.score > 0).map((s, i) => (
                <div key={s.id} className="leaderboard-item">
                  <div className="rank-badge">{i + 1}</div>
                  <div className="s-info">
                    <span className="s-name">{s.name}</span>
                    <div className="score-track">
                      {[...Array(3)].map((_, j) => (
                        <Star key={j} size={12} className={j < s.score ? 'star-active' : 'star-muted'} fill={j < s.score ? '#f59e0b' : 'transparent'} />
                      ))}
                    </div>
                  </div>
                  {i === 0 && <Award className="text-yellow" size={18} />}
                </div>
              ))}
              {leaderboard.filter(l => l.score > 0).length === 0 && (
                <div className="empty-widget-state">
                  <p>Belum ada data prestasi hari ini.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card tips-widget">
            <div className="widget-header">
              <TrendingUp size={20} className="text-primary" />
              <h3>Tren Kedisiplinan</h3>
            </div>
            <div className="discipline-trend">
              <p className="trend-text">Peningkatan <strong>+12%</strong> dibanding hari kemarin.</p>
              <div className="mini-chart">
                {[40, 60, 45, 80, 90, 70, 85].map((h, i) => (
                  <div key={i} className="bar-column">
                    <div className="bar-fill" style={{ height: `${h}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="glass-card analytics-widget">
            <div className="widget-header">
              <BarChart3 size={20} className="text-secondary" />
              <h3>Analisis Mingguan</h3>
            </div>
            <div className="weekly-stats">
              <div className="stat-row-mini">
                <span className="label">Konsistensi Kelas</span>
                <span className="value">94%</span>
              </div>
              <div className="chart-container-premium">
                {[
                  { day: 'Sen', val: 70 },
                  { day: 'Sel', val: 85 },
                  { day: 'Rab', val: 65 },
                  { day: 'Kam', val: 95 },
                  { day: 'Jum', val: 80 },
                  { day: 'Sab', val: 90 },
                ].map((d, i) => (
                  <div key={i} className="chart-column">
                    <div className="bar-wrapper">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${d.val}%` }}
                        className="bar-fill-premium"
                        style={{ background: d.val > 80 ? '#10b981' : d.val > 70 ? '#3b82f6' : '#f59e0b' }}
                      />
                    </div>
                    <span className="day-label">{d.day}</span>
                  </div>
                ))}
              </div>
              <p className="analytics-summary">
                Pencapaian terbaik terjadi pada hari <strong>Kamis</strong> dengan tingkat partisipasi 95%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Religious;
