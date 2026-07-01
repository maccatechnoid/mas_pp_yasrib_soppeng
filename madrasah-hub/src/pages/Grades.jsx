import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  BookOpen,
  GraduationCap,
  School,
  UserCheck,
  Star,
  ExternalLink,
  Printer,
  ChevronLeft,
  Lock,
  RefreshCcw,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react';
import { getAllData, saveData, supabase } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';
import './Grades.css';
import './ReportModal.css';

const Grades = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('academic'); // 'academic', 'p5ra', 'leger'
  const [projects, setProjects] = useState([]);
  const [p5Elements, setP5Elements] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [p5Grades, setP5Grades] = useState({}); // { studentId: { subElementId: value } }

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [org, setOrg] = useState({});
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [grades, setGrades] = useState({}); // { studentId: { tugas, uts, uas, notes } }
  const [summaries, setSummaries] = useState({}); // { studentId: { character_notes, extracurricular } }
  const [showSaved, setShowSaved] = useState(false);
  const [bulkValue, setBulkValue] = useState(75);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ranking, setRanking] = useState({}); // { studentId: rank }
  const [autosaveStatus, setAutosaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'
  const [kkm, setKkm] = useState(75);
  const [activeMenu, setActiveMenu] = useState(null); // studentId of open menu
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const [classStats, setClassStats] = useState({ avg: 0, max: 0, min: 0 });
  const [generatingId, setGeneratingId] = useState(null);

  const filteredStudents = students.filter(s => s.class === selectedClass);

  useEffect(() => {
    const data = getAllData();
    setStudents(data.students || []);
    setSubjects(data.subjects || []);
    setClasses(data.classes || []);
    setOrg(data.org || {});
    setProjects(data.p5Projects || []);
    setP5Elements(data.p5Elements || []);
    
    // Calculate Class Stats
    if (data.grades && data.grades.length > 0) {
      const subjectGrades = data.grades.filter(g => g.subject_name === selectedSubject);
      const avgs = subjectGrades.map(g => (g.tugas + g.uts + g.uas) / 3).filter(a => a > 0);
      
      if (avgs.length > 0) {
        setClassStats({
          avg: (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1),
          max: Math.max(...avgs).toFixed(1),
          min: Math.min(...avgs).toFixed(1)
        });
      }
    } else {
      setClassStats({ avg: 0, max: 0, min: 0 });
    }
    
    setLoading(false);

    if (data.classes?.length > 0) setSelectedClass(data.classes[0]);
    if (data.subjects?.length > 0) setSelectedSubject(data.subjects[0]);
    if (data.p5Projects?.length > 0) setSelectedProject(data.p5Projects[0]);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchData();
      calculateRanking();
      fetchLockStatus(selectedClass, selectedSubject);
    }
  }, [selectedClass, selectedSubject, mode]);

  const fetchLockStatus = async (className, subjectName) => {
    if (!className || !subjectName) return;
    try {
      const { data, error } = await supabase
        .from('grade_locks')
        .select('is_locked')
        .eq('class_name', className)
        .eq('subject_name', subjectName)
        .eq('academic_year', org.academicYear)
        .eq('semester', org.semester)
        .single();
      
      if (data) setIsLocked(data.is_locked);
      else setIsLocked(false);
    } catch (err) {
      setIsLocked(false);
    }
  };

  const handleToggleLock = async () => {
    const newStatus = !isLocked;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('grade_locks')
        .upsert({
          class_name: selectedClass,
          subject_name: selectedSubject,
          academic_year: org.academicYear,
          semester: org.semester,
          is_locked: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: user.name
        }, { onConflict: 'class_name,subject_name,academic_year,semester' });

      if (!error) {
        setIsLocked(newStatus);
        setAutosaveStatus('saved');
        setTimeout(() => setAutosaveStatus('idle'), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Debounced Autosave Logic
  useEffect(() => {
    if (loading || saving || isLocked) return;
    
    const timer = setTimeout(() => {
      if (Object.keys(grades).length > 0 || Object.keys(summaries).length > 0) {
        autoSave();
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [grades, summaries]);

  const autoSave = async () => {
    setAutosaveStatus('saving');
    try {
      await handleSaveAll(true);
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus('idle'), 3000);
    } catch (err) {
      setAutosaveStatus('idle');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const year = org.academicYear || '2023/2024';
      const sem = org.semester || 'Ganjil';

      // 1. Fetch Academic Grades
      const { data: gData } = await supabase
        .from('student_grades')
        .select('*')
        .eq('academic_year', year)
        .eq('semester', sem);
      
      const gradeMap = {};
      gData?.forEach(g => {
        if (g.subject_name === selectedSubject) {
          gradeMap[g.student_id] = {
            score_knowledge: g.score_knowledge,
            score_skills: g.score_skills,
            notes: g.notes
          };
        }
      });
      setGrades(gradeMap);

      // 2. Fetch P5 Data
      const { data: pData } = await supabase
        .from('student_p5')
        .select('*')
        .eq('project_name', selectedProject);
      
      const pMap = {};
      pData?.forEach(p => {
        pMap[p.student_id] = p.ratings || {};
      });
      setP5Grades(pMap);

      // 3. Fetch Summaries
      const { data: sData } = await supabase
        .from('student_summaries')
        .select('*')
        .eq('academic_year', year)
        .eq('semester', sem);
      
      const sumMap = {};
      sData?.forEach(s => sumMap[s.student_id] = s);
      setSummaries(sumMap);

    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSingle = async (studentId) => {
    setSaving(studentId);
    try {
      const year = org.academicYear || '2023/2024';
      const sem = org.semester || 'Ganjil';

      if (mode === 'academic') {
        const g = grades[studentId] || { score_knowledge: 0, score_skills: 0, notes: '' };
        await supabase.from('student_grades').upsert({
          student_id: studentId,
          subject_name: selectedSubject,
          academic_year: year,
          semester: sem,
          ...g
        }, { onConflict: 'student_id,subject_name,academic_year,semester' });
      } else if (mode === 'p5ra') {
        const ratings = p5Grades[studentId] || {};
        await supabase.from('student_p5').upsert({
          student_id: studentId,
          project_name: selectedProject,
          ratings: ratings
        }, { onConflict: 'student_id,project_name' });
      } else {
        const s = summaries[studentId] || {};
        await supabase.from('student_summaries').upsert({
          student_id: studentId,
          academic_year: year,
          semester: sem,
          ...s
        }, { onConflict: 'student_id,academic_year,semester' });
      }
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const calculateRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('student_grades')
        .select('student_id, score_knowledge, score_skills')
        .eq('academic_year', org.academicYear)
        .eq('semester', org.semester);

      if (error) throw error;

      const studentAverages = {};
      data.forEach(g => {
        if (!studentAverages[g.student_id]) studentAverages[g.student_id] = { total: 0, count: 0 };
        studentAverages[g.student_id].total += (g.score_knowledge + g.score_skills) / 2;
        studentAverages[g.student_id].count += 1;
      });

      const ranked = Object.entries(studentAverages)
        .map(([id, val]) => ({ id, avg: val.total / val.count }))
        .sort((a, b) => b.avg - a.avg);

      const rankMap = {};
      ranked.forEach((r, idx) => rankMap[r.id] = idx + 1);
      setRanking(rankMap);
    } catch (err) {
      console.warn('Ranking failed:', err);
    }
  };

  const exportToExcel = () => {
    const csvRows = [["Nama", "NISN", "Kelas", "Rata-rata", "Peringkat"]];
    filteredStudents.forEach(s => {
      const rank = ranking[s.id] || '-';
      const sGrades = grades[s.id] || { score_knowledge: 0, score_skills: 0 };
      const avg = ((sGrades.score_knowledge + sGrades.score_skills) / 2).toFixed(1);
      csvRows.push([s.name, s.nisn, s.class, avg, rank]);
    });
    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Ledger_Nilai_${selectedClass}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGradeChange = (studentId, field, value) => {
    const val = field === 'notes' ? value : (parseInt(value) || 0);
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { score_knowledge: 0, score_skills: 0, notes: '' }),
        [field]: val
      }
    }));
  };

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
      if (current.score_knowledge === 0) current.score_knowledge = bulkValue;
      if (current.score_skills === 0) current.score_skills = bulkValue;
      newGrades[s.id] = current;
    });
    setGrades(newGrades);
    setAutosaveStatus('saving'); // Trigger visual feedback for bulk fill
  };

  const handleSummaryChange = (studentId, field, value) => {
    setSummaries(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        [field]: value
      }
    }));
  };

  const handleSaveAll = async (isAuto = false) => {
    if (!isAuto) setSaving(true);
    try {
      const promises = filteredStudents.map(s => handleSaveSingle(s.id));
      await Promise.all(promises);
      if (!isAuto) {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }
    } catch (err) {
      console.error('Batch save error:', err);
    } finally {
      if (!isAuto) setSaving(false);
    }
  };

  const handleOpenMenu = (e, studentId) => {
    e.stopPropagation();
    if (activeMenu === studentId) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    // Position menu below the button, aligned to the right
    setMenuPos({
      top: rect.bottom + window.scrollY,
      left: rect.right - 220 + window.scrollX // 220 is menu width
    });
    setActiveMenu(studentId);
  };

  // Close menu on click outside
  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handlePrintIframe = () => {
    const iframe = document.querySelector('.report-preview-iframe');
    if (iframe) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  if (loading) return <div className="loading-state">Memuat data...</div>;

  return (
    <div className="grades-container">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <GraduationCap size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Manajemen Nilai & Rapor</h1>
            <p className="page-subtitle">Kelola nilai harian dan catatan perkembangan siswa.</p>
          </div>
        </div>
        <div className="header-actions-premium">
          <button className="btn-premium btn-secondary-premium action-btn-responsive" onClick={exportToExcel}>
            <Printer size={18} />
            <span>Ledger Excel</span>
          </button>
          <button 
            className="btn-premium btn-primary-premium action-btn-responsive"
            onClick={() => setPreviewUrl(`/rapor?class=${selectedClass}&view=rapor&preview=true&bulk=true`)}
          >
            <Printer size={18} />
            <span>Cetak Masal</span>
          </button>
          <button 
            className="btn btn-primary action-btn-responsive"
            onClick={() => handleSaveAll()}
            disabled={saving || isLocked}
          >
            {saving ? <div className="spinner-small" /> : <Save size={18} />}
            <span>{saving ? 'Saving...' : isLocked ? 'Data Terkunci' : 'Simpan Cloud'}</span>
          </button>
          
          {(user?.role === 'Admin' || user?.role === 'Kepala Madrasah' || !isLocked) && (
            <button 
              className={`btn action-btn-responsive ${isLocked ? 'btn-secondary' : 'btn-primary'}`}
              style={isLocked ? {background: '#f1f5f9', color: '#475569'} : {background: '#ef4444', color: 'white'}}
              onClick={handleToggleLock}
              disabled={saving}
            >
              {isLocked ? <Lock size={18} /> : <ClipboardCheck size={18} />}
              <span>{isLocked ? 'Buka Kunci Nilai' : 'Finalisasi Nilai'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="mode-toggle-bar glass-card">
        <button 
          className={`mode-btn ${mode === 'academic' ? 'active' : ''}`}
          onClick={() => setMode('academic')}
        >
          <BookOpen size={18} />
          <span>Nilai Akademik</span>
        </button>
        <button 
          className={`mode-btn ${mode === 'p5ra' ? 'active' : ''}`}
          onClick={() => setMode('p5ra')}
        >
          <Star size={18} />
          <span>Proyek P5-PPRA</span>
        </button>
        <button 
          className={`mode-btn ${mode === 'leger' ? 'active' : ''}`}
          onClick={() => setMode('leger')}
        >
          <GraduationCap size={18} />
          <span>Leger & Ranking</span>
        </button>
      </div>

      <div className="grades-filter-card glass-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label><School size={14} /> Pilih Kelas</label>
            <CustomSelect 
              options={classes}
              value={selectedClass}
              onChange={(val) => setSelectedClass(val)}
            />
          </div>
          
          {mode === 'academic' && (
            <div className="filter-group">
              <label><Star size={14} /> Mata Pelajaran</label>
              <div className="input-with-lock">
                <CustomSelect 
                  options={subjects}
                  value={selectedSubject} 
                  onChange={(val) => setSelectedSubject(val)}
                  disabled={user?.role === 'Guru'}
                />
                {user?.role === 'Guru' && <Lock size={14} className="lock-icon" />}
              </div>
            </div>
          )}

          {mode === 'p5ra' && (
            <div className="filter-group">
              <label><ClipboardCheck size={14} /> Pilih Proyek P5</label>
              <CustomSelect 
                options={projects}
                value={selectedProject}
                onChange={(val) => setSelectedProject(val)}
              />
            </div>
          )}

          <div className="filter-info-bar">
            <div className="info-badge">
              <div className="info-icon"><Calendar size={14} /></div>
              <div className="info-content">
                <span>Periode Akademik</span>
                <strong>{org.academicYear} - {org.semester}</strong>
              </div>
            </div>
            <div className="info-badge">
              <div className="info-icon"><User size={14} /></div>
              <div className="info-content">
                <span>Wali Kelas</span>
                <strong>{org.homerooms?.[selectedClass] || 'Belum diatur'}</strong>
              </div>
            </div>
          </div>

          <div className="kkm-config-box">
            <label>KKM Mapel</label>
            <div className="kkm-input-wrapper">
              <input 
                type="number" 
                value={kkm} 
                onChange={(e) => setKkm(parseInt(e.target.value) || 0)} 
              />
              <Lock size={12} className="text-muted" />
            </div>
          </div>

          {mode === 'subject' && (
            <div className="bulk-fill-box">
              <label>Isi Masal (Bulk Fill)</label>
              <div className="bulk-controls">
                <input 
                  type="number" 
                  value={bulkValue} 
                  onChange={(e) => setBulkValue(parseInt(e.target.value) || 0)} 
                  className="grade-input"
                  style={{width: '80px'}}
                />
                <button className="btn-bulk-apply" onClick={handleBulkFill}>
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="stats-dashboard-bar animate-fade-in">
        <div className="stat-card">
          <div className="stat-icon avg"><Star size={18} /></div>
          <div className="stat-info">
            <span>Rata-rata Kelas</span>
            <strong>{classStats.avg}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon max"><CheckCircle2 size={18} /></div>
          <div className="stat-info">
            <span>Nilai Tertinggi</span>
            <strong>{classStats.max}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon min"><AlertCircle size={18} /></div>
          <div className="stat-info">
            <span>Nilai Terendah</span>
            <strong>{classStats.min}</strong>
          </div>
        </div>
      </div>

      <div className="grades-table-card glass-card">
        <div className="table-responsive-wrapper">
          <table className="grades-table">
          <thead>
            {mode === 'academic' && (
              <tr>
                <th>Nama Siswa</th>
                <th width="100">Pengetahuan</th>
                <th width="100">Keterampilan</th>
                <th width="100" className="hide-mobile">Tren</th>
                <th>Deskripsi Kemajuan</th>
                <th width="100">Rata2</th>
                <th width="60" className="hide-mobile">Rank</th>
                <th width="80" style={{textAlign: 'center'}}>Aksi</th>
              </tr>
            )}
            {mode === 'p5ra' && (
              <tr>
                <th>Nama Siswa</th>
                {p5Elements.map(el => (
                  <th key={el.id} width="120" title={el.sub}>{el.name}</th>
                ))}
                <th width="80">Aksi</th>
              </tr>
            )}
            {mode === 'leger' && (
              <tr>
                <th>Nama Siswa</th>
                <th width="100">Rata-rata</th>
                <th width="100">Peringkat</th>
                <th>Catatan Wali Kelas</th>
                <th width="120">Aksi</th>
              </tr>
            )}
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const actionCell = (
                  <td>
                    <div className="action-group-mini">
                      <button 
                        className={`btn-save-mini ${saving === student.id ? 'loading' : ''}`}
                        onClick={() => handleSaveSingle(student.id)}
                      >
                        <Save size={16} />
                      </button>
                      <button 
                        className="btn-print-mini"
                        onClick={(e) => handleOpenMenu(e, student.id)}
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                );

                if (mode === 'academic') {
                  const sGrades = grades[student.id] || { score_knowledge: 0, score_skills: 0, notes: '' };
                  const avg = ((sGrades.score_knowledge + sGrades.score_skills) / 2).toFixed(1);
                  
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <div>
                            <div className="student-name">{student.name}</div>
                            <div className="student-nisn hide-mobile">NISN: {student.nisn}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="grade-input" 
                          value={sGrades.score_knowledge} 
                          disabled={isLocked}
                          onChange={(e) => handleGradeChange(student.id, 'score_knowledge', e.target.value)} 
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="grade-input" 
                          value={sGrades.score_skills} 
                          disabled={isLocked}
                          onChange={(e) => handleGradeChange(student.id, 'score_skills', e.target.value)} 
                        />
                      </td>
                      <td className="graph-cell-premium hide-mobile">
                        <div className="mini-progress-graph">
                          <div className="bar-wrapper"><div className="bar k" style={{height: `${(sGrades.score_knowledge/100)*100}%`}} /></div>
                          <div className="bar-wrapper"><div className="bar s" style={{height: `${(sGrades.score_skills/100)*100}%`}} /></div>
                        </div>
                      </td>
                      <td>
                        <div className="notes-with-auto">
                          <input 
                            type="text" 
                            className="notes-input" 
                            placeholder="Catatan kemajuan..."
                            value={sGrades.notes} 
                            disabled={isLocked}
                            onChange={(e) => handleGradeChange(student.id, 'notes', e.target.value)} 
                          />
                        </div>
                      </td>
                      <td>
                        <div className={`avg-badge ${avg >= kkm ? 'pass' : 'fail'}`}>{avg}</div>
                      </td>
                      <td align="center" className="hide-mobile">
                        <div className={`rank-badge rank-${ranking[student.id] <= 3 ? ranking[student.id] : 'default'}`}>
                          {ranking[student.id] || '-'}
                        </div>
                      </td>
                      {actionCell}
                    </tr>
                  );
                } else if (mode === 'p5ra') {
                  const sP5 = p5Grades[student.id] || {};
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-name">{student.name}</div>
                        </div>
                      </td>
                      {p5Elements.map(el => (
                        <td key={el.id}>
                          <CustomSelect 
                            options={['MB', 'B', 'BSH', 'SB']}
                            value={sP5[el.id] || ''}
                            onChange={(val) => handleP5Change(student.id, el.id, val)}
                            placeholder="-"
                            className="p5-custom-select"
                          />
                        </td>
                      ))}
                      {actionCell}
                    </tr>
                  );
                } else {
                  // Leger Mode
                  const sSum = summaries[student.id] || {};
                  const sGrades = grades[student.id] || { score_knowledge: 0, score_skills: 0 };
                  const avg = ((sGrades.score_knowledge + sGrades.score_skills) / 2).toFixed(1);
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-name">{student.name}</div>
                        </div>
                      </td>
                      <td align="center"><strong>{avg}</strong></td>
                      <td align="center"><span className="rank-badge">{ranking[student.id] || '-'}</span></td>
                      <td>
                        <textarea 
                          className="notes-textarea"
                          rows={2}
                          value={sSum.notes || ''}
                          onChange={(e) => handleSummaryChange(student.id, 'notes', e.target.value)}
                        />
                      </td>
                      {actionCell}
                    </tr>
                  );
                }
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty-table">Tidak ada siswa di kelas ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {showSaved && (
        <div className="toast-success">
          <CheckCircle2 size={20} />
          <span>Data berhasil disimpan ke Cloud!</span>
        </div>
      )}

      {previewUrl && (
        <div className="report-modal-overlay">
          <div className="report-modal-container">
            <div className="modal-top-bar">
              <button className="btn-close-modal" onClick={() => setPreviewUrl(null)}>
                <ChevronLeft size={18} />
                <span>Tutup</span>
              </button>
              <div className="modal-title-info">Pratinjau Rapor Digital</div>
              <button className="btn-print-modal" onClick={handlePrintIframe}>
                <Printer size={18} />
                <span>Cetak Rapor</span>
              </button>
            </div>
            <div className="modal-body-preview">
              <iframe 
                src={previewUrl}
                className="report-preview-iframe"
                title="Report Preview"
              />
            </div>
          </div>
        </div>
      )}
      {activeMenu && (
        <>
          {/* Overlay for mobile to handle click-outside properly */}
          <div className="menu-overlay-mobile" onClick={() => setActiveMenu(null)} />
          <div 
            className="fixed-print-menu animate-pop-in"
            style={{ 
              top: `${menuPos.top}px`, 
              left: `${menuPos.left}px` 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="menu-header-mobile">
              <h4>Pilih Dokumen Cetak</h4>
              <button className="btn-close-sm" onClick={() => setActiveMenu(null)}><ChevronLeft size={16}/></button>
            </div>
            {(() => {
              const student = students.find(s => s.id === activeMenu);
              if (!student) return null;
              return (
                <div className="menu-buttons-list">
                  <button onClick={() => { setPreviewUrl(`/rapor?nisn=${student.nisn}&view=sampul&preview=true`); setActiveMenu(null); }}><span>Cetak Sampul</span> <ChevronRight size={14}/></button>
                  <button onClick={() => { setPreviewUrl(`/rapor?nisn=${student.nisn}&view=identitas&preview=true`); setActiveMenu(null); }}><span>Cetak Identitas</span> <ChevronRight size={14}/></button>
                  <button onClick={() => { setPreviewUrl(`/rapor?nisn=${student.nisn}&view=nilai&preview=true`); setActiveMenu(null); }}><span>Cetak Nilai</span> <ChevronRight size={14}/></button>
                  <button onClick={() => { setPreviewUrl(`/rapor?nisn=${student.nisn}&view=rapor&preview=true`); setActiveMenu(null); }}><span>Cetak Rapor</span> <ChevronRight size={14}/></button>
                  <button onClick={() => { setPreviewUrl(`/rapor?nisn=${student.nisn}&view=rekap&preview=true`); setActiveMenu(null); }}><span>Cetak Rekap</span> <ChevronRight size={14}/></button>
                  <button onClick={() => { setPreviewUrl(`/rapor?nisn=${student.nisn}&view=p5ra&preview=true`); setActiveMenu(null); }}><span>Cetak Lampiran</span> <ChevronRight size={14}/></button>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {autosaveStatus !== 'idle' && (
        <div className={`autosave-indicator ${autosaveStatus}`}>
          {autosaveStatus === 'saving' ? (
            <><RefreshCcw size={14} className="spin" /> <span>Menyimpan otomatis...</span></>
          ) : (
            <><CheckCircle2 size={14} /> <span>Semua perubahan tersimpan</span></>
          )}
        </div>
      )}
    </div>
  );
};

export default Grades;
