import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  Edit2,
  UserCheck,
  FileText,
  Wallet,
  Settings as SettingsIcon
} from 'lucide-react';
import { getAllData, saveData } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import './Settings.css';

const Settings = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab === 'user' ? 'org' : (location.state?.activeTab || 'subjects'));
  const [data, setData] = useState({
    subjects: [],
    classes: [],
    teachers: [],
    roles: [],
    allowances: [],
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
      logoLeft: null,
      kopHeader1: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
      kopHeader2: 'MAS PP YASRIB LAPAJUNG',
      kopHeader3: 'Jl. Pesantren, Kec. Lalabata, Kab. Soppeng',
      homerooms: {},
      payment: {
        bankName: 'BSI (Bank Syariah Indonesia)',
        bankAccount: '701 234 5678',
        bankHolder: 'YAYASAN MADRASAH HUB',
        ewalletName: 'OVO / DANA / GoPay',
        ewalletNumber: '0812 3456 7890',
        ewalletHolder: 'MADRASAH HUB',
        confirmWhatsApp: '0812-3456-7890'
      }
    },
    p5Projects: [],
    p5Elements: []
  });
  const [newP5Project, setNewP5Project] = useState('');
  const [newP5Element, setNewP5Element] = useState({ name: '', sub: '' });
  const [newAllowanceForm, setNewAllowanceForm] = useState({ label: '', value: 0, name: '' });
  const [inputValue, setInputValue] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  
  // Dashboard Content State
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });
  const [newAgenda, setNewAgenda] = useState({ title: '', date: '', category: 'Umum' });

  useEffect(() => {
    setData(getAllData());
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      if (location.state.activeTab === 'user') {
        setActiveTab('org');
      } else {
        setActiveTab(location.state.activeTab);
      }
    }
  }, [location.state]);

  const tabs = [
    { id: 'subjects', label: 'Mata Pelajaran', icon: <BookOpen size={18} /> },
    { id: 'classes', label: 'Kelas', icon: <School size={18} /> },
    { id: 'teachers', label: 'Daftar Guru', icon: <UserSquare2 size={18} /> },
    { id: 'roles', label: 'Jabatan/Struktural', icon: <ShieldCheck size={18} /> },
    { id: 'allowances', label: 'Tunjangan Jabatan', icon: <Zap size={18} /> },
    { id: 'org', label: 'Identitas Madrasah', icon: <Building2 size={18} /> },
    { id: 'homerooms', label: 'Wali Kelas', icon: <UserCheck size={18} /> },
    { id: 'schedule', label: 'Jadwal Pelajaran', icon: <Clock size={18} /> },
    { id: 'academic-calendar', label: 'Kalender Akademik', icon: <Calendar size={18} /> },
    { id: 'slides', label: 'Galeri Slideshow', icon: <LayoutPanelTop size={18} /> },
    { id: 'dashboard-content', label: 'Kutipan Harian', icon: <LayoutGrid size={18} /> },
    { id: 'p5-config', label: 'Konfigurasi P5-PPRA', icon: <Sparkles size={18} /> },
    { id: 'payment', label: 'Cara Pembayaran', icon: <Wallet size={18} /> },
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

  const handleOrgImageChange = async (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      const updated = { ...data.org, [field]: compressed };
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
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-indigo">
            <SettingsIcon size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Pengaturan Sistem</h1>
            <p className="page-subtitle">Kelola seluruh referensi data Madrasah Aliyah.</p>
          </div>
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
            {!['subjects', 'classes', 'teachers', 'roles', 'allowances', 'org', 'homerooms', 'schedule', 'academic-calendar', 'slides', 'dashboard-content', 'p5-config', 'payment'].includes(activeTab) && (
              <div className="card-header">
                <h3 className="card-title">Kelola {tabs.find(t => t.id === activeTab)?.label || 'Pengaturan'}</h3>
              </div>
            )}
            
            <div className="settings-content">
              {activeTab === 'org' ? (
                <div className="org-settings-form">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}}>
                    <div className="header-icon-wrap">
                      <Building2 size={32} />
                    </div>
                    <div>
                      <h3>Identitas & Profil Madrasah</h3>
                      <p>Kelola identitas utama, kontak, stempel, kop surat, dan pimpinan madrasah.</p>
                    </div>
                  </div>
                  <div className="premium-logo-card dual-logo">
                    <div className="logo-upload-item">
                      <div className="main-logo-preview">
                        {data.org.logoLeft ? <img src={data.org.logoLeft} alt="Logo Left" /> : <Building2 size={40} className="placeholder-icon" />}
                      </div>
                      <div className="logo-upload-controls">
                        <div className="brand-title">
                          <h3>Logo Kiri (Kemenag)</h3>
                          <p>Format PNG/JPG (Maks. 500KB)</p>
                        </div>
                        <label className="btn btn-primary btn-upload-premium">
                          <Camera size={18} />
                          <span>Ganti Logo Kiri</span>
                          <input type="file" hidden accept="image/*" onChange={(e) => handleOrgImageChange('logoLeft', e)} />
                        </label>
                      </div>
                    </div>
                    <div className="logo-upload-item">
                      <div className="main-logo-preview">
                        {data.org.logo ? <img src={data.org.logo} alt="Logo Right" /> : <Building2 size={40} className="placeholder-icon" />}
                      </div>
                      <div className="logo-upload-controls">
                        <div className="brand-title">
                          <h3>Logo Kanan (Madrasah)</h3>
                          <p>Format PNG/JPG (Maks. 500KB)</p>
                        </div>
                        <label className="btn btn-primary btn-upload-premium">
                          <Camera size={18} />
                          <span>Ganti Logo Kanan</span>
                          <input type="file" hidden accept="image/*" onChange={(e) => handleOrgImageChange('logo', e)} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Kustomisasi Kop Surat Rapor</div>
                  <div className="kop-inputs-grid mt-4">
                    <div className="form-group">
                      <label>Baris Kop 1 (Instansi Utama)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: KEMENTERIAN AGAMA REPUBLIK INDONESIA"
                        value={data.org.kopHeader1 || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, kopHeader1: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Baris Kop 2 (Nama Madrasah)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: MAS PP YASRIB LAPAJUNG"
                        value={data.org.kopHeader2 || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, kopHeader2: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Baris Kop 3 (Alamat & Info Lain)</label>
                      <textarea 
                        rows={2}
                        className="premium-textarea"
                        placeholder="Contoh: Jl. Pesantren, Kec. Lalabata, Kab. Soppeng"
                        value={data.org.kopHeader3 || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, kopHeader3: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
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
                        placeholder="Contoh: 2024/2025"
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
                      <CustomSelect 
                        options={['Ganjil', 'Genap']}
                        value={data.org.semester || 'Ganjil'} 
                        onChange={(val) => {
                          const updated = { ...data.org, semester: val };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          window.dispatchEvent(new Event('user-data-updated'));
                        }}
                      />
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
                        <input type="file" hidden accept="image/*" onChange={(e) => handleOrgImageChange('logo', e)} />
                      </label>
                    </div>
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
                  <div className="doc-divider-settings">Penanda Tangan & Stempel (Digital)</div>
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
                      <div className="form-group mt-2">
                        <label>Tanda Tangan (PNG Transparan)</label>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="sig-preview-small">
                            {data.org.principalSig ? <img src={data.org.principalSig} alt="Sig" /> : <div className="placeholder-mini"><Edit2 size={14}/></div>}
                          </div>
                          <label className="btn btn-secondary btn-sm cursor-pointer">
                            <Camera size={14} className="mr-1" /> Upload
                            <input type="file" hidden accept="image/*" onChange={(e) => handleOrgImageChange('principalSig', e)} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="signatory-box">
                      <h4>Wali Kelas / Guru</h4>
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
                      <div className="form-group mt-2">
                        <label>Tanda Tangan (PNG Transparan)</label>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="sig-preview-small">
                            {data.org.teacherSig ? <img src={data.org.teacherSig} alt="Sig" /> : <div className="placeholder-mini"><Edit2 size={14}/></div>}
                          </div>
                          <label className="btn btn-secondary btn-sm cursor-pointer">
                            <Camera size={14} className="mr-1" /> Upload
                            <input type="file" hidden accept="image/*" onChange={(e) => handleOrgImageChange('teacherSig', e)} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="signatory-box">
                      <h4>Stempel Madrasah</h4>
                      <div className="form-group">
                         <label>Upload Stempel (PNG Transparan)</label>
                         <div className="stamp-upload-area mt-2">
                            <div className="stamp-preview-large mx-auto mb-3">
                              {data.org.stamp ? <img src={data.org.stamp} alt="Stempel" /> : <div className="placeholder-large"><Sparkles size={32}/></div>}
                            </div>
                            <label className="btn btn-primary w-full cursor-pointer justify-center">
                              <Camera size={18} className="mr-2" /> Upload Stempel Resmi
                              <input type="file" hidden accept="image/*" onChange={(e) => handleOrgImageChange('stamp', e)} />
                            </label>
                         </div>
                         <p className="text-xs text-muted mt-2">Gunakan format PNG transparan untuk hasil terbaik (terlihat menimpa tanda tangan).</p>
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

                  <div className="doc-divider-settings">Pengaturan Waktu Presensi</div>
                  <div className="geofencing-box">
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Batas Jam Masuk (Tepat Waktu)</label>
                        <p className="text-xs text-muted" style={{marginBottom: '0.5rem'}}>
                          Check In setelah jam ini akan dicatat sebagai <strong>Terlambat</strong>
                        </p>
                        <input
                          type="time"
                          value={data.org.lateThreshold || '07:00'}
                          onChange={(e) => {
                            const updated = { ...data.org, lateThreshold: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                            triggerSaveToast();
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Jam Minimum Check Out</label>
                        <p className="text-xs text-muted" style={{marginBottom: '0.5rem'}}>
                          Guru tidak bisa Check Out sebelum jam ini
                        </p>
                        <input
                          type="time"
                          value={data.org.minCheckoutTime || '14:00'}
                          onChange={(e) => {
                            const updated = { ...data.org, minCheckoutTime: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                            triggerSaveToast();
                          }}
                        />
                      </div>
                    </div>
                    <div className="premium-info-box" style={{marginTop: '1rem'}}>
                      <Clock size={20} className="info-icon" />
                      <div className="info-content">
                        <h4>Cara Kerja Aturan Waktu</h4>
                        <p>Jam masuk &amp; keluar ini langsung berlaku di modul Presensi Guru tanpa perlu menyentuh kode. Perubahan tersimpan otomatis.</p>
                      </div>
                    </div>
                  </div>
                </div>

              ) : activeTab === 'allowances' ? (
                <div className="allowances-settings">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                    <div className="header-icon-wrap">
                      <Zap size={32} />
                    </div>
                    <div>
                      <h3>Kelola Tunjangan Jabatan</h3>
                      <p>Atur daftar tunjangan yang akan digunakan dalam perhitungan gaji guru.</p>
                    </div>
                  </div>

                  <div className="glass-card mt-6 p-6">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center"><Plus size={18} className="mr-2 text-emerald-600"/> Tambah Tunjangan Baru</h4>
                    <div className="form-grid-3">
                      <div className="form-group mb-0">
                        <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Pilih Jabatan</label>
                        <CustomSelect 
                          options={data.roles || []}
                          value={newAllowanceForm.label} 
                          onChange={(val) => {
                             setNewAllowanceForm({
                               ...newAllowanceForm, 
                               label: val,
                               name: `Tunjangan ${val}`
                             })
                          }}
                          placeholder="-- Pilih Jabatan --"
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Nominal (Rp)</label>
                        <input 
                          type="number" 
                          placeholder="Misal: 300000"
                          value={newAllowanceForm.value || ''} 
                          onChange={(e) => setNewAllowanceForm({...newAllowanceForm, value: Number(e.target.value)})}
                          className="premium-input w-full"
                          style={{ padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 block">Nama di Slip Gaji</label>
                        <input 
                          type="text" 
                          placeholder="Misal: Tunjangan Wali Kelas"
                          value={newAllowanceForm.name} 
                          onChange={(e) => setNewAllowanceForm({...newAllowanceForm, name: e.target.value})}
                          className="premium-input w-full"
                          style={{ padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button 
                        className="btn-primary-premium bg-emerald-600 hover:bg-emerald-700 border-none px-6"
                        onClick={() => {
                          if (newAllowanceForm.label && newAllowanceForm.value > 0 && newAllowanceForm.name) {
                            let shortVal = newAllowanceForm.value;
                            let valStr = '';
                            if (shortVal >= 1000000) valStr = (shortVal / 1000000) + 'jt';
                            else if (shortVal >= 1000) valStr = (shortVal / 1000) + 'rb';
                            else valStr = shortVal;
                            
                            const formattedLabel = `${newAllowanceForm.label} (Rp ${valStr})`;

                            const newAllow = {
                              id: 'opt_' + Date.now(),
                              label: formattedLabel,
                              value: newAllowanceForm.value,
                              name: newAllowanceForm.name
                            };
                            const current = data.allowances || [];
                            const updated = [...current, newAllow];
                            setData({ ...data, allowances: updated });
                            saveData('allowances', updated);
                            setNewAllowanceForm({ label: '', value: 0, name: '' });
                            triggerSaveToast();
                          }
                        }}
                      >
                        <Plus size={18} className="mr-2" /> Simpan Tunjangan
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-700">Daftar Tunjangan Aktif</h4>
                      <button 
                        className="text-sm text-indigo-600 font-medium flex items-center hover:text-indigo-800"
                        onClick={() => {
                          const defaultAllowances = [
                            { id: 'none', label: 'Tanpa Tunjangan (Rp 0)', value: 0, name: '' },
                            { id: 'wali', label: 'Wali Kelas (Rp 300rb)', value: 300000, name: 'Tunjangan Wali Kelas' },
                            { id: 'eskul', label: 'Pembina Eskul (Rp 200rb)', value: 200000, name: 'Tunjangan Pembina Eskul' },
                            { id: 'waka', label: 'Waka / Staf (Rp 750rb)', value: 750000, name: 'Tunjangan Waka / Staf' },
                            { id: 'kamad', label: 'Kepala Madrasah (Rp 1.5jt)', value: 1500000, name: 'Tunjangan Kepala Madrasah' }
                          ];
                          setData({ ...data, allowances: defaultAllowances });
                          saveData('allowances', defaultAllowances);
                          triggerSaveToast();
                        }}
                      >
                        <RefreshCcw size={14} className="mr-1" /> Reset ke Default
                      </button>
                    </div>
                    <div className="settings-list">
                      {(Array.isArray(data.allowances) ? data.allowances : []).map((allow, idx) => (
                        <div key={idx} className="list-item-premium border-l-4 border-l-emerald-500 flex items-center bg-white p-4 rounded-xl shadow-sm mb-3">
                          <div className="item-content flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{allow.label}</span>
                              <span className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">Rp {allow?.value?.toLocaleString('id-ID') || 0}</span>
                            </div>
                            {allow.name && <span className="text-xs text-slate-500 mt-1 block flex items-center"><FileText size={12} className="mr-1"/> Tercetak: {allow.name}</span>}
                          </div>
                          {allow.id !== 'none' && (
                            <button 
                              className="btn-icon-danger ml-4 shrink-0"
                              onClick={() => {
                                const updated = (Array.isArray(data.allowances) ? data.allowances : []).filter((_, i) => i !== idx);
                                setData({ ...data, allowances: updated });
                                saveData('allowances', updated);
                                triggerSaveToast();
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {(!Array.isArray(data.allowances) || data.allowances.length === 0) && (
                        <div className="text-center text-muted py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center">
                          <Zap size={32} className="text-slate-300 mb-2" />
                          <p>Belum ada data tunjangan.</p>
                          <p className="text-sm">Silakan gunakan tombol "Reset ke Default" di atas atau tambahkan baru.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'homerooms' ? (
                <div className="homerooms-settings">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'}}>
                    <div className="header-icon-wrap">
                      <UserCheck size={32} />
                    </div>
                    <div>
                      <h3>Penetapan Wali Kelas</h3>
                      <p>Kelola tanggung jawab akademik untuk setiap rombongan belajar.</p>
                    </div>
                  </div>
                  
                  <div className="homeroom-container-grid mt-6">
                    {data.classes.map(c => (
                      <div key={c} className="homeroom-card-new glass-card">
                        <div className="card-top">
                          <div className="class-badge-modern">{c}</div>
                          <div className="teacher-info-now">
                             <span className="info-label">Wali Kelas Aktif:</span>
                             <span className={`info-value ${!data.org.homerooms?.[c] ? 'text-rose-500' : 'text-indigo-600'}`}>
                               {data.org.homerooms?.[c] || 'Belum Ditentukan'}
                             </span>
                          </div>
                        </div>
                        <div className="card-bottom">
                          <div className="form-group-premium mb-0">
                            <label>Pilih Guru Baru</label>
                            <div className="input-with-icon">
                              <User size={18} />
                              <CustomSelect 
                                options={data.teachers}
                                value={data.org.homerooms?.[c] || ''}
                                onChange={(val) => handleHomeroomChange(c, val)}
                                placeholder="-- Pilih Guru --"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.classes.length === 0 && (
                      <div className="empty-state-card">
                        <School size={48} />
                        <h3>Data Kelas Kosong</h3>
                        <p>Silakan tambahkan daftar kelas di menu 'Kelas' terlebih dahulu.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : activeTab === 'slides' ? (
                <div className="slides-settings">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'}}>
                    <div className="header-icon-wrap">
                      <ImageIcon size={32} />
                    </div>
                    <div>
                      <h3>Galeri Slideshow Dashboard</h3>
                      <p>Maksimal 5 slide disarankan untuk performa terbaik.</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 mb-4">
                    <h4 className="font-bold text-slate-700">Daftar Slide Aktif</h4>
                    <button className="btn btn-primary btn-primary-premium border-none px-6" onClick={addSlide}>
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
                          <CustomSelect 
                            options={['Libur', 'Ujian', 'Acara', 'Umum']}
                            value={newAgenda.category}
                            onChange={(val) => setNewAgenda({...newAgenda, category: val})}
                            placeholder="Pilih Kategori"
                          />
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
              ) : activeTab === 'p5-config' ? (
                <div className="p5-config-settings animate-fade-in">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'}}>
                    <div className="header-icon-wrap">
                      <Sparkles size={32} />
                    </div>
                    <div>
                      <h3>Konfigurasi Proyek P5-PPRA</h3>
                      <p>Kelola daftar proyek dan dimensi penilaian karakter siswa.</p>
                    </div>
                  </div>

                  <div className="doc-divider-settings">Daftar Proyek Aktif</div>
                  <div className="p5-project-input-form mb-6">
                    <div className="input-with-icon">
                      <Zap size={16} />
                      <input 
                        type="text" 
                        placeholder="Contoh: Proyek 1: Kewirausahaan..."
                        value={newP5Project}
                        onChange={(e) => setNewP5Project(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={() => {
                      if (!newP5Project) return;
                      const updated = [...(data.p5Projects || []), newP5Project];
                      setData({ ...data, p5Projects: updated });
                      saveData('p5Projects', updated);
                      setNewP5Project('');
                      triggerSaveToast();
                    }}>
                      <Plus size={18} /> Tambah Proyek
                    </button>
                  </div>
                  <div className="p5-items-list mb-10">
                    {(data.p5Projects || []).map((p, idx) => (
                      <div key={idx} className="p5-item-card">
                        <span>{p}</span>
                        <button className="btn-delete" onClick={() => {
                          const updated = data.p5Projects.filter((_, i) => i !== idx);
                          setData({ ...data, p5Projects: updated });
                          saveData('p5Projects', updated);
                        }}><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>

                  <div className="doc-divider-settings">Elemen & Sub-Elemen Penilaian</div>
                  <div className="p5-element-form mb-6">
                    <div className="form-grid-2">
                      <div className="form-group-premium">
                        <label>Nama Dimensi/Elemen</label>
                        <input type="text" value={newP5Element.name} onChange={(e) => setNewP5Element({...newP5Element, name: e.target.value})} placeholder="Contoh: Gotong Royong" />
                      </div>
                      <div className="form-group-premium">
                        <label>Keterangan/Sub-Elemen</label>
                        <input type="text" value={newP5Element.sub} onChange={(e) => setNewP5Element({...newP5Element, sub: e.target.value})} placeholder="Contoh: Kolaborasi dalam tim" />
                      </div>
                    </div>
                    <button className="btn btn-primary w-full mt-4" onClick={() => {
                      if (!newP5Element.name) return;
                      const updated = [...(data.p5Elements || []), { id: 'e' + Date.now(), ...newP5Element }];
                      setData({ ...data, p5Elements: updated });
                      saveData('p5Elements', updated);
                      setNewP5Element({ name: '', sub: '' });
                      triggerSaveToast();
                    }}>
                      <Plus size={18} /> Simpan Elemen Baru
                    </button>
                  </div>
                  <div className="p5-elements-grid">
                    {(data.p5Elements || []).map((el) => (
                      <div key={el.id} className="p5-element-card glass-card">
                        <div className="el-main">
                          <h4>{el.name}</h4>
                          <p>{el.sub}</p>
                        </div>
                        <button className="btn-delete-mini" onClick={() => {
                          const updated = data.p5Elements.filter(e => e.id !== el.id);
                          setData({ ...data, p5Elements: updated });
                          saveData('p5Elements', updated);
                        }}><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'schedule' ? (
                <div className="schedule-editor">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'}}>
                    <div className="header-icon-wrap">
                      <Clock size={32} />
                    </div>
                    <div>
                      <h3>Jadwal & Jam Pelajaran</h3>
                      <p>Kelola pembagian waktu KBM (Kegiatan Belajar Mengajar) dan istirahat.</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 mb-4">
                    <h4 className="font-bold text-slate-700">Konfigurasi Jam Pelajaran</h4>
                    <button className="btn btn-primary btn-primary-premium border-none px-6" onClick={() => {
                      const newId = data.schedule.length > 0 ? Math.max(...data.schedule.map(s => s.id)) + 1 : 1;
                      const updated = [...data.schedule, { id: newId, label: 'X', time: '00.00 - 00.00', type: 'Belajar' }];
                      setData({ ...data, schedule: updated });
                      saveData('schedule', updated);
                    }}>
                      <Plus size={16} className="mr-1" /> Tambah Jam
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
                              <CustomSelect 
                                options={['Belajar', 'Istirahat', 'Sholat']}
                                value={item.type}
                                onChange={(val) => {
                                  const updated = [...data.schedule];
                                  updated[idx].type = val;
                                  setData({ ...data, schedule: updated });
                                  saveData('schedule', updated);
                                }}
                                className="schedule-custom-select"
                              />
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
              ) : activeTab === 'payment' ? (
                <div className="org-settings-form">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'}}>
                    <div className="header-icon-wrap">
                      <Wallet size={32} />
                    </div>
                    <div>
                      <h3>Cara Pembayaran & Rekening</h3>
                      <p>Kelola rekening bank, e-wallet, dan kontak konfirmasi pembayaran.</p>
                    </div>
                  </div>
                  <div className="doc-divider-settings">Transfer Bank</div>
                  <div className="form-grid-2 mt-4">
                    <div className="form-group">
                      <label>Nama Bank</label>
                      <input
                        type="text"
                        value={data.org.payment?.bankName || ''}
                        placeholder="cth: BSI (Bank Syariah Indonesia)"
                        onChange={(e) => {
                          const updated = { ...data.org, payment: { ...data.org.payment, bankName: e.target.value } };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          triggerSaveToast();
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nomor Rekening</label>
                      <input
                        type="text"
                        value={data.org.payment?.bankAccount || ''}
                        placeholder="cth: 701 234 5678"
                        onChange={(e) => {
                          const updated = { ...data.org, payment: { ...data.org.payment, bankAccount: e.target.value } };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          triggerSaveToast();
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Atas Nama (Pemilik Rekening)</label>
                      <input
                        type="text"
                        value={data.org.payment?.bankHolder || ''}
                        placeholder="cth: YAYASAN MADRASAH HUB"
                        onChange={(e) => {
                          const updated = { ...data.org, payment: { ...data.org.payment, bankHolder: e.target.value } };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          triggerSaveToast();
                        }}
                      />
                    </div>
                  </div>

                  <div className="doc-divider-settings" style={{ marginTop: '2rem' }}>E-Wallet</div>
                  <div className="form-grid-2 mt-4">
                    <div className="form-group">
                      <label>Nama E-Wallet</label>
                      <input
                        type="text"
                        value={data.org.payment?.ewalletName || ''}
                        placeholder="cth: OVO / DANA / GoPay"
                        onChange={(e) => {
                          const updated = { ...data.org, payment: { ...data.org.payment, ewalletName: e.target.value } };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          triggerSaveToast();
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nomor Tujuan E-Wallet</label>
                      <input
                        type="text"
                        value={data.org.payment?.ewalletNumber || ''}
                        placeholder="cth: 0812 3456 7890"
                        onChange={(e) => {
                          const updated = { ...data.org, payment: { ...data.org.payment, ewalletNumber: e.target.value } };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          triggerSaveToast();
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Atas Nama (E-Wallet)</label>
                      <input
                        type="text"
                        value={data.org.payment?.ewalletHolder || ''}
                        placeholder="cth: MADRASAH HUB"
                        onChange={(e) => {
                          const updated = { ...data.org, payment: { ...data.org.payment, ewalletHolder: e.target.value } };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          triggerSaveToast();
                        }}
                      />
                    </div>
                  </div>

                  <div className="doc-divider-settings" style={{ marginTop: '2rem' }}>Konfirmasi Pembayaran</div>
                  <div className="form-grid-2 mt-4">
                    <div className="form-group">
                      <label>Nomor WhatsApp Tata Usaha</label>
                      <input
                        type="text"
                        value={data.org.payment?.confirmWhatsApp || ''}
                        placeholder="cth: 0812-3456-7890"
                        onChange={(e) => {
                          const updated = { ...data.org, payment: { ...data.org.payment, confirmWhatsApp: e.target.value } };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          triggerSaveToast();
                        }}
                      />
                    </div>
                  </div>

                  <div className="premium-info-box mt-6">
                    <AlertCircle size={20} className="info-icon" />
                    <div className="info-content">
                      <h4>Pratinjau Cara Pembayaran</h4>
                      <p style={{ lineHeight: '1.8', marginTop: '0.5rem' }}>
                        <strong>Transfer Bank {data.org.payment?.bankName || 'BSI'}</strong><br/>
                        No. Rekening: <strong>{data.org.payment?.bankAccount || '-'}</strong><br/>
                        A.n: <strong>{data.org.payment?.bankHolder || '-'}</strong>
                        <br /><br />
                        <strong>E-Wallet ({data.org.payment?.ewalletName || 'OVO/DANA/GoPay'})</strong><br/>
                        No. Tujuan: <strong>{data.org.payment?.ewalletNumber || '-'}</strong><br/>
                        A.n: <strong>{data.org.payment?.ewalletHolder || '-'}</strong>
                        <br /><br />
                        Konfirmasi via WhatsApp: <strong>{data.org.payment?.confirmWhatsApp || '-'}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'subjects' && (
                    <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                      <div className="header-icon-wrap">
                        <BookOpen size={32} />
                      </div>
                      <div>
                        <h3>Kelola Mata Pelajaran</h3>
                        <p>Atur daftar mata pelajaran yang diajarkan di Madrasah Aliyah.</p>
                      </div>
                    </div>
                  )}
                  {activeTab === 'classes' && (
                    <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                      <div className="header-icon-wrap">
                        <School size={32} />
                      </div>
                      <div>
                        <h3>Kelola Kelas & Rombel</h3>
                        <p>Atur daftar rombongan belajar (rombel) dan kelas aktif.</p>
                      </div>
                    </div>
                  )}
                  {activeTab === 'teachers' && (
                    <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'}}>
                      <div className="header-icon-wrap">
                        <UserSquare2 size={32} />
                      </div>
                      <div>
                        <h3>Kelola Daftar Guru</h3>
                        <p>Atur data pendidik dan tenaga kependidikan aktif.</p>
                      </div>
                    </div>
                  )}
                  {activeTab === 'roles' && (
                    <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'}}>
                      <div className="header-icon-wrap">
                        <ShieldCheck size={32} />
                      </div>
                      <div>
                        <h3>Kelola Jabatan & Struktural</h3>
                        <p>Atur daftar jabatan dan tugas tambahan guru di Madrasah.</p>
                      </div>
                    </div>
                  )}

                  <div className="glass-card mt-6 p-6">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                      <Plus size={18} className="mr-2 text-emerald-600"/> Tambah {tabs.find(t => t.id === activeTab)?.label} Baru
                    </h4>
                    <form className="add-subject-form mb-0" onSubmit={handleAdd}>
                      <input 
                        type="text" 
                        placeholder={`Tambah ${tabs.find(t => t.id === activeTab)?.label.toLowerCase() || 'data'}...`} 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="premium-input w-full"
                        style={{ padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <button type="submit" className="btn btn-primary btn-primary-premium border-none px-6">
                        <Plus size={18} /> Tambah
                      </button>
                    </form>
                  </div>

                  <div className="mt-8">
                    <h4 className="font-bold text-slate-700 mb-4">Daftar {tabs.find(t => t.id === activeTab)?.label} Aktif</h4>
                    <div className="settings-list">
                      {Array.isArray(data[activeTab]) && data[activeTab].map((item, index) => {
                        let borderColor = 'border-l-blue-500';
                        if (activeTab === 'classes') borderColor = 'border-l-amber-500';
                        else if (activeTab === 'teachers') borderColor = 'border-l-pink-500';
                        else if (activeTab === 'roles') borderColor = 'border-l-cyan-500';
                        
                        return (
                          <div key={index} className={`list-item-premium border-l-4 ${borderColor} flex items-center bg-white p-4 rounded-xl shadow-sm mb-3`}>
                            <div className="item-content flex-1">
                              <span className="font-bold text-slate-800">{item}</span>
                            </div>
                            <button className="btn-delete" onClick={() => handleDelete(index)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                      {Array.isArray(data[activeTab]) && data[activeTab].length === 0 && (
                        <div className="text-center text-muted py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center">
                          <p>Belum ada data {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}.</p>
                        </div>
                      )}
                    </div>
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
