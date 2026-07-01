import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, FileText, Download, Award, TrendingUp, CheckCircle2, Calculator, FlaskConical, BookHeart, ClipboardList, PenTool, Hash, Percent, AlertCircle } from 'lucide-react';
import { getAllData } from '../utils/storage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import './NilaiSiswa.css';

const NilaiSiswa = () => {
  const [grades, setGrades] = useState([]);
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const data = getAllData();
    setUser(data.user);
    setOrg(data.org);

    // Simulated fetch or fallback to default grades
    // In a real app, you would fetch from Supabase here using student ID
    const rawGrades = [
      { subject: 'Matematika Lanjut', daily: 88, uts: 85, uas: 90 },
      { subject: 'Fisika Terapan', daily: 90, uts: 92, uas: 88 },
      { subject: 'Pendidikan Agama Islam', daily: 95, uts: 96, uas: 95 },
      { subject: 'Bahasa Inggris', daily: 82, uts: 80, uas: 85 },
      { subject: 'Biologi', daily: 78, uts: 75, uas: 79 },
    ];

    const processedGrades = rawGrades.map(g => {
      const avg = Math.round(((g.daily + g.uts + g.uas) / 3) * 10) / 10;
      let status = 'Belum Tuntas';
      let statusType = 'warning';

      if (avg >= 90) { status = 'Sangat Baik'; statusType = 'success'; }
      else if (avg >= 75) { status = 'Lulus'; statusType = 'success'; }

      return { ...g, avg, status, statusType };
    });

    setGrades(processedGrades);
  }, []);

  const getSubjectIcon = (subject) => {
    if (subject.includes('Matematika')) return <Calculator size={18} className="text-indigo-500" />;
    if (subject.includes('Fisika')) return <FlaskConical size={18} className="text-emerald-500" />;
    if (subject.includes('Agama')) return <BookHeart size={18} className="text-amber-500" />;
    return <BookOpen size={18} className="text-blue-500" />;
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsDownloading(true);
    const toastId = toast.loading('Menyiapkan dokumen rapor...');

    try {
      const element = reportRef.current;

      // We'll temporarily adjust some styles to make the PDF look better
      const originalBoxShadow = element.style.boxShadow;
      element.style.boxShadow = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      element.style.boxShadow = originalBoxShadow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Header Kop Surat in PDF
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(org?.name || 'Madrasah Hub', pdfWidth / 2, 20, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(org?.address || 'Alamat Madrasah', pdfWidth / 2, 26, { align: 'center' });

      pdf.line(15, 30, pdfWidth - 15, 30);

      // Student Info
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text('LAPORAN HASIL BELAJAR SISWA', pdfWidth / 2, 40, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Nama Siswa: ${user?.name || 'Siswa'}`, 15, 50);
      pdf.text(`Semester: ${org?.semester || 'Ganjil'} ${org?.academicYear || '2024/2025'}`, 15, 56);

      // Paste table image
      pdf.addImage(imgData, 'PNG', 15, 65, pdfWidth - 30, (pdfWidth - 30) * (canvas.height / canvas.width));

      pdf.save(`Rapor_${user?.name || 'Siswa'}_${org?.semester || 'Semester'}.pdf`);
      toast.success('Rapor berhasil diunduh!', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal mengunduh rapor.', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="nilai-siswa-page animate-fade-in">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper" style={{ color: '#3b82f6', background: '#eff6ff' }}>
            <BookOpen size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Nilai Siswa</h1>
            <p className="page-subtitle">Pantau perkembangan akademik dan unduh rapor Anda.</p>
          </div>
        </div>
      </div>

      <div className="academic-alert glass-card">
        <div className="aa-icon">
          <Award size={24} />
        </div>
        <div className="aa-content">
          <h4>Semester {org?.semester || 'Genap'} {org?.academicYear || '2025/2026'}</h4>
          <p>Tingkatkan terus prestasi Anda, {user?.name || 'Siswa'}!</p>
        </div>
      </div>

      <div className="academic-matrix-wrapper glass-card mt-8">
        <div className="amw-header">
          <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800">
            <TrendingUp size={20} className="text-blue-500" /> Rincian Nilai
          </h3>
          <button
            className="premium-download-btn"
            title="Unduh Rapor (PDF)"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? <span className="animate-pulse">Loading...</span> : <><Download size={18} /> Unduh Rapor</>}
          </button>
        </div>

        <div className="table-responsive" ref={reportRef} style={{ padding: '10px', background: 'white', borderRadius: '8px' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th><div className="flex items-center gap-2"><BookOpen size={16} className="text-slate-400 hide-icon-mobile" /> Mapel</div></th>
                <th><div className="flex justify-center items-center gap-2"><ClipboardList size={16} className="text-slate-400 hide-icon-mobile" /> Tugas</div></th>
                <th><div className="flex justify-center items-center gap-2"><PenTool size={16} className="text-slate-400 hide-icon-mobile" /> UTS</div></th>
                <th><div className="flex justify-center items-center gap-2"><FileText size={16} className="text-slate-400 hide-icon-mobile" /> UAS</div></th>
                <th><div className="flex justify-center items-center gap-2"><Hash size={16} className="text-slate-400 hide-icon-mobile" /> Rerata</div></th>
                <th><div className="flex items-center gap-2"><Percent size={16} className="text-slate-400 hide-icon-mobile" /> Ket.</div></th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, idx) => (
                <tr key={idx}>
                  <td data-label="Mapel">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 hide-icon-mobile">
                        {getSubjectIcon(g.subject)}
                      </div>
                      <span className="font-semibold text-slate-800">{g.subject}</span>
                    </div>
                  </td>
                  <td data-label="Tugas" className="text-center">{g.daily}</td>
                  <td data-label="UTS" className="text-center">{g.uts}</td>
                  <td data-label="UAS" className="text-center">{g.uas}</td>
                  <td data-label="Rerata" className="text-center font-bold text-blue-600">{g.avg}</td>
                  <td data-label="Ket.">
                    <span className={`premium-badge ${g.statusType}`}>
                      {g.statusType === 'success' ? <CheckCircle2 size={14} className="hide-icon-mobile" /> : <AlertCircle size={14} className="hide-icon-mobile" />}
                      &nbsp;{g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NilaiSiswa;
