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
  Award,
  Building2,
  Calendar,
  User,
  Briefcase,
  MapPin,
  Heart,
  Printer,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAllData, saveData } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import './Siswa.css';

const Siswa = () => {
  const [filterClass, setFilterClass] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [classList, setClassList] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedForCard, setSelectedForCard] = useState(null);
  const navigate = useNavigate();

  const initialFormData = {
    name: '',
    nis: '',
    nisn: '',
    class: '',
    gender: 'Laki-laki',
    birth_place: '',
    birth_date: '',
    religion: 'Islam',
    family_status: 'Anak Kandung',
    child_no: '1',
    student_phone: '',
    student_address: '',
    original_school: '',
    admission_date: '',
    admission_class: '',
    father_name: '',
    mother_name: '',
    father_job: '',
    mother_job: '',
    parent_address: '',
    guardian_name: '',
    guardian_job: '',
    guardian_address: '',
    status: 'Aktif',
    photo: null
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const data = getAllData();
    setClassList(data.classes || []);
    setStudents(data.students || []);
  }, []);

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ ...initialFormData, ...student });
    } else {
      setEditingStudent(null);
      setFormData({ ...initialFormData, class: classList[0] || '', admission_class: classList[0] || '' });
    }
    setShowModal(true);
  };

  const handleChat = (phone) => {
    if (!phone) {
      toast.error('Nomor WhatsApp belum terdaftar.');
      return;
    }
    let numbersOnly = phone.toString().replace(/\D/g, '');
    if (numbersOnly.startsWith('0')) numbersOnly = '62' + numbersOnly.slice(1);
    else if (numbersOnly.startsWith('8')) numbersOnly = '62' + numbersOnly;

    window.open(`https://wa.me/${numbersOnly}`, '_blank');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    const safeDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Data_Siswa_Lengkap_${safeDate}.xlsx`);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    let updatedStudents;
    if (editingStudent) {
      updatedStudents = students.map(s => s.id === editingStudent.id ? { ...formData } : s);
    } else {
      updatedStudents = [...students, { ...formData, id: Date.now() }];
    }
    setStudents(updatedStudents);
    saveData('students', updatedStudents);
    toast.success(editingStudent ? 'Data siswa berhasil diperbarui!' : 'Siswa baru berhasil ditambahkan!');
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus data siswa ini?')) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      saveData('students', updated);
      toast.success('Data siswa berhasil dihapus.');
    }
  };

  const filteredStudents = students.filter(s => {
    if (!s) return false;
    const sName = s.name || '';
    const matchClass = filterClass === 'Semua' || s.class === filterClass;
    const matchSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nisn && s.nisn.toString().includes(searchTerm)) ||
      (s.nis && s.nis.toString().includes(searchTerm));
    return matchClass && matchSearch;
  });

  return (
    <div className="students-container">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <Users size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Database Siswa</h1>
            <p className="page-subtitle">Kelola Buku Induk Digital Madrasah secara lengkap dan akurat.</p>
          </div>
        </div>
        <div className="header-actions-premium">
          <button className="btn-premium btn-secondary-premium" onClick={exportToExcel}>
            <FileDown size={18} />
            <span>Ekspor Excel</span>
          </button>
          <button className="btn-premium btn-primary-premium" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      <div className="students-stats-grid animate-fade-in">
        <div className="glass-card stat-item-premium">
          <div className="stat-icon-box total"><Users size={24} /></div>
          <div className="stat-info-box">
            <span className="label">Total Siswa</span>
            <h3 className="value">{students.length}</h3>
          </div>
        </div>
        <div className="glass-card stat-item-premium">
          <div className="stat-icon-box male"><User size={24} /></div>
          <div className="stat-info-box">
            <span className="label">Laki-laki</span>
            <h3 className="value">
              {students.filter(s => s.gender === 'Laki-laki').length}
            </h3>
          </div>
        </div>
        <div className="glass-card stat-item-premium">
          <div className="stat-icon-box female"><User size={24} /></div>
          <div className="stat-info-box">
            <span className="label">Perempuan</span>
            <h3 className="value">
              {students.filter(s => s.gender === 'Perempuan').length}
            </h3>
          </div>
        </div>
        <div className="glass-card stat-item-premium">
          <div className="stat-icon-box active"><UserCheck size={24} /></div>
          <div className="stat-info-box">
            <span className="label">Siswa Aktif</span>
            <h3 className="value">{students.filter(s => s.status === 'Aktif').length}</h3>
          </div>
        </div>
      </div>

      <div className="glass-card table-container">
        <div className="table-filters">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Cari NISN, NIS, atau Nama..."
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
            />
          </div>
        </div>

        <div className="data-table-wrapper">
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>NISN / NIS</th>
                  <th>Kelas</th>
                  <th>L/P</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">
                          {student.photo ? <img src={student.photo} alt="" /> : (student.name ? student.name.charAt(0) : '?')}
                        </div>
                        <div className="student-info">
                          <span className="student-name" onClick={() => navigate(`/student/${student.id}`)} style={{ cursor: 'pointer' }}>
                            {student.name || 'Tanpa Nama'}
                          </span>
                          <div className="student-contacts">
                            <MapPin size={12} /> <span className="small-text">{student.student_address || 'Alamat belum diisi'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="nis-stack">
                        <code>{student.nisn || '-'}</code>
                        <code className="sub-code">{student.nis || '-'}</code>
                      </div>
                    </td>
                    <td>{student.class}</td>
                    <td>{student.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                    <td><span className={`badge-status ${(student.status || 'Aktif').toLowerCase()}`}>{student.status || 'Aktif'}</span></td>
                    <td className="text-right">
                      <div className="action-btns">
                        <button className="icon-btn-sm id-card" onClick={() => navigate(`/student/${student.id}`)} title="Analisa 360°">
                          <TrendingUp size={18} />
                        </button>
                        <button className="icon-btn-sm whatsapp" onClick={() => handleChat(student.student_phone || student.parentPhone)} title="Chat WA">
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
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Edit/Tambah Siswa (Versi Lengkap 2 Kolom) */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="modal-content student-modal-large"
            >
              <div className="modal-header">
                <h3><UserCheck size={20} /> {editingStudent ? 'Edit Profil Siswa' : 'Tambah Siswa Baru'}</h3>
                <button className="btn-close" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body-scrollable">
                  <div className="form-columns-grid">
                    {/* Kolom Kiri: Biodata Siswa */}
                    <div className="form-column">
                      <h4 className="column-title"><User size={16} /> Identitas Pribadi</h4>

                      <div className="form-row">
                        <div className="form-group">
                          <label>NIS</label>
                          <input type="text" value={formData.nis} onChange={(e) => setFormData({ ...formData, nis: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>NISN</label>
                          <input type="text" value={formData.nisn} onChange={(e) => setFormData({ ...formData, nisn: e.target.value })} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Jenis Kelamin</label>
                          <CustomSelect options={['Laki-laki', 'Perempuan']} value={formData.gender} onChange={(val) => setFormData({ ...formData, gender: val })} />
                        </div>
                        <div className="form-group">
                          <label>Agama</label>
                          <CustomSelect options={['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Konghucu']} value={formData.religion} onChange={(val) => setFormData({ ...formData, religion: val })} />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Tempat Lahir</label>
                          <input type="text" value={formData.birth_place} onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Tanggal Lahir</label>
                          <input type="date" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Status Keluarga</label>
                          <CustomSelect options={['Anak Kandung', 'Anak Tiri', 'Anak Angkat']} value={formData.family_status} onChange={(val) => setFormData({ ...formData, family_status: val })} />
                        </div>
                        <div className="form-group">
                          <label>Anak Ke-</label>
                          <input type="number" value={formData.child_no} onChange={(e) => setFormData({ ...formData, child_no: e.target.value })} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Nomor Telpon Siswa</label>
                        <input type="text" value={formData.student_phone} onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })} placeholder="08..." />
                      </div>

                      <div className="form-group">
                        <label>Alamat Siswa</label>
                        <textarea rows={2} value={formData.student_address} onChange={(e) => setFormData({ ...formData, student_address: e.target.value })} />
                      </div>

                      <div className="form-group">
                        <label>Foto Siswa</label>
                        <div className="photo-dropzone">
                          <input type="file" id="photo-up" hidden accept="image/*" onChange={handlePhotoUpload} />
                          <label htmlFor="photo-up" className="photo-label-premium">
                            {formData.photo ? <img src={formData.photo} alt="P" /> : <div className="up-box"><Plus size={20} /><span>Upload Foto</span></div>}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Kolom Kanan: Sekolah & Orang Tua */}
                    <div className="form-column">
                      <h4 className="column-title"><Building2 size={16} /> Data Sekolah & Orang Tua</h4>

                      <div className="form-group">
                        <label>Sekolah Nama Asal</label>
                        <input type="text" value={formData.original_school} onChange={(e) => setFormData({ ...formData, original_school: e.target.value })} />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Tanggal Diterima</label>
                          <input type="date" value={formData.admission_date} onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Terima di Kelas</label>
                          <CustomSelect options={classList} value={formData.admission_class} onChange={(val) => setFormData({ ...formData, admission_class: val })} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Kelas Saat Ini</label>
                        <CustomSelect options={classList} value={formData.class} onChange={(val) => setFormData({ ...formData, class: val })} />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Nama Ayah</label>
                          <input type="text" value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Pekerjaan Ayah</label>
                          <CustomSelect options={['PNS', 'TNI/POLRI', 'Pegawai Swasta', 'Wiraswasta', 'Petani', 'Lainnya']} value={formData.father_job} onChange={(val) => setFormData({ ...formData, father_job: val })} />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Nama Ibu</label>
                          <input type="text" value={formData.mother_name} onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Pekerjaan Ibu</label>
                          <CustomSelect options={['PNS', 'Pegawai Swasta', 'IRT', 'Wiraswasta', 'Lainnya']} value={formData.mother_job} onChange={(val) => setFormData({ ...formData, mother_job: val })} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Alamat Orang Tua</label>
                        <textarea rows={2} value={formData.parent_address} onChange={(e) => setFormData({ ...formData, parent_address: e.target.value })} />
                      </div>

                      <h4 className="column-title" style={{ marginTop: '2rem' }}><UserPlus size={16} /> Wali (Opsional)</h4>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nama Wali</label>
                          <input type="text" value={formData.guardian_name} onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Pekerjaan Wali</label>
                          <input type="text" value={formData.guardian_job} onChange={(e) => setFormData({ ...formData, guardian_job: e.target.value })} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Alamat Wali</label>
                        <textarea rows={2} value={formData.guardian_address} onChange={(e) => setFormData({ ...formData, guardian_address: e.target.value })} />
                      </div>

                      <div className="form-group">
                        <label>Status Aktif</label>
                        <CustomSelect options={['Aktif', 'Lulus', 'Pindah', 'DO']} value={formData.status} onChange={(val) => setFormData({ ...formData, status: val })} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer-premium">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Batalkan</button>
                  <button type="submit" className="btn btn-primary-premium">
                    <UserCheck size={18} />
                    <span>Simpan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Siswa;
