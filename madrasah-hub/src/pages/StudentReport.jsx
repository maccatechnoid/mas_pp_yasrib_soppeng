import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Printer, 
  ChevronLeft,
  AlertCircle,
  FileText,
  User,
  Layout,
  ClipboardList,
  FileCheck,
  Paperclip,
  QrCode,
  Loader2,
  Share2
} from 'lucide-react';
import { getAllData, supabase } from '../utils/storage';
import './StudentReport.css';

import { useNavigate } from 'react-router-dom';

const StudentReport = () => {
  const navigate = useNavigate();
  const [searchNisn, setSearchNisn] = useState('');
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [org, setOrg] = useState({});
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('rekap');
  
  // Bulk states
  const [bulkStudents, setBulkStudents] = useState([]);
  const [allGradesMap, setAllGradesMap] = useState({});
  const [allSummariesMap, setAllSummariesMap] = useState({});
  const [allReligiousMap, setAllReligiousMap] = useState({});
  const [isBulk, setIsBulk] = useState(false);

  useEffect(() => {
    try {
      const data = getAllData();
      setOrg(data.org || {});

      const params = new URLSearchParams(window.location.search);
      const nisnParam = params.get('nisn');
      const viewParam = params.get('view');
      const bulkParam = params.get('bulk') === 'true';
      const classParam = params.get('class');
      
      if (viewParam) setActiveView(viewParam);

      if (bulkParam && classParam) {
        setIsBulk(true);
        performBulkSearch(classParam, data);
      } else if (nisnParam) {
        setSearchNisn(nisnParam);
        performSearch(nisnParam, data);
      }
    } catch (err) {
      console.error("Init error:", err);
    }
  }, []);

  const performBulkSearch = async (className, allData) => {
    setLoading(true);
    try {
      const studentsInClass = (allData.students || []).filter(s => s.class === className);
      setBulkStudents(studentsInClass);

      if (supabase) {
        const studentIds = studentsInClass.map(s => s.id);
        const { data: gData } = await supabase.from('student_grades').select('*').in('student_id', studentIds);
        const { data: sData } = await supabase.from('student_summaries').select('*').in('student_id', studentIds);
        const { data: rData } = await supabase.from('student_religious').select('*').in('student_id', studentIds);

        const gMap = {};
        gData?.forEach(g => {
          if (!gMap[g.student_id]) gMap[g.student_id] = [];
          gMap[g.student_id].push(g);
        });
        setAllGradesMap(gMap);

        const sMap = {};
        sData?.forEach(s => sMap[s.student_id] = s);
        setAllSummariesMap(sMap);

        const rMap = {};
        rData?.forEach(r => {
          if (!rMap[r.student_id]) rMap[r.student_id] = {};
          rMap[r.student_id][r.activity] = (rMap[r.student_id][r.activity] || 0) + 1;
        });
        setAllReligiousMap(rMap);
      }
    } catch (err) {
      console.error("Bulk fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (nisn, allData) => {
    if (!nisn) return;
    setLoading(true);
    setError(null);
    try {
      const students = allData.students || [];
      const foundStudent = students.find(s => s.nisn === nisn.trim());
      if (!foundStudent) throw new Error(`Siswa dengan NISN ${nisn} tidak ditemukan.`);
      setStudent(foundStudent);
      if (supabase) {
        const { data: gradeData } = await supabase.from('student_grades').select('*').eq('student_id', foundStudent.id);
        setGrades(gradeData || []);
        const { data: summaryData } = await supabase.from('student_summaries').select('*').eq('student_id', foundStudent.id).maybeSingle();
        setSummary(summaryData);
        
        const { data: rData } = await supabase.from('student_religious').select('*').eq('student_id', foundStudent.id);
        const rMap = {};
        rData?.forEach(r => rMap[r.activity] = (rMap[r.activity] || 0) + 1);
        setAllReligiousMap({ [foundStudent.id]: rMap });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const data = getAllData();
    performSearch(searchNisn, data);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link rapor berhasil di-copy ke clipboard! Silakan bagikan melalui WhatsApp.');
  };

  const renderSignature = (role, name, nip) => {
    const sigImg = role === 'Kepala' ? org.principalSig : org.teacherSig;
    const stampImg = role === 'Kepala' ? org.stamp : null;
    return (
      <div style={{textAlign: 'center', width: '220px', position: 'relative'}}>
        <p>{role === 'Kepala' ? 'Mengetahui,' : ''}</p>
        <p>{role === 'Kepala' ? 'Kepala Madrasah' : 'Wali Kelas'}</p>
        <div style={{height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          {sigImg && (
            <img src={sigImg} alt="sig" style={{maxHeight: '70px', objectFit: 'contain', position: 'relative', zIndex: 2}} />
          )}
          {stampImg && (
            <img src={stampImg} alt="stamp" className="rdm-stamp-img" />
          )}
          {!sigImg && !stampImg && <div style={{height: '45px'}}></div>}
        </div>
        <p className="sig-name">{name}</p>
        <p>NIP. {nip || '-'}</p>
      </div>
    );
  };

  const renderReportContent = (currStudent, currGrades, currSummary) => {
    // Shared variables
    const sRel = allReligiousMap[currStudent.id] || {};

    const getFinalGrade = (subj) => {
      const match = currGrades.find(g => g.subject_name === subj);
      return match ? ((match.score_tugas + match.score_uts + match.score_uas) / 3).toFixed(0) : '-';
    };

    const generateDescription = (subj, grade, baseDesc) => {
      if (grade === '-') return '-';
      const score = parseInt(grade);
      let prefix = score >= 90 ? "Menunjukkan penguasaan yang sangat baik dalam" : 
                   score >= 80 ? "Menunjukkan penguasaan yang baik dalam" :
                   score >= 70 ? "Menunjukkan penguasaan yang cukup dalam" : 
                   "Perlu bimbingan lebih lanjut dalam";
      return `${prefix} ${baseDesc}`;
    };

    const getPredicate = (score) => {
      const s = parseInt(score);
      if (isNaN(s)) return '-';
      if (s >= 93) return 'A';
      if (s >= 84) return 'B';
      if (s >= 75) return 'C';
      return 'D';
    };

    const getPredicateDesc = (pred) => {
      if (pred === 'A') return 'Sangat Baik';
      if (pred === 'B') return 'Baik';
      if (pred === 'C') return 'Cukup';
      if (pred === 'D') return 'Perlu Bimbingan';
      return '-';
    };

    const commonSubjects = [
      { id: '1a', name: "Al Qur'an Hadis", isSub: true, desc: "Memahami ayat dan hadis tentang ketaatan." },
      { id: '1b', name: "Akidah Akhlak", isSub: true, desc: "Memahami ragam sikap terpuji." },
      { id: '1c', name: "Fikih", isSub: true, desc: "Memahami kaidah hukum Islam." },
      { id: '1d', name: "Sejarah Kebudayaan Islam", isSub: true, desc: "Menganalisis sejarah kerajaan Islam." },
      { id: 2, name: "Pendidikan Pancasila", desc: "Menganalisis Gotong Royong." },
      { id: 3, name: "Bahasa Indonesia", desc: "Menganalisis teks sastra." },
      { id: 4, name: "Bahasa Arab", desc: "Memahami struktur teks Arab." },
      { id: 5, name: "Matematika", desc: "Memahami permutasi dan kombinasi." },
      { id: 6, name: "Bahasa Inggris", desc: "Memahami teks hortatory." },
      { id: 7, name: "Pendidikan Jasmani", desc: "Keterampilan olahraga beregu." },
      { id: 8, name: "Sejarah Indonesia", desc: "Menganalisis dinamika bangsa." },
      { id: 9, name: "Seni Budaya", desc: "Memahami apresiasi seni." },
      { id: 10, name: "Prakarya", desc: "Pengolahan produk non pangan." }
    ];

    const electiveSubjects = [
      { id: '1a', name: "Biologi", isSub: true, desc: "Mengevaluasi teori evolusi." },
      { id: '1b', name: "Kimia", isSub: true, desc: "Memahami konsep polimer." },
      { id: '1c', name: "Fisika", isSub: true, desc: "Menganalisis relativitas." }
    ];

    if (activeView === 'sampul') {
      return (
        <div className="report-page sampul-page">
          <div className="sampul-border-frame">
            <div className="sampul-kemenag-logo-wrap">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Logo_Kementerian_Agama.png" alt="K" className="sampul-kemenag-logo" />
            </div>
            <h1 className="sampul-title">RAPOR DIGITAL MADRASAH</h1>
            <h2 className="sampul-subtitle">(RDM)</h2>
            <div className="sampul-logo-madrasah">
               <img src={org.logo || "https://upload.wikimedia.org/wikipedia/id/0/05/Logo_Madrasah_Indonesia.png"} alt="L" />
            </div>
            <div className="sampul-student-box">
               <p className="label-above">NAMA PESERTA DIDIK</p>
               <div className="name-box">{currStudent?.name?.toUpperCase()}</div>
               <p className="label-above">NISN / NIS</p>
               <div className="name-box">{currStudent?.nisn} / {currStudent?.nis || '-'}</div>
            </div>
            <div className="sampul-bottom-official">
               <h3>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
               <h2>{org.name || 'NAMA MADRASAH BELUM DIATUR'}</h2>
               <p className="official-address">{org.address}</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeView === 'identitas') {
      return (
        <div className="report-page">
           <div className="report-title-box">
             <h2 className="official-title">IDENTITAS PESERTA DIDIK</h2>
           </div>
           <table className="identitas-table-official">
              <tbody>
                 <tr><td width="30">1.</td><td width="220">Nama Lengkap</td><td>: <strong>{currStudent?.name?.toUpperCase()}</strong></td></tr>
                 <tr><td>2.</td><td>NIS / NISN</td><td>: {currStudent?.nis || '-'} / {currStudent?.nisn}</td></tr>
                 <tr><td>3.</td><td>Tempat, Tanggal Lahir</td><td>: {currStudent?.pob || '-'}, {currStudent?.dob || '-'}</td></tr>
                 <tr><td>4.</td><td>Jenis Kelamin</td><td>: {currStudent?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
                 <tr><td>5.</td><td>Agama</td><td>: Islam</td></tr>
                 <tr><td>6.</td><td>Status dalam Keluarga</td><td>: {currStudent?.familyStatus || 'Anak Kandung'}</td></tr>
                 <tr><td>7.</td><td>Anak Ke</td><td>: {currStudent?.childOrder || '-'}</td></tr>
                 <tr><td>8.</td><td>Alamat Peserta Didik</td><td>: {currStudent?.address || '-'}</td></tr>
                 <tr><td>9.</td><td>Diterima di Madrasah ini</td><td></td></tr>
                 <tr><td></td><td style={{paddingLeft: '15px'}}>a. Di Kelas</td><td>: {currStudent?.class}</td></tr>
                 <tr><td></td><td style={{paddingLeft: '15px'}}>b. Pada Tanggal</td><td>: {currStudent?.entryDate || '-'}</td></tr>
                 <tr><td>10.</td><td>Nama Orang Tua</td><td></td></tr>
                 <tr><td></td><td style={{paddingLeft: '15px'}}>a. Ayah</td><td>: {currStudent?.fatherName || '-'}</td></tr>
                 <tr><td></td><td style={{paddingLeft: '15px'}}>b. Ibu</td><td>: {currStudent?.motherName || '-'}</td></tr>
                 <tr><td>11.</td><td>Pekerjaan Orang Tua</td><td></td></tr>
                 <tr><td></td><td style={{paddingLeft: '15px'}}>a. Ayah</td><td>: {currStudent?.fatherJob || '-'}</td></tr>
                 <tr><td></td><td style={{paddingLeft: '15px'}}>b. Ibu</td><td>: {currStudent?.motherJob || '-'}</td></tr>
              </tbody>
           </table>
           <div className="rdm-sig-container mt-40">
              <div className="sig-row-bottom">
                 {renderSignature('Kepala', org.principal, org.principalNip)}
              </div>
           </div>
        </div>
      );
    }

    if (activeView === 'rapor') {
      return (
        <div className="report-multi-page">
          <div className="report-page">
            <div className="official-kop-header">
               <div className="kop-left">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Logo_Kementerian_Agama.png" alt="K" />
               </div>
               <div className="kop-center">
                  <h3>{org.kopHeader1 || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA'}</h3>
                  <h2>{org.kopHeader2 || org.name}</h2>
                  <p>{org.kopHeader3 || org.address}</p>
               </div>
               <div className="kop-right">
                  <img src={org.logo || "https://upload.wikimedia.org/wikipedia/id/0/05/Logo_Madrasah_Indonesia.png"} alt="L" />
               </div>
            </div>
            <div className="student-info-grid-official">
              <div className="info-col">
                <table><tbody>
                  <tr><td width="80">NAMA</td><td>: <strong>{currStudent?.name?.toUpperCase()}</strong></td></tr>
                  <tr><td>NIS/NISN</td><td>: {currStudent?.nis || '-'} / {currStudent?.nisn}</td></tr>
                  <tr><td>Madrasah</td><td>: {org.name}</td></tr>
                </tbody></table>
              </div>
              <div className="info-col">
                <table><tbody>
                  <tr><td width="100">Kelas</td><td>: {currStudent?.class}</td></tr>
                  <tr><td>Semester</td><td>: {org.semester}</td></tr>
                  <tr><td>Tahun Pelajaran</td><td>: {org.academicYear}</td></tr>
                </tbody></table>
              </div>
            </div>
            <h4 className="section-title-official">A. CAPAIAN HASIL BELAJAR</h4>
            <table className="rekap-table" style={{fontSize: '9pt'}}>
              <thead><tr><th width="150">Mata Pelajaran</th><th width="45">Nilai Akhir</th><th width="40">Predikat</th><th>Capaian Kompetensi</th></tr></thead>
              <tbody>
                <tr className="cat-header"><td colSpan="4">Kelompok A (Umum)</td></tr>
                {commonSubjects.map((s, idx) => {
                  const g = getFinalGrade(s.name);
                  const pred = getPredicate(g);
                  return (
                    <tr key={s.id}>
                      <td className={s.isSub ? 'subject-sub-name' : 'subject-name'}>
                        {s.isSub ? `${s.id.slice(-1).toUpperCase()}. ${s.name}` : `${idx + 1}. ${s.name}`}
                      </td>
                      <td align="center"><strong>{g}</strong></td>
                      <td align="center">{pred}</td>
                      <td style={{fontSize: '8pt', textAlign: 'justify', lineHeight: '1.2'}}>
                        {g !== '-' ? `Ananda menunjukkan kemampuan ${getPredicateDesc(pred).toLowerCase()} dalam ${s.desc}` : '-'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="cat-header"><td colSpan="4">Kelompok B (Pilihan)</td></tr>
                {electiveSubjects.map((s) => {
                  const g = getFinalGrade(s.name);
                  const pred = getPredicate(g);
                  return (
                    <tr key={s.id}>
                      <td className="subject-sub-name">{s.id.slice(-1).toUpperCase()}. {s.name}</td>
                      <td align="center"><strong>{g}</strong></td>
                      <td align="center">{pred}</td>
                      <td style={{fontSize: '8pt', textAlign: 'justify', lineHeight: '1.2'}}>
                        {g !== '-' ? `Ananda menunjukkan kemampuan ${getPredicateDesc(pred).toLowerCase()} dalam ${s.desc}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Religious & Character - Merged into Page 1 flow */}
            <h4 className="section-title-official" style={{marginTop: '15px'}}>B. PEMBIASAAN IBADAH & KARAKTER</h4>
            <table className="rekap-table">
              <thead>
                <tr><th width="30">NO</th><th>Jenis Pembiasaan</th><th width="100">Predikat</th><th>Deskripsi</th></tr>
              </thead>
              <tbody>
                <tr><td align="center">1</td><td>Kedisiplinan Shalat Dhuha</td><td align="center"><strong>{sRel?.dhuha > 10 ? 'SANGAT BAIK' : sRel?.dhuha > 5 ? 'BAIK' : 'CUKUP'}</strong></td><td style={{fontSize: '8pt'}}>Ananda menunjukkan istiqomah dalam ibadah dhuha.</td></tr>
                <tr><td align="center">2</td><td>Tadarus Al-Qur'an Pagi</td><td align="center"><strong>{sRel?.tadarus > 10 ? 'SANGAT BAIK' : sRel?.tadarus > 5 ? 'BAIK' : 'CUKUP'}</strong></td><td style={{fontSize: '8pt'}}>Kemampuan membaca Al-Qur'an meningkat dengan baik.</td></tr>
                <tr><td align="center">3</td><td>Kedisiplinan Shalat Dzuhur</td><td align="center"><strong>{sRel?.dzuhur > 10 ? 'SANGAT BAIK' : sRel?.dzuhur > 5 ? 'BAIK' : 'CUKUP'}</strong></td><td style={{fontSize: '8pt'}}>Tertib dalam melaksanakan shalat berjamaah.</td></tr>
              </tbody>
            </table>

            <div className="wali-section">
                <h4 className="section-title-official">C. SIKAP (SPIRITUAL & SOSIAL)</h4>
                <table className="rekap-table">
                  <thead><tr><th width="150">Dimensi</th><th width="80">Predikat</th><th>Deskripsi</th></tr></thead>
                  <tbody>
                    <tr><td>Sikap Spiritual</td><td align="center"><strong>SANGAT BAIK</strong></td><td style={{fontSize: '8pt'}}>{currSummary?.note_spiritual || 'Sangat taat beribadah.'}</td></tr>
                    <tr><td>Sikap Sosial</td><td align="center"><strong>BAIK</strong></td><td style={{fontSize: '8pt'}}>{currSummary?.note_social || 'Disiplin dan bertanggung jawab.'}</td></tr>
                  </tbody>
                </table>

                <h4 className="section-title-official">D. EKSTRAKURIKULER & PRESTASI</h4>
                <table className="rekap-table">
                  <thead><tr><th width="40">NO</th><th width="200">Kegiatan/Prestasi</th><th>Keterangan</th></tr></thead>
                  <tbody>
                    <tr><td align="center">1</td><td>{currSummary?.extracurricular || '-'}</td><td>Ekstrakurikuler</td></tr>
                    <tr><td align="center">2</td><td>{currSummary?.achievement || '-'}</td><td>Prestasi</td></tr>
                  </tbody>
                </table>

                <h4 className="section-title-official">E. KETIDAKHADIRAN</h4>
                <table className="rekap-table" style={{width: '280px'}}>
                  <tbody>
                    <tr><td width="120">Sakit: <strong>{currSummary?.attendance_s || 0}</strong></td><td width="120">Izin: <strong>{currSummary?.attendance_i || 0}</strong></td><td width="120">Alpa: <strong>{currSummary?.attendance_a || 0}</strong></td></tr>
                  </tbody>
                </table>
             </div>

             <div className="rdm-sig-container">
                <div className="sig-row-top">
                   <div style={{textAlign: 'center', width: '200px'}}><p>Orang Tua/Wali</p><div style={{height: '45px'}}></div><p>________________</p></div>
                   {renderSignature('Wali Kelas', org.teacherName, org.teacherNip)}
                </div>
                <div className="sig-row-bottom" style={{marginTop: '-10px'}}>
                   {renderSignature('Kepala Madrasah', org.principal, org.principalNip)}
                </div>
             </div>
          </div>
        </div>
      );
    }

    if (activeView === 'nilai' || activeView === 'rekap') {
      return (
        <div className="report-page">
          <div className="rekap-header">
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Logo_Kementerian_Agama.png" alt="K" />
             <div className="header-text-center">
               <h3>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
               <h2>{org.name}</h2>
               <p>{org.address}</p>
             </div>
          </div>
          <div className="report-title"><h3>{activeView === 'nilai' ? 'DAFTAR NILAI AKADEMIK' : 'REKAPITULASI NILAI AKHIR'}</h3></div>
          <div className="student-info-section-official">
              <table><tbody>
                <tr><td>NAMA</td><td>: {currStudent?.name?.toUpperCase()}</td></tr>
                <tr><td>KELAS</td><td>: {currStudent?.class}</td></tr>
              </tbody></table>
          </div>
          <table className="rekap-table">
            <thead>
              <tr><th width="40">NO</th><th>MATA PELAJARAN</th><th width="80">PENGETAHUAN</th><th width="80">KETERAMPILAN</th><th width="80">RATA-RATA</th></tr>
            </thead>
            <tbody>
              {commonSubjects.map((s, idx) => {
                const g = getFinalGrade(s.name);
                return (
                  <tr key={s.id}>
                    <td align="center">{idx + 1}</td>
                    <td>{s.name}</td>
                    <td align="center">{g}</td>
                    <td align="center">{g}</td>
                    <td align="center"><strong>{g}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="rdm-sig-container">
             <div className="sig-row-bottom">
                {renderSignature('Guru', org.teacherName, org.teacherNip)}
             </div>
          </div>
        </div>
      );
    }

    if (activeView === 'p5ra') {
      return (
        <div className="report-page">
          <div className="report-title"><h3>LAPORAN PROYEK P3 - PPRA</h3></div>
          <p style={{fontSize: '10pt', textAlign: 'center', marginBottom: '20px'}}>(Proyek Penguatan Profil Pelajar Pancasila & Rahmatan Lil Alamin)</p>
          <div className="wali-section">
             <h4 className="section-title-official">PROYEK 1: Gaya Hidup Berkelanjutan</h4>
             <table className="rekap-table">
                <thead><tr><th>Sub-Elemen</th><th width="100">Capaian</th></tr></thead>
                <tbody>
                   <tr><td>Memahami keterhubungan ekosistem bumi</td><td align="center">SB</td></tr>
                   <tr><td>Menjaga lingkungan alam sekitar</td><td align="center">BSH</td></tr>
                </tbody>
             </table>
             <p style={{fontSize: '9pt', fontStyle: 'italic'}}>Catatan: Ananda sangat antusias dalam proyek pengolahan limbah organik di madrasah.</p>
          </div>
          <div className="rdm-sig-container mt-20">
             <div className="sig-row-bottom">
                {renderSignature('Kepala', org.principal, org.principalNip)}
             </div>
          </div>
        </div>
      );
    }
    // Fallback or other views can be added here
    return <div>Tampilan Cetak "{activeView}" sedang disiapkan untuk mode masal.</div>;
  };

  if (loading) return <div className="report-loading-screen"><Loader2 className="spinner" size={40} /><p>Memuat Rapor Siswa...</p></div>;

  return (
    <div className={`report-portal-advanced ${isBulk || new URLSearchParams(window.location.search).get('preview') === 'true' ? 'pure-preview' : ''}`}>
      {!student && !isBulk ? (
        <div className="search-view-advanced">
           <div className="search-card-premium">
              <QrCode size={48} />
              <h2>Cek Rapor Digital</h2>
              <form onSubmit={handleSearch} className="search-form-advanced">
                <input type="text" placeholder="Masukkan NISN Siswa" value={searchNisn} onChange={(e) => setSearchNisn(e.target.value)} />
                <button type="submit" className="btn btn-primary">Cari Data</button>
              </form>
              {error && <div className="error-box"><AlertCircle size={16} /> {error}</div>}
           </div>
        </div>
      ) : (
        <div className="report-workspace">
          {!isBulk && !new URLSearchParams(window.location.search).get('preview') && (
            <div className="report-sidebar no-print">
              <div className="sidebar-header">
                <div className="sidebar-top-actions">
                  <button className="btn-back" onClick={() => navigate('/portal-akademik')}><ChevronLeft size={16} /> Kembali</button>
                  <button className="btn-print-action-top" onClick={() => window.print()}><Printer size={16} /> Cetak</button>
                </div>
                <div className="rdm-student-profile">
                  <div className="rdm-avatar-mini">{student?.name?.charAt(0)}</div>
                  <div className="rdm-profile-info">
                    <p className="b-name">{student?.name}</p>
                    <p className="b-nisn">{student?.nisn}</p>
                  </div>
                </div>
              </div>
              <div className="sidebar-menu">
                <button className={`menu-item ${activeView === 'rapor' ? 'active' : ''}`} onClick={() => setActiveView('rapor')}><FileCheck size={18} /><span>Rapor Hasil Belajar</span></button>
                <button className="menu-item" onClick={handleShare}><Share2 size={18} /><span>Bagikan Link WA</span></button>
              </div>
            </div>
          )}
          <div className="report-preview-area">
             <div className="preview-container-inner">
                {isBulk ? (
                  bulkStudents.map((s, idx) => (
                    <React.Fragment key={s.id}>
                      <div className="bulk-report-wrapper">
                        {renderReportContent(s, allGradesMap[s.id] || [], allSummariesMap[s.id] || {})}
                      </div>
                      {idx < bulkStudents.length - 1 && <div className="page-break-after"></div>}
                    </React.Fragment>
                  ))
                ) : (
                  renderReportContent(student, grades, summary)
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReport;
