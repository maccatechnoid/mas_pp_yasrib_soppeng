import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  Calendar,
  ChevronDown,
  FileSpreadsheet,
  FileBadge2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { getAllData } from '../utils/storage';
import './Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('Presensi'); // 'Presensi', 'Nilai', 'Keuangan', 'Jurnal Guru', 'Kehadiran Guru'
  const [period, setPeriod] = useState('Bulanan');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [masterData, setMasterData] = useState({ 
    classes: [],
    students: [],
    grades: [],
    payments: [],
    org: {
      name: 'MADRASAH ALIYAH HUB',
      address: 'Jl. Pendidikan No. 45',
      phone: '-',
      email: '-',
      principal: '-',
      teacherName: '-'
    }
  });
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const data = getAllData();
    setMasterData(data);
  }, []);

  const getReportData = () => {
    const students = (masterData.students || []).filter(s => 
      selectedClass === 'Semua' || s.class === selectedClass
    );

    if (reportType === 'Presensi') {
      return students.map(s => ({
        name: s.name,
        hadir: 18 + Math.floor(Math.random() * 5),
        izin: Math.floor(Math.random() * 2),
        alpa: Math.floor(Math.random() * 1),
        late: Math.floor(Math.random() * 3),
        total: 90 + Math.floor(Math.random() * 10)
      }));
    } else if (reportType === 'Nilai') {
      const subjects = masterData.subjects || ['Matematika', 'B. Indonesia', 'B. Inggris'];
      return students.map(s => {
        const studentGrades = subjects.reduce((acc, sub) => {
          acc[sub] = 75 + Math.floor(Math.random() * 20);
          return acc;
        }, {});
        const avg = Object.values(studentGrades).reduce((a, b) => a + b, 0) / subjects.length;
        return {
          name: s.name,
          ...studentGrades,
          average: avg.toFixed(1)
        };
      });
    } else if (reportType === 'Keuangan') {
      return students.map(s => {
        const isPaid = Math.random() > 0.3;
        return {
          name: s.name,
          amount: isPaid ? 250000 : 0,
          status: isPaid ? 'Lunas' : 'Belum Bayar',
          date: isPaid ? '12/10/2023' : '-'
        };
      });
    } else if (reportType === 'Jurnal Guru') {
      const logs = JSON.parse(localStorage.getItem('teacher_teaching_logs') || '[]');
      return logs.filter(log => selectedClass === 'Semua' || log.class === selectedClass);
    } else if (reportType === 'Kehadiran Guru') {
      const teachers = masterData.teachers || [
        { name: 'Ahmad Fauzi, S.Pd', role: 'Guru Matematika' },
        { name: 'Ustadz Ridwan, S.Ag', role: 'Guru PAI' },
        { name: 'Drs. H. M. Yasin', role: 'Guru Fiqih' },
        { name: 'Laila Husna, S.Si', role: 'Guru Biologi' },
        { name: 'Hj. Siti Aminah, M.Pd', role: 'Guru B. Indonesia' },
        { name: 'Budi Santoso, S.Kom', role: 'Guru TIK' },
        { name: 'Rini Astuti, S.Pd', role: 'Guru B. Inggris' },
        { name: 'Herman Pelani, S.Or', role: 'Guru PJOK' }
      ];
      return teachers.map(t => {
        const hadir = 18 + Math.floor(Math.random() * 4);
        const izin = Math.floor(Math.random() * 2);
        const alpa = Math.floor(Math.random() * 2);
        const total = hadir + izin + alpa;
        return {
          name: t.name || t,
          role: t.role || '-',
          hadir,
          izin,
          alpa,
          persentase: total > 0 ? Math.round((hadir / total) * 100) : 0
        };
      });
    } else if (reportType === 'Perizinan & Dinas Guru') {
      const leaves = JSON.parse(localStorage.getItem('madrasah_hub_teacher_leaves') || '[]');
      return leaves;
    }
    return [];
  };

  const currentReportData = getReportData();

  const handleExportPDF = async () => {
    const element = document.getElementById('report-document');
    if (!element) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan_${period}_${selectedClass}_${new Date().getTime()}.pdf`);
      setShowPreview(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      let worksheetData;
      if (reportType === 'Presensi') {
        worksheetData = currentReportData.map((row, i) => ({
          'No': i + 1, 'Nama': row.name, 'Hadir': row.hadir, 'Izin': row.izin, 'Alpa': row.alpa, 'Persentase': `${row.total}%`
        }));
      } else if (reportType === 'Nilai') {
        worksheetData = currentReportData.map((row, i) => ({
          'No': i + 1, 'Nama': row.name, ...row
        }));
      } else if (reportType === 'Keuangan') {
        worksheetData = currentReportData.map((row, i) => ({
          'No': i + 1, 'Nama': row.name, 'Jumlah': row.amount, 'Status': row.status
        }));
      } else if (reportType === 'Jurnal Guru') {
        worksheetData = currentReportData.map((row, i) => ({
          'No': i + 1, 'Tanggal': new Date(row.date).toLocaleDateString('id-ID'), 'Nama Guru': row.teacher, 'Kelas': row.class, 'Mata Pelajaran': row.subject, 'Topik': row.topic, 'Jam Masuk': row.timeIn || '-', 'Jam Keluar': row.timeOut || '-'
        }));
      } else if (reportType === 'Kehadiran Guru') {
        worksheetData = currentReportData.map((row, i) => ({
          'No': i + 1, 'Nama Guru': row.name, 'Jabatan': row.role, 'Hadir': row.hadir, 'Izin': row.izin, 'Alpa': row.alpa, 'Persentase Kehadiran': `${row.persentase}%`
        }));
      } else if (reportType === 'Perizinan & Dinas Guru') {
        worksheetData = currentReportData.map((row, i) => ({
          'No': i + 1,
          'Nama Guru': row.teacher_name,
          'Jabatan': row.role,
          'Jenis Izin': row.type,
          'Tanggal Mulai': row.start_date,
          'Tanggal Selesai': row.end_date,
          'Alasan': row.reason,
          'Tujuan Dinas': row.destination || '-',
          'Estimasi Biaya': row.cost || '0',
          'Guru Pengganti': row.substitute_teacher || '-',
          'Status': row.status,
          'Alasan Ditolak': row.rejected_reason || '-'
        }));
      }

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan ${reportType}`);
      XLSX.writeFile(workbook, `Laporan_${reportType}_${period}_${selectedClass}.xlsx`);
    } catch (error) {
      console.error('Excel Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (type) => {
    if (type === 'PDF') handleExportPDF();
    if (type === 'Excel') handleExportExcel();
    if (type === 'WORD') handleExportWord();
  };

  const handleExportWord = () => {
    setIsExporting(true);
    try {
      // Create a temporary container to render the report if modal is closed
      let reportElement = document.getElementById('report-document');
      
      // If modal is closed, we need to handle it. For now, let's assume user opens preview.
      // But better: if not found, we can't export.
      if (!reportElement) {
        alert("Silakan klik 'Lihat Preview Dokumen' terlebih dahulu untuk menyiapkan data ekspor.");
        setIsExporting(false);
        return;
      }

      const content = reportElement.innerHTML;
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 5px; text-align: left; } .doc-header { text-align: center; margin-bottom: 20px; } .sig-item { display: inline-block; width: 45%; vertical-align: top; }</style><title>Export Word</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + content + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_${period}_${selectedClass}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Word Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const reportTypes = [
    { id: 'Harian', label: 'Harian', desc: 'Presensi per hari ini' },
    { id: 'Mingguan', label: 'Mingguan', desc: 'Rekap 7 hari terakhir' },
    { id: 'Bulanan', label: 'Bulanan', desc: 'Statistik bulan aktif' },
    { id: 'Tahunan', label: 'Tahunan', desc: 'Akumulasi 1 tahun' },
    { id: 'Custom', label: 'Rentang Waktu', desc: 'Pilih tanggal bebas' },
  ];

  return (
    <div className="reports-container">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-amber">
            <FileText size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Pusat Laporan</h1>
            <p className="page-subtitle">Unduh rekapitulasi kehadiran siswa dalam berbagai format.</p>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="glass-card report-config-card">
          <h3 className="card-title mb-4">Konfigurasi Laporan</h3>
          
          <div className="config-section">
            <label className="config-label">Pilih Tipe Laporan</label>
            <CustomSelect 
              options={['Presensi Siswa', 'Nilai (Ledger)', 'Keuangan (SPP)', 'Jurnal Guru', 'Kehadiran Guru', 'Perizinan & Dinas Guru']}
              value={
                reportType === 'Nilai' ? 'Nilai (Ledger)' : 
                reportType === 'Keuangan' ? 'Keuangan (SPP)' : 
                reportType === 'Presensi' ? 'Presensi Siswa' : 
                reportType
              }
              onChange={(val) => {
                if (val === 'Nilai (Ledger)') setReportType('Nilai');
                else if (val === 'Keuangan (SPP)') setReportType('Keuangan');
                else if (val === 'Presensi Siswa') setReportType('Presensi');
                else if (val === 'Kehadiran Guru') setReportType('Kehadiran Guru');
                else if (val === 'Perizinan & Dinas Guru') setReportType('Perizinan & Dinas Guru');
                else setReportType('Jurnal Guru');
              }}
              icon={FileText}
            />

            <label className="config-label mt-6">Pilih Periode Laporan</label>
            <CustomSelect 
              options={reportTypes.map(t => t.label)}
              value={reportTypes.find(t => t.id === period)?.label}
              onChange={(val) => setPeriod(reportTypes.find(t => t.label === val)?.id)}
              icon={Calendar}
            />

            {period === 'Custom' && (
              <div className="custom-date-range mt-4 animate-fade-in">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Tanggal Mulai</label>
                    <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Selesai</label>
                    <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="config-section mt-6">
            <label className="config-label">Pilih Kelas</label>
            <CustomSelect 
              options={['Semua Kelas', ...masterData.classes.map(c => `Kelas ${c}`)]}
              value={selectedClass === 'Semua' ? 'Semua Kelas' : `Kelas ${selectedClass}`}
              onChange={(val) => setSelectedClass(val === 'Semua Kelas' ? 'Semua' : val.replace('Kelas ', ''))}
              icon={Filter}
            />
          </div>

          <div className="export-actions mt-8">
            <button 
              className="btn btn-primary w-full py-4"
              onClick={() => setShowPreview(true)}
              disabled={isExporting}
            >
              <FileBadge2 size={20} /> Lihat Preview Dokumen
            </button>
            <button 
              className="btn btn-ghost w-full py-4 mt-2"
              onClick={() => handleExport('Excel')}
              disabled={isExporting}
            >
              <FileSpreadsheet size={20} /> {isExporting ? 'Memproses...' : 'Unduh Format Excel'}
            </button>
            <button 
              className="btn btn-ghost w-full py-4 mt-2"
              onClick={() => handleExport('WORD')}
              disabled={isExporting}
            >
              <FileText size={20} /> {isExporting ? 'Memproses...' : 'Unduh Format Word'}
            </button>
          </div>
        </div>

        <div className="glass-card report-info-card">
          <div className="premium-info-box mt-6">
            <AlertCircle size={20} className="info-icon" />
            <div className="info-content">
              <h4>Panduan Preview</h4>
              <p>Klik tombol "Lihat Preview Dokumen" untuk memverifikasi tampilan surat resmi (KOP & Tanda Tangan) sebelum mencetak atau mengunduh file.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Document Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content report-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pratinjau Dokumen Resmi</h3>
              <button className="btn-close-modal" onClick={() => setShowPreview(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="official-document" id="report-document">
              {/* KOP SURAT */}
              <div className="doc-header">
                <div className="doc-logo">
                  {masterData.org.logo ? (
                    <img src={masterData.org.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    masterData.org.name.charAt(0)
                  )}
                </div>
                <div className="doc-header-text">
                  <h2>{masterData.org.name}</h2>
                  <p>{masterData.org.address}</p>
                  <p>Telp: {masterData.org.phone} | Email: {masterData.org.email}</p>
                </div>
              </div>
              <div className="doc-divider"></div>

              {/* JUDUL LAPORAN */}
              <div className="doc-body">
                <h3 className="doc-title">
                  {reportType === 'Presensi' && 'LAPORAN REKAPITULASI PRESENSI SISWA'}
                  {reportType === 'Nilai' && 'LAPORAN HASIL BELAJAR (LEDGER NILAI)'}
                  {reportType === 'Keuangan' && 'LAPORAN PEMBAYARAN SPP SISWA'}
                  {reportType === 'Jurnal Guru' && 'LAPORAN JURNAL MENGAJAR GURU'}
                  {reportType === 'Kehadiran Guru' && 'LAPORAN REKAPITULASI KEHADIRAN GURU'}
                  {reportType === 'Perizinan & Dinas Guru' && 'LAPORAN PERIZINAN & DINAS GURU'}
                </h3>
                <div className="doc-meta">
                  <p><span>Periode</span>: {period === 'Custom' ? `${dateRange.start} s/d ${dateRange.end}` : period}</p>
                  <p><span>Kelas</span>: {selectedClass}</p>
                </div>

                <table className="doc-table">
                  <thead>
                    {reportType === 'Presensi' && (
                      <tr>
                        <th>No</th>
                        <th>Nama Lengkap Siswa</th>
                        <th>Hadir</th>
                        <th>Izin</th>
                        <th>Alpa</th>
                        <th>%</th>
                      </tr>
                    )}
                    {reportType === 'Nilai' && (
                      <tr>
                        <th>No</th>
                        <th>Nama Lengkap Siswa</th>
                        {(masterData.subjects || ['Matematika', 'B.Indo', 'B.Ing']).map(s => <th key={s}>{s}</th>)}
                        <th>Rata-rata</th>
                      </tr>
                    )}
                    {reportType === 'Keuangan' && (
                      <tr>
                        <th>No</th>
                        <th>Nama Lengkap Siswa</th>
                        <th>Jumlah Bayar</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                      </tr>
                    )}
                    {reportType === 'Jurnal Guru' && (
                      <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Nama Guru</th>
                        <th>Kelas</th>
                        <th>Mapel</th>
                        <th>Topik</th>
                        <th>Waktu (Masuk - Keluar)</th>
                      </tr>
                    )}
                    {reportType === 'Kehadiran Guru' && (
                      <tr>
                        <th>No</th>
                        <th>Nama Guru</th>
                        <th>Jabatan / Mapel</th>
                        <th>Hadir</th>
                        <th>Izin</th>
                        <th>Alpa</th>
                        <th>% Kehadiran</th>
                      </tr>
                    )}
                    {reportType === 'Perizinan & Dinas Guru' && (
                      <tr>
                        <th>No</th>
                        <th>Nama Guru</th>
                        <th>Jabatan</th>
                        <th>Jenis Izin</th>
                        <th>Mulai - Selesai</th>
                        <th>Alasan</th>
                        <th>Guru Badal</th>
                        <th>Status</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {currentReportData.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        {reportType !== 'Jurnal Guru' && reportType !== 'Perizinan & Dinas Guru' && <td>{row.name}</td>}
                        {reportType === 'Presensi' && (
                          <>
                            <td>{row.hadir}</td>
                            <td>{row.izin}</td>
                            <td>{row.alpa}</td>
                            <td>{row.total}%</td>
                          </>
                        )}
                        {reportType === 'Nilai' && (
                          <>
                            {(masterData.subjects || ['Matematika', 'B.Indo', 'B.Ing']).map(s => <td key={s}>{row[s]}</td>)}
                            <td><strong>{row.average}</strong></td>
                          </>
                        )}
                        {reportType === 'Keuangan' && (
                          <>
                            <td>Rp {row.amount.toLocaleString('id-ID')}</td>
                            <td>{row.status}</td>
                            <td>{row.date}</td>
                          </>
                        )}
                        {reportType === 'Jurnal Guru' && (
                          <>
                            <td>{new Date(row.date).toLocaleDateString('id-ID')}</td>
                            <td>{row.teacher}</td>
                            <td>{row.class}</td>
                            <td>{row.subject}</td>
                            <td>{row.topic}</td>
                            <td>{(row.timeIn || '-') + ' - ' + (row.timeOut || '-')}</td>
                          </>
                        )}
                        {reportType === 'Kehadiran Guru' && (
                          <>
                            <td>{row.name}</td>
                            <td>{row.role}</td>
                            <td style={{color: '#10b981', fontWeight: 'bold'}}>{row.hadir}</td>
                            <td style={{color: '#f59e0b'}}>{row.izin}</td>
                            <td style={{color: '#ef4444'}}>{row.alpa}</td>
                            <td><strong>{row.persentase}%</strong></td>
                          </>
                        )}
                        {reportType === 'Perizinan & Dinas Guru' && (
                          <>
                            <td>{row.teacher_name}</td>
                            <td>{row.role}</td>
                            <td>{row.type}</td>
                            <td>{row.start_date} s/d {row.end_date}</td>
                            <td>{row.reason}</td>
                            <td>{row.substitute_teacher || '-'}</td>
                            <td>
                              <span className={`status-badge-premium ${row.status.toLowerCase()}`} style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' }}>
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* TANDA TANGAN */}
                <div className="doc-date-header">
                  <p>Kota Pendidikan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="doc-signatures">
                  <div className="sig-item">
                    <p>Mengetahui,</p>
                    <p>Kepala Madrasah</p>
                    <div className="sig-space"></div>
                    <p className="sig-name"><strong>( {masterData.org.principal || '................................'} )</strong></p>
                  </div>
                  <div className="sig-item">
                    <p>&nbsp;</p>
                    <p>Guru Mata Pelajaran</p>
                    <div className="sig-space"></div>
                    <p className="sig-name"><strong>( {masterData.org.teacherName || '................................'} )</strong></p>
                    {masterData.org.teacherNip && <p className="sig-nip">NIP. {masterData.org.teacherNip}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPreview(false)} disabled={isExporting}>Batal</button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-ghost" style={{ border: '1px solid #e2e8f0' }} onClick={() => handleExport('WORD')} disabled={isExporting}>
                  <FileText size={18} /> Word
                </button>
                <button className="btn btn-primary" onClick={() => handleExport('PDF')} disabled={isExporting}>
                  <Printer size={18} /> {isExporting ? 'Memproses...' : 'Cetak & Unduh PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
