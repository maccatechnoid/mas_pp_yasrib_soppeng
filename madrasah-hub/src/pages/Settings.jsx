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
                  <div className="kop-inputs-grid mt-
