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
  ExternalLink
} from 'lucide-react';
import { getAllData, saveData, supabase } from '../utils/storage';
import './Grades.css';

const Grades = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('subject'); // 'subject' or 'homeroom'
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [org, setOrg] = useState({});
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [grades, setGrades] = useState({}); // { studentId: { tugas, uts, uas, notes } }
  const [summaries, setSummaries] = useState({}); // { studentId: { character_notes, extracurricular } }
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const data = getAllData();
    setStudents(data.students || []);
    setSubjects(data.subjects || []);
    setClasses(data.classes || []);
    setOrg(data.org || {});
    setLoading(false);

    if (data.classes?.length > 0) setSelectedClass(data.classes[0]);
    if (data.subjects?.length > 0) setSelectedSubject(data.subjects[0]);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchData();
    }
  }, [selectedClass, selectedSubject, mode]);

  const fetchData = async () => {
    try {
      if (mode === 'subject') {
        const { data, error } = await supabase
          .from('student_grades')
          .select('*')
          .eq('subject_name', selectedSubject)
          .eq('academic_year', org.academicYear || '2023/2024')
          .eq('semester', org.semester || 'Ganjil');

        if (error) throw error;

        const gradeMap = {};
        data.forEach(g => {
          gradeMap[g.student_id] = {
            tugas: g.score_tugas,
            uts: g.score_uts,
            uas: g.score_uas,
            notes: g.notes
          };
        });
        setGrades(gradeMap);
      } else {
        const { data, error } = await supabase
          .from('student_summaries')
          .select('*')
          .eq('academic_year', org.academicYear || '2023/2024')
          .eq('semester', org.semester || 'Ganjil');

        if (error) throw error;

        const sumMap = {};
        data.forEach(s => {
          sumMap[s.student_id] = {
            character_notes: s.character_notes,
            extracurricular: s.extracurricular || []
          };
        });
        setSummaries(sumMap);
      }
    } catch (err) {
      console.error('Error fetching data:', err.message);
    }
  };

  const filteredStudents = students.filter(s => s.class === selectedClass);

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { tugas: 0, uts: 0, uas: 0, notes: '' }),
        [field]: field === 'notes' ? value : parseInt(value) || 0
      }
    }));
  };

  const handleSummaryChange = (studentId, field, value) => {
    setSummaries(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { character_notes: '', extracurricular: [] }),
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const year = org.academicYear || '2023/2024';
      const sem = org.semester || 'Ganjil';

      if (mode === 'subject') {
        const payloads = filteredStudents.map(s => ({
          student_id: s.id,
          subject_name: selectedSubject,
          academic_year: year,
          semester: sem,
          score_tugas: grades[s.id]?.tugas || 0,
          score_uts: grades[s.id]?.uts || 0,
          score_uas: grades[s.id]?.uas || 0,
          notes: grades[s.id]?.notes || ''
        }));

        for (const payload of payloads) {
          await supabase.from('student_grades').upsert(payload, { 
            onConflict: 'student_id,subject_name,academic_year,semester' 
          });
        }
      } else {
        const payloads = filteredStudents.map(s => ({
          student_id: s.id,
          academic_year: year,
          semester: sem,
          character_notes: summaries[s.id]?.character_notes || '',
          extracurricular: summaries[s.id]?.extracurricular || []
        }));

        for (const payload of payloads) {
          await supabase.from('student_summaries').upsert(payload, { 
            onConflict: 'student_id,academic_year,semester' 
          });
        }
      }

      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error('Error saving data:', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Memuat data...</div>;

  return (
    <div className="grades-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Nilai & Rapor</h1>
          <p className="page-subtitle">Kelola nilai harian dan catatan perkembangan siswa.</p>
        </div>
        <button 
          className="btn btn-primary btn-save-all"
          onClick={handleSaveAll}
          disabled={saving}
        >
          {saving ? <div className="spinner-small" /> : <Save size={18} />}
          <span>{saving ? 'Menyimpan...' : 'Simpan Semua Data'}</span>
        </button>
      </div>

      <div className="mode-toggle-bar glass-card">
        <button 
          className={`mode-btn ${mode === 'subject' ? 'active' : ''}`}
          onClick={() => setMode('subject')}
        >
          <BookOpen size={18} />
          <span>Input Nilai Mapel</span>
        </button>
        <button 
          className={`mode-btn ${mode === 'homeroom' ? 'active' : ''}`}
          onClick={() => setMode('homeroom')}
        >
          <UserCheck size={18} />
          <span>Catatan Wali Kelas</span>
        </button>
      </div>

      <div className="grades-filter-card glass-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label><School size={14} /> Pilih Kelas</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          {mode === 'subject' && (
            <div className="filter-group">
              <label><Star size={14} /> Mata Pelajaran</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="filter-info">
            <div className="info-item">
              <span>Periode:</span>
              <strong>{org.academicYear} - {org.semester}</strong>
            </div>
            <div className="info-item">
              <span>Wali Kelas:</span>
              <strong>{org.homerooms?.[selectedClass] || 'Belum diatur'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grades-table-card glass-card">
        <table className="grades-table">
          <thead>
            {mode === 'subject' ? (
              <tr>
                <th>Nama Siswa</th>
                <th width="100">Tugas</th>
                <th width="100">UTS</th>
                <th width="100">UAS</th>
                <th>Catatan Mapel</th>
                <th width="100">Rata-rata</th>
                <th width="120">Aksi</th>
              </tr>
            ) : (
              <tr>
                <th>Nama Siswa</th>
                <th width="300">Catatan Karakter / Wali Kelas</th>
                <th>Ekstrakurikuler</th>
                <th width="120">Aksi</th>
              </tr>
            )}
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const actionCell = (
                  <td>
                    <a 
                      href={`/rapor?nisn=${student.nisn}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-preview-link"
                    >
                      <ExternalLink size={14} />
                      <span>Lihat Rapor</span>
                    </a>
                  </td>
                );

                if (mode === 'subject') {
                  const sGrades = grades[student.id] || { tugas: 0, uts: 0, uas: 0, notes: '' };
                  const avg = ((sGrades.tugas + sGrades.uts + sGrades.uas) / 3).toFixed(1);
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">{student.name.charAt(0)}</div>
                          <div>
                            <div className="student-name">{student.name}</div>
                            <div className="student-nisn">NISN: {student.nisn}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <input type="number" className="grade-input" value={sGrades.tugas} onChange={(e) => handleGradeChange(student.id, 'tugas', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="grade-input" value={sGrades.uts} onChange={(e) => handleGradeChange(student.id, 'uts', e.target.value)} />
                      </td>
                      <td>
                        <input type="number" className="grade-input" value={sGrades.uas} onChange={(e) => handleGradeChange(student.id, 'uas', e.target.value)} />
                      </td>
                      <td>
                        <input type="text" className="notes-input" value={sGrades.notes} onChange={(e) => handleGradeChange(student.id, 'notes', e.target.value)} />
                      </td>
                      <td>
                        <div className={`avg-badge ${avg >= 75 ? 'pass' : 'fail'}`}>{avg}</div>
                      </td>
                      {actionCell}
                    </tr>
                  );
                } else {
                  const sSum = summaries[student.id] || { character_notes: '', extracurricular: [] };
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">{student.name.charAt(0)}</div>
                          <div>
                            <div className="student-name">{student.name}</div>
                            <div className="student-nisn">NISN: {student.nisn}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <textarea 
                          className="notes-textarea" 
                          rows={2}
                          placeholder="Tulis catatan perkembangan karakter siswa..."
                          value={sSum.character_notes} 
                          onChange={(e) => handleSummaryChange(student.id, 'character_notes', e.target.value)} 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="notes-input" 
                          placeholder="Contoh: Pramuka (A), PMR (B)"
                          value={sSum.extracurricular.join(', ')} 
                          onChange={(e) => handleSummaryChange(student.id, 'extracurricular', e.target.value.split(',').map(s => s.trim()))} 
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

      {showSaved && (
        <div className="toast-success">
          <CheckCircle2 size={20} />
          <span>Data berhasil disimpan ke Cloud!</span>
        </div>
      )}
    </div>
  );
};

export default Grades;
