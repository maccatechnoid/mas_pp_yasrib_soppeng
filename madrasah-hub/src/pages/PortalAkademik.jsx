import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Users, 
  Save, 
  Search, 
  Calendar,
  MessageSquare,
  Award,
  BookOpen,
  Heart,
  Activity,
  FileText,
  ChevronRight,
  ClipboardList,
  Star,
  RefreshCw,
  Zap,
  CheckCircle2,
  Printer,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllData, saveStudentSummary, saveStudentGrade, fetchStudentGrades, supabase } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import { toast } from 'react-hot-toast';
import './PortalAkademik.css';

const PortalAkademik = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Rekapitulasi (S/I/A)');
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [org, setOrg] = useState({});
  const [summaries, setSummaries] = useState({});
  const [isWali, setIsWali] = useState(false);
  const [grades, setGrades] = useState({});
  const [p5Grades, setP5Grades] = useState({});
  const [projects, setProjects] = useState([]);
  const [p5Elements, setP5Elements] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [ranking, setRanking] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'attendance', 'academic', 'p5ra', 'character', 'physical', 'ledger'
  const [kkm, setKkm] = useState(75);
  const [bulkValue, setBulkValue] = useState(75);
  const [masterClasses, setMasterClasses] = useState([]);

  useEffect(() => {
    const data = getAllData();
    setOrg(data.org || {});
    setSubjects(data.subjects || []);
    setMasterClasses(data.classes || []);
    const allStudents = data.students || [];
    setStudents(allStudents);
    
    // Get logged in user
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(currentUser);

    // Auto-detect homeroom class
    const homerooms = data.org?.homerooms || {};
    let autoClass = '';
    
    Object.entries(homerooms).forEach(([className, teacherName]) => {
      if (teacherName && currentUser.name && teacherName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) {
        autoClass = className;
        setIsWali(true);
      }
    });

    if (autoClass && !selectedClass) {
      setSelectedClass(autoClass);
    } else if (allStudents.length > 0 && !selectedClass) {
      setSelectedClass(allStudents[0].class);
    }

    setProjects(data.p5Projects || []);
    setP5Elements(data.p5Elements || []);
    if (data.p5Projects?.length > 0) setSelectedProject(data.p5Projects[0]);
    if (data.subjects?.length > 0 && !selectedSubject) setSelectedSubject(data.subjects[0]);
  }, []);

  useEffect(() => {
    const filtered = students.filter(s => 
      s.class === selectedClass && 
      (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (s.nisn && s.nisn.toString().includes(searchTerm)))
    );
    setFilteredStudents(filtered);
    
    if (filtered.length > 0) {
      fetchAllDataForClass(filtered.map(s => s.id));
    }
  }, [selectedClass, searchTerm, students, selectedSubject, selectedProject, activeTab]);

  const fetchAllDataForClass = async (studentIds) => {
    if (!supabase) return;
    setLoading(true);
    try {
      const year = org.academicYear || '2023/2024';
      const sem = org.semester || 'Ganjil';

      // 1. Fetch Summaries (Absensi, Sikap, dll)
      const { data: sData } = await supabase.from('student_summaries').select('*').in('student_id', studentIds);
      const sMap = {}; sData?.forEach(s => sMap[s.student_id] = s);
      setSummaries(sMap);

      // 2. Fetch Grades for Academic
      const { data: gData } = await supabase.from('student_grades').select('*').in('student_id', studentIds).eq('subject_name', selectedSubject);
      const gMap = {}; gData?.forEach(g => gMap[g.student_id] = g);
      setGrades(gMap);

      // 3. Fetch P5 Data
      const { data: pData } = await supabase.from('student_p5').select('*').in('student_id', studentIds).eq('project_name', selectedProject);
      const pMap = {}; pData?.forEach(p => pMap[p.student_id] = p.ratings || {});
      setP5Grades(pMap);

      // 4. Calculate Ranking (Fetch all grades for the semester)
      const { data: allGrades } = await supabase.from('student_grades').select('student_id, score_knowledge, score_skills').eq('academic_year', year).eq('semester', sem);
      if (allGrades) {
        const studentAverages = {};
        allGrades.forEach(g => {
          if (!studentAverages[g.student_id]) studentAverages[g.student_id] = { total: 0, count: 0 };
          studentAverages[g.student_id].total += (g.score_knowledge + g.score_skills) / 2;
          studentAverages[g.student_id].count += 1;
        });
        const ranked = Object.entries(studentAverages).map(([id, val]) => ({ id, avg: val.total / val.count })).sort((a, b) => b.avg - a.avg);
        const rMap = {}; ranked.forEach((r, idx) => rMap[r.id] = idx + 1);
        setRanking(rMap);
      }
    } catch (err) {
      console.error("Fetch all failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (studentId, field, value) => {
    if (selectedSubject === 'Rekapitulasi (S/I/A)') {
      setSummaries(prev => ({
        ...prev,
        [studentId]: { ...(prev[studentId] || { student_id: studentId }), [field]: value }
      }));
    } else {
      setGrades(prev => ({
        ...prev,
        [studentId]: { ...(prev[studentId] || { student_id: studentId, subject_name: selectedSubject }), [field]: value }
      }));
    }
  };

  const handleSave = async (studentId) => {
    setSaving(studentId);
    try {
      if (selectedSubject === 'Rekapitulasi (S/I/A)') {
        const summaryData = summaries[studentId];
        if (!summaryData) return;
        await saveStudentSummary(summaryData);
      } else {
        const gradeData = grades[studentId];
        if (!gradeData) return;
        await saveStudentGrade(gradeData);
      }
      toast.success("Data berhasil disinkronkan!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Gagal sinkronisasi data.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving('all');
    try {
      const promises = filteredStudents.map(student => {
        if (selectedSubject === 'Rekapitulasi (S/I/A)') {
          const summaryData = summaries[student.id];
          return summaryData ? saveStudentSummary(summaryData) : Promise.resolve();
        } else {
          const gradeData = grades[student.id];
          return gradeData ? saveStudentGrade(gradeData) : Promise.resolve();
        }
      });
      await Promise.all(promises);
      toast.success("Seluruh data kelas berhasil disinkronkan!");
    } catch (err) {
      console.error("Batch save error:", err);
      toast.error("Gagal sinkronisasi data kelas.");
    } finally {
      setSaving(false);
    }
  };

  const classes = masterClasses;

  // Calculate quick stats
  const totalStudents = filteredStudents.length;
  const totalS = filteredStudents.reduce((acc, s) => acc + (summaries[s.id]?.attendance_s || 0), 0);
  const totalI = filteredStudents.reduce((acc, s) => acc + (summaries[s.id]?.attendance_i || 0), 0);
  const totalA = filteredStudents.reduce((acc, s) => acc + (summaries[s.id]?.attendance_a || 0), 0);

  const handleP5Change = (studentId, elementId, value) => {
    setP5Grades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [elementId]: value
      }
    }));
  };

  const handleBulkFill = () => {
    const newGrades = { ...grades };
    filteredStudents.forEach(s => {
      const current = newGrades[s.id] || { score_knowledge: 0, score_skills: 0, notes: '' };
      if (!current.score_knowledge) current.score_knowledge = bulkValue;
      if (!current.score_skills) current.score_skills = bulkValue;
      newGrades[s.id] = current;
    });
    setGrades(newGrades);
    toast.success(`Berhasil mengisi nilai masal ${bulkValue}`);
  };


  return (
    <div className="homeroom-container-premium">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <UserCheck size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Portal Akademik</h1>
            <p className="page-subtitle">Pusat kendali penilaian, absensi, dan perkembangan santri terpadu.</p>
          </div>
        </div>
        <div className="header-actions-premium">
          <button 
            className={`btn-premium btn-primary-premium ${saving === 'all' ? 'loading' : ''}`}
            onClick={handleSaveAll}
            disabled={saving === 'all'}
          >
            <Save size={18} />
            <span>{saving === 'all' ? 'Menyimpan...' : 'Simpan Semua Data'}</span>
          </button>
        </div>
      </div>

      <div className="homeroom-stats-grid">
        <div className="stat-card-premium glass-card">
          <div className="stat-icon-wrap blue"><Users size={24} /></div>
          <div className="stat-info">
            <span>Total Siswa</span>
            <strong>{totalStudents} Santri</strong>
          </div>
        </div>
        <div className="stat-card-premium glass-card">
          <div className="stat-icon-wrap yellow"><Calendar size={24} /></div>
          <div className="stat-info">
            <span>Sakit (S)</span>
            <strong>{totalS} Kali</strong>
          </div>
        </div>
        <div className="stat-card-premium glass-card">
          <div className="stat-icon-wrap orange"><MessageSquare size={24} /></div>
          <div className="stat-info">
            <span>Izin (I)</span>
            <strong>{totalI} Kali</strong>
          </div>
        </div>
        <div className="stat-card-premium glass-card">
          <div className="stat-icon-wrap red"><Award size={24} /></div>
          <div className="stat-info">
            <span>Alpa (A)</span>
            <strong>{totalA} Kali</strong>
          </div>
        </div>
      </div>

      <div className="homeroom-navigation-tabs glass-card">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Zap size={18} />
          <span>Dashboard</span>
        </button>
        <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <ClipboardList size={18} />
          <span>Absensi</span>
        </button>
        <button className={`tab-btn ${activeTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveTab('academic')}>
          <BookOpen size={18} />
          <span>Nilai Akademik</span>
        </button>
        <button className={`tab-btn ${activeTab === 'p5ra' ? 'active' : ''}`} onClick={() => setActiveTab('p5ra')}>
          <Star size={18} />
          <span>P5-PPRA</span>
        </button>
        <button className={`tab-btn ${activeTab === 'character' ? 'active' : ''}`} onClick={() => setActiveTab('character')}>
          <Heart size={18} />
          <span>Sikap</span>
        </button>
        <button className={`tab-btn ${activeTab === 'physical' ? 'active' : ''}`} onClick={() => setActiveTab('physical')}>
          <Activity size={18} />
          <span>Fisik</span>
        </button>
        <button className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>
          <FileText size={18} />
          <span>Ledger & Rapor</span>
        </button>
      </div>

      <div className="homeroom-toolbar-premium glass-card">
        <div className="toolbar-left">
          <div className="search-wrapper-premium">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NISN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          {activeTab === 'rekap' && (
            <div className="subject-selector-wrapper">
              <CustomSelect 
                options={['Rekapitulasi (S/I/A)', ...subjects]}
                value={selectedSubject}
                onChange={(val) => setSelectedSubject(val)}
                icon={BookOpen}
              />
            </div>
          )}
          <div className="class-selector-wrapper">
            <CustomSelect 
              options={classes.length > 0 ? classes.map(c => `Kelas ${c}`) : ['Tidak Ada Kelas']}
              value={selectedClass ? `Kelas ${selectedClass}` : 'Pilih Kelas'}
              onChange={(val) => val !== 'Tidak Ada Kelas' && setSelectedClass(val.replace('Kelas ', ''))}
              icon={Users}
            />
          </div>
          <div className="academic-badge-homeroom desktop-only">
            <BookOpen size={16} />
            <span>{org.academicYear} | {org.semester}</span>
          </div>
        </div>
      </div>

      <div className="homeroom-content-area">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <div className="homeroom-dashboard-grid">
                <div className="stats-main-card glass-card">
                  <div className="card-inner">
                    <div className="icon-box"><Users size={32} /></div>
                    <div className="info-box">
                      <span className="label">Total Siswa Terdaftar</span>
                      <h2 className="value">{filteredStudents.length} <span className="unit">Siswa</span></h2>
                    </div>
                  </div>
                </div>
                <div className="stats-main-card glass-card">
                  <div className="card-inner">
                    <div className="icon-box attendance"><Clock size={32} /></div>
                    <div className="info-box">
                      <span className="label">Rata-rata Kehadiran</span>
                      <h2 className="value">98.5 <span className="unit">%</span></h2>
                    </div>
                  </div>
                </div>
                <div className="stats-main-card glass-card">
                  <div className="card-inner">
                    <div className="icon-box achievement"><Star size={32} /></div>
                    <div className="info-box">
                      <span className="label">Rata-rata Nilai Kelas</span>
                      <h2 className="value">84.2 <span className="unit">Pts</span></h2>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="students-wali-table-container">
                <div className="wali-table-responsive">
                  <table className="wali-table-main">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Siswa</th>
                        <th>S</th>
                        <th>I</th>
                        <th>A</th>
                        <th>Ekstrakurikuler</th>
                        <th>Prestasi</th>
                        <th>Catatan Wali</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => {
                        const s = summaries[student.id] || {};
                        return (
                          <tr key={student.id}>
                            <td align="center"><span className="row-number-badge">{index + 1}</span></td>
                            <td>
                              <div className="s-profile-cell">
                                <div className="s-info-text">
                                  <span className="s-main-name">{student.name}</span>
                                  <div className="s-meta-sub"><span>{student.nisn}</span></div>
                                </div>
                              </div>
                            </td>
                            <td><input type="number" className="table-input-small" value={s.attendance_s || 0} onChange={(e) => handleInputChange(student.id, 'attendance_s', parseInt(e.target.value))} /></td>
                            <td><input type="number" className="table-input-small" value={s.attendance_i || 0} onChange={(e) => handleInputChange(student.id, 'attendance_i', parseInt(e.target.value))} /></td>
                            <td><input type="number" className="table-input-small" value={s.attendance_a || 0} onChange={(e) => handleInputChange(student.id, 'attendance_a', parseInt(e.target.value))} /></td>
                            <td><input type="text" className="table-input-text" placeholder="Ekstra..." value={s.extracurricular || ''} onChange={(e) => handleInputChange(student.id, 'extracurricular', e.target.value)} /></td>
                            <td><input type="text" className="table-input-text" placeholder="Prestasi..." value={s.achievement || ''} onChange={(e) => handleInputChange(student.id, 'achievement', e.target.value)} /></td>
                            <td><textarea className="table-textarea" placeholder="Catatan..." value={s.notes || ''} onChange={(e) => handleInputChange(student.id, 'notes', e.target.value)}></textarea></td>
                            <td align="center">
                              <button className={`btn-save-mini ${saving === student.id ? 'loading' : ''}`} onClick={() => handleSave(student.id)}>
                                {saving === student.id ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="students-wali-table-container">
                <div className="academic-controls-premium">
                  <div className="bulk-box glass-card">
                    <label>Isi Masal:</label>
                    <input type="number" value={bulkValue} onChange={(e) => setBulkValue(parseInt(e.target.value))} />
                    <button onClick={handleBulkFill} className="btn-bulk">Terapkan</button>
                  </div>
                </div>
                <div className="wali-table-responsive">
                  <table className="wali-table-main">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Siswa</th>
                        <th>Pengetahuan</th>
                        <th>Keterampilan</th>
                        <th>Deskripsi Kemajuan</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => {
                        const g = grades[student.id] || {};
                        return (
                          <tr key={student.id}>
                            <td align="center">{index + 1}</td>
                            <td><span className="s-main-name">{student.name}</span></td>
                            <td><input type="number" className="table-input-small" value={g.score_knowledge || ''} onChange={(e) => handleInputChange(student.id, 'score_knowledge', parseInt(e.target.value))} /></td>
                            <td><input type="number" className="table-input-small" value={g.score_skills || ''} onChange={(e) => handleInputChange(student.id, 'score_skills', parseInt(e.target.value))} /></td>
                            <td>
                              <div className="notes-with-auto">
                                <textarea className="table-textarea" value={g.subject_notes || ''} onChange={(e) => handleInputChange(student.id, 'subject_notes', e.target.value)} />
                              </div>
                            </td>
                            <td align="center">
                              <button className="btn-save-mini" onClick={() => handleSave(student.id)}><Save size={16} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'p5ra' && (
              <div className="students-wali-table-container">
                <div className="project-selector-premium">
                  <CustomSelect options={projects} value={selectedProject} onChange={(val) => setSelectedProject(val)} icon={Star} />
                </div>
                <div className="wali-table-responsive">
                  <table className="wali-table-main">
                    <thead>
                      <tr>
                        <th>Nama Siswa</th>
                        {p5Elements.map(el => <th key={el.id}>{el.name}</th>)}
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(student => (
                        <tr key={student.id}>
                          <td><span className="s-main-name">{student.name}</span></td>
                          {p5Elements.map(el => (
                            <td key={el.id}>
                              <CustomSelect 
                                className="custom-select-table"
                                options={['-', 'MB', 'B', 'BSH', 'SB']}
                                value={p5Grades[student.id]?.[el.id] || '-'}
                                onChange={(val) => handleP5Change(student.id, el.id, val === '-' ? '' : val)}
                              />
                            </td>
                          ))}
                          <td><button className="btn-save-mini" onClick={() => handleSave(student.id)}><Save size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'character' && (
              <div className="students-wali-table-container">
                <div className="wali-table-responsive">
                  <table className="wali-table-main">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Siswa</th>
                        <th>Predikat Spiritual</th>
                        <th>Catatan Spiritual</th>
                        <th>Predikat Sosial</th>
                        <th>Catatan Sosial</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => {
                        const s = summaries[student.id] || {};
                        return (
                          <tr key={student.id}>
                            <td align="center">{index + 1}</td>
                            <td><span className="s-main-name">{student.name}</span></td>
                            <td>
                              <CustomSelect 
                                className="custom-select-table"
                                options={['SANGAT BAIK', 'BAIK', 'CUKUP', 'KURANG']}
                                value={s.predikat_spiritual || 'SANGAT BAIK'}
                                onChange={(val) => handleInputChange(student.id, 'predikat_spiritual', val)}
                              />
                            </td>
                            <td><textarea className="table-textarea" value={s.note_spiritual || ''} onChange={(e) => handleInputChange(student.id, 'note_spiritual', e.target.value)} /></td>
                            <td>
                              <CustomSelect 
                                className="custom-select-table"
                                options={['SANGAT BAIK', 'BAIK', 'CUKUP', 'KURANG']}
                                value={s.predikat_social || 'SANGAT BAIK'}
                                onChange={(val) => handleInputChange(student.id, 'predikat_social', val)}
                              />
                            </td>
                            <td><textarea className="table-textarea" value={s.note_social || ''} onChange={(e) => handleInputChange(student.id, 'note_social', e.target.value)} /></td>
                            <td><button className="btn-save-mini" onClick={() => handleSave(student.id)}><Save size={16} /></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'physical' && (
              <div className="students-wali-table-container">
                <div className="wali-table-responsive">
                  <table className="wali-table-main">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Siswa</th>
                        <th>Tinggi (cm)</th>
                        <th>Berat (kg)</th>
                        <th>Kesehatan</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => {
                        const s = summaries[student.id] || {};
                        return (
                          <tr key={student.id}>
                            <td align="center">{index + 1}</td>
                            <td><span className="s-main-name">{student.name}</span></td>
                            <td><input type="number" className="table-input-small" value={s.height || ''} onChange={(e) => handleInputChange(student.id, 'height', e.target.value)} /></td>
                            <td><input type="number" className="table-input-small" value={s.weight || ''} onChange={(e) => handleInputChange(student.id, 'weight', e.target.value)} /></td>
                            <td><input type="text" className="table-input-text" value={s.hearing || 'Normal'} onChange={(e) => handleInputChange(student.id, 'hearing', e.target.value)} /></td>
                            <td><button className="btn-save-mini" onClick={() => handleSave(student.id)}><Save size={16} /></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'ledger' && (
              <div className="students-wali-table-container">
                <div className="ledger-overview-premium">
                  <div className="ledger-header-info" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>

                    <button className="btn-primary-premium" onClick={() => window.open(`/rapor?class=${selectedClass}&preview=true&bulk=true`)}>
                      <Printer size={18} /> Cetak Masal Rapor
                    </button>
                  </div>
                  <div className="wali-table-responsive">
                    <table className="wali-table-main">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Nama Siswa</th>
                          <th>Rerata</th>
                          <th>Peringkat</th>
                          <th>Aksi Rapor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => {
                          const rank = ranking[student.id] || '-';
                          return (
                            <tr key={student.id}>
                              <td align="center"><span className={`rank-badge ${rank <= 3 ? 'top-rank' : ''}`}>{rank}</span></td>
                              <td><span className="s-main-name">{student.name}</span></td>
                              <td align="center"><strong>84.2</strong></td>
                              <td align="center">{rank}</td>
                              <td align="center">
                                <a href={`/rapor?nisn=${student.nisn}`} target="_blank" rel="noopener noreferrer" className="btn-view-report-mini"><BookOpen size={16} /> Rapor</a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {filteredStudents.length === 0 && (
        <div className="empty-state-wali">
          <Users size={48} />
          <p>Tidak ada siswa ditemukan di kelas ini.</p>
        </div>
      )}
    </div>
  );
};

export default PortalAkademik;
