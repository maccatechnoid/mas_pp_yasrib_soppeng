import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  BookOpen,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  ChevronDown,
  UploadCloud
} from 'lucide-react';
import { getAllData } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import './ManajemenKelas.css';

const ManajemenKelas = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [classesList, setClassesList] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const data = getAllData();
    if (data.classes) {
      setClassesList(data.classes);
    }
  }, []);

  // Mock Data
  const [schedules, setSchedules] = useState([
    { id: 1, class: 'XII-A', subject: 'Matematika Lanjut', time: 'Jam I - II (07.30 - 08.40)', room: 'R. 12', teacher: 'Laila Husna, S.Si' },
    { id: 2, class: 'XII-A', subject: 'Fisika Terapan', time: 'Jam III - IV (08.40 - 09.50)', room: 'Lab. Fisika', teacher: 'Budi Santoso, M.Si' },
    { id: 3, class: 'XI-A', subject: 'Biologi Dasar', time: 'Jam I - II (07.30 - 08.40)', room: 'Lab. Biologi', teacher: 'Siti Aminah, M.Pd' },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, class: 'XII-A', subject: 'Matematika Lanjut', title: 'Tugas Eksponensial', deadline: '2026-06-15T23:59', type: 'Tugas' },
    { id: 2, class: 'XII-A', subject: 'Fisika Terapan', title: 'Laporan Praktikum Lensa', deadline: '2026-06-15T12:00', type: 'Praktikum' },
    { id: 3, class: 'XI-A', subject: 'Biologi Dasar', title: 'Observasi Sel', deadline: '2026-06-18T12:00', type: 'Tugas' },
  ]);

  const [library, setLibrary] = useState([
    { id: 1, class: 'XII-A', subject: 'Fisika', title: 'Modul Fisika: Optik', type: 'PDF', size: '2.4 MB' },
    { id: 2, class: 'XII-A', subject: 'Matematika', title: 'Kumpulan Soal UTBK Mat', type: 'PDF', size: '5.1 MB' },
    { id: 3, class: 'XI-A', subject: 'Biologi', title: 'Modul Biologi Sel', type: 'PDF', size: '3.2 MB' },
  ]);

  const filteredSchedules = selectedClass === 'Semua Kelas' ? schedules : schedules.filter(s => s.class === selectedClass);
  const filteredTasks = selectedClass === 'Semua Kelas' ? tasks : tasks.filter(t => t.class === selectedClass);
  const filteredLibrary = selectedClass === 'Semua Kelas' ? library : library.filter(l => (l.class || '').includes(selectedClass) || selectedClass === 'Semua Kelas');

  const openModal = (type) => {
    setModalType(type);
    setFormData({ class: classesList.length > 0 ? classesList[0] : 'XII-A' });
  };

  const handleSave = () => {
    if (modalType === 'schedule') {
      setSchedules([...schedules, { id: Date.now(), subject: '-', teacher: '-', time: '-', room: '-', ...formData }]);
    } else if (modalType === 'tasks') {
      const combinedDeadline = (formData.deadline_date && formData.deadline_time)
        ? `${formData.deadline_date}T${formData.deadline_time}`
        : new Date().toISOString();
      setTasks([...tasks, { id: Date.now(), subject: '-', title: '-', type: 'Tugas', deadline: combinedDeadline, ...formData }]);
    } else if (modalType === 'library') {
      setLibrary([...library, { id: Date.now(), subject: '-', title: '-', type: 'PDF', size: '1.5 MB', ...formData }]);
    }
    setModalType(null);
  };

  return (
    <div className="class-management-page animate-fade-in">
      <div className="page-header-premium" style={{ marginBottom: '1.5rem' }}>
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <BookOpen size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Manajemen Kelas & Modul</h1>
            <p className="page-subtitle">Pusat kendali operasional akademik, tugas, dan perpustakaan digital untuk siswa.</p>
          </div>
        </div>
      </div>

      <div className="cm-tabs-wrapper">
        <div className="cm-tabs glass-card">
          <button
            className={`cm-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            <CalendarIcon size={18} />
            Jadwal Pelajaran
          </button>
          <button
            className={`cm-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <AlertCircle size={18} />
            Tugas & Deadline
          </button>
          <button
            className={`cm-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <BookOpen size={18} />
            E-Library & Modul
          </button>
        </div>

        <div className="cm-filter-wrap glass-card" onClick={() => setFilterOpen(!filterOpen)} style={{ position: 'relative', cursor: 'pointer' }}>
          <Filter size={18} className="cm-filter-icon" />
          <div className="cm-custom-dropdown-selected">
            {selectedClass}
            <ChevronDown size={16} className={`cm-dropdown-chevron ${filterOpen ? 'open' : ''}`} />
          </div>

          {filterOpen && (
            <div className="cm-custom-dropdown-menu">
              <div
                className={`cm-dropdown-item ${selectedClass === 'Semua Kelas' ? 'selected' : ''}`}
                onClick={() => setSelectedClass('Semua Kelas')}
              >
                Semua Kelas
              </div>
              {classesList.map(c => (
                <div
                  key={c}
                  className={`cm-dropdown-item ${selectedClass === c ? 'selected' : ''}`}
                  onClick={() => setSelectedClass(c)}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cm-content-area">
        {/* TAB 1: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="cm-card glass-card animate-fade-in">
            <div className="cm-card-header">
              <h3><CalendarIcon size={20} />Jadwal Pelajaran</h3>
              <button className="cm-btn-primary" onClick={() => openModal('schedule')}>
                + Tambah
              </button>
            </div>
            <div className="cm-table-responsive">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Kelas</th>
                    <th>Mata Pelajaran</th>
                    <th>Guru</th>
                    <th>Waktu</th>
                    <th>Ruang</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.length > 0 ? filteredSchedules.map(item => (
                    <tr key={item.id}>
                      <td><span className="cm-badge">{item.class}</span></td>
                      <td><strong>{item.subject}</strong></td>
                      <td>{item.teacher}</td>
                      <td><span className="cm-time"><Clock size={12} /> {item.time}</span></td>
                      <td>{item.room}</td>
                      <td>
                        <div className="cm-actions">
                          <button className="cm-action-btn edit"><Edit2 size={16} /></button>
                          <button className="cm-action-btn delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data jadwal untuk kelas ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TASKS */}
        {activeTab === 'tasks' && (
          <div className="cm-card glass-card animate-fade-in">
            <div className="cm-card-header">
              <h3><AlertCircle size={20} />Deadline</h3>
              <button className="cm-btn-primary" onClick={() => openModal('tasks')}>
                + Tugas Baru
              </button>
            </div>
            <div className="cm-table-responsive">
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>Kelas</th>
                    <th>Mata Pelajaran</th>
                    <th>Judul Tugas</th>
                    <th>Jenis</th>
                    <th>Tenggat Waktu (Deadline)</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length > 0 ? filteredTasks.map(item => (
                    <tr key={item.id}>
                      <td><span className="cm-badge">{item.class}</span></td>
                      <td>{item.subject}</td>
                      <td><strong>{item.title}</strong></td>
                      <td><span className="cm-badge type-badge">{item.type}</span></td>
                      <td><span className="cm-deadline"><AlertCircle size={12} /> {new Date(item.deadline).toLocaleString('id-ID')}</span></td>
                      <td>
                        <div className="cm-actions">
                          <button className="cm-action-btn edit"><Edit2 size={16} /></button>
                          <button className="cm-action-btn delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada data tugas untuk kelas ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: E-LIBRARY */}
        {activeTab === 'library' && (
          <div className="cm-card glass-card animate-fade-in">
            <div className="cm-card-header">
              <h3><BookOpen size={20} /> E-Library</h3>
              <button className="cm-btn-primary" onClick={() => openModal('library')}>
                + Unggah
              </button>
            </div>

            <div className="cm-grid-cards">
              {filteredLibrary.length > 0 ? filteredLibrary.map(item => (
                <div key={item.id} className="cm-lib-card">
                  <div className="cm-lib-icon">
                    <FileText size={24} />
                  </div>
                  <div className="cm-lib-content">
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                      <span className="cm-badge" style={{ fontSize: '0.65rem' }}>{item.class}</span>
                      <span className="cm-lib-subject">{item.subject}</span>
                    </div>
                    <h4 className="cm-lib-title">{item.title}</h4>
                    <span className="cm-lib-meta">{item.type} • {item.size}</span>
                  </div>
                  <div className="cm-lib-actions">
                    <button className="cm-lib-btn"><Download size={16} /></button>
                    <button className="cm-lib-btn delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>Tidak ada modul untuk kelas ini.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modalType && (
        <div className="cm-modal-overlay">
          <div className="cm-modal glass-card animate-fade-in">
            <div className="cm-modal-header">
              <h3>Tambah {modalType === 'schedule' ? 'Jadwal' : modalType === 'tasks' ? 'Tugas' : 'Modul'}</h3>
              <button onClick={() => setModalType(null)} className="cm-close-btn">&times;</button>
            </div>
            <div className="cm-modal-body">
              <label className="cm-label">Kelas</label>
              <CustomSelect
                options={classesList.length > 0 ? classesList : ['X-A', 'XI-A', 'XII-A']}
                value={formData.class || classesList[0] || 'X-A'}
                onChange={(val) => setFormData({ ...formData, class: val })}
              />

              <label className="cm-label">Mata Pelajaran</label>
              <input type="text" onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="cm-input" placeholder="Contoh: Matematika" />

              {modalType === 'schedule' && (
                <>
                  <label className="cm-label">Guru</label>
                  <input type="text" onChange={(e) => setFormData({ ...formData, teacher: e.target.value })} className="cm-input" />
                  <label className="cm-label">Waktu</label>
                  <CustomSelect
                    options={[
                      'Jam I (07.30 - 08.05)',
                      'Jam II (08.05 - 08.40)',
                      'Jam I - II (07.30 - 08.40)',
                      'Jam III (08.40 - 09.15)',
                      'Jam IV (09.15 - 09.50)',
                      'Jam III - IV (08.40 - 09.50)',
                      'Jam V (10.10 - 10.45)',
                      'Jam VI (10.45 - 11.20)',
                      'Jam V - VI (10.10 - 11.20)',
                      'Jam VII (11.20 - 11.55)',
                      'Jam VIII (11.55 - 12.30)',
                      'Jam VII - VIII (11.20 - 12.30)'
                    ]}
                    value={formData.time || 'Jam I (07.30 - 08.05)'}
                    onChange={(val) => setFormData({ ...formData, time: val })}
                  />
                  <label className="cm-label">Ruang</label>
                  <input type="text" onChange={(e) => setFormData({ ...formData, room: e.target.value })} className="cm-input" />
                </>
              )}
              {modalType === 'tasks' && (
                <>
                  <label className="cm-label">Judul Tugas</label>
                  <input type="text" onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="cm-input" />
                  <label className="cm-label">Tenggat Waktu</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="cm-datetime-wrapper" style={{ flex: 1 }}>
                      <CalendarIcon size={18} className="cm-datetime-icon" />
                      <input type="date" onChange={(e) => setFormData({ ...formData, deadline_date: e.target.value })} className="cm-input cm-input-datetime" />
                    </div>
                    <div className="cm-datetime-wrapper" style={{ flex: 1 }}>
                      <Clock size={18} className="cm-datetime-icon" />
                      <input type="time" onChange={(e) => setFormData({ ...formData, deadline_time: e.target.value })} className="cm-input cm-input-datetime" />
                    </div>
                  </div>
                </>
              )}
              {modalType === 'library' && (
                <>
                  <label className="cm-label">Judul Modul</label>
                  <input type="text" onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="cm-input" />
                  <label className="cm-label">File Modul</label>
                  <label className="cm-file-upload-wrapper">
                    <UploadCloud size={32} />
                    <span>{formData.fileName || 'Klik atau seret file ke sini untuk mengunggah'}</span>
                    <p>Mendukung PDF, DOCX (Maks. 5MB)</p>
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, fileName: e.target.files[0]?.name })}
                      hidden
                    />
                  </label>
                </>
              )}
            </div>
            <div className="cm-modal-footer">
              <button onClick={() => setModalType(null)} className="cm-btn-secondary">Batal</button>
              <button onClick={handleSave} className="cm-btn-primary">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenKelas;
