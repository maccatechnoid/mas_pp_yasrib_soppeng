import React, { useState } from 'react';
import { CheckCircle2, Plus, Star, BookHeart, User, X } from 'lucide-react';
import './StudentReligious.css';

const StudentReligious = () => {
  const [showModal, setShowModal] = useState(false);
  const [hafalanList, setHafalanList] = useState([
    { surah: 'Ar-Rahman', ayat: '1-78', date: '12 Jun 2026', status: 'Lancar', teacher: 'Ustadz Ridwan' },
    { surah: 'Al-Waqiah', ayat: '1-96', date: '5 Jun 2026', status: 'Lancar', teacher: 'Ustadz Ridwan' },
    { surah: 'Al-Mulk', ayat: '1-30', date: '28 Mei 2026', status: 'Lancar', teacher: 'Ustadz Ridwan' },
  ]);

  const [formData, setFormData] = useState({ surah: '', ayat: '', status: 'Lancar' });

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.surah) return;
    
    const newEntry = {
      surah: formData.surah,
      ayat: formData.ayat || '-',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: formData.status,
      teacher: 'Mandiri (Belum Disimak)'
    };
    
    setHafalanList([newEntry, ...hafalanList]);
    setShowModal(false);
    setFormData({ surah: '', ayat: '', status: 'Lancar' });
  };

  return (
    <div className="student-religious-page animate-fade-in">
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper" style={{ color: '#10b981', background: '#ecfdf5' }}>
            <BookHeart size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Log Tahfidz & Ibadah</h1>
            <p className="page-subtitle">Pantau catatan setoran hafalan dan ibadah harian Anda.</p>
          </div>
        </div>
        <div className="header-actions">
           <button className="premium-action-btn" onClick={() => setShowModal(true)}>
             <Plus size={18} /> Input Jurnal Mandiri
           </button>
        </div>
      </div>

      <div className="religious-list-wrapper glass-card">
        <div className="rl-header">
          <h3 className="flex items-center gap-2 font-bold text-lg text-slate-800">
            <Star size={20} className="text-amber-500" /> Riwayat Setoran Hafalan
          </h3>
        </div>
        
        <div className="rl-grid">
          {hafalanList.map((item, idx) => (
            <div key={idx} className="rl-card">
              <div className="rl-card-icon">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div className="rl-card-content">
                <h4 className="rl-surah">Surah {item.surah} <span className="rl-ayat">(Ayat {item.ayat})</span></h4>
                <div className="rl-teacher">
                  <User size={14} className="text-slate-400" /> Disimak oleh: {item.teacher}
                </div>
              </div>
              <div className="rl-card-meta">
                <div className="rl-date">{item.date}</div>
                <div className="rl-status-badge">{item.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px', width: '90%' }}>
            <div className="modal-header">
              <h3>Input Jurnal Mandiri</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Surah / Kegiatan</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.surah}
                  onChange={(e) => setFormData({...formData, surah: e.target.value})}
                  placeholder="Misal: Al-Kahfi"
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Ayat / Keterangan</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.ayat}
                  onChange={(e) => setFormData({...formData, ayat: e.target.value})}
                  placeholder="Misal: 1-10"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Status</label>
                <select 
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <option value="Lancar">Lancar</option>
                  <option value="Kurang Lancar">Kurang Lancar</option>
                  <option value="Terbata-bata">Terbata-bata</option>
                </select>
              </div>
              <button type="submit" className="premium-action-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Simpan Jurnal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReligious;
