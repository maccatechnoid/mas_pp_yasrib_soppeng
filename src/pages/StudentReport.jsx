import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Printer, 
  Download, 
  GraduationCap,
  AlertCircle,
  ChevronLeft,
  School,
  FileText
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
      const data = getAllData();
      const foundStudent = data.students.find(s => s.nisn === searchNisn.trim());
      
      if (!foundStudent) throw new Error('Siswa dengan NISN tersebut tidak ditemukan.');
      setStudent(foundStudent);

      const { data: gradeData, error: gradeErr } = await supabase
        .from('student_grades')
        .select('*')
        .eq('student_id', foundStudent.id)
        .eq('academic_year', org.academicYear || '2023/2024')
        .eq('semester', org.semester || 'Ganjil');

      if (gradeErr) throw gradeErr;
      setGrades(gradeData || []);

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

  const handlePrint = () => window.print();

  // Sort grades into Kemenag groups (A: Common, B: Local/Vocational)
  const groupA = grades.filter(g => !['Seni Budaya', 'PJOK', 'Informatika', 'Bahasa Jawa', 'Muatan Lokal'].includes(g.subject_name));
  const groupB = grades.filter(g => ['Seni Budaya', 'PJOK', 'Informatika', 'Bahasa Jawa', 'Muatan Lokal'].includes(g.subject_name));

  return (
    <div className="report-portal-container">
      {!student ? (
        <div className="search-view fade-in">
          <div className="search-box-card glass-card">
            <div className="kemenag-brand">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Logo_Kementerian_Agama.png" alt="Kemenag" className="kemenag-logo" />
              <h3>Kementerian Agama RI</h3>
              <p>Portal Rapor Digital Madrasah (RDM)</p>
            </div>
            
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrap">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Masukkan NISN Siswa..."
                  value={searchNisn}
                  onChange={(e) => setSearchNisn(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-search" disabled={loading}>
                {loading ? 'Mencari Data...' : 'Lihat Hasil Belajar'}
              </button>
            </form>
            
            {error && <div className="search-error"><AlertCircle size={16} /> {error}</div>}
          </div>
        </div>
      ) : (
        <div className="report-view fade-in">
          <div className="report-actions no-print">
            <button className="btn btn-outline" onClick={() => setStudent(null)}>
              <ChevronLeft size={18} /> Kembali
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={18} /> Cetak Rapor (RDM Style)
            </button>
          </div>

          <div className="report-document printable-area kemenag-style">
            {/* Kop Madrasah */}
            <div className="kemenag-kop">
              <div className="kop-logo-kemenag">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Logo_Kementerian_Agama.png" alt="Kemenag" />
              </div>
              <div className="kop-text">
                <h3>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
                <h4>KANTOR KEMENTERIAN AGAMA KABUPATEN/KOTA</h4>
                <h2 className="madrasah-name">{org.name || 'MADRASAH ALIYAH NEGERI'}</h2>
                <p className="madrasah-address">{org.address || 'Alamat Lengkap Madrasah'}</p>
              </div>
              <div className="kop-logo-madrasah">
                {org.logo && <img src={org.logo} alt="Logo" />}
              </div>
            </div>

            <div className="report-title-section">
              <h2>LAPORAN HASIL BELAJAR (RAPOR)</h2>
              <p>KURIKULUM MERDEKA</p>
            </div>

            <div className="student-info-table">
              <div className="info-row"><span>Nama Siswa</span>: {student.name}</div>
              <div className="info-row"><span>NISN / NIS</span>: {student.nisn}</div>
              <div className="info-row"><span>Kelas / Fase</span>: {student.class}</div>
              <div className="info-row"><span>Semester</span>: {org.semester}</div>
              <div className="info-row"><span>Tahun Pelajaran</span>: {org.academicYear}</div>
            </div>

            <div className="rdm-section">
              <h3>A. Nilai Akademik</h3>
              <table className="rdm-table">
                <thead>
                  <tr>
                    <th width="40">No</th>
                    <th>Mata Pelajaran</th>
                    <th width="80">Nilai Akhir</th>
                    <th>Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan="4" className="group-title">Kelompok A (Umum)</td></tr>
                  {groupA.map((g, i) => (
                    <tr key={g.id}>
                      <td align="center">{i + 1}</td>
                      <td>{g.subject_name}</td>
                      <td align="center"><strong>{((g.score_tugas + g.score_uts + g.score_uas)/3).toFixed(0)}</strong></td>
                      <td className="desc-cell">{g.notes || `Menunjukkan penguasaan yang sangat baik dalam memahami materi ${g.subject_name}.`}</td>
                    </tr>
                  ))}
                  <tr><td colSpan="4" className="group-title">Kelompok B (Lokal/Pilihan)</td></tr>
                  {groupB.map((g, i) => (
                    <tr key={g.id}>
                      <td align="center">{i + 1}</td>
                      <td>{g.subject_name}</td>
                      <td align="center"><strong>{((g.score_tugas + g.score_uts + g.score_uas)/3).toFixed(0)}</strong></td>
                      <td className="desc-cell">{g.notes || `Menunjukkan penguasaan yang baik dalam materi ${g.subject_name}.`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rdm-grid-2">
              <div className="rdm-section">
                <h3>B. Ekstrakurikuler</h3>
                <table className="rdm-table">
                  <thead>
                    <tr><th width="40">No</th><th>Kegiatan</th><th>Predikat</th><th>Keterangan</th></tr>
                  </thead>
                  <tbody>
                    {(summary?.extracurricular || []).length > 0 ? (
                      summary.extracurricular.map((ex, i) => (
                        <tr key={i}><td align="center">{i+1}</td><td>{ex.split('(')[0]}</td><td align="center">A</td><td>Sangat Baik</td></tr>
                      ))
                    ) : (
                      <tr><td colSpan="4" align="center">-</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="rdm-section">
                <h3>C. Kehadiran</h3>
                <table className="rdm-table">
                  <tbody>
                    <tr><td width="150">Sakit</td><td>: 0 Hari</td></tr>
                    <tr><td>Izin</td><td>: 0 Hari</td></tr>
                    <tr><td>Alpa</td><td>: 0 Hari</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rdm-section">
              <h3>D. Catatan Wali Kelas</h3>
              <div className="rdm-notes-box">
                {summary?.character_notes || 'Ananda memiliki motivasi belajar yang tinggi, pertahankan prestasi dan teruslah berakhlak mulia.'}
              </div>
            </div>

            <div className="rdm-signatures">
              <div className="sig-item">
                <p>Orang Tua/Wali,</p>
                <div className="sig-space"></div>
                <p>..................................</p>
              </div>
              <div className="sig-item">
                <p>{org.address?.split(',')[0] || 'Kota'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Wali Kelas,</p>
                <div className="sig-space"></div>
                <p><strong>{org.homerooms?.[student.class] || '..................................'}</strong></p>
              </div>
              <div className="sig-center">
                <p>Mengetahui,</p>
                <p>Kepala Madrasah</p>
                <div className="sig-space-large">
                   {org.principalPhoto && <img src={org.principalPhoto} className="rdm-stempel" alt="TTD" />}
                </div>
                <p><strong>{org.principal || '..................................'}</strong></p>
                <p>NIP. {org.principalNip || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
