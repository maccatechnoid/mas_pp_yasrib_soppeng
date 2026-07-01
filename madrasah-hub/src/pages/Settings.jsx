import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
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
    user: { name: 'Administrator', role: 'Kepala Madrasah', photo: null },
    org: {
      name: '', address: '', phone: '', email: '',
      principal: '', principalPhoto: null, principalNip: '', principalSig: null,
      teacherName: '', teacherNip: '', teacherSig: null,
      chairman: '', chairmanPhoto: null, logo: null, logoLeft: null, stamp: null,
      kopHeader1: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
      kopHeader2: 'MAS PP YASRIB LAPAJUNG',
      kopHeader3: 'Jl. Pesantren, Kec. Lalabata, Kab. Soppeng',
      appName: '', appShortName: '', loginTitle: '', loginTagline: '',
      dashboardTitle: '', dashboardTagline: '', runningText: '',
      academicYear: '', semester: 'Ganjil', lat: '', lng: '', radius: 100,
      lateThreshold: '07:00', minCheckoutTime: '14:00',
      homerooms: {}, payment: { bankName: '', bankAccount: '', bankHolder: '', ewalletName: '', ewalletNumber: '', ewalletHolder: '', confirmWhatsApp: '' },
      agendas: [], quotes: []
    },
    p5Projects: [],
    p5Elements: []
  });

  const [newP5Project, setNewP5Project] = useState('');
  const [newP5Element, setNewP5Element] = useState({ name: '', sub: '' });
  const [newAllowanceForm, setNewAllowanceForm] = useState({ label: '', value: 0, name: '' });
  const [inputValue, setInputValue] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [newQuote, setNewQuote] = useState({ text: '', author: '' });
  const [newAgenda, setNewAgenda] = useState({ title: '', date: '', category: 'Umum' });

  useEffect(() => {
    const localData = getAllData();
    if (localData) {
      setData(prev => ({
        ...prev,
        ...localData,
        org: { ...prev.org, ...localData.org }
      }));
    }
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab === 'user' ? 'org' : location.state.activeTab);
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

  const triggerSaveToast = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const currentList = data[activeTab] || [];
    if (inputValue.trim() && !currentList.includes(inputValue.trim())) {
      const updatedList = [...currentList, inputValue.trim()];
      setData(prev => ({ ...prev, [activeTab]: updatedList }));
      saveData(activeTab, updatedList);
      setInputValue('');
      triggerSaveToast();
    }
  };

  const handleDelete = (index) => {
    const currentList = data[activeTab] || [];
    const updatedList = currentList.filter((_, i) => i !== index);
    setData(prev => ({ ...prev, [activeTab]: updatedList }));
    saveData(activeTab, updatedList);
    triggerSaveToast();
  };

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
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleOrgImageChange = async (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, field === 'stamp' ? 300 : 400);
      const updatedOrg = { ...data.org, [field]: compressed };
      setData(prev => ({ ...prev, org: updatedOrg }));
      saveData('org', updatedOrg);
      window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updatedOrg }));
      triggerSaveToast();
    }
  };

  const handleLeaderPhotoChange = async (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 400);
      const updatedOrg = { ...data.org, [type]: compressed };
      setData(prev => ({ ...prev, org: updatedOrg }));
      saveData('org', updatedOrg);
      window.dispatchEvent(new Event('user-data-updated'));
      triggerSaveToast();
    }
  };

  const addSlide = () => {
    const newSlide = { id: Date.now(), url: null, title: 'Judul Slide Baru', desc: 'Narasi atau deskripsi aktivitas...' };
    const updated = [...(data.slides || []), newSlide];
    setData(prev => ({ ...prev, slides: updated }));
    saveData('slides', updated);
  };

  const updateSlide = (id, field, value) => {
    const updated = data.slides.map(s => s.id === id ? { ...s, [field]: value } : s);
    setData(prev => ({ ...prev, slides: updated }));
    saveData('slides', updated);
  };

  const deleteSlide = (id) => {
    const updated = data.slides.filter(s => s.id !== id);
    setData(prev => ({ ...prev, slides: updated }));
    saveData('slides', updated);
  };

  const handleSlideImage = async (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, 800);
      updateSlide(id, 'url', compressed);
    }
  };

  const handleHomeroomChange = (className, teacherName) => {
    const updatedOrg = { 
      ...data.org, 
      homerooms: { ...(data.org.homerooms || {}), [className]: teacherName } 
    };
    setData(prev => ({ ...prev, org: updatedOrg }));
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

                  {/* Dual Logo Section */}
                  <div className="premium-logo-card dual-logo mt-6">
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

                  {/* Kop Surat */}
                  <div className="doc-divider-settings mt-6">Kustomisasi Kop Surat Rapor</div>
                  <div className="kop-inputs-grid mt-4">
                    <div className="form-group">
                      <label>Baris Kop 1 (Instansi Utama)</label>
                      <input 
                        type="text" 
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
                        value={data.org.kopHeader3 || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, kopHeader3: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                  </div>

                  {/* Profile Pimpinan */}
                  <div className="doc-divider-settings mt-6">Foto Pimpinan</div>
                  <div className="form-grid-2 mt-4">
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
                          value={data.org.chairman || ''} 
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
                          value={data.org.principal || ''} 
                          onChange={(e) => {
                            const updated = { ...data.org, principal: e.target.value };
                            setData({ ...data, org: updated });
                            saveData('org', updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Identitas Aplikasi */}
                  <div className="doc-divider-settings mt-6">Identitas Aplikasi & KBM</div>
                  <div className="form-grid-2 mt-4">
                    <div className="form-group">
                      <label>Nama Madrasah (Umum)</label>
                      <input 
                        type="text" 
                        value={data.org.name || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, name: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Alamat Lengkap</label>
                      <input 
                        type="text" 
                        value={data.org.address || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, address: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nama Aplikasi (Sidebar)</label>
                      <input 
                        type="text" 
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

                  {/* Running Text */}
                  <div className="doc-divider-settings mt-6">Informasi Berjalan (Running Text)</div>
                  <div className="form-row mt-4">
                    <div className="form-group">
                      <textarea 
                        rows={2}
                        className="premium-textarea"
                        placeholder="Teks pengumuman berjalan..."
                        value={data.org.runningText || ''} 
                        onChange={(e) => {
                          const updated = { ...data.org, runningText: e.target.value };
                          setData({ ...data, org: updated });
                          saveData('org', updated);
                          window.dispatchEvent(new CustomEvent('user-data-updated', { detail: updated }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Periode Akademik */}
                  <div className="doc-divider-settings mt-6">Periode Akademik</div>
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

                  {/* Geofencing */}
                  <div className="doc-divider-settings mt-6">Lokasi Presensi Terikat (GPS & Radius)</div>
                  <div className="geofencing-box mt-4">
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label>Latitude</label>
                        <input type="text" value={data.org.lat || ''} onChange={(e) => {
                          const updated = { ...data.org, lat: e.target.value };
                          setData({ ...data, org: updated }); saveData('org', updated);
                        }}/>
                      </div>
                      <div className="form-group">
                        <label>Longitude</label>
                        <input type="text" value={data.org.lng || ''} onChange={(e) => {
                          const updated = { ...data.org, lng: e.target.value };
                          setData({ ...data, org: updated }); saveData('org', updated);
                        }}/>
                      </div>
                      <div className="form-group">
                        <label>Radius (Meter)</label>
                        <input type="number" value={data.org.radius || 100} onChange={(e) => {
                          const updated = { ...data.org, radius: Number(e.target.value) };
                          setData({ ...data, org: updated }); saveData('org', updated);
                        }}/>
                      </div>
                    </div>
                    <div className="gps-actions mt-3">
                      <button className="btn btn-secondary btn-gps" onClick={() => {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          const updated = { ...data.org, lat: pos.coords.latitude, lng: pos.coords.longitude };
                          setData({ ...data, org: updated }); saveData('org', updated); triggerSaveToast();
                        });
                      }}>
                        <MapPin size={18} /> <span>Ambil Koordinat GPS Sekarang</span>
                      </button>
                    </div>
                  </div>

                  {/* Signatures and Stamps */}
                  <div className="doc-divider-settings mt-6">Tanda Tangan & Stempel Berkas digital</div>
                  <div className="signatory-grid mt-4">
                    <div className="signatory-box">
                      <h4>Kepala Madrasah</h4>
                      <div className="form-group">
                        <label>NIP Pimpinan</label>
                        <input type="text" value={data.org.principalNip || ''} onChange={(e) => {
                          const updated = { ...data.org, principalNip: e.target.value };
                          setData({ ...data, org: updated }); saveData('org', updated);
                        }}/>
                      </div>
                      <div className="form-group mt-2">
                        <div className="flex items-center gap-3">
                          <div className="sig-preview-small">
                            {data.org.principalSig ? <img src={data.org.principalSig} alt="Sig" /> : <div className="placeholder-mini"><Edit2 size={14}/></div>}
                          </div>
                          <label className="btn btn-secondary btn-sm cursor-pointer">
                            <Camera size={14} /> Upload TTD
                            <input type="file" hidden accept="image/*" onChange={(e) => handleOrgImageChange('principalSig', e)} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="signatory-box">
                      <h4>Stempel Resmi Madrasah</h4>
                      <div className="stamp-upload-area">
                        <div className="stamp-preview-large mx-auto mb-2">
                          {data.org.stamp ? <img src={data.org.stamp} alt="Stempel" /> : <div className="placeholder-large"><Sparkles size={24}/></div>}
                        </div>
                        <label className="btn btn-primary w-full justify-center cursor-pointer">
                          <Camera size={16} className="mr-2" /> Upload Stempel (PNG)
                          <input type="file" hidden accept="image/*" onChange={(e) => handleOrgImageChange('stamp', e)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'allowances' ? (
                <div className="allowances-settings">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                    <div className="header-icon-wrap"><Zap size={32} /></div>
                    <div>
                      <h3>Kelola Tunjangan Jabatan</h3>
                      <p>Atur daftar tunjangan struktural untuk modul penggajian guru.</p>
                    </div>
                  </div>

                  <div className="glass-card mt-6 p-6">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center"><Plus size={18} className="mr-2 text-emerald-600"/> Tambah Tunjangan Baru</h4>
                    <div className="form-grid-3">
                      <div className="form-group">
                        <label className="text-xs font-semibold">Pilih Jabatan</label>
                        <CustomSelect 
                          options={data.roles || []}
                          value={newAllowanceForm.label} 
                          onChange={(val) => setNewAllowanceForm({ ...newAllowanceForm, label: val, name: `Tunjangan ${val}` })}
                          placeholder="-- Pilih Jabatan --"
                        />
                      </div>
                      <div className="form-group">
                        <label className="text-xs font-semibold">Nominal (Rp)</label>
                        <input type="number" className="premium-input w-full" value={newAllowanceForm.value || ''} onChange={(e) => setNewAllowanceForm({ ...newAllowanceForm, value: Number(e.target.value) })}/>
                      </div>
                      <div className="form-group">
                        <label className="text-xs font-semibold">Nama Slip Gaji</label>
                        <input type="text" className="premium-input w-full" value={newAllowanceForm.name} onChange={(e) => setNewAllowanceForm({ ...newAllowanceForm, name: e.target.value })}/>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button className="btn-primary-premium bg-emerald-600 hover:bg-emerald-700 border-none px-6" onClick={() => {
                        if (newAllowanceForm.label && newAllowanceForm.value > 0) {
                          const valStr = newAllowanceForm.value >= 1000000 ? (newAllowanceForm.value / 1000000) + 'jt' : (newAllowanceForm.value / 1000) + 'rb';
                          const newAllow = { id: 'opt_' + Date.now(), label: `${newAllowanceForm.label} (Rp ${valStr})`, value: newAllowanceForm.value, name: newAllowanceForm.name };
                          const updated = [...(data.allowances || []), newAllow];
                          setData({ ...data, allowances: updated });
                          saveData('allowances', updated);
                          setNewAllowanceForm({ label: '', value: 0, name: '' });
                          triggerSaveToast();
                        }
                      }}><Plus size={18} /> Simpan Tunjangan</button>
                    </div>
                  </div>

                  <div className="mt-6">
                    {/* Render List Allowance Map */}
                    {(data.allowances || []).map((allow, idx) => (
                      <div key={idx} className="list-item-premium border-l-4 border-l-emerald-500 flex items-center bg-white p-4 rounded-xl shadow-sm mb-3">
                        <div className="item-content flex-1 flex justify-between">
                          <span className="font-bold text-slate-800">{allow.label}</span>
                          <span className="font-semibold text-emerald-700">Rp {allow.value?.toLocaleString('id-ID')}</span>
                        </div>
                        <button className="btn-delete ml-4" onClick={() => {
                          const updated = data.allowances.filter((_, i) => i !== idx);
                          setData({ ...data, allowances: updated }); saveData('allowances', updated);
                        }}><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'homerooms' ? (
                <div className="homerooms-settings">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'}}>
                    <div className="header-icon-wrap"><UserCheck size={32} /></div>
                    <div>
                      <h3>Penetapan Wali Kelas</h3>
                      <p>Petakan tanggung jawab akademik guru pada tiap rombel aktif.</p>
                    </div>
                  </div>
                  <div className="homeroom-container-grid mt-6">
                    {(data.classes || []).map(c => (
                      <div key={c} className="homeroom-card-new glass-card p-4 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">{c}</span>
                          <CustomSelect 
                            options={data.teachers || []}
                            value={data.org.homerooms?.[c] || ''}
                            onChange={(val) => handleHomeroomChange(c, val)}
                            placeholder="Tentukan Wali Kelas"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'slides' ? (
                <div className="slides-settings">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'}}>
                    <div className="header-icon-wrap"><ImageIcon size={32} /></div>
                    <div>
                      <h3>Galeri Beranda Slideshow</h3>
                      <p>Unggah dokumentasi kegiatan untuk dipajang pada banner utama landing app.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="btn btn-primary" onClick={addSlide}><Plus size={16}/> Tambah Slide Banner</button>
                  </div>
                  <div className="slides-list-config mt-4">
                    {(data.slides || []).map(slide => (
                      <div key={slide.id} className="premium-slide-card flex gap-4 p-4 bg-white rounded-xl shadow-sm mb-3">
                        <div className="slide-media w-32 h-20 relative bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                          {slide.url ? <img src={slide.url} alt="Slide" className="object-cover w-full h-full"/> : <Camera size={20}/>}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleSlideImage(slide.id, e)}/>
                        </div>
                        <div className="flex-1">
                          <input type="text" className="w-full font-bold mb-1" value={slide.title} onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}/>
                          <textarea className="w-full text-sm text-slate-500" value={slide.desc} onChange={(e) => updateSlide(slide.id, 'desc', e.target.value)}/>
                        </div>
                        <button className="text-red-500" onClick={() => deleteSlide(slide.id)}><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'schedule' ? (
                <div className="schedule-editor">
                  <div className="premium-section-header" style={{background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'}}>
                    <div className="header-icon-wrap"><Clock size={32} /></div>
                    <div>
                      <h3>Konfigurasi Jam Pelajaran (KBM)</h3>
                      <p>Atur alokasi porsi durasi waktu belajar mengajar madrasah.</p>
                    </div>
                  </div>
                  {/* Penanganan Jam Mengajar Tradisional */}
                  <div className="mt-4">
                    <button className="btn btn-primary mb-4" onClick={() => {
                      const updated = [...(data.schedule || []), { id: Date.now(), label: 'Jam baru', time: '07:30 - 08:15', type: 'Belajar' }];
                      setData({ ...data, schedule: updated }); saveData('schedule', updated);
                    }}><Plus size={16}/> Tambah Slot KBM</button>
                    {/* Render minimal input untuk mempersingkat baris tabel */}
                    {(data.schedule || []).map((sch, i) => (
                      <div key={sch.id} className="flex gap-3 mb-2 items-center">
                        <input type="text" className="p-2 border rounded" value={sch.label} onChange={(e) => {
                          const temp = [...data.schedule]; temp[i].label = e.target.value; setData({...data, schedule: temp}); saveData('schedule', temp);
                        }}/>
                        <input type="text" className="p-2 border rounded flex-1" value={sch.time} onChange={(e) => {
                          const temp = [...data.schedule]; temp[i].time = e.target.value; setData({...data, schedule: temp}); saveData('schedule', temp);
                        }}/>
                        <button onClick={() => {
                          const temp = data.schedule.filter(s => s.id !== sch.id); setData({...data, schedule: temp}); saveData('schedule', temp);
                        }}><Trash2 size={16} className="text-red-500"/></button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Fallback Handler untuk Tab Data Array Sederhana: subjects, classes, teachers, roles */
                <>
                  <div className="premium-section-header bg-slate-700 text-white">
                    <div className="header-icon-wrap"><Building2 size={32} /></div>
                    <div>
                      <h3>Kelola Data {tabs.find(t => t.id === activeTab)?.label}</h3>
                      <p>Tambah atau hapus referensi list objek aktif untuk aplikasi.</p>
                    </div>
                  </div>

                  <div className="glass-card mt-6 p-6">
                    <form className="add-subject-form flex gap-3 mb-0" onSubmit={handleAdd}>
                      <input 
                        type="text" 
                        placeholder={`Tambah ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} baru...`} 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="premium-input flex-1"
                        style={{ padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <button type="submit" className="btn btn-primary bg-indigo-600 border-none px-6 text-white flex items-center gap-1">
                        <Plus size={18} /> Tambah
                      </button>
                    </form>
                  </div>

                  <div className="mt-6">
                    {Array.isArray(data[activeTab]) && data[activeTab].map((item, index) => (
                      <div key={index} className="list-item-premium border-l-4 border-l-indigo-500 flex items-center bg-white p-4 rounded-xl shadow-sm mb-2 justify-between">
                        <span className="font-bold text-slate-800">{item}</span>
                        <button className="btn-delete text-red-500" onClick={() => handleDelete(index)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
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
