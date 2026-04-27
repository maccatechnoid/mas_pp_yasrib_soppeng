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
  School
} from 'lucide-react';
import { getAllData, saveData, supabase } from '../utils/storage';
import './Grades.css';

const Grades = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [org, setOrg] = useState({});
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [grades, setGrades] = useState({}); // { studentId: { tugas, uts, uas, notes } }
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
    if (selectedClass && selectedSubject) {
      fetchGrades();
    }
  }, [selectedClass, selectedSubject]);

  const fetchGrades = async () => {
    try {
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
    } catch (err) {
      console.error('Error fetching grades:', err.message);
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

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payloads = filteredStudents.map(s => ({
        student_id: s.id,
        subject_name: selectedSubject,
        academic_year: org.academicYear || '2023/2024',
        semester: org.semester || 'Ganjil',
        score_tugas: grades[s.id]?.tugas || 0,
        score_uts: grades[s.id]?.uts || 0,
        score_uas: grades[s.id]?.uas || 0,
        notes: grades[s.id]?.notes || ''
      }));

      for (const payload of payloads) {
        await supabase
          .from('student_grades')
          .upsert(payload, { 
            onConflict: 'student_id,subject_name,academic_year,semester' 
          });
      }

      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error('Error saving grades:', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Memuat data...</div>;

  return (
    <div className="grades-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manajemen Nilai</h1>
          <p className="page-subtitle">Input nilai tugas, UTS, dan UAS siswa Madrasah.</p>
        </div>
        <button 
          className="btn btn-primary btn-save-all"
          onClick={handleSaveAll}
          disabled={saving}
        >
          {saving ? <div className="spinner-small" /> : <Save size={18} />}
          <span>{saving ? 'Menyimpan...' : 'Simpan Semua Nilai'}</span>
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
          <div className="filter-group">
            <label><BookOpen size={14} /> Mata Pelajaran</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-info">
            <div className="info-item">
              <span>Tahun Ajaran:</span>
              <strong>{org.academicYear || '2023/2024'}</strong>
            </div>
            <div className="info-item">
              <span>Semester:</span>
              <strong>{org.semester || 'Ganjil'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grades-table-card glass-card">
        <table className="grades-table">
          <thead>
            <tr>
              <th>Nama Siswa</th>
              <th width="120">Tugas</th>
              <th width="120">UTS</th>
              <th width="120">UAS</th>
              <th>Catatan</th>
              <th width="100">Rata-rata</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
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
                      <input 
                        type="number" 
                        className="grade-input"
                        value={sGrades.tugas}
                        onChange={(e) => handleGradeChange(student.id, 'tugas', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="grade-input"
                        value={sGrades.uts}
                        onChange={(e) => handleGradeChange(student.id, 'uts', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="grade-input"
                        value={sGrades.uas}
                        onChange={(e) => handleGradeChange(student.id, 'uas', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="notes-input"
                        placeholder="Catatan progres..."
                        value={sGrades.notes}
                        onChange={(e) => handleGradeChange(student.id, 'notes', e.target.value)}
                      />
                    </td>
                    <td>
                      <div className={`avg-badge ${avg >= 75 ? 'pass' : 'fail'}`}>
                        {avg}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-table">Tidak ada siswa di kelas ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showSaved && (
        <div className="toast-success">
          <CheckCircle2 size={20} />
          <span>Nilai berhasil disimpan ke Cloud!</span>
        </div>
      )}
    </div>
  );
};

export default Grades;
