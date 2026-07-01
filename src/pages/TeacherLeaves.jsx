import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Search, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  MapPin, 
  UploadCloud, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Download,
  Users,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAllData } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import './TeacherLeaves.css';

const TeacherLeaves = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('apply');
  const [leaves, setLeaves] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'Sakit', // Sakit, Izin, Perjalanan Dinas
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    attachment: '',
    destination: '',
    cost: '',
    substitute_teacher: ''
  });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Modal State for Reject
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Load leaves & teachers on boot
  useEffect(() => {
    const data = getAllData();
    if (data.teachers) {
      setTeacherList(data.teachers);
    }

    const stored = localStorage.getItem('madrasah_hub_teacher_leaves');
    if (stored) {
      setLeaves(JSON.parse(stored));
    } else {
      // Mock initial data if empty
      const mockData = [
        {
          id: '1',
          teacher_id: '4',
          teacher_name: 'Ustadz Ridwan, S.Ag',
          role: 'Guru Mata Pelajaran',
          type: 'Perjalanan Dinas',
          start_date: '2026-06-15',
          end_date: '2026-06-17',
          reason: 'Menghadiri Pelatihan Kurikulum Merdeka Tingkat Provinsi',
          attachment: '',
          destination: 'Aula Kantor Wilayah Kemenag',
          cost: '500000',
          substitute_teacher: 'Ahmad Fauzi, S.Pd',
          status: 'Disetujui',
          rejected_reason: '',
          created_at: '2026-06-10T08:00:00.000Z'
        },
        {
          id: '2',
          teacher_id: '3',
          teacher_name: 'Hj. Siti Aminah, M.Pd',
          role: 'Guru BK',
          type: 'Sakit',
          start_date: '2026-06-12',
          end_date: '2026-06-13',
          reason: 'Sakit Demam Tinggi, butuh istirahat sesuai rujukan dokter',
          attachment: '',
          destination: '',
          cost: '',
          substitute_teacher: '',
          status: 'Pending',
          rejected_reason: '',
          created_at: '2026-06-12T07:30:00.000Z'
        }
      ];
      setLeaves(mockData);
      localStorage.setItem('madrasah_hub_teacher_leaves', JSON.stringify(mockData));
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File terlalu besar! Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, attachment: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetForm = () => {
    setFormData({
      type: 'Sakit',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: '',
      attachment: '',
      destination: '',
      cost: '',
      substitute_teacher: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      alert('Alasan pengajuan wajib diisi.');
      return;
    }
    if (formData.type === 'Perjalanan Dinas' && !formData.destination.trim()) {
      alert('Lokasi tujuan dinas wajib diisi.');
      return;
    }

    const newRequest = {
      id: Date.now().toString(),
      teacher_id: user?.id || 'guest',
      teacher_name: user?.name || 'Guest Teacher',
      role: user?.role || 'Guru',
      ...formData,
      status: 'Pending',
      rejected_reason: '',
      created_at: new Date().toISOString()
    };

    const updated = [newRequest, ...leaves];
    setLeaves(updated);
    localStorage.setItem('madrasah_hub_teacher_leaves', JSON.stringify(updated));
    alert('Pengajuan Anda berhasil dikirim! Silakan tunggu persetujuan Kepala Madrasah.');
    handleResetForm();
    setActiveTab('history');
  };

  const handleApprove = (id) => {
    if (!window.confirm('Setujui pengajuan izin ini?')) return;
    
    let approvedLeave = null;
    const updated = leaves.map(l => {
      if (l.id === id) {
        approvedLeave = { ...l, status: 'Disetujui' };
        return approvedLeave;
      }
      return l;
    });

    setLeaves(updated);
    localStorage.setItem('madrasah_hub_teacher_leaves', JSON.stringify(updated));

    // Sync to teacher_presence_logs
    if (approvedLeave) {
      try {
        const raw = localStorage.getItem('teacher_presence_logs');
        let presenceLogs = raw ? JSON.parse(raw) : [];

        let mappedStatus = 'Izin';
        if (approvedLeave.type === 'Sakit') mappedStatus = 'Sakit';
        if (approvedLeave.type === 'Cuti') mappedStatus = 'Cuti';

        const start = new Date(approvedLeave.start_date);
        const end = new Date(approvedLeave.end_date);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const existingIdx = presenceLogs.findIndex(p => p.date === dateStr && p.teacherName === approvedLeave.teacher_name);
          
          if (existingIdx >= 0) {
            presenceLogs[existingIdx].status = mappedStatus;
            presenceLogs[existingIdx].notes = approvedLeave.reason;
          } else {
            presenceLogs.push({
              date: dateStr,
              teacherName: approvedLeave.teacher_name,
              status: mappedStatus,
              timeIn: '',
              timeOut: '',
              notes: approvedLeave.reason,
              photo: null,
              savedAt: new Date().toISOString()
            });
          }
        }
        
        localStorage.setItem('teacher_presence_logs', JSON.stringify(presenceLogs));
        alert('Pengajuan disetujui dan data presensi otomatis diperbarui.');
      } catch (err) {
        console.error('Failed to sync presence logs', err);
      }
    }
  };

  const handleRejectClick = (id) => {
    setRejectingLeaveId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Alasan penolakan wajib diisi.');
      return;
    }
    const updated = leaves.map(l => 
      l.id === rejectingLeaveId 
        ? { ...l, status: 'Ditolak', rejected_reason: rejectionReason } 
        : l
    );
    setLeaves(updated);
    localStorage.setItem('madrasah_hub_teacher_leaves', JSON.stringify(updated));
    setShowRejectModal(false);
    setRejectingLeaveId(null);
    setRejectionReason('');
  };

  // Authorization flags
  const isApprover = user?.role === 'Admin' || user?.role === 'Kepala Madrasah';

  // Filter leaves
  const visibleLeaves = leaves.filter(l => {
    // Normal teacher can only see their own requests in History
    if (!isApprover && activeTab === 'history') {
      return l.teacher_id === user?.id;
    }
    return true;
  });

  const pendingApprovals = visibleLeaves.filter(l => l.status === 'Pending');

  const filteredHistory = visibleLeaves.filter(l => {
    // Search filter
    const matchesSearch = 
      l.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.destination && l.destination.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = selectedStatus === 'Semua' || l.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: visibleLeaves.length,
    pending: visibleLeaves.filter(l => l.status === 'Pending').length,
    approved: visibleLeaves.filter(l => l.status === 'Disetujui').length,
    rejected: visibleLeaves.filter(l => l.status === 'Ditolak').length,
    sakit: visibleLeaves.filter(l => l.type === 'Sakit').length,
    izin: visibleLeaves.filter(l => l.type === 'Izin').length,
    dinas: visibleLeaves.filter(l => l.type === 'Perjalanan Dinas').length,
  };

  const getPercentage = (count) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  return (
    <div className="leaves-container">
      {/* Page Header */}
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-indigo">
            <CalendarClock size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Pengajuan Izin& Dinas Guru</h1>
            <p className="page-subtitle">Sistem pengajuan izin sakit, izin pribadi, dan perjalanan dinas terintegrasi.</p>
          </div>
        </div>
        <div className="header-actions-premium">
          <div className="leaves-nav-tabs">
            <button 
              className={`l-tab ${activeTab === 'apply' ? 'active' : ''}`} 
              onClick={() => setActiveTab('apply')}
            >
              <Plus size={16} /> <span>Ajukan Izin</span>
            </button>
            {isApprover && (
              <button 
                className={`l-tab ${activeTab === 'approve' ? 'active' : ''}`} 
                onClick={() => setActiveTab('approve')}
              >
                <Clock size={16} /> 
                <span>Persetujuan</span>
                {pendingApprovals.length > 0 && (
                  <span style={{ 
                    background: '#ef4444', 
                    color: 'white', 
                    borderRadius: '50%', 
                    padding: '2px 6px', 
                    fontSize: '0.65rem', 
                    fontWeight: 800, 
                    marginLeft: '4px' 
                  }}>
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            )}
            <button 
              className={`l-tab ${activeTab === 'history' ? 'active' : ''}`} 
              onClick={() => setActiveTab('history')}
            >
              <FileText size={16} /> <span>Riwayat</span>
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS PANEL */}
      {isApprover && (activeTab === 'approve' || activeTab === 'history') && (
        <div className="leaves-stats-panel glass-card">
          <div className="stats-cards-grid">
            <div className="stat-card-mini">
              <span className="label">Total Pengajuan</span>
              <span className="value">{stats.total}</span>
            </div>
            <div className="stat-card-mini theme-amber">
              <span className="label">Menunggu</span>
              <span className="value">{stats.pending}</span>
            </div>
            <div className="stat-card-mini theme-green">
              <span className="label">Disetujui</span>
              <span className="value">{stats.approved}</span>
            </div>
            <div className="stat-card-mini theme-rose">
              <span className="label">Ditolak</span>
              <span className="value">{stats.rejected}</span>
            </div>
          </div>
          <div className="stats-breakdown-section">
            <h4>Peta Ketidakhadiran Guru</h4>
            <div className="breakdown-bars">
              <div className="breakdown-bar-item">
                <div className="bar-labels">
                  <span>Sakit ({stats.sakit})</span>
                  <span>{getPercentage(stats.sakit)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill sakit" style={{ width: `${getPercentage(stats.sakit)}%` }}></div>
                </div>
              </div>
              <div className="breakdown-bar-item">
                <div className="bar-labels">
                  <span>Izin Pribadi ({stats.izin})</span>
                  <span>{getPercentage(stats.izin)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill izin" style={{ width: `${getPercentage(stats.izin)}%` }}></div>
                </div>
              </div>
              <div className="breakdown-bar-item">
                <div className="bar-labels">
                  <span>Perjalanan Dinas ({stats.dinas})</span>
                  <span>{getPercentage(stats.dinas)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill dinas" style={{ width: `${getPercentage(stats.dinas)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="leaves-content">
        <AnimatePresence mode="wait">
          {/* APPLY TAB */}
          {activeTab === 'apply' && (
            <motion.div
              key="apply"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="leaves-grid"
            >
              <div className="glass-card leave-form-card">
                <form onSubmit={handleSubmit} className="leave-form">
                  <div className="form-grid-2">
                    <div className="form-group-premium">
                      <label>Jenis Perizinan</label>
                      <CustomSelect 
                        options={['Sakit', 'Izin', 'Perjalanan Dinas']}
                        value={formData.type}
                        onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                      />
                    </div>
                    
                    <div className="form-grid-2" style={{ margin: 0, gap: '1rem' }}>
                      <div className="form-group-premium">
                        <label>Tanggal Mulai</label>
                        <input 
                          type="date" 
                          value={formData.start_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="form-group-premium">
                        <label>Tanggal Selesai</label>
                        <input 
                          type="date" 
                          value={formData.end_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    {/* GURU BADAL / SUBSTITUTION */}
                    <div className="form-group-premium">
                      <label>Guru Pengganti / Badal (Opsional)</label>
                      <CustomSelect 
                        options={['-- Tanpa Guru Badal --', ...teacherList.filter(t => t !== user?.name)]}
                        value={formData.substitute_teacher || '-- Tanpa Guru Badal --'}
                        onChange={(val) => setFormData(prev => ({ 
                          ...prev, 
                          substitute_teacher: val === '-- Tanpa Guru Badal --' ? '' : val 
                        }))}
                      />
                    </div>

                    {/* Placeholder space for alignment */}
                    <div className="form-group-premium"></div>
                  </div>

                  {formData.type === 'Perjalanan Dinas' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="form-grid-2"
                    >
                      <div className="form-group-premium">
                        <label>Lokasi / Tempat Tujuan</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            placeholder="Contoh: Aula Kanwil Kemenag Prov..."
                            value={formData.destination}
                            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                            required={formData.type === 'Perjalanan Dinas'}
                            style={{ paddingLeft: '40px' }}
                          />
                          <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        </div>
                      </div>
                      <div className="form-group-premium">
                        <label>Estimasi Biaya Operasional (Rp)</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="number" 
                            placeholder="Masukkan jumlah biaya opsional"
                            value={formData.cost}
                            onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                            style={{ paddingLeft: '40px' }}
                          />
                          <DollarSign size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="form-group-premium">
                    <label>Keterangan / Alasan Pengajuan</label>
                    <textarea 
                      placeholder="Jelaskan keperluan izin atau detail kegiatan dinas secara lengkap..."
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={4}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group-premium">
                    <label>Dokumen Pendukung / Bukti Foto (Maks. 2MB)</label>
                    <label className="file-upload-wrapper">
                      <UploadCloud size={32} />
                      <span>{formData.attachment ? 'Ganti File Bukti' : 'Klik atau seret file ke sini untuk mengunggah'}</span>
                      <p>Mendukung JPG, PNG, atau PDF (Gambar akan dipratinjau)</p>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        hidden
                      />
                      {formData.attachment && (
                        <img 
                          src={formData.attachment} 
                          alt="Pratinjau Bukti" 
                          className="preview-upload-img" 
                        />
                      )}
                    </label>
                  </div>

                  <button type="submit" className="btn-submit-leave">
                    <CheckCircle2 size={20} />
                    <span>Kirim Pengajuan</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* APPROVE TAB */}
          {activeTab === 'approve' && isApprover && (
            <motion.div
              key="approve"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="leaves-list"
            >
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map(leave => (
                  <div key={leave.id} className="leave-card glass-card">
                    <div className="leave-card-top">
                      <div className="teacher-info-group">
                        <div className="t-avatar">{leave.teacher_name.charAt(0)}</div>
                        <div className="t-text">
                          <span className="t-name">{leave.teacher_name}</span>
                          <span className="t-role">{leave.role}</span>
                        </div>
                      </div>
                      <span className={`leave-badge-type ${leave.type.toLowerCase().replace(' ', '-')}`}>
                        {leave.type}
                      </span>
                    </div>

                    <div className="leave-card-dates">
                      <Calendar size={16} />
                      <span>{leave.start_date}</span>
                      <ArrowRight size={14} />
                      <span>{leave.end_date}</span>
                    </div>

                    <p className="leave-card-reason">{leave.reason}</p>

                    {leave.type === 'Perjalanan Dinas' && leave.destination && (
                      <div className="dinas-details-box">
                        <div><MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Tujuan: <strong>{leave.destination}</strong></div>
                        {leave.cost && <div><DollarSign size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Anggaran: <strong>Rp {parseInt(leave.cost).toLocaleString('id-ID')}</strong></div>}
                      </div>
                    )}

                    {leave.substitute_teacher && (
                      <div className="substitute-badge-info">
                        <Users size={14} />
                        <span>Guru Badal: <strong>{leave.substitute_teacher}</strong></span>
                      </div>
                    )}

                    {leave.attachment && (
                      <a href={leave.attachment} target="_blank" rel="noopener noreferrer" className="attachment-preview-link">
                        <FileText size={16} />
                        <span>Lihat Dokumen Pendukung</span>
                      </a>
                    )}

                    <div className="leave-card-footer" style={{ border: 'none', paddingTop: 0 }}>
                      <div className="approval-actions">
                        <button className="btn-approve" onClick={() => handleApprove(leave.id)}>
                          <Check size={16} /> Setujui
                        </button>
                        <button className="btn-reject" onClick={() => handleRejectClick(leave.id)}>
                          <X size={16} /> Tolak
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <CheckCircle2 size={48} className="text-green" />
                  <h4>Semua Pengajuan Selesai</h4>
                  <p>Tidak ada perizinan pending yang perlu disetujui saat ini.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="leaves-grid"
            >
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div className="history-header">
                  <h3>{isApprover ? 'Semua Riwayat Pengajuan' : 'Riwayat Pengajuan Saya'}</h3>
                  <div className="search-filter-row">
                    <div className="search-input-wrapper">
                      <Search size={16} />
                      <input 
                        type="text" 
                        placeholder="Cari guru atau alasan..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <CustomSelect 
                      options={['Semua', 'Pending', 'Disetujui', 'Ditolak']}
                      value={selectedStatus}
                      onChange={(val) => setSelectedStatus(val)}
                    />
                  </div>
                </div>

                <div className="leaves-list">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map(leave => (
                      <div key={leave.id} className="leave-card glass-card">
                        <div className="leave-card-top">
                          <div className="teacher-info-group">
                            <div className="t-avatar">{leave.teacher_name.charAt(0)}</div>
                            <div className="t-text">
                              <span className="t-name">{leave.teacher_name}</span>
                              <span className="t-role">{leave.role}</span>
                            </div>
                          </div>
                          <span className={`leave-badge-type ${leave.type.toLowerCase().replace(' ', '-')}`}>
                            {leave.type}
                          </span>
                        </div>

                        <div className="leave-card-dates">
                          <Calendar size={16} />
                          <span>{leave.start_date}</span>
                          <ArrowRight size={14} />
                          <span>{leave.end_date}</span>
                        </div>

                        <p className="leave-card-reason">{leave.reason}</p>

                        {leave.type === 'Perjalanan Dinas' && leave.destination && (
                          <div className="dinas-details-box">
                            <div><MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Tujuan: <strong>{leave.destination}</strong></div>
                            {leave.cost && <div><DollarSign size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Anggaran: <strong>Rp {parseInt(leave.cost).toLocaleString('id-ID')}</strong></div>}
                          </div>
                        )}

                        {leave.substitute_teacher && (
                          <div className="substitute-badge-info">
                            <Users size={14} />
                            <span>Guru Badal: <strong>{leave.substitute_teacher}</strong></span>
                          </div>
                        )}

                        {leave.attachment && (
                          <a href={leave.attachment} target="_blank" rel="noopener noreferrer" className="attachment-preview-link">
                            <FileText size={16} />
                            <span>Lihat Dokumen Pendukung</span>
                          </a>
                        )}

                        <div className="leave-card-footer">
                          <span className={`status-badge-premium ${leave.status.toLowerCase()}`}>
                            {leave.status === 'Pending' && <Clock size={14} />}
                            {leave.status === 'Disetujui' && <Check size={14} />}
                            {leave.status === 'Ditolak' && <X size={14} />}
                            {leave.status}
                          </span>
                        </div>
                        {leave.status === 'Ditolak' && leave.rejected_reason && (
                          <p className="rejected-note">
                            <strong>Alasan Ditolak:</strong> {leave.rejected_reason}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <AlertCircle size={48} />
                      <h4>Tidak Ada Riwayat</h4>
                      <p>Belum ada riwayat pengajuan perizinan yang sesuai dengan filter.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* REJECT MODAL */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="leaves-modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="leaves-modal glass-card" onClick={(e) => e.stopPropagation()}>
              <div className="leaves-modal-header">
                <h3>Alasan Penolakan</h3>
                <button className="leaves-modal-close" onClick={() => setShowRejectModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleRejectSubmit} className="leaves-modal-body">
                <div className="form-group-premium">
                  <label>Mengapa pengajuan ini ditolak?</label>
                  <textarea 
                    placeholder="Contoh: Jadwal tugas bentrok dengan ujian, berkas kurang lengkap..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-submit-reject">
                  <X size={16} />
                  <span>Tolak Pengajuan</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherLeaves;
