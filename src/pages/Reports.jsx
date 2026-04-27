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
  const [period, setPeriod] = useState('Bulanan');
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [masterData, setMasterData] = useState({ 
    classes: [],
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

  const reportData = (masterData.students || []).filter(s => 
    selectedClass === 'Semua' || s.class === selectedClass
  ).map(s => ({
    name: s.name,
    hadir: 18,
    izin: 1,
    alpa: 0,
    late: 1,
    total: 95
  }));

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
      const worksheetData = reportData.map((row, i) => ({
        'No': i + 1,
        'Nama Siswa': row.name,
        'Hadir': row.hadir,
        'Izin': row.izin,
        'Alpa': row.alpa,
        'Terlambat': row.late,
        'Persentase': `${row.total}%`
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Presensi");
      XLSX.writeFile(workbook, `Laporan_${period}_${selectedClass}.xlsx`);
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Pusat Laporan</h1>
          <p className="page-subtitle">Unduh rekapitulasi kehadiran siswa dalam berbagai format.</p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="glass-card report-config-card">
          <h3 className="card-title mb-4">Konfigurasi Laporan</h3>
          
          <div className="config-section">
            <label className="config-label">Pilih Periode Laporan</label>
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
          <div className="preview-header">
            <h3 className="card-title">Ringkasan Cepat</h3>
            <span className="badge-info">Kelas {selectedClass}</span>
          </div>
          <div className="quick-stats-grid">
            <div className="q-stat">
              <span className="q-label">Rata-rata Hadir</span>
              <span className="q-value">94.2%</span>
            </div>
            <div className="q-stat">
              <span className="q-label">Total Alpa</span>
              <span className="q-value text-danger">5</span>
            </div>
          </div>
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
                <h3 className="doc-title">LAPORAN REKAPITULASI PRESENSI SISWA</h3>
                <div className="doc-meta">
                  <p>
                    <span>Periode</span>: {period === 'Custom' ? `${dateRange.start} s/d ${dateRange.end}` : period}
                  </p>
                  <p><span>Kelas</span>: {selectedClass}</p>
                </div>

                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Lengkap Siswa</th>
                      <th>Hadir</th>
                      <th>Izin</th>
                      <th>Alpa</th>
                      <th>Telat</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{row.name}</td>
                        <td>{row.hadir}</td>
                        <td>{row.izin}</td>
                        <td>{row.alpa}</td>
                        <td>{row.late}</td>
                        <td>{row.total}%</td>
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
