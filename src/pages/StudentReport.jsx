import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Printer, 
  Download, 
  User, 
  Book, 
  BarChart, 
  Award, 
  FileText,
  Calendar,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';
import { getAllData, supabase } from '../utils/storage';
import './StudentReport.css';

const StudentReport = () => {
  const [searchNisn, setSearchNisn] = useState('');
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [org, setOrg] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const data = getAllData();
    setOrg(data.org || {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchNisn.trim()) return;

    setLoading(true);
    setError(null);
    setStudent(null);
    
    try {
      // 1. Get student data
      const data = getAllData();
      const foundStudent = data.students.find(s => s.nisn === searchNisn.trim());
      
      if (!foundStudent) {
        throw new Error('Siswa dengan NISN tersebut tidak ditemukan.');
      }

      setStudent(foundStudent);

      // 2. Fetch grades from Supabase
      const { data: gradeData, error: gradeErr } = await supabase
        .from('student_grades')
        .select('*')
        .eq('student_id', foundStudent.id)
        .eq('academic_year', org.academicYear || '2023/2024')
        .eq('semester', org.semester || 'Ganjil');

      if (gradeErr) throw gradeErr;
      setGrades(gradeData || []);

      // 3. Fetch summary
      const { data: summaryData } = await supabase
        .from('student_summaries')
        .select('*')
        .eq('student_id', foundStudent.id)
        .eq('academic_year', org.academicYear || '2023/2024')
        .eq('semester', org.semester || 'Ganjil')
        .single();
      
      setSummary(summaryData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateTotalAvg = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => {
      return acc + (curr.score_tugas + curr.score_uts + curr.score_uas) / 3;
    }, 0);
    return (sum / grades.length).toFixed(1);
  };

  return (
    <div className="report-portal-container">
      {/* Public View / Search View */}
      {!student ? (
        <div className="search-view fade-in">
          <div className="search-box-card glass-card">
            <div className="search-header">
              <div className="portal-icon">
                <GraduationCap size={40} />
              </div>
              <h2>Portal Rapor Digital</h2>
              <p>Masukkan NISN siswa untuk melihat hasil belajar semester ini.</p>
            </div>
            
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrap">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Contoh: 0012345678"
                  value={searchNisn}
                  onChange={(e) => setSearchNisn(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-search" disabled={loading}>
                {loading ? 'Mencari...' : 'Lihat Rapor'}
              </button>
            </form>
            
            {error && <div className="search-error"><AlertCircle size={16} /> {error}</div>}
            
            <div className="search-footer">
              <p>Punya kendala? Hubungi Admin Tata Usaha Madrasah.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="report-view fade-in">
          <div className="report-actions no-print">
            <button className="btn btn-outline" onClick={() => setStudent(null)}>
              <ChevronLeft size={18} /> Kembali
            </button>
            <div className="action-group">
              <button className="btn btn-primary" onClick={handlePrint}>
                <Printer size={18} /> Cetak Rapor
              </button>
            </div>
          </div>

          <div className="report-document printable-area">
            {/* Report Header */}
            <div className="doc-header">
              <div className="doc-logo">
                {org.logo ? <img src={org.logo} alt="Logo" /> : <div className="logo-placeholder">M</div>}
              </div>
              <div className="doc-org-info">
                <h1>{org.name || 'MADRASAH ALIYAH'}</h1>
                <p>{org.address || 'Alamat Madrasah Belum Diatur'}</p>
                <p>Telp: {org.phone || '-'} | Email: {org.email || '-'}</p>
              </div>
            </div>

            <div className="doc-title">
              <h2>LAPORAN HASIL BELAJAR PESERTA DIDIK</h2>
              <p>(RAPOR DIGITAL)</p>
            </div>

            <div className="student-info-grid">
              <div className="info-col">
                <div className="info-row"><span>Nama Peserta Didik</span>: <strong>{student.name}</strong></div>
                <div className="info-row"><span>Nomor Induk / NISN</span>: <strong>{student.nisn}</strong></div>
                <div className="info-row"><span>Madrasah</span>: <strong>{org.name}</strong></div>
              </div>
              <div className="info-col">
                <div className="info-row"><span>Kelas</span>: <strong>{student.class}</strong></div>
                <div className="info-row"><span>Fase / Semester</span>: <strong>{org.semester}</strong></div>
                <div className="info-row"><span>Tahun Pelajaran</span>: <strong>{org.academicYear}</strong></div>
              </div>
            </div>

            <div className="doc-section-title">A. NILAI AKADEMIK</div>
            <table className="report-table">
              <thead>
                <tr>
                  <th width="40">No</th>
                  <th>Mata Pelajaran</th>
                  <th width="80">Nilai</th>
                  <th>Capaian Kompetensi / Catatan Guru</th>
                </tr>
              </thead>
              <tbody>
                {grades.length > 0 ? (
                  grades.map((g, index) => {
                    const avg = ((g.score_tugas + g.score_uts + g.score_uas) / 3).toFixed(0);
                    return (
                      <tr key={g.id}>
                        <td align="center">{index + 1}</td>
                        <td>{g.subject_name}</td>
                        <td align="center"><strong>{avg}</strong></td>
                        <td className="comp-cell">{g.notes || 'Menunjukkan penguasaan materi yang baik.'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="4" align="center">Belum ada data nilai.</td></tr>
                )}
              </tbody>
              {grades.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan="2" align="right"><strong>RATA-RATA NILAI AKHIR</strong></td>
                    <td align="center"><strong>{calculateTotalAvg()}</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>

            <div className="doc-section-title">B. CATATAN PERKEMBANGAN</div>
            <div className="notes-box">
              <div className="note-item">
                <h4>Catatan Wali Kelas:</h4>
                <p>{summary?.character_notes || 'Pertahankan semangat belajarmu, teruslah berprestasi dan berakhlak mulia.'}</p>
              </div>
            </div>

            <div className="signatures-area">
              <div className="sig-item">
                <p>Orang Tua/Wali,</p>
                <div className="sig-space"></div>
                <p>( .................................. )</p>
              </div>
              <div className="sig-item">
                <p>{org.principal || 'Kepala Madrasah'},</p>
                <div className="sig-space">
                   {org.principalPhoto && <img src={org.principalPhoto} className="stempel-mock" alt="TTD" />}
                </div>
                <p><strong>{org.principal || '..................................'}</strong></p>
              </div>
            </div>
            
            <div className="doc-footer-info">
              Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
