import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import './RiwayatPresensi.css';

const RiwayatPresensi = () => {
  const [filterMonth, setFilterMonth] = useState('Juni 2026');
  const [presenceHistory, setPresenceHistory] = useState([]);
  const [summary, setSummary] = useState({ hadir: 0, sakit: 0, izin: 0, alpa: 0, total: 0 });

  useEffect(() => {
    // Get current user
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Get all presence logs
    const logsStr = localStorage.getItem('student_presence_logs');
    let logs = logsStr ? JSON.parse(logsStr) : [];

    // If we have a user name, filter logs for this student
    if (user && user.name) {
      logs = logs.filter(log => log.studentName === user.name);
    }

    // Sort by date descending
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // If completely empty (e.g. no data yet), show mock data so the page isn't blank for demo purposes
    if (logs.length === 0) {
      logs = [
        { date: '2026-06-13', status: 'hadir', timeIn: '06:45', timeOut: '15:10', type: 'Masuk Kelas', subject: 'Fiqih', schedule: '1-2' },
        { date: '2026-06-12', status: 'hadir', timeIn: '06:50', timeOut: '15:05', type: 'Masuk Kelas', subject: 'Sejarah Islam', schedule: '3-4' },
        { date: '2026-06-11', status: 'izin', timeIn: '-', timeOut: '-', type: 'Kegiatan Keluarga', note: 'Surat terlampir', subject: 'Bahasa Arab', schedule: '1-2' },
        { date: '2026-06-10', status: 'hadir', timeIn: '06:40', timeOut: '15:00', type: 'Masuk Kelas', subject: 'Matematika', schedule: '5-6' },
        { date: '2026-06-09', status: 'sakit', timeIn: '-', timeOut: '-', type: 'Demam', note: 'Surat Dokter', subject: 'IPA Terpadu', schedule: '1-3' },
        { date: '2026-06-08', status: 'hadir', timeIn: '06:55', timeOut: '15:15', type: 'Masuk Kelas', subject: 'Bahasa Indonesia', schedule: '2-3' },
        { date: '2026-06-05', status: 'hadir', timeIn: '06:48', timeOut: '15:05', type: 'Masuk Kelas', subject: 'Tahfidz', schedule: '1' },
      ];
    }

    setPresenceHistory(logs);

    // Calculate summary
    const newSummary = {
      hadir: logs.filter(l => l.status === 'hadir').length,
      sakit: logs.filter(l => l.status === 'sakit').length,
      izin: logs.filter(l => l.status === 'izin').length,
      alpa: logs.filter(l => l.status === 'alpa').length,
      total: logs.length
    };
    setSummary(newSummary);
  }, []);


  const getStatusBadge = (status) => {
    switch (status) {
      case 'hadir': return <span className="p-badge p-hadir"><CheckCircle2 size={14} /> Hadir</span>;
      case 'sakit': return <span className="p-badge p-sakit"><AlertCircle size={14} /> Sakit</span>;
      case 'izin': return <span className="p-badge p-izin"><Clock size={14} /> Izin</span>;
      case 'alpa': return <span className="p-badge p-alpa"><XCircle size={14} /> Alpa</span>;
      default: return null;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="riwayat-presensi-page animate-fade-in">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper" style={{ color: '#10b981', background: '#ecfdf5' }}>
            <UserCheck size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Riwayat Presensi</h1>
            <p className="page-subtitle">Pantau kehadiran harian dan riwayat absensi Anda.</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="presence-summary-grid">
        <div className="p-summary-card glass-card">
          <div className="p-icon-wrap green"><CheckCircle2 size={24} /></div>
          <div className="p-info">
            <span className="p-label">Hadir</span>
            <span className="p-val">{summary.hadir} <small>Hari</small></span>
          </div>
        </div>
        <div className="p-summary-card glass-card">
          <div className="p-icon-wrap amber"><AlertCircle size={24} /></div>
          <div className="p-info">
            <span className="p-label">Sakit</span>
            <span className="p-val">{summary.sakit} <small>Hari</small></span>
          </div>
        </div>
        <div className="p-summary-card glass-card">
          <div className="p-icon-wrap blue"><Clock size={24} /></div>
          <div className="p-info">
            <span className="p-label">Izin</span>
            <span className="p-val">{summary.izin} <small>Hari</small></span>
          </div>
        </div>
        <div className="p-summary-card glass-card">
          <div className="p-icon-wrap red"><XCircle size={24} /></div>
          <div className="p-info">
            <span className="p-label">Alpa</span>
            <span className="p-val">{summary.alpa} <small>Hari</small></span>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="glass-card mt-8 p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Calendar size={20} className="text-emerald-500" />
            Detail Kehadiran
          </h3>
          <div style={{ width: '140px', position: 'relative', zIndex: 10 }}>
            <CustomSelect
              options={['Juni 2026', 'Mei 2026']}
              value={filterMonth}
              onChange={(val) => setFilterMonth(val)}
            />
          </div>
        </div>

        <div className="presence-grid">
          {presenceHistory.map((item, idx) => (
            <div key={idx} className="pg-card">
              <div className="pg-header">
                <span className="pg-date">{formatDate(item.date)}</span>
                {getStatusBadge(item.status)}
              </div>
              <div className="pg-body">
                <div className="pg-subject">
                  {item.subject ? (
                    <span>{item.subject} <span className="pg-schedule">(Jam Ke-{item.schedule || '1'})</span></span>
                  ) : (
                    <span>{item.type}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiwayatPresensi;
