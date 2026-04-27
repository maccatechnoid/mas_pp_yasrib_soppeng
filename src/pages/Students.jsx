import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3,
  Mail, 
  Phone,
  FileDown,
  X,
  MessageCircle,
  CreditCard,
  Download,
  QrCode,
  FileText,
  BarChart2,
  Upload,
  UserCheck,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllData, saveData } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import * as XLSX from 'xlsx';
import './Students.css';

const Students = () => {
  const [filterClass, setFilterClass] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [classList, setClassList] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedForCard, setSelectedForCard] = useState(null);
  const [selectedForDetail, setSelectedForDetail] = useState(null);

  const downloadFormatExcel = () => {
    // Data format standar untuk diisi
    const formatData = [
      { 'NAMA LENGKAP': '', 'NISN': '', 'KELAS': '', 'JENIS KELAMIN (L/P)': '', 'NO HP ORANG TUA': '' },
      { 'NAMA LENGKAP': 'Contoh Siswa', 'NISN': '0012345678', 'KELAS': 'X-A', 'JENIS KELAMIN (L/P)': 'L', 'NO HP ORANG TUA': '081234567890' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(formatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Siswa');
    
    // Download file
    XLSX.writeFile(workbook, 'Format_Impor_Siswa.xlsx');
  };
  
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    class: '',
    gender: 'L',
    status: 'Aktif',
    parentPhone: '',
    photo: null
  });

  useEffect(() => {
    const data = getAllData();
    setClassList(data.classes);
    setStudents(data.students || []);
  }, []);

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ ...student });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        nisn: '',
        class: classList[0] || '',
        gender: 'L',
        status: 'Aktif',
        parentPhone: '',
        photo: null
      });
    }
    setShowModal(true);
  };

  const handleChat = (phone) => {
    if (!phone) {
      alert('Nomor WhatsApp orang tua belum terdaftar.');
      return;
    }
    
    // 1. Bersihkan total semua karakter non-angka
    let numbersOnly = phone.toString().replace(/\D/g, '');
    
    // 2. Tangani awalan: jika 08... jadi 628...
    if (numbersOnly.startsWith('0')) {
      numbersOnly = '62' + numbersOnly.slice(1);
    } else if (numbersOnly.startsWith('8')) {
      // Jika langsung 8... tambahkan 62
      numbersOnly = '62' + numbersOnly;
    }
    
    // 3. Gunakan metode anchor link (lebih ampuh menembus browser)
    const link = document.createElement('a');
    link.href = `https://wa.me/${numbersOnly}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // Simple CSV Export
    const headers = ['Nama', 'NISN', 'Kelas', 'Jenis Kelamin', 'Status', 'WA Orang Tua'];
    const csvContent = [
      headers.join(','),
      ...students.map(s => [
        `"${s.name}"`,
        `"${s.nisn}"`,
        `"${s.class}"`,
        `"${s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}"`,
        `"${s.status}"`,
        `"${s.parentPhone}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_siswa_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        const rows = text.split('\n').slice(1); // Skip header
        const newStudents = rows.map(row => {
          const cols = row.split(',').map(c => c.replace(/"/g, '').trim());
          if (cols.length < 3) return null;
          return {
            id: Date.now() + Math.random(),
            name: cols[0],
            nisn: cols[1],
            class: cols[2],
            gender: cols[3] || 'L',
            status: cols[4] || 'Aktif',
            parentPhone: cols[5] || '',
            photo: null
          };
        }).filter(Boolean);
        
        const updated = [...students, ...newStudents];
        setStudents(updated);
        saveData('students', updated);
        alert(`${newStudents.length} siswa berhasil diimpor!`);
      };
      reader.readAsText(file);
    }
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'Aktif').length,
    male: students.filter(s => s.gender === 'L').length,
    female: students.filter(s => s.gender === 'P').length
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    let updatedStudents;
    
    if (editingStudent) {
      updatedStudents = students.map(s => s.id === editingStudent.id ? { ...formData } : s);
    } else {
      const newStudent = {
        ...formData,
        id: Date.now()
      };
      updatedStudents = [...students, newStudent];
    }

    setStudents(updatedStudents);
    saveData('students', updatedStudents);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      saveData('students', updated);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchClass = filterClass === 'Semua' || s.class === filterClass;
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.nisn.includes(searchTerm);
    return matchClass && matchSearch;
  });

  return (
    <div className="students-container">
      <div className="page-header-premium">
        <div className="header-text-group">
          <h1 className="page-title">Data Siswa</h1>
          <p className="page-subtitle">Kelola informasi dan rekapitulasi siswa Madrasah secara digital.</p>
        </div>
        <div className="header-actions-premium">
          <input type="file" id="csv-import" hidden onChange={handleImportCSV} accept=".csv" />
          <label htmlFor="csv-import" className="btn-premium btn-secondary-premium cursor-pointer">
            <Upload size={18} />
            <span>Impor Data</span>
          </label>
          <button className="btn-premium btn-secondary-premium" onClick={exportToExcel}>
            <FileDown size={18} />
            <span>Ekspor Data</span>
          </button>
          <button className="btn-premium btn-primary-premium" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      <div className="stats-grid-premium mb-8">
        <div className="stat-card-premium">
          <div className="stat-icon-wrap primary">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Siswa</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-wrap success">
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Siswa Aktif</span>
            <span className="stat-value">{stats.active}</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-wrap info">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Laki-laki</span>
            <span className="stat-value">{stats.male}</span>
          </div>
        </div>
        <div className="stat-card-premium">
          <div className="stat-icon-wrap warning">
            <BarChart2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Perempuan</span>
            <span className="stat-value">{stats.female}</span>
          </div>
        </div>
      </div>

      <div className="glass-card table-container">
        <div className="table-filters">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari NISN atau Nama..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <CustomSelect 
              options={['Semua Kelas', ...classList.map(c => `Kelas ${c}`)]}
              value={filterClass === 'Semua' ? 'Semua Kelas' : `Kelas ${filterClass}`}
              onChange={(val) => setFilterClass(val === 'Semua Kelas' ? 'Semua' : val.replace('Kelas ', ''))}
              icon={Filter}
              className="student-filter-select"
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>NISN</th>
                <th>Kelas</th>
                <th>L/P</th>
                <th>Status</th>
                <th className="text-right">Aksi Premium</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="avatar-img" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      <div className="student-info">
                        <span className="student-name">{student.name}</span>
                        <div className="student-contacts">
                          <Mail size={12} /> <Phone size={12} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><code className="nisn-code">{student.nisn}</code></td>
                  <td>{student.class}</td>
                  <td>{student.gender}</td>
                  <td><span className="badge-status">{student.status}</span></td>
                  <td className="text-right">
                    <div className="action-btns">
                      <button className="icon-btn-sm id-card" onClick={() => setSelectedForDetail(student)} title="Buku Induk Digital">
                        <FileText size={18} />
                      </button>
                      <button className="icon-btn-sm id-card" onClick={() => setSelectedForCard(student)} title="Kartu Pelajar Digital">
                        <CreditCard size={18} />
                      </button>
                      <button className="icon-btn-sm whatsapp" onClick={() => handleChat(student.parentPhone)} title="Chat Orang Tua">
                        <MessageCircle size={18} />
                      </button>
                      <button className="icon-btn-sm edit" onClick={() => handleOpenModal(student)}>
                        <Edit3 size={18} />
                      </button>
                      <button className="icon-btn-sm delete" onClick={() => handleDelete(student.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    Tidak ada data siswa yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-pagination">
          <span className="pagination-info">Menampilkan {filteredStudents.length} siswa</span>
        </div>
      </div>

      {/* Modal Tambah/Edit Siswa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content student-modal">
            <div className="modal-header">
              <h3>{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid-2 mb-4">
                  <div className="form-group">
                    <label>Nama Lengkap Siswa</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Foto Siswa</label>
                    <div className="photo-upload-container">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden-input"
                        id="student-photo-input"
                      />
                      <label htmlFor="student-photo-input" className="photo-upload-label">
                        {formData.photo ? (
                          <img src={formData.photo} alt="Preview" />
                        ) : (
                          <div className="photo-placeholder">
                            <Plus size={16} /> <span>Pilih Foto</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>NISN</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.nisn}
                      onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Orang Tua</label>
                    <div className="input-with-action">
                      <input 
                        type="text" 
                        placeholder="0852xxx"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                      />
                      <button 
                        type="button" 
                        className="btn-check-wa"
                        onClick={() => handleChat(formData.parentPhone)}
                        title="Tes Chat WhatsApp"
                      >
                        Cek WA
                      </button>
                    </div>
                  </div>
                </div>
                <div className="form-grid-2 mt-4">
                  <div className="form-group">
                    <label>Kelas</label>
                    <CustomSelect 
                      options={classList.map(c => `Kelas ${c}`)}
                      value={`Kelas ${formData.class}`}
                      onChange={(val) => setFormData({...formData, class: val.replace('Kelas ', '')})}
                      icon={Users}
                    />
                  </div>
                  <div className="form-group">
                    <label>Jenis Kelamin</label>
                    <CustomSelect 
                      options={['Laki-laki', 'Perempuan']}
                      value={formData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      onChange={(val) => setFormData({...formData, gender: val === 'Laki-laki' ? 'L' : 'P'})}
                    />
                  </div>
                </div>
                <div className="form-group mt-4">
                  <label>Status Akademik</label>
                  <CustomSelect 
                    options={['Aktif', 'Lulus', 'Pindah']}
                    value={formData.status}
                    onChange={(val) => setFormData({...formData, status: val})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kartu Pelajar Digital */}
      <AnimatePresence>
        {selectedForCard && (
          <div className="modal-overlay" onClick={() => setSelectedForCard(null)}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="id-card-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="id-card-premium portrait">
                <div className="id-card-inner">
                  {/* Header */}
                  <div className="id-header">
                    <div className="id-logo-box">MH</div>
                    <div className="id-header-text">
                      <h4>KARTU PELAJAR</h4>
                      <p>MADRASAH ALIYAH HUB</p>
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="id-body">
                    <div className="id-photo-container">
                      <div className="id-photo">
                        {selectedForCard.photo ? (
                          <img src={selectedForCard.photo} alt={selectedForCard.name} />
                        ) : (
                          <Users size={60} />
                        )}
                      </div>
                    </div>

                    <div className="id-student-details">
                      <h2 className="id-name">{selectedForCard.name}</h2>
                      <div className="id-details-grid">
                        <div className="id-detail-item">
                          <span className="id-label">NISN</span>
                          <span className="id-value">{selectedForCard.nisn}</span>
                        </div>
                        <div className="id-detail-item">
                          <span className="id-label">KELAS</span>
                          <span className="id-value">{selectedForCard.class}</span>
                        </div>
                        <div className="id-detail-item">
                          <span className="id-label">JENIS KELAMIN</span>
                          <span className="id-value">{selectedForCard.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="id-footer">
                    <div className="id-qr-box">
                      <QrCode size={48} />
                    </div>
                    <div className="id-signature">
                      <p>Kepala Madrasah</p>
                      <div className="signature-line"></div>
                      <p className="director-name">Dr. H. Ahmad Dahlan</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="id-card-actions">
                <button className="btn btn-primary btn-full" onClick={() => window.print()}>
                  <Download size={18} /> Unduh Kartu (PDF)
                </button>
                <button className="btn btn-ghost btn-full" onClick={() => setSelectedForCard(null)}>
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL SISWA (BUKU INDUK DIGITAL) */}
      <AnimatePresence>
        {selectedForDetail && (
          <div className="modal-overlay" onClick={() => setSelectedForDetail(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="student-detail-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="detail-header">
                <div className="detail-profile-section">
                  <div className="detail-avatar">
                    {selectedForDetail.photo ? (
                      <img src={selectedForDetail.photo} alt="" />
                    ) : (
                      selectedForDetail.name.charAt(0)
                    )}
                  </div>
                  <div className="detail-title">
                    <h2>{selectedForDetail.name}</h2>
                  </div>
                </div>
                <button className="btn-close-detail" onClick={() => setSelectedForDetail(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="detail-body">
                <div className="detail-tabs">
                  <button className="detail-tab active">Biodata Siswa</button>
                  <button className="detail-tab">Riwayat & Catatan</button>
                </div>
                <div className="detail-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>NISN</label>
                      <p>{selectedForDetail.nisn}</p>
                    </div>
                    <div className="info-item">
                      <label>Kelas saat ini</label>
                      <p>Kelas {selectedForDetail.class}</p>
                    </div>
                    <div className="info-item">
                      <label>Jenis Kelamin</label>
                      <p>{selectedForDetail.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                    </div>
                    <div className="info-item">
                      <label>WhatsApp Orang Tua</label>
                      <p>{selectedForDetail.parentPhone || '-'}</p>
                    </div>
                  </div>
                  <div className="info-box-premium">
                    <div className="box-icon"><Award size={20} /></div>
                    <div className="box-text">
                      <h4>Catatan Akademik</h4>
                      <p>Siswa ini memiliki catatan kehadiran yang sangat baik di semester ini.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-footer">
                <button className="btn-print-detail" onClick={() => window.print()}>
                  <Download size={18} /> Cetak Profil
                </button>
                <button className="btn-wa-detail" onClick={() => handleChat(selectedForDetail.parentPhone)}>
                  <MessageCircle size={18} /> Chat Orang Tua
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
