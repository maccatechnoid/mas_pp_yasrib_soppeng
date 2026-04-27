import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2,
  RefreshCcw, 
  School, 
  UserSquare2, 
  ShieldCheck,
  Building2,
  ImageIcon,
  LayoutPanelTop,
  LayoutGrid,
  Quote,
  Zap,
  Trash,
  Camera,
  MapPin,
  AlertCircle,
  User,
  Clock,
  Calendar,
  Sparkles,
  Edit2
} from 'lucide-react';
import { getAllData, saveData } from '../utils/storage';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [data, setData] = useState({
    subjects: [],
    classes: [],
    teachers: [],
    roles: [],
    slides: [],
    schedule: [],
    user: {
      name: 'Administrator',
      role: 'Kepala Madrasah',
      photo: null
    },
    org: {
      name: '',
      address: '',
      phone: '',
      email: '',
      principal: '',
      principalPhoto: null,
      teacherName: '',
      chairman: '',
      chairmanPhoto: null,
      logo: null,
      homerooms: {} // { 'Kelas X-A': 'Nama Guru' }
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  
  // Dashboard Content State
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });
  const [newAgenda, setNewAgenda] = useState({ title: '', date: '', category: 'Umum' });

  useEffect(() => {
    setData(getAllData());
  }, []);

  const tabs = [
    { id: 'subjects', label: 'Mata Pelajaran', icon: <BookOpen size={18} /> },
    { id: 'classes', label: 'Kelas', icon: <School size={18} /> },
    { id: 'teachers', label: 'Daftar Guru', icon: <UserSquare2 size={18} /> },
    { id: 'roles', label: 'Jabatan/Struktural', icon: <ShieldCheck size={18} /> },
    { id: 'org', label: 'Identitas Madrasah', icon: <Building2 size={18} /> },
    { id: 'schedule', label: 'Jadwal Pelajaran', icon: <Clock size={18} /> },
    { id: 'academic-calendar', label: 'Kalender Akademik', icon: <Calendar size={18} /> },
    { id: 'slides', label: 'Galeri Slideshow', icon: <LayoutPanelTop size={18} /> },
    { id: 'dashboard-content', label: 'Kutipan Harian', icon: <LayoutGrid size={18} /> },
    { id: 'user', label: 'Profil Pengguna', icon: <User size={18} /> },
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    const currentList = data[activeTab];
    if (inputValue.trim() && !currentList.includes(inputValue.trim())) {
      const updatedList = [...currentList, inputValue.trim()];
      const updatedData = { ...data, [activeTab]: updatedList };
      setData(updatedData);
      saveData(activeTab, updatedList);
      setInputValue('');
      triggerSaveToast();
    }
  };

  const handleDelete = (index) => {
    const currentList = data[activeTab];
    const updatedList = currentList.filter((_, i) => i !== index);
    const updatedData = { ...data, [activeTab]: updatedList };
    setData(updatedData);
    saveData(activeTab, updatedList);
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  // ─── Helper: Compress Image ──────────────────────────────────────────
  const compressImage = (file, maxWidth = 400) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
        };
      };
    });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      const updated = { ...data.org, logo: compressed };
      setData({ ...data, org: updated });
      saveData('org', updated);
      window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updated }));
      triggerSaveToast();
    }
  };

  const handleLeaderPhotoChange = async (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      const updated = { ...data.org, [type]: compressed };
      setData({ ...data, org: updated });
      saveData('org', updated);
      window.dispatchEvent(new Event('user-data-updated'));
      triggerSaveToast();
    }
  };

  const handleUserPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      const currentUser = data.user || {};
      const updated = { ...currentUser, photo: compressed };
      
      setData(prev => ({ ...prev, user: updated }));
      saveData('user', updated);
      
      window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updated }));
      triggerSaveToast();
    }
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      url: null,
      title: 'Judul Slide Baru',
      desc: 'Narasi atau deskripsi aktivitas...'
    };
    const updated = [...data.slides, newSlide];
    setData({ ...data, slides: updated });
    saveData('slides', updated);
  };

  const updateSlide = (id, field, value) => {
    const updated = data.slides.map(s => s.id === id ? { ...s, [field]: value } : s);
    setData({ ...data, slides: updated });
    saveData('slides', updated);
  };

  const deleteSlide = (id) => {
    const updated = data.slides.filter(s => s.id !== id);
    setData({ ...data, slides: updated });
    saveData('slides', updated);
  };

  const handleSlideImage = async (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 800); // Larger for slides
      updateSlide(id, 'url', compressed);
    }
  };

  const handleHomeroomChange = (className, teacherName) => {
    const updatedOrg = { 
      ...data.org, 
      homerooms: { ...(data.org.homerooms || {}), [className]: teacherName } 
    };
    setData({ ...data, org: updatedOrg });
    saveData('org', updatedOrg);
    triggerSaveToast();
  };

  return (
    <div className="settings-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan Sistem</h1>
          <p className="page-subtitle">Kelola seluruh referensi data Madrasah Aliyah.</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="glass-card settings-tabs-card">
          <div className="tabs-list">
            {tabs.map((tab) => (
              <button 
                key={tab.id}
                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setInputValue('');
                }}
              >
                {React.cloneElement(tab.icon, { size: 22 })}
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-main">
          <div className="glass-card settings-card">
            <div className="card-header">
              <h3 className="card-title">Kelola {tabs.find(t => t.id === activeTab)?.label || 'Pengaturan'}</h3>
            </div>
            
            <div className="settings-content">
              {activeTab === 'org' ? (
                <div className="org-settings-form">
                  <div className="premium-logo-card">
                    <div className="logo-display-area">
                      <div className="main-logo-preview">
                        {data.org.logo ? (
                          <img src={data.org.logo} alt="Logo" />
                        ) : (
                          <Building2 size={40} className="placeholder-icon" />
                        )}
                      </div>
                    </div>
                    <div className="logo-upload-controls">
                      <div className="brand-title">
                        <h3>Logo Institusi</h3>
                        <p>Format PNG/JPG disarankan (Min. 512x512px)</p>
                      </div>
                      <label className="btn btn-primary btn-upload-premium">
                        <Camera size={18} />
                        <span>Ganti Logo Madrasah</span>
                        <input type="file" hidden accept="image/*" onChange={(e) => handleLogoChange(e)} />
                      </label>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Foto Pimpinan</div>
                  <div className="form-grid-2">
                    <div className="leader-profile-card">
                      <div className="profile-photo-wrapper">
                        {data.org.chairmanPhoto ? <img src={data.org.chairmanPhoto} alt="Ketua" /> : <div className="photo-placeholder"><Camera size={32} /></div>}
                        <label className="photo-edit-badge">
                          <Plus size={14} />
                          <input type="file" hidden accept="image/*" onChange={(e) => handleLeaderPhotoChange('chairmanPhoto', e)} />
                        </label>
                      </div>
                      <div className="profile-details">
                        <label>Ketua Yayasan</label>
                        <input 
                          type="text" 
                          placeholder="Nama Ketua Yayasan..."
                          value={data.org.chairman} 
                          onChange={(e) => {
                            const updated = { ...data.org, chairman: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                    </div>

                    <div className="leader-profile-card">
                      <div className="profile-photo-wrapper">
                        {data.org.principalPhoto ? <img src={data.org.principalPhoto} alt="Kepala" /> : <div className="photo-placeholder"><Camera size={32} /></div>}
                        <label className="photo-edit-badge">
                          <Plus size={14} />
                          <input type="file" hidden accept="image/*" onChange={(e) => handleLeaderPhotoChange('principalPhoto', e)} />
                        </label>
                      </div>
                      <div className="profile-details">
                        <label>Kepala Madrasah</label>
                        <input 
                          type="text" 
                          placeholder="Nama Kepala Madrasah..."
                          value={data.org.principal} 
                          onChange={(e) => {
                            const updated = { ...data.org, principal: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Identitas Aplikasi (Sidebar)</div>
                  <div className="form-grid-2 mt-4">
                    <div className="form-group">
                      <label>Nama Aplikasi (Sidebar)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Madrasah Hub"
                        value={data.org.appName || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, appName: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updated }));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Inisial Logo (1 Huruf)</label>
                      <input 
                        type="text" 
                        maxLength="1"
                        placeholder="M"
                        value={data.org.appShortName || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, appShortName: e.target.value.toUpperCase() };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updated }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="doc-divider-settings">Tampilan Halaman Login</div>
                  <div className="form-grid-2 mt-4">
                    <div className="form-group">
                      <label>Nama Aplikasi di Login</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Madrasah Hub"
                        value={data.org.loginTitle || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, loginTitle: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tagline di Login</label>
                      <input 
                        type="text" 
                        placeholder="Slogan singkat untuk halaman login..."
                        value={data.org.loginTagline || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, loginTagline: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                  </div>

                  <div className="doc-divider-settings">Judul & Slogan Dashboard</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Judul Utama Dashboard</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Dashboard MA Yasrib"
                        value={data.org.dashboardTitle} 
                        onChange={(e) => {
                          const updated = { ...data.org, dashboardTitle: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Slogan / Tagline</label>
                      <input 
                        type="text" 
                        placeholder="Motto Madrasah Anda..."
                        value={data.org.dashboardTagline} 
                        onChange={(e) => {
                          const updated = { ...data.org, dashboardTagline: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                  </div>

                  <div className="doc-divider-settings">Informasi Berjalan (Running Text)</div>
                  <div className="form-row mt-4">
                    <div className="form-group">
                      <label>Isi Pengumuman Berjalan</label>
                      <textarea 
                        rows={3}
                        className="premium-textarea"
                        placeholder="Masukkan teks pengumuman yang akan berjalan di dashboard..."
                        value={data.org.runningText || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, runningText: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updated }));
                        }}
                      />
                      <p className="text-xs text-muted mt-1 italic">* Gunakan tanda pemisah (seperti • atau |) agar teks terlihat rapi saat berputar.</p>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Periode Akademik</div>
                  <div className="form-grid-2 mt-4">
                    <div className="form-group">
                      <label>Tahun Pelajaran</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: 2023/2024"
                        value={data.org.academicYear || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, academicYear: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          window.dispatchEvent(new Event('user-data-updated'));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Semester</label>
                      <select 
                        className="premium-select"
                        value={data.org.semester || 'Ganjil'} 
                        onChange={(e) => {
                          const updated = { ...data.org, semester: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          window.dispatchEvent(new Event('user-data-updated'));
                        }}
                      >
                        <option value="Ganjil">Semester Ganjil</option>
                        <option value="Genap">Semester Genap</option>
                      </select>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Pengaturan Wali Kelas</div>
                  <div className="homeroom-grid mt-4">
                    {data.classes.map(c => (
                      <div key={c} className="homeroom-item glass-card p-3 mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="class-badge-small">{c}</div>
                          <span className="font-semibold text-slate-700">Wali Kelas:</span>
                        </div>
                        <select 
                          className="premium-select-mini"
                          value={data.org.homerooms?.[c] || ''}
                          onChange={(e) => handleHomeroomChange(c, e.target.value)}
                        >
                          <option value="">Pilih Guru...</option>
                          {data.teachers.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="doc-divider-settings">Identitas & Kontak</div>
                  <div className="form-row mt-4">
                    <div className="form-group">
                      <label>Nama Madrasah (KOP)</label>
                      <input 
                        type="text" 
                        value={data.org.name} 
                        onChange={(e) => {
                          const updated = { ...data.org, name: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Alamat Lengkap</label>
                      <input 
                        type="text" 
                        value={data.org.address} 
                        onChange={(e) => {
                          const updated = { ...data.org, address: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Nomor Telepon</label>
                      <input 
                        type="text" 
                        value={data.org.phone} 
                        onChange={(e) => {
                          const updated = { ...data.org, phone: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Madrasah</label>
                      <input 
                        type="email" 
                        value={data.org.email} 
                        onChange={(e) => {
                          const updated = { ...data.org, email: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                  </div>
                  <div className="doc-divider-settings">Penanda Tangan Laporan</div>
                  <div className="signatory-grid">
                    <div className="signatory-box">
                      <h4>Kepala Madrasah</h4>
                      <div className="form-group">
                        <label>Nama Lengkap</label>
                        <textarea 
                          rows={2}
                          className="premium-textarea"
                          value={data.org.principal} 
                          onChange={(e) => {
                            const updated = { ...data.org, principal: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>NIP (Opsional)</label>
                        <input 
                          type="text" 
                          value={data.org.principalNip || ''} 
                          onChange={(e) => {
                            const updated = { ...data.org, principalNip: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                    </div>

                    <div className="signatory-box">
                      <h4>Guru Mata Pelajaran</h4>
                      <div className="form-group">
                        <label>Nama Lengkap</label>
                        <textarea 
                          rows={2}
                          className="premium-textarea"
                          value={data.org.teacherName} 
                          onChange={(e) => {
                            const updated = { ...data.org, teacherName: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>NIP (Opsional)</label>
                        <input 
                          type="text" 
                          value={data.org.teacherNip || ''} 
                          onChange={(e) => {
                            const updated = { ...data.org, teacherNip: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Keamanan & Lokasi Presensi (GPS)</div>
                  <div className="geofencing-box">
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label>Latitude Sekolah</label>
                        <input 
                          type="text" 
                          placeholder="-6.12345"
                          value={data.org.lat || ''} 
                          onChange={(e) => {
                            const updated = { ...data.org, lat: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Longitude Sekolah</label>
                        <input 
                          type="text" 
                          placeholder="106.12345"
                          value={data.org.lng || ''} 
                          onChange={(e) => {
                            const updated = { ...data.org, lng: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Radius Absensi (Meter)</label>
                        <input 
                          type="number" 
                          placeholder="100"
                          value={data.org.radius || 100} 
                          onChange={(e) => {
                            const updated = { ...data.org, radius: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="gps-actions">
                      <button 
                        className="btn btn-secondary btn-gps"
                        onClick={() => {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const updated = { ...data.org, lat: pos.coords.latitude, lng: pos.coords.longitude };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                            triggerSaveToast();
                          });
                        }}
                      >
                        <MapPin size={18} />
                        <span>Tentukan Titik Koordinat Otomatis (GPS)</span>
                      </button>
                    </div>

                    <div className="premium-info-box">
                      <AlertCircle size={20} className="info-icon" />
                      <div className="info-content">
                        <h4>Aturan Geofencing</h4>
                        <p>Sistem secara otomatis akan memblokir proses absensi jika guru berada di luar radius yang Anda tentukan dari titik pusat sekolah.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'slides' ? (
                <div className="slides-settings">
                  <div className="slides-header">
                    <div className="slides-info">
                      <h3>Galeri Slideshow Dashboard</h3>
                      <p>Maksimal 5 slide disarankan untuk performa terbaik.</p>
                    </div>
                    <button className="btn btn-primary" onClick={addSlide}>
                      <Plus size={18} /> Tambah Slide
                    </button>
                  </div>
                  <div className="slides-list-config mt-6">
                    {data.slides.map((slide) => (
                      <div key={slide.id} className="premium-slide-card">
                        <div className="slide-media">
                          {slide.url ? (
                            <img src={slide.url} alt="Slide" className="slide-image" />
                          ) : (
                            <div className="media-placeholder">
                              <ImageIcon size={32} />
                              <span>Belum Ada Gambar</span>
                            </div>
                          )}
                          <label className="media-upload-overlay">
                            <Camera size={20} />
                            <span>Ganti Gambar</span>
                            <input type="file" hidden accept="image/*" onChange={(e) => handleSlideImage(slide.id, e)} />
                          </label>
                        </div>
                        <div className="slide-content-form">
                          <div className="form-group mb-3">
                            <label>Judul Aktivitas</label>
                            <input 
                              type="text" 
                              placeholder="Masukkan judul menarik..." 
                              value={slide.title} 
                              onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Deskripsi Narasi</label>
                            <textarea 
                              placeholder="Ceritakan aktivitas ini secara singkat..."
                              value={slide.desc}
                              onChange={(e) => updateSlide(slide.id, 'desc', e.target.value)}
                            />
                          </div>
                        </div>
                        <button className="slide-delete-action" onClick={() => deleteSlide(slide.id)} title="Hapus Slide">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {data.slides.length === 0 && (
                      <div className="empty-slides-state">
                        <LayoutPanelTop size={64} className="text-muted" />
                        <h3>Belum Ada Slideshow</h3>
                        <p>Slideshow akan ditampilkan di beranda utama aplikasi.</p>
                        <button className="btn btn-primary mt-4" onClick={addSlide}>Mulai Tambah Slide</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'academic-calendar' ? (
                <div className="calendar-management-settings animate-fade-in">
                  <div className="premium-section-header">
                    <div className="header-icon-wrap">
                      <Calendar size={32} />
                    </div>
                    <div>
                      <h3>Kalender Akademik Terpadu</h3>
                      <p>Kelola hari libur, jadwal ujian, dan momentum penting Madrasah Anda.</p>
                    </div>
                  </div>

                  <div className="premium-glass-form mb-8">
                    <div className="form-grid-3">
                      <div className="form-group-premium">
                        <label>Nama Kegiatan</label>
                        <div className="input-with-icon">
                          <Zap size={16} />
                          <input 
                            type="text"
                            placeholder="Contoh: Maulid Nabi..."
                            value={newAgenda.title}
                            onChange={(e) => setNewAgenda({...newAgenda, title: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="form-group-premium">
                        <label>Pilih Tanggal</label>
                        <div className="input-with-icon">
                          <Clock size={16} />
                          <input 
                            type="date"
                            value={newAgenda.date}
                            onChange={(e) => setNewAgenda({...newAgenda, date: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="form-group-premium">
                        <label>Kategori</label>
                        <div className="input-with-icon">
                          <LayoutGrid size={16} />
                          <select 
                            value={newAgenda.category}
                            onChange={(e) => setNewAgenda({...newAgenda, category: e.target.value})}
                          >
                            <option value="Libur">🔴 Hari Libur</option>
                            <option value="Ujian">🟡 Jadwal Ujian</option>
                            <option value="Acara">🟢 Acara Madrasah</option>
                            <option value="Umum">⚪ Umum</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="btn-premium-add mt-6"
                      disabled={!newAgenda.title || !newAgenda.date}
                      onClick={() => {
                        const updatedAgendas = [...(data.org.agendas || []), { id: Date.now(), ...newAgenda }];
                        const updatedOrg = { ...data.org, agendas: updatedAgendas };
                        setData({ ...data, org: updatedOrg });
                        saveData('org', updatedOrg);
                        setNewAgenda({ title: '', date: '', category: 'Acara' });
                        triggerSaveToast();
                        window.dispatchEvent(new Event('user-data-updated'));
                      }}
                    >
                      <Plus size={20} />
                      <span>Simpan Agenda Ke Sistem</span>
                    </button>
                  </div>

                  <div className="doc-divider-settings">Agenda Terjadwal</div>
                  <div className="agenda-timeline">
                    {(data.org.agendas || []).sort((a,b) => new Date(a.date) - new Date(b.date)).map((a) => (
                      <div key={a.id} className={`timeline-card ${a.category.toLowerCase()}`}>
                        <div className="timeline-date-box">
                          <span className="t-day">{new Date(a.date).getDate()}</span>
                          <span className="t-month">{new Date(a.date).toLocaleString('id-ID', { month: 'short' })}</span>
                        </div>
                        <div className="timeline-content">
                          <div className="t-main">
                            <h4>{a.title}</h4>
                            <span className="t-year">{new Date(a.date).getFullYear()}</span>
                          </div>
                          <div className="t-actions">
                            <span className={`t-badge ${a.category.toLowerCase()}`}>{a.category}</span>
                            <button 
                              className="t-delete-btn"
                              onClick={() => {
                                const updatedAgendas = data.org.agendas.filter(item => item.id !== a.id);
                                const updatedOrg = { ...data.org, agendas: updatedAgendas };
                                setData({ ...data, org: updatedOrg });
                                saveData('org', updatedOrg);
                                triggerSaveToast();
                                window.dispatchEvent(new Event('user-data-updated'));
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(data.org.agendas || []).length === 0 && (
                      <div className="premium-empty-state">
                        <div className="empty-icon-ring">
                          <Calendar size={40} />
                        </div>
                        <h3>Belum Ada Agenda</h3>
                        <p>Mulai susun kalender akademik Madrasah Bapak sekarang.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'dashboard-content' ? (
                <div className="dashboard-content-settings animate-fade-in">
                  <div className="premium-section-header q-header">
                    <div className="header-icon-wrap">
                      <Quote size={32} />
                    </div>
                    <div>
                      <h3>Mutiara Hikmah Harian</h3>
                      <p>Kelola kutipan bijak dan hadits yang akan tampil secara bergantian di beranda.</p>
                    </div>
                  </div>

                  <div className="premium-glass-form mb-8">
                    <div className="form-row-premium">
                      <div className="form-group-premium full-width">
                        <label>Teks Kutipan / Hadits</label>
                        <div className="input-with-icon">
                          <Edit2 size={16} />
                          <textarea 
                            rows={2}
                            placeholder="Tuliskan kata-kata mutiara yang menginspirasi..."
                            value={newQuote.text}
                            onChange={(e) => setNewQuote({...newQuote, text: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="form-grid-2 mt-4">
                      <div className="form-group-premium">
                        <label>Sumber / Penulis</label>
                        <div className="input-with-icon">
                          <User size={16} />
                          <input 
                            type="text"
                            placeholder="Contoh: HR. Bukhari atau Imam Syafi'i"
                            value={newQuote.author}
                            onChange={(e) => setNewQuote({...newQuote, author: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="form-group-premium flex-end">
                        <button 
                          className="btn-premium-add quote-add-btn"
                          disabled={!newQuote.text}
                          onClick={() => {
                            const updatedQuotes = [...(data.org.quotes || []), { id: Date.now(), ...newQuote }];
                            const updatedOrg = { ...data.org, quotes: updatedQuotes };
                            setData({ ...data, org: updatedOrg });
                            saveData('org', updatedOrg);
                            setNewQuote({ text: '', author: '' });
                            triggerSaveToast();
                            window.dispatchEvent(new Event('user-data-updated'));
                          }}
                        >
                          <Plus size={20} />
                          <span>Tambahkan Kutipan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Koleksi Kutipan Aktif</div>
                  <div className="quotes-premium-list">
                    {(data.org.quotes || []).map((q) => (
                      <div key={q.id} className="quote-premium-card">
                        <div className="quote-icon-side">
                          <Quote size={20} />
                        </div>
                        <div className="quote-main-content">
                          <p className="quote-display-text">"{q.text}"</p>
                          <span className="quote-display-author">— {q.author}</span>
                        </div>
                        <button 
                          className="quote-delete-btn"
                          onClick={() => {
                            const updatedQuotes = data.org.quotes.filter(item => item.id !== q.id);
                            const updatedOrg = { ...data.org, quotes: updatedQuotes };
                            setData({ ...data, org: updatedOrg });
                            saveData('org', updatedOrg);
                            triggerSaveToast();
                            window.dispatchEvent(new Event('user-data-updated'));
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {(data.org.quotes || []).length === 0 && (
                      <div className="premium-empty-state">
                        <div className="empty-icon-ring">
                          <Sparkles size={40} />
                        </div>
                        <h3>Belum Ada Kutipan</h3>
                        <p>Tambahkan kutipan pertama Anda untuk menginspirasi hari-hari di Madrasah.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'user' ? (
                <div className="user-profile-settings">
                  <div className="profile-hero-editor">
                    <div className="avatar-edit-container">
                      <div className="avatar-preview-large">
                        {data.user.photo ? (
                          <img src={data.user.photo} alt="Profile" />
                        ) : (
                          <div className="avatar-placeholder-large">
                            <User size={64} />
                          </div>
                        )}
                        <label className="avatar-upload-badge">
                          <Camera size={20} />
                          <input type="file" hidden accept="image/*" onChange={handleUserPhotoChange} />
                        </label>
                      </div>
                      <div className="avatar-info-text">
                        <h3>Foto Profil Anda</h3>
                        <p>Format JPG, PNG atau GIF. Maksimal 2MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Identitas & Logo Aplikasi</div>
                  <div className="premium-logo-card mb-6">
                    <div className="logo-display-area">
                      <div className="main-logo-preview">
                        {data.org.logo ? (
                          <img src={data.org.logo} alt="Logo" />
                        ) : (
                          <Building2 size={40} className="placeholder-icon" />
                        )}
                      </div>
                    </div>
                    <div className="logo-upload-controls">
                      <div className="brand-title">
                        <h3>Logo Splash & Login</h3>
                        <p>Logo ini muncul di layar splash dan halaman masuk.</p>
                      </div>
                      <label className="btn btn-primary btn-upload-premium">
                        <Camera size={18} />
                        <span>Ganti Logo Utama</span>
                        <input type="file" hidden accept="image/*" onChange={(e) => handleLogoChange(e)} />
                      </label>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Informasi Akun</div>
                  <div className="form-grid-2 mt-4">
                    <div className="form-group">
                      <label>Nama Lengkap</label>
                      <input 
                        type="text" 
                        value={data.user.name} 
                        onChange={(e) => {
                          const updated = { ...data.user, name: e.target.value };
                          setData({ ...data, user: updated });
                          saveData('user', updated);
                          
                          // Update accounts array
                          if (data.accounts) {
                            const updatedAccounts = data.accounts.map(acc => acc.id === updated.id ? { ...acc, name: updated.name } : acc);
                            saveData('accounts', updatedAccounts);
                          }
                          
                          window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updated }));
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Jabatan / Peran</label>
                      <input 
                        type="text" 
                        value={data.user.role} 
                        readOnly
                        disabled
                        className="bg-gray-50"
                        title="Hubungi Admin untuk mengubah Jabatan"
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input 
                        type="text" 
                        value={data.user.username || ''} 
                        onChange={(e) => {
                          const updated = { ...data.user, username: e.target.value };
                          setData({ ...data, user: updated });
                          saveData('user', updated);
                          
                          if (data.accounts) {
                            const updatedAccounts = data.accounts.map(acc => acc.id === updated.id ? { ...acc, username: updated.username } : acc);
                            saveData('accounts', updatedAccounts);
                          }
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input 
                        type="text" 
                        value={data.user.password || ''} 
                        onChange={(e) => {
                          const updated = { ...data.user, password: e.target.value };
                          setData({ ...data, user: updated });
                          saveData('user', updated);
                          
                          if (data.accounts) {
                            const updatedAccounts = data.accounts.map(acc => acc.id === updated.id ? { ...acc, password: updated.password } : acc);
                            saveData('accounts', updatedAccounts);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : activeTab === 'schedule' ? (
                <div className="schedule-editor">
                  <div className="table-actions-header">
                    <h3 className="section-title">Konfigurasi Jam Pelajaran</h3>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      const newId = data.schedule.length > 0 ? Math.max(...data.schedule.map(s => s.id)) + 1 : 1;
                      const updated = [...data.schedule, { id: newId, label: 'X', time: '00.00 - 00.00', type: 'Belajar' }];
                      setData({ ...data, schedule: updated });
                      saveData('schedule', updated);
                    }}>
                      <Plus size={16} /> Tambah Jam
                    </button>
                  </div>
                  
                  <div className="schedule-table-wrapper">
                    <table className="schedule-edit-table">
                      <thead>
                        <tr>
                          <th>JAM KE</th>
                          <th>WAKTU</th>
                          <th>TIPE</th>
                          <th style={{ width: '80px' }}>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.schedule.map((item, idx) => (
                          <tr key={item.id} className={item.type === 'Istirahat' ? 'row-break' : ''}>
                            <td>
                              <input 
                                type="text" 
                                value={item.label}
                                onChange={(e) => {
                                  const updated = [...data.schedule];
                                  updated[idx].label = e.target.value;
                                  setData({ ...data, schedule: updated });
                                  saveData('schedule', updated);
                                }}
                                className="schedule-input-small"
                              />
                            </td>
                            <td>
                              <input 
                                type="text" 
                                value={item.time}
                                onChange={(e) => {
                                  const updated = [...data.schedule];
                                  updated[idx].time = e.target.value;
                                  setData({ ...data, schedule: updated });
                                  saveData('schedule', updated);
                                }}
                                className="schedule-input"
                              />
                            </td>
                            <td>
                              <select 
                                value={item.type}
                                onChange={(e) => {
                                  const updated = [...data.schedule];
                                  updated[idx].type = e.target.value;
                                  setData({ ...data, schedule: updated });
                                  saveData('schedule', updated);
                                }}
                                className="schedule-select"
                              >
                                <option value="Belajar">Belajar</option>
                                <option value="Istirahat">Istirahat</option>
                                <option value="Sholat">Sholat</option>
                              </select>
                            </td>
                            <td>
                              <button className="btn-delete" onClick={() => {
                                const updated = data.schedule.filter(s => s.id !== item.id);
                                setData({ ...data, schedule: updated });
                                saveData('schedule', updated);
                              }}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  <form className="add-subject-form" onSubmit={handleAdd}>
                    <input 
                      type="text" 
                      placeholder={`Tambah ${tabs.find(t => t.id === activeTab)?.label.toLowerCase() || 'data'}...`} 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      <Plus size={18} /> Tambah
                    </button>
                  </form>

                  <div className="subjects-list">
                    {data[activeTab].map((item, index) => (
                      <div key={index} className="subject-item">
                        <span>{item}</span>
                        <button className="btn-delete" onClick={() => handleDelete(index)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {data[activeTab].length === 0 && (
                      <p className="text-muted text-center py-8">Belum ada data di kategori ini.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSaved && (
        <div className="save-toast">
          <CheckCircle2 size={20} /> Data Berhasil Diperbarui
        </div>
      )}
    </div>
  );
};

export default Settings;
