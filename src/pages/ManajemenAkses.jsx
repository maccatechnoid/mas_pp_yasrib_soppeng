import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  Save,
  X,
  Users,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  KeyRound,
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Wallet,
  FileText,
  Settings,
  Info,
  Camera,
  CalendarClock,
  ClipboardCheck,
  CheckCheck,
  HeartHandshake
} from 'lucide-react';
import { getAllData, saveData, uploadImage } from '../utils/storage';
import CustomSelect from '../components/CustomSelect';
import toast from 'react-hot-toast';
import './ManajemenAkses.css';

// Group menus by portal
const MENU_GROUPS = [
  {
    name: 'Portal Admin / Guru',
    menus: [
      { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
      { path: '/presensi', label: 'Presensi', icon: <UserCheck size={14} /> },
      { path: '/students', label: 'Siswa', icon: <Users size={14} /> },
      { path: '/homeroom', label: 'Portal Akademik & Wali', icon: <UserCheck size={14} /> },
      { path: '/manajemen-kelas', label: 'Manajemen Kelas & Modul', icon: <BookOpen size={14} /> },
      { path: '/religious', label: 'Kegiatan Ibadah', icon: <BookOpen size={14} /> },
      { path: '/quran', label: 'Tahfidz', icon: <BookOpen size={14} /> },
      { path: '/teacher-study', label: 'Kajian Keagamaan', icon: <Users size={14} /> },
      { path: '/teacher-leaves', label: 'Perizinan Guru', icon: <CalendarClock size={14} /> },
      { path: '/ujian-sumatif', label: 'Ujian Sumatif', icon: <ClipboardCheck size={14} /> },
      { path: '/konseling', label: 'Bimbingan Konseling', icon: <HeartHandshake size={14} /> },
      { path: '/finance', label: 'Keuangan', icon: <Wallet size={14} /> },
      { path: '/reports', label: 'Laporan', icon: <FileText size={14} /> },
      { path: '/manajemen-akses', label: 'Manajemen Akses', icon: <ShieldCheck size={14} /> },
      { path: '/settings', label: 'Pengaturan', icon: <Settings size={14} /> },
    ]
  },
  {
    name: 'Portal Siswa',
    menus: [
      { path: '/student-dashboard', label: 'Dashboard Siswa', icon: <LayoutDashboard size={14} /> },
      { path: '/riwayat-presensi', label: 'Riwayat Presensi', icon: <UserCheck size={14} /> },
      { path: '/nilai-siswa', label: 'Nilai Siswa', icon: <BookOpen size={14} /> },
    ]
  },
  {
    name: 'Portal Orang Tua',
    menus: [
      { path: '/parent-dashboard', label: 'Dashboard Wali', icon: <LayoutDashboard size={14} /> },
      { path: '/parent-academic', label: 'Akademik & Hafalan', icon: <BookOpen size={14} /> },
      { path: '/parent-finance', label: 'Informasi Keuangan', icon: <Wallet size={14} /> },
    ]
  }
];

const ALL_MENUS = MENU_GROUPS.flatMap(g => g.menus);



const ROLE_COLORS = {
  'Admin': { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  'Kepala Madrasah': { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  'Guru BK': { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  'Guru Mata Pelajaran': { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  'Pembina': { bg: '#ecfeff', text: '#155e75', border: '#a5f3fc' },
  'Orang Tua': { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
  'Siswa': { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
};

const FALLBACK_PALETTES = [
  { bg: '#f0fdfa', text: '#0f766e', border: '#ccfbf1' }, // Teal
  { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' }, // Red
  { bg: '#fdf4ff', text: '#86198f', border: '#fae8ff' }, // Fuchsia
  { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' }, // Orange
  { bg: '#f8fafc', text: '#334155', border: '#e2e8f0' }, // Slate
  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }, // Blue
];

const getRoleColor = (role) => {
  if (ROLE_COLORS[role]) return ROLE_COLORS[role];
  
  // Hash string to pick a consistent fallback palette
  let hash = 0;
  for (let i = 0; i < role.length; i++) {
    hash = role.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_PALETTES[Math.abs(hash) % FALLBACK_PALETTES.length];
};

const ManajemenAkses = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [data, setData] = useState({ accounts: [], permissions: {}, roles: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [permissionsChanged, setPermissionsChanged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'Guru Mata Pelajaran',
    photo: null
  });
  const [formErrors, setFormErrors] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    const loadData = () => {
      const all = getAllData();
      setData({ accounts: all.accounts || [], permissions: all.permissions || {}, roles: all.roles || [] });
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Dynamic roles from settings, always ensuring 'Admin' is present
  const dynamicRoles = Array.from(new Set(['Admin', ...(data.roles || [])]));

  // ─── Account Management ─────────────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username wajib diisi';
    else if (formData.username.trim().length < 3) errors.username = 'Minimal 3 karakter';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) errors.username = 'Hanya huruf, angka, dan underscore';
    else {
      const exists = data.accounts.find(
        a => a.username === formData.username.trim() && a.id !== editingAccount?.id
      );
      if (exists) errors.username = 'Username sudah digunakan';
    }
    if (!formData.password.trim()) errors.password = 'Password wajib diisi';
    else if (formData.password.trim().length < 4) errors.password = 'Minimal 4 karakter';
    if (!formData.name.trim()) errors.name = 'Nama wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB');
      return;
    }
    
    setIsUploading(true);
    try {
      const path = `avatars/${Date.now()}_${file.name}`;
      const { url, error } = await uploadImage('public', file, path);
      if (error) throw error;
      setFormData(prev => ({ ...prev, photo: url }));
      toast.success('Foto berhasil diunggah');
    } catch (err) {
      toast.error('Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let updatedAccounts;
    if (editingAccount) {
      updatedAccounts = data.accounts.map(a =>
        a.id === editingAccount.id
          ? { ...a, username: formData.username.trim(), password: formData.password.trim(), name: formData.name.trim(), role: formData.role, photo: formData.photo }
          : a
      );
      toast.success(`Akun "${formData.name.trim()}" berhasil diperbarui`);
    } else {
      const maxId = data.accounts.reduce((max, a) => Math.max(max, a.id || 0), 0);
      const newAccount = {
        id: maxId + 1,
        username: formData.username.trim(),
        password: formData.password.trim(),
        name: formData.name.trim(),
        role: formData.role,
        photo: formData.photo,
      };
      updatedAccounts = [...data.accounts, newAccount];
      toast.success(`Akun "${formData.name.trim()}" berhasil ditambahkan`);
    }

    saveData('accounts', updatedAccounts);
    setData(prev => ({ ...prev, accounts: updatedAccounts }));
    closeModal();
  };

  const handleDeleteAccount = (account) => {
    if (account.username === 'admin') {
      toast.error('Akun Admin utama tidak bisa dihapus!');
      return;
    }
    const updatedAccounts = data.accounts.filter(a => a.id !== account.id);
    saveData('accounts', updatedAccounts);
    setData(prev => ({ ...prev, accounts: updatedAccounts }));
    setDeleteConfirm(null);
    toast.success(`Akun "${account.name}" berhasil dihapus`);
  };

  const handleResetPassword = (account) => {
    const updatedAccounts = data.accounts.map(a =>
      a.id === account.id ? { ...a, password: 'password' } : a
    );
    saveData('accounts', updatedAccounts);
    setData(prev => ({ ...prev, accounts: updatedAccounts }));
    toast.success(`Password "${account.name}" direset ke default`);
  };

  const openAddModal = () => {
    setEditingAccount(null);
    setFormData({ username: '', password: 'password', name: '', role: 'Guru Mata Pelajaran', photo: null });
    setFormErrors({});
    setShowPassword(false);
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormData({
      username: account.username,
      password: account.password,
      name: account.name,
      role: account.role,
      photo: account.photo,
    });
    setFormErrors({});
    setShowPassword(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({ username: '', password: '', name: '', role: 'Guru Mata Pelajaran', photo: null });
    setFormErrors({});
  };

  // ─── Permissions Management ─────────────────────────────────────
  const handleTogglePermission = (role, path) => {
    if (role === 'Admin') return; // Admin always has full access
    const currentPerms = { ...data.permissions };
    const rolePaths = currentPerms[role] || [];
    
    if (rolePaths.includes(path)) {
      currentPerms[role] = rolePaths.filter(p => p !== path);
    } else {
      currentPerms[role] = [...rolePaths, path];
    }
    
    setData(prev => ({ ...prev, permissions: currentPerms }));
    setPermissionsChanged(true);
  };

  const handleToggleAllForRole = (role) => {
    if (role === 'Admin') return;
    const currentPerms = { ...data.permissions };
    const rolePaths = currentPerms[role] || [];
    const allPaths = ALL_MENUS.map(m => m.path);
    
    if (rolePaths.length === allPaths.length) {
      currentPerms[role] = ['/settings']; // Always keep settings
    } else {
      currentPerms[role] = [...allPaths];
    }
    
    setData(prev => ({ ...prev, permissions: currentPerms }));
    setPermissionsChanged(true);
  };

  const handleSavePermissions = () => {
    saveData('permissions', data.permissions);
    setPermissionsChanged(false);
    toast.success('Hak akses berhasil disimpan!');
    // Trigger sidebar update
    window.dispatchEvent(new CustomEvent('user-data-updated'));
  };

  // ─── Filtered Accounts ──────────────────────────────────────────
  const filteredAccounts = data.accounts.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="am-container animate-fade-in">
      {/* Header */}
      <div className="page-header-premium">
        <div className="header-text-group-with-icon">
          <div className="header-icon-wrapper theme-green">
            <ShieldCheck size={28} />
          </div>
          <div className="header-title-area">
            <h1 className="page-title">Manajemen Akses</h1>
            <p className="page-subtitle">Kelola akun pengguna dan hak akses menu aplikasi</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="am-tabs">
        <button
          className={`am-tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          <Users size={18} />
          <span>Daftar Akun</span>
          <span className="am-tab-count">{data.accounts.length}</span>
        </button>
        <button
          className={`am-tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <Lock size={18} />
          <span>Hak Akses</span>
          {permissionsChanged && <span className="am-tab-dot" />}
        </button>
      </div>

      {/* ═══════════════ TAB: DAFTAR AKUN ═══════════════ */}
      {activeTab === 'accounts' && (
        <div className="am-section animate-fade-in">
          <div className="am-toolbar">
            <div className="am-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari akun..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="am-btn am-btn-primary" onClick={openAddModal}>
              <UserPlus size={18} />
              <span>Tambah Akun</span>
            </button>
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="am-empty glass-card">
              <Users size={48} />
              <h3>Tidak ada akun ditemukan</h3>
              <p>Coba ubah kata kunci pencarian atau tambah akun baru.</p>
            </div>
          ) : (
            <div className="am-table-wrapper glass-card">
              <table className="am-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>No</th>
                    <th>Pengguna</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th style={{ width: 200 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account, index) => (
                    <tr key={account.id}>
                      <td className="am-td-center">{index + 1}</td>
                      <td>
                        <div className="am-user-cell">
                          <span className="am-user-name">{account.name}</span>
                        </div>
                      </td>
                      <td>
                        <code className="am-username-code">{account.username}</code>
                      </td>
                      <td>
                        <span
                          className="am-role-badge"
                          style={{
                            background: getRoleColor(account.role).bg,
                            color: getRoleColor(account.role).text,
                            borderColor: getRoleColor(account.role).border,
                          }}
                        >
                          {account.role}
                        </span>
                      </td>
                      <td>
                        <div className="am-actions">
                          <button
                            className="am-action-btn am-action-edit"
                            onClick={() => openEditModal(account)}
                            title="Edit Akun"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="am-action-btn am-action-reset"
                            onClick={() => handleResetPassword(account)}
                            title="Reset Password"
                          >
                            <RotateCcw size={14} />
                          </button>
                          {account.username !== 'admin' && (
                            <>
                              {deleteConfirm === account.id ? (
                                <div className="am-delete-confirm">
                                  <button
                                    className="am-action-btn am-action-delete-yes"
                                    onClick={() => handleDeleteAccount(account)}
                                    title="Ya, hapus"
                                  >
                                    <CheckCircle2 size={14} />
                                  </button>
                                  <button
                                    className="am-action-btn am-action-cancel"
                                    onClick={() => setDeleteConfirm(null)}
                                    title="Batal"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="am-action-btn am-action-delete"
                                  onClick={() => setDeleteConfirm(account.id)}
                                  title="Hapus Akun"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="am-info-box">
            <Info size={18} />
            <div>
              <strong>Catatan:</strong> Password default untuk akun baru adalah <code>password</code>. 
              Pengguna dapat mengubah password di halaman Pengaturan setelah login.
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: HAK AKSES ═══════════════ */}
      {activeTab === 'permissions' && (
        <div className="am-section animate-fade-in">
          <div className="am-toolbar">
            <div className="am-perm-info">
              <ShieldCheck size={18} />
              <span>Atur menu yang dapat diakses oleh setiap role</span>
            </div>
            <button
              className={`am-btn ${permissionsChanged ? 'am-btn-primary am-btn-pulse' : 'am-btn-disabled'}`}
              onClick={handleSavePermissions}
              disabled={!permissionsChanged}
            >
              <Save size={18} />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          <div className="am-matrix-wrapper glass-card">
            <div className="am-matrix-scroll">
              <table className="am-matrix">
                <thead>
                  <tr>
                    <th className="am-matrix-corner" rowSpan={2}>
                      <div className="am-corner-label">
                        <span className="am-corner-role">Role</span>
                      </div>
                    </th>
                    {MENU_GROUPS.map(group => (
                      <th key={group.name} colSpan={group.menus.length} className="am-matrix-group-header">
                        {group.name}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {ALL_MENUS.map(menu => (
                      <th key={menu.path} className="am-matrix-header">
                        <div className="am-matrix-header-content">
                          {menu.icon}
                          <span>{menu.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dynamicRoles.map(role => {
                    const rolePaths = data.permissions[role] || [];
                    const isAdmin = role === 'Admin';
                    const allChecked = ALL_MENUS.every(m => rolePaths.includes(m.path));
                    return (
                      <tr key={role} className={isAdmin ? 'am-matrix-admin-row' : ''}>
                        <td className="am-matrix-role-cell">
                          <div className="am-matrix-role">
                            <span
                              className="am-role-badge am-role-badge-sm"
                              style={{
                                background: getRoleColor(role).bg,
                                color: getRoleColor(role).text,
                                borderColor: getRoleColor(role).border,
                              }}
                            >
                              {role}
                            </span>
                            {!isAdmin && (
                              <button
                                className="am-toggle-all-btn"
                                onClick={() => handleToggleAllForRole(role)}
                                title={allChecked ? 'Hapus semua akses' : 'Pilih semua akses'}
                              >
                                <CheckCheck size={15} />
                              </button>
                            )}
                            {isAdmin && (
                              <span className="am-admin-lock" title="Akses penuh">
                                <Lock size={13} />
                              </span>
                            )}
                          </div>
                        </td>
                        {ALL_MENUS.map(menu => (
                          <td key={menu.path} className="am-matrix-cell">
                            <label className={`am-checkbox-wrapper ${isAdmin ? 'am-checkbox-locked' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isAdmin || rolePaths.includes(menu.path)}
                                onChange={() => handleTogglePermission(role, menu.path)}
                                disabled={isAdmin}
                              />
                              <span className="am-checkbox-custom" />
                            </label>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="am-info-box">
            <Info size={18} />
            <div>
              <strong>Info:</strong> Role <strong>Admin</strong> selalu memiliki akses penuh ke semua menu dan tidak dapat diubah.
              Perubahan hak akses akan langsung berlaku setelah pengguna login ulang.
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: ADD/EDIT ACCOUNT ═══════════════ */}
      {showModal && (
        <div className="am-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="am-modal animate-fade-in" ref={modalRef}>
            <div className="am-modal-header">
              <div className="am-modal-header-icon">
                {editingAccount ? <Edit2 size={20} /> : <UserPlus size={20} />}
              </div>
              <div>
                <h2>{editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}</h2>
                <p>{editingAccount ? 'Perbarui informasi akun pengguna' : 'Buat akun baru untuk pengguna sistem'}</p>
              </div>
              <button className="am-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="am-modal-form">
              <div className="am-form-group">
                <label>Username</label>
                <div className="am-input-wrapper">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="contoh: guru_ali"
                    className={formErrors.username ? 'am-input-error' : ''}
                    autoFocus
                  />
                </div>
                {formErrors.username && (
                  <span className="am-error-text">
                    <AlertCircle size={12} /> {formErrors.username}
                  </span>
                )}
              </div>

              <div className="am-form-group">
                <label>Password</label>
                <div className="am-input-wrapper am-input-password">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Masukkan password"
                    className={formErrors.password ? 'am-input-error' : ''}
                  />
                  <button
                    type="button"
                    className="am-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="am-error-text">
                    <AlertCircle size={12} /> {formErrors.password}
                  </span>
                )}
              </div>

              <div className="am-form-group">
                <label>Nama Lengkap</label>
                <div className="am-input-wrapper">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                    className={formErrors.name ? 'am-input-error' : ''}
                  />
                </div>
                {formErrors.name && (
                  <span className="am-error-text">
                    <AlertCircle size={12} /> {formErrors.name}
                  </span>
                )}
              </div>

              <div className="am-form-group">
                <label>Role / Jabatan</label>
                <div className="am-input-wrapper">
                  <CustomSelect
                    options={dynamicRoles}
                    value={formData.role}
                    onChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                  />
                </div>
              </div>

              <div className="am-modal-preview">
                <div className="am-avatar-upload-wrapper">
                  <div
                    className={`am-avatar am-avatar-lg am-avatar-upload ${isUploading ? 'uploading' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${getRoleColor(formData.role).bg}, ${getRoleColor(formData.role).border})`,
                      color: getRoleColor(formData.role).text
                    }}
                  >
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" />
                    ) : (
                      formData.name ? getInitials(formData.name) : '?'
                    )}
                    <label className="am-avatar-overlay">
                      <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={isUploading} hidden />
                      <Camera size={16} />
                    </label>
                  </div>
                </div>
                <div className="am-preview-info">
                  <span className="am-preview-name">{formData.name || 'Nama Pengguna'}</span>
                  <span
                    className="am-role-badge"
                    style={{
                      background: ROLE_COLORS[formData.role]?.bg,
                      color: ROLE_COLORS[formData.role]?.text,
                      borderColor: ROLE_COLORS[formData.role]?.border,
                    }}
                  >
                    {formData.role}
                  </span>
                </div>
              </div>

              <div className="am-modal-actions">
                <button type="button" className="am-btn am-btn-ghost" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="am-btn am-btn-primary">
                  <Save size={16} />
                  <span>{editingAccount ? 'Simpan Perubahan' : 'Tambah Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenAkses;
